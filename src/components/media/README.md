# src/components/media/ — 媒体组件

| 文件 | 作用 |
|---|---|
| `Backdrop.tsx` | 详情/首页大背景图与遮罩 |
| `CardRow.tsx` | 横向货架容器（标题、箭头、滚动） |
| `CastCard.tsx` | 演员卡 |
| `CategoryTabs.tsx` | 分类标签页 |
| `ClockBox.tsx` | 直播页时钟 |
| `ConnectionNotice.tsx` | 后端不可达/未授权提示 |
| `ContinueWatchingRow.tsx` | 继续观看货架 |
| `CornerButton.tsx` | 卡片角标按钮（收藏、更多） |
| `DownloadCard.tsx` | 下载任务卡 |
| `EntryShelf.tsx` | 首页入口货架 |
| `EntryTile.tsx` | 首页入口磁贴 |
| `EpisodeCard.tsx` | 单集卡 |
| `EpisodeList.tsx` | 剧集列表 |
| `FilterPanel.tsx` | 媒体库筛选面板 |
| `KeyPad.tsx` | 搜索虚拟键盘 |
| `LibraryHero.tsx` | 媒体库头图 |
| `LiveChannelList.tsx` | 直播频道列表 |
| `LiveGuide.tsx` | 节目单时间轴 |
| `LiveNowPanel.tsx` | 当前节目信息面板 |
| `LivePreview.tsx` | 直播预览窗 |
| `MediaCard.tsx` | 通用媒体海报卡 |
| `NavEdgeTab.tsx` | 边缘导航标签 |
| `NavRail.tsx` | 侧边导航栏 |
| `Overlays.tsx` | 播放器叠加层（标题、进度、提示） |
| `PlayerControls.tsx` | 播放控制条 |
| `Saver.tsx` | 屏保/待机画面 |
| `SearchResultItem.tsx` | 搜索结果行 |
| `SettingItem.tsx` | 设置项 |
| `SourceMenu.tsx` | 播放源切换菜单 |
| `SubtitleMenu.tsx` | 字幕选择菜单 |
| `TrackMenu.tsx` | 音轨选择菜单 |
| `WallpaperPanel.tsx` | 壁纸选择面板 |

## 约束

- 只接收已归一化的媒体字段；不要把后端原始 JSON 透传到组件。
- 海报/背景图统一用 `base/PosterImage` 或 `Image`，避免各自处理失败回退。
