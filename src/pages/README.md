# src/pages/ — 页面

| 文件 | 路由/用途 |
|---|---|
| `HomePage.tsx` | 首页：入口磁贴、继续观看、推荐货架 |
| `LibraryPage.tsx` | 媒体库：分类、筛选、分页海报墙 |
| `DetailPage.tsx` | 详情：背景、简介、演职员、剧集与播放入口 |
| `PlayerPage.tsx` | 播放页：视频层、控制条、字幕/音轨/源菜单 |
| `LivePage.tsx` | 直播：频道列表、预览、节目单 |
| `MusicPage.tsx` | 音乐库与播放 |
| `SettingsPage.tsx` | 设置：网络、播放、外观、关于 |
| `SubscribePage.tsx` | 订阅/追番 |
| `PlaceholderPage.tsx` | 未实现功能的统一占位页 |
| `DevPreviewPage.tsx` | 开发预览：组件与状态一览，仅开发期使用 |
| `SaverPreviewPage.tsx` | 屏保预览 |

## 约定

- 页面只组合组件与 hooks，不写底层请求；数据来自 `hooks/`。
- 每个页面必须实现加载、空、错误三态，并保证遥控器可达全部操作。
- 新增页面在 `App.tsx` 注册，并在 `data/navigation.ts` 决定是否进入导航。
