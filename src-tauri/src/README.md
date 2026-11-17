# src-tauri/src/ — Rust 源码

| 文件 | 作用 |
|---|---|
| `main.rs` | 二进制入口，调用 `nastv_lib::run()` |
| `lib.rs` | Tauri 构建器：注册命令、插件与窗口事件 |
| `player.rs` | MPV 播放进程：启动/停止、IPC 命令、音轨与字幕切换、进度回报 |

## 约定

- 命令返回统一 `Result<_, String>`，错误信息可被前端展示。
- 不在命令里做业务判断；只做进程与系统能力封装。
- 新增命令需在 `lib.rs` 注册，并在 `capabilities/default.json` 授权。
