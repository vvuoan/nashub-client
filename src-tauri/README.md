# src-tauri/ — Tauri 桌面壳

| 文件 / 目录 | 作用 |
|---|---|
| `src/main.rs` | 可执行入口，调用库启动应用 |
| `src/lib.rs` | 应用构建、窗口配置、命令注册 |
| `src/player.rs` | MPV 进程管理与 IPC 命令实现 |
| `capabilities/default.json` | 权限清单：允许前端调用的命令与窗口能力 |
| `icons/` | 各平台应用图标（Windows/macOS/Android/iOS），随仓库分发 |
| `Cargo.toml` / `Cargo.lock` | Rust 依赖与锁定版本 |
| `tauri.conf.json` | 窗口尺寸、CSP、打包与更新配置 |
| `build.rs` | Tauri 构建脚本 |

## 构建

```bash
npm run tauri:dev     # 桌面窗口开发
npm run tauri:build   # 产出平台安装包
```

## 约定

- Rust 命令名与前端 `src/player/` 的调用保持一一对应。
- 新增能力必须同时改 `capabilities/default.json`，只授最小权限。
- `target/`、`gen/schemas/` 与 `lib/*.dll|*.so|*.dylib` 不入库（见根 `.gitignore`）。
