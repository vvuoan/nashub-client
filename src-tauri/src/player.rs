//! 播放内核：外部 mpv 进程 + JSON IPC（Windows 命名管道）。
//!
//! 为什么不是 libmpv 插件：`tauri-plugin-libmpv` 依赖随包 DLL、维护低频，
//! 且 IPC 方案在 WPF 客户端上已经验证过。这里把 mpv 当独立进程管理，
//! 前端通过 `PlayerHost`（src/player/PlayerHost.ts）调用本模块暴露的命令。
//!
//! mpv 可执行文件来源（按优先级）：
//! 1. 环境变量 `NASTV_MPV`（绝对路径，调试用）
//! 2. PATH 中的 `mpv.exe`
//! 3. 应用同目录 `mpv.exe`，或 `binaries/mpv.exe`（sidecar 打包位置）
//! 4. Windows 常见安装目录（`%ProgramFiles%\MPV Player` 等）
//!
//! sidecar 打包：把 mpv.exe 放到 `src-tauri/binaries/mpv.exe` 并加入
//! tauri.conf.json 的 `bundle.resources`，安装后即可被第 3 条命中。

use std::{
    env,
    fs::{File, OpenOptions},
    io::{BufRead, BufReader, Write},
    path::{Path, PathBuf},
    process::{Child, Command},
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};

use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter, State};

const PIPE_PREFIX: &str = r"\\.\pipe\";
const EVENT_NAME: &str = "player://event";

#[derive(Default)]
pub struct PlayerState(Mutex<Option<PlayerHost>>);

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerProbe {
    found: bool,
    path: Option<String>,
    source: Option<String>,
}

#[derive(Clone)]
pub struct MpvLocation {
    path: PathBuf,
    source: &'static str,
}

impl MpvLocation {
    fn describe(&self) -> PlayerProbe {
        PlayerProbe {
            found: true,
            path: Some(self.path.display().to_string()),
            source: Some(self.source.to_string()),
        }
    }
}

pub struct PlayerHost {
    child: Child,
    writer: Arc<Mutex<File>>,
    pipe: String,
}

impl PlayerHost {
    fn send(&self, payload: &Value) -> Result<(), String> {
        let mut writer = self.writer.lock().map_err(|_| "ipc writer poisoned")?;
        writeln!(writer, "{}", payload).map_err(|e| format!("write ipc: {e}"))?;
        writer.flush().map_err(|e| format!("flush ipc: {e}"))
    }

    fn shutdown(&mut self) {
        let _ = self.send(&json!({ "command": ["quit"] }));
        let deadline = Instant::now() + Duration::from_millis(1500);
        while Instant::now() < deadline {
            match self.child.try_wait() {
                Ok(Some(_)) => return,
                Ok(None) => thread::sleep(Duration::from_millis(50)),
                Err(_) => break,
            }
        }
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

/// 按优先级查找 mpv.exe。
pub fn locate_mpv() -> Option<MpvLocation> {
    if let Ok(explicit) = env::var("NASTV_MPV") {
        let path = PathBuf::from(explicit);
        if path.is_file() {
            return Some(MpvLocation {
                path,
                source: "env:NASTV_MPV",
            });
        }
    }

    if let Some(paths) = env::var_os("PATH") {
        for dir in env::split_paths(&paths) {
            let candidate = dir.join("mpv.exe");
            if candidate.is_file() {
                return Some(MpvLocation {
                    path: candidate,
                    source: "PATH",
                });
            }
        }
    }

    if let Ok(exe) = env::current_exe() {
        if let Some(dir) = exe.parent() {
            for relative in ["mpv.exe", "binaries/mpv.exe"] {
                let candidate = dir.join(relative);
                if candidate.is_file() {
                    return Some(MpvLocation {
                        path: candidate,
                        source: "sidecar",
                    });
                }
            }
        }
    }

    for (root, relative) in [
        ("ProgramFiles", r"MPV Player\mpv.exe"),
        ("LOCALAPPDATA", r"Programs\mpv\mpv.exe"),
        ("ProgramFiles(x86)", r"MPV Player\mpv.exe"),
    ] {
        if let Ok(base) = env::var(root) {
            let candidate = Path::new(&base).join(relative);
            if candidate.is_file() {
                return Some(MpvLocation {
                    path: candidate,
                    source: "install-dir",
                });
            }
        }
    }

    None
}

/// 启动 mpv 并通过命名管道建立 IPC，事件回调运行在读取线程上。
pub fn spawn_player<F>(
    media: &str,
    extra: &[String],
    on_event: F,
) -> Result<PlayerHost, String>
where
    F: Fn(Value) + Send + 'static,
{
    let mpv = locate_mpv().ok_or_else(|| {
        "未找到 mpv：请安装 mpv，或把 mpv.exe 放到应用目录/binaries，或设置 NASTV_MPV".to_string()
    })?;

    let pipe = format!("nastv-mpv-{}", std::process::id());
    let pipe_path = format!("{PIPE_PREFIX}{pipe}");

    let mut command = Command::new(&mpv.path);
    command
        .arg("--no-config")
        .arg("--idle=yes")
        .arg("--force-window=yes")
        .arg("--keep-open=no")
        .arg("--osc=no")
        .arg("--really-quiet")
        .arg(format!("--input-ipc-server={pipe_path}"));
    for arg in extra {
        command.arg(arg);
    }

    let child = command
        .spawn()
        .map_err(|e| format!("启动 mpv 失败（{}）：{e}", mpv.path.display()))?;

    let mut connected: Option<File> = None;
    for _ in 0..80 {
        match OpenOptions::new().read(true).write(true).open(&pipe_path) {
            Ok(file) => {
                connected = Some(file);
                break;
            }
            Err(_) => thread::sleep(Duration::from_millis(50)),
        }
    }
    let file = connected.ok_or_else(|| "连接 mpv IPC 超时".to_string())?;

    let writer = file.try_clone().map_err(|e| format!("复制 IPC 句柄失败：{e}"))?;
    let reader = file;

    thread::spawn(move || {
        let mut reader = BufReader::new(reader);
        let mut line = String::new();
        loop {
            line.clear();
            match reader.read_line(&mut line) {
                Ok(0) => break,
                Ok(_) => {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        continue;
                    }
                    if let Ok(value) = serde_json::from_str::<Value>(trimmed) {
                        on_event(value);
                    }
                }
                Err(_) => break,
            }
        }
    });

    let host = PlayerHost {
        child,
        writer: Arc::new(Mutex::new(writer)),
        pipe,
    };

    host.send(&json!({ "command": ["loadfile", media, "replace"] }))?;
    for (id, prop) in [(1, "time-pos"), (2, "duration"), (3, "pause"), (4, "eof-reached")] {
        host.send(&json!({ "command": ["observe_property", id, prop] }))?;
    }

    Ok(host)
}

#[tauri::command]
pub fn player_probe() -> PlayerProbe {
    match locate_mpv() {
        Some(location) => location.describe(),
        None => PlayerProbe {
            found: false,
            path: None,
            source: None,
        },
    }
}

#[tauri::command]
pub fn player_start(
    app: AppHandle,
    state: State<'_, PlayerState>,
    media: String,
    extra: Option<Vec<String>>,
) -> Result<Value, String> {
    player_stop_inner(&state);

    let handle = app.clone();
    let host = spawn_player(&media, extra.as_deref().unwrap_or(&[]), move |event| {
        let _ = handle.emit(EVENT_NAME, event);
    })?;

    let pipe = host.pipe.clone();
    let mut guard = state.0.lock().map_err(|_| "player state poisoned")?;
    *guard = Some(host);
    Ok(json!({ "ok": true, "pipe": pipe }))
}

#[tauri::command]
pub fn player_command(state: State<'_, PlayerState>, command: Value) -> Result<(), String> {
    let guard = state.0.lock().map_err(|_| "player state poisoned")?;
    let host = guard.as_ref().ok_or_else(|| "mpv 未启动".to_string())?;
    host.send(&command)
}

#[tauri::command]
pub fn player_stop(state: State<'_, PlayerState>) {
    player_stop_inner(&state);
}

/// 应用退出时清理 mpv 进程。
pub fn stop_playback(state: &PlayerState) {
    player_stop_inner(state);
}

fn player_stop_inner(state: &PlayerState) {
    if let Ok(mut guard) = state.0.lock() {
        if let Some(mut host) = guard.take() {
            host.shutdown();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::mpsc::channel;

    /// 需要真实 mpv 与一个本地测试视频：
    /// `NASTV_TEST_VIDEO=D:\clip.mp4 cargo test -- --nocapture`
    #[test]
    fn plays_pauses_and_reports_progress() {
        let Ok(media) = env::var("NASTV_TEST_VIDEO") else {
            eprintln!("skip: NASTV_TEST_VIDEO not set");
            return;
        };
        let (tx, rx) = channel();
        let mut host = spawn_player(&media, &[], move |event| {
            let _ = tx.send(event);
        })
        .expect("spawn mpv");

        let mut loaded = false;
        let mut playing_progress = false;
        let mut paused_event = false;
        let deadline = Instant::now() + Duration::from_secs(12);

        while Instant::now() < deadline {
            let Ok(event) = rx.recv_timeout(Duration::from_millis(500)) else {
                continue;
            };
            let name = event.get("event").and_then(Value::as_str).unwrap_or_default();
            match name {
                "file-loaded" => loaded = true,
                "property-change" => {
                    let prop = event.get("name").and_then(Value::as_str).unwrap_or_default();
                    if prop == "time-pos" {
                        if let Some(pos) = event.get("data").and_then(Value::as_f64) {
                            if pos > 0.2 {
                                playing_progress = true;
                                let _ = host.send(&json!({
                                    "command": ["set_property", "pause", true]
                                }));
                            }
                        }
                    }
                    if prop == "pause" && event.get("data") == Some(&Value::Bool(true)) {
                        paused_event = true;
                    }
                }
                _ => {}
            }
            if loaded && playing_progress && paused_event {
                break;
            }
        }

        assert!(loaded, "no file-loaded event");
        assert!(playing_progress, "no time-pos progress");
        assert!(paused_event, "no pause=true event");
        host.shutdown();
    }
}
