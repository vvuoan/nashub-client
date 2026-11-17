mod player;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 可选内核：libmpv 插件不作为默认路径，只有 `--features libmpv` 时才编译/注册。
    #[cfg(feature = "libmpv")]
    let builder = tauri::Builder::default().plugin(tauri_plugin_libmpv::init());
    #[cfg(not(feature = "libmpv"))]
    let builder = tauri::Builder::default();

    builder
        .manage(player::PlayerState::default())
        .invoke_handler(tauri::generate_handler![
            player::player_probe,
            player::player_start,
            player::player_command,
            player::player_stop
        ])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                // 电视端默认全屏；配置里已声明，这里兜底一次。
                let _ = window.set_fullscreen(true);
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building NasTv")
        .run(|handle, event| {
            // 退出时结束 mpv，避免后台残留进程。
            if let tauri::RunEvent::Exit = event {
                if let Some(state) = handle.try_state::<player::PlayerState>() {
                    player::stop_playback(&state);
                }
            }
        });
}
