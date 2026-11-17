# src-tauri/icons/ — 应用图标

Tauri 打包所需的多平台图标，**随仓库分发**（非第三方字体，不受字体授权限制）。

| 路径 | 用途 |
|---|---|
| `icon.png` / `icon.ico` / `icon.icns` | 通用图标与 Windows/macOS 主图标 |
| `32x32.png`、`64x64.png`、`128x128.png`、`128x128@2x.png` | Linux/桌面尺寸 |
| `Square*Logo.png`、`StoreLogo.png` | Windows Store 资源 |
| `android/` | Android 各密度启动图标 |
| `ios/` | iOS AppIcon 全套尺寸 |

## 替换图标

用 `npm run tauri icon <源图.png>` 重新生成全部尺寸，不要手工只改其中一个文件。
