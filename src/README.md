# src/ — 前端源码

| 文件 / 目录 | 作用 |
|---|---|
| `main.tsx` | React 入口；引入 token/字体/页面样式，并按需打包本地字体声明 |
| `App.tsx` | 路由外壳、焦点上下文与全局键盘处理 |
| `types.ts` | 领域类型（媒体、频道、播放进度、API 响应） |
| `pages/` | 页面级组件，一个路由一个文件 |
| `components/` | 跨页面复用组件；`base/` 基础控件，`media/` 媒体组件 |
| `hooks/` | 数据请求与交互 hooks，页面不直接 fetch |
| `data/` | API 客户端、首页聚合与导航配置 |
| `player/` | 播放器后端封装（MPV IPC / 宿主桥接） |
| `focus/` | 空间焦点与方向键导航 |
| `styles/` | 设计 token、字体栈、首页与页面样式 |
| `lib/` | 图标与缩放等纯函数工具 |
| `ui/` | 跨页共享的 UI 状态定义 |
| `fonts/` | 字体放置目录（二进制不入库） |

## 约定

- 组件只引用 `--font-*` 与其它 token，不硬编码字体族与颜色。
- 数据获取放 `hooks/` + `data/api.ts`；不在组件里散写 `fetch`。
- 新页面必须在 `App.tsx` 注册，并实现加载/空/错/焦点四态（见 `docs/design/14-component-state-contract.md`）。
