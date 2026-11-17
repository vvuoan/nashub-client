# src/lib/ — 纯函数工具

| 文件 | 作用 |
|---|---|
| `icons.tsx` | 内联 SVG 图标集，避免外部图标字体依赖 |
| `scale.ts` | 10-foot UI 缩放：把设计稿像素换算为 `--u` 基准单位 |

## 约定

- 只放无副作用、可单测的纯函数/纯组件；不访问网络、不读全局状态。
- 新增图标加到 `icons.tsx`，保持 `currentColor` 与统一 `viewBox`。
