# src/hooks/ — 数据与交互 hooks

| 文件 | 作用 |
|---|---|
| `useCatalogSearch.ts` | 搜索输入防抖、请求取消与结果态 |
| `useClock.ts` | 直播页时钟（定时刷新） |
| `useHomeOverview.ts` | 首页聚合数据与刷新 |
| `useIdleSaver.ts` | 无操作进入屏保/待机 |
| `useLibraryPage.ts` | 媒体库分页、筛选与排序 |
| `useLivePage.ts` | 频道列表、节目单与换源 |
| `useRemoteKeys.ts` | 遥控器按键映射（返回、菜单、播放控制） |
| `useWallpaper.ts` | 壁纸选择与持久化 |

## 约定

- 一个 hook 只负责一类数据或交互；错误与加载态一并返回，不吞异常。
- 请求必须支持取消（`AbortController`），避免快速切页时回写旧数据。
- 不在 hook 里做视觉决策；只返回数据与状态。
