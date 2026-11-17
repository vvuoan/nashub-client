# src-tauri/capabilities/ — 权限清单

| 文件 | 作用 |
|---|---|
| `default.json` | 主窗口能力：允许前端调用的 Tauri 命令、窗口与事件权限 |

## 规则

- 只授予实际用到的权限；新增能力要写清用途与影响范围。
- 涉及文件系统、Shell、HTTP 的能力必须限定具体路径或域名，不用通配。
- 权限变更需同步检查 `src/player/` 与 `src/data/api.ts` 的调用是否仍可工作。
