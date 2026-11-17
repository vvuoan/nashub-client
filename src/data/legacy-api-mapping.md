# 旧 API → 新后端契约：消失接口清单

> 本文件只给后端排期参考，**不是代码，任何模块都不要 import**。
> 旧接口取自 `analysis/_old_openapi.json`，新接口取自 `docs/api/runtime-openapi.json`（客户端内的快照同源）。
> 以 method+path 比对：旧 103 个操作、84 个旧路径在新栈不存在，共 **97 个操作**（即任务书所说的约 80 个）。
> 新栈使用 HTTPBearer + `ErrorEnvelope {code,message,traceId,field?}`；4xx 必须声明错误响应，旧 `X-NasTv-Unlock` 头不再使用。

## 播放与流

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /stream/{token}` | token*、Range | 无响应体/未声明 | 无 | 旧 token 直链没有替代；新栈用 `/v1/playback/stream/{item_id}` 且要求 Bearer。 |
| `GET /v1/play/{item_id}` | item_id*、X-NasTv-Unlock | `PlayTarget`：itemId、url、headers、proxyUrl、mediaSourceId、playSessionId… | 近似：`GET /v1/playback/stream/{item_id}` | PlayTarget 的播放器选择字段消失；多流选择由 playback/stream-info 提供。 |
| `GET /v1/stream/{token}` | token*、Range | 无响应体/未声明 | 无 | 同上；不要把 token 放回 URL（会进日志）。 |

## 插件管理

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/admin/plugins/{plugin_id}` | plugin_id* | `DomainPluginInfo`：id、name、version、enabled、state、order… | 近似：`GET /v1/plugins`、`POST enable/disable` | 域插件配置缺失；恢复时把启用状态与配置分开，避免用同一个 PATCH 改两类语义。 |
| `GET /v1/admin/plugins` | 无 | `DomainPluginListResponse`：plugins、count | 近似：`GET /v1/plugins`、`POST enable/disable` | 域插件配置缺失；恢复时把启用状态与配置分开，避免用同一个 PATCH 改两类语义。 |
| `GET /v1/plugins/{name}` | name* | `PluginDetailResponse`：name、kind、enabled、priority、capabilities、health… | 近似：`GET /v1/plugins`、`POST /v1/plugins/{plugin_id}/enable|disable` | 新栈没有单插件 GET/PATCH 路由；先按 operationId 建资源级接口，名称应从 {name} 改为 plugin_id 以对齐路径参数。 |
| `PATCH /v1/admin/plugins/{plugin_id}` | plugin_id*、body:DomainPluginPatchRequest | `DomainPluginInfo`：id、name、version、enabled、state、order… | 近似：`GET /v1/plugins`、`POST enable/disable` | 域插件配置缺失；恢复时把启用状态与配置分开，避免用同一个 PATCH 改两类语义。 |
| `PATCH /v1/plugins/{name}` | name*、body:PluginPatchRequest | `PluginDetailResponse`：name、kind、enabled、priority、capabilities、health… | 近似：`GET /v1/plugins`、`POST /v1/plugins/{plugin_id}/enable|disable` | 新栈没有单插件 GET/PATCH 路由；先按 operationId 建资源级接口，名称应从 {name} 改为 plugin_id 以对齐路径参数。 |

## 动漫

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `DELETE /v1/anime/{subject_id}/follow` | subject_id* | 无响应体/未声明 | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `GET /v1/anime/calendar` | 无 | `AnimeCalendarResponse`：days、stale、fetchedAt | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `GET /v1/anime/follows` | 无 | `AnimeFollowsResponse`：items、count、limit | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `GET /v1/anime/search` | q、limit | `AnimeSearchResponse`：query、items、count、cached、fetchedAt | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `GET /v1/anime/{subject_id}` | subject_id* | `AnimeDetailResponse`：subjectId、name、nameCn、image、airDate、totalEps… | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `PATCH /v1/anime/{subject_id}/follow` | subject_id*、body:AnimeWatchRequest | `AnimeFollowState`：subjectId、following、lastNotifiedEp、watchedEp、createdAt | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `POST /v1/anime/check` | 无 | `AnimeCheckResult`：checked、newEpisodes、notified、reason、items、errors | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `POST /v1/anime/{subject_id}/bind` | subject_id*、body:AnimeBindRequest | `AnimeDetailResponse`：subjectId、name、nameCn、image、airDate、totalEps… | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |
| `POST /v1/anime/{subject_id}/follow` | subject_id* | `AnimeFollowState`：subjectId、following、lastNotifiedEp、watchedEp、createdAt | 近似：`GET /v1/discovery/search|details|recommendations` | 追番是用户状态，discovery 只读；恢复关注/进度需新增 collections 资源，不能复用 TMDB 条目。 |

## 日志与系统

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/app/update` | channel、currentVersion* | `UpdateCheckResponse`：updateAvailable、currentVersion、latestVersion、channel、url、sha256… | 无 | 版本检查是客户端能力，恢复时明确渠道/当前版本参数与签名校验，不返回未验证的下载地址。 |
| `GET /v1/logs/dates` | 无 | `LogDatesResponse`：dates、count | 近似：`GET /v1/logs/recent` | 只有 recent 有替代；按日期查询、用量统计、压缩与客户端日志上报都要新增，沿用 ErrorEnvelope 与 traceId 关联。 |
| `GET /v1/logs/usage` | 无 | `LogUsageResponse`：totalBytes、rawTotalBytes、dateCount、days、retention、hint | 近似：`GET /v1/logs/recent` | 只有 recent 有替代；按日期查询、用量统计、压缩与客户端日志上报都要新增，沿用 ErrorEnvelope 与 traceId 关联。 |
| `GET /v1/logs/{date}` | date*、limit、level、tag、traceId | `LogQueryResponse`：date、count、limit、entries | 近似：`GET /v1/logs/recent` | 只有 recent 有替代；按日期查询、用量统计、压缩与客户端日志上报都要新增，沿用 ErrorEnvelope 与 traceId 关联。 |
| `POST /v1/logs/compact` | 无 | `LogCompactResponse`：compressed、skipped、failed、savedBytes | 近似：`GET /v1/logs/recent` | 只有 recent 有替代；按日期查询、用量统计、压缩与客户端日志上报都要新增，沿用 ErrorEnvelope 与 traceId 关联。 |
| `POST /v1/logs` | body:LogBatchRequest | `LogBatchResponse`：accepted、dates | 近似：`GET /v1/logs/recent` | 只有 recent 有替代；按日期查询、用量统计、压缩与客户端日志上报都要新增，沿用 ErrorEnvelope 与 traceId 关联。 |

## ASR

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/asr/status` | 无 | `AsrStatusResponse`：available、engine、model、sampleRate、modelDirConfigured | 无 | ASR 会话状态与分片上传全部缺失；恢复时需定义会话生命周期、限流与临时文件清理。 |
| `POST /v1/asr/chunks` | sessionId、seq、final、sampleRate、channels、language、hotwords、body:object | `AsrChunkResponse`：accepted、receivedBytes、sessionId、text、confidence、latencyMs… | 无 | ASR 会话状态与分片上传全部缺失；恢复时需定义会话生命周期、限流与临时文件清理。 |
| `POST /v1/asr/transcribe` | sampleRate、channels、format、language、hotwords | `AsrTranscribeResponse`：text、confidence、latencyMs、engine、hotwordsApplied | 无 | ASR 会话状态与分片上传全部缺失；恢复时需定义会话生命周期、限流与临时文件清理。 |

## 弹幕

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/danmaku/providers` | 无 | `DanmakuProvidersResponse`：providers、active | 无 | 弹幕域整体下线；恢复需定义 provider 能力、缓存与刷新策略。 |
| `GET /v1/danmaku/{item_id}` | item_id*、title、episode、filename、refresh | `DanmakuListResponse`：itemId、episodeId、provider、cached、comments、state… | 无 | 弹幕域整体下线；恢复需定义 provider 能力、缓存与刷新策略。 |
| `POST /v1/danmaku/{item_id}/refresh` | item_id*、title、episode、filename | `DanmakuRefreshResponse`：itemId、provider、episodeId、count、state、selected… | 无 | 弹幕域整体下线；恢复需定义 provider 能力、缓存与刷新策略。 |

## 收藏与播放列表

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `DELETE /v1/favorites/{item_type}/{item_id}` | item_type*、item_id*、X-NasTv-Unlock | 无响应体/未声明 | 近似：`DELETE /v1/collections/favorites/{item_id}` | 新栈按 item_id 删除，没有 item_type 段；单条查询无替代。 |
| `DELETE /v1/playlists/{playlist_id}/items/{item_id}` | playlist_id*、item_id* | 无响应体/未声明 | 近似：`GET|POST /v1/collections/playlists` | 只有集合级读写；重命名、删除、条目增删/reorder 都要新增，注意 collectionType=playlist 的隔离。 |
| `DELETE /v1/playlists/{playlist_id}` | playlist_id* | 无响应体/未声明 | 近似：`GET|POST /v1/collections/playlists` | 只有集合级读写；重命名、删除、条目增删/reorder 都要新增，注意 collectionType=playlist 的隔离。 |
| `GET /v1/favorites/{item_type}/{item_id}` | item_type*、item_id*、X-NasTv-Unlock | `FavoriteItem`：id、itemType、itemId、titleSnapshot、createdAt | 近似：`DELETE /v1/collections/favorites/{item_id}` | 新栈按 item_id 删除，没有 item_type 段；单条查询无替代。 |
| `GET /v1/favorites` | itemType、limit、offset、X-NasTv-Unlock | `FavoritePage`：items、count、total、offset、limit | 近似：`GET|POST /v1/collections/favorites` | 新列表接口无 offset/limit/itemType 过滤，客户端本地切片；字段是 snake_case。 |
| `GET /v1/playlists/{playlist_id}/items` | playlist_id*、X-NasTv-Unlock | `PlaylistItemsResponse`：playlistId、items、count | 近似：`GET|POST /v1/collections/playlists` | 只有集合级读写；重命名、删除、条目增删/reorder 都要新增，注意 collectionType=playlist 的隔离。 |
| `GET /v1/playlists` | X-NasTv-Unlock | `PlaylistListResponse`：items、count | 近似：`GET|POST /v1/collections/playlists` | 旧 PlaylistSummary 字段需重新定义；新栈以 collections 表为准。 |
| `PATCH /v1/playlists/{playlist_id}/items/reorder` | playlist_id*、X-NasTv-Unlock、body:PlaylistReorderRequest | `PlaylistItemsResponse`：playlistId、items、count | 近似：`GET|POST /v1/collections/playlists` | 只有集合级读写；重命名、删除、条目增删/reorder 都要新增，注意 collectionType=playlist 的隔离。 |
| `PATCH /v1/playlists/{playlist_id}` | playlist_id*、body:PlaylistNameRequest | `PlaylistSummary`：id、name、itemCount、createdAt、updatedAt | 近似：`GET|POST /v1/collections/playlists` | 只有集合级读写；重命名、删除、条目增删/reorder 都要新增，注意 collectionType=playlist 的隔离。 |
| `POST /v1/favorites` | X-NasTv-Unlock、body:FavoriteCreateRequest | `FavoriteItem`：id、itemType、itemId、titleSnapshot、createdAt | 近似：`GET|POST /v1/collections/favorites` | 新列表接口无 offset/limit/itemType 过滤，客户端本地切片；字段是 snake_case。 |
| `POST /v1/playlists/{playlist_id}/items` | playlist_id*、X-NasTv-Unlock、body:PlaylistItemCreateRequest | `PlaylistItemEntry`：itemId、position、addedAt | 近似：`GET|POST /v1/collections/playlists` | 只有集合级读写；重命名、删除、条目增删/reorder 都要新增，注意 collectionType=playlist 的隔离。 |
| `POST /v1/playlists` | body:PlaylistNameRequest | `PlaylistSummary`：id、name、itemCount、createdAt、updatedAt | 近似：`GET|POST /v1/collections/playlists` | 旧 PlaylistSummary 字段需重新定义；新栈以 collections 表为准。 |

## 媒体库与目录

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/library/items/{item_id}/poster` | item_id*、X-NasTv-Unlock | 无响应体/未声明 | 近似：`GET /v1/catalog/items/{item_id}/images/poster` | kind 只允许 poster/backdrop；保留 ETag 与 404 语义，新端点不支持 width。 |
| `GET /v1/library/items/{item_id}` | item_id*、X-NasTv-Unlock | `ItemDetail`：id、name、type、year、durationSec、durationReliable… | 近似：`GET /v1/catalog/items/{item_id}` | ItemDetail 的流信息/字幕字段被拆到 playback/subtitles 域，不要塞回目录详情。 |
| `GET /v1/library/libraries` | X-NasTv-Unlock | `LibraryListResponse`：libraries、count | 近似：`GET /v1/catalog/libraries` | 字段 kind→ kind；旧 collectionType 不再返回，客户端按 kind 映射。 |
| `GET /v1/library/{library_id}/items` | library_id*、limit、startIndex、X-NasTv-Unlock | `ItemPage`：items、total、startIndex、limit | 近似：`GET /v1/catalog/items` | 新接口没有 libraryId 过滤；要恢复按库浏览需补 libraryId 查询参数或 /libraries/{id}/items 子资源。 |
| `GET /v1/media/search` | q、limit、X-NasTv-Unlock | `MediaSearchPage`：items、count | 近似：`GET /v1/catalog/search` | 旧 q/limit 变成 q/pageSize；新栈不分页，total 是总数。 |
| `GET /v1/media/{item_id}/backdrop` | item_id*、If-None-Match、X-NasTv-Unlock | 无响应体/未声明 | 近似：`GET /v1/catalog/items/{item_id}` 与 images 端点 | 详情拆成 catalog + playback，refresh 无替代；图片只支持 poster/backdrop 两种 kind。 |
| `GET /v1/media/{item_id}/poster` | item_id*、If-None-Match、X-NasTv-Unlock | 无响应体/未声明 | 近似：`GET /v1/catalog/items/{item_id}` 与 images 端点 | 详情拆成 catalog + playback，refresh 无替代；图片只支持 poster/backdrop 两种 kind。 |
| `GET /v1/media/{item_id}` | item_id*、X-NasTv-Unlock | `MediaDetail`：itemId、source、title、originalTitle、year、type… | 近似：`GET /v1/catalog/items/{item_id}` 与 images 端点 | 详情拆成 catalog + playback，refresh 无替代；图片只支持 poster/backdrop 两种 kind。 |
| `POST /v1/media/{item_id}/refresh` | item_id*、X-NasTv-Unlock | `MediaDetail`：itemId、source、title、originalTitle、year、type… | 近似：`GET /v1/catalog/items/{item_id}` 与 images 端点 | 详情拆成 catalog + playback，refresh 无替代；图片只支持 poster/backdrop 两种 kind。 |

## 直播

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/live/groups` | 无 | `LiveGroupsResponse`：items、count | 近似：`GET /v1/live/channels` 的 group 字段 | 客户端已从频道列表聚合分组；若后端补分组接口，需与现有 group 自由文本保持一致。 |
| `GET /v1/live/{channel_id}/epg` | channel_id*、days、limit | `LiveEpgResponse`：channelId、matched、tvgId、current、upcoming、count… | 近似：`GET /v1/live/epg?channelId=`、`GET /v1/live/channels/{channel_id}` | epg 没有 days/limit 参数，一次返回全量由客户端切片；stream 改为返回频道自带 streamUrls，不再提供 index 代理。 |
| `GET /v1/live/{channel_id}/stream` | channel_id*、index | `LiveStreamInfo`：channelId、index、url、type、headers、source | 近似：`GET /v1/live/epg?channelId=`、`GET /v1/live/channels/{channel_id}` | epg 没有 days/limit 参数，一次返回全量由客户端切片；stream 改为返回频道自带 streamUrls，不再提供 index 代理。 |
| `POST /v1/live/epg/refresh` | 无 | `LiveEpgRefreshStats`：channels、programmes、fetchedAt | 无 | EPG 刷新是写操作；新 live 插件只读 programmes 表，恢复时明确刷新频率与来源。 |
| `POST /v1/live/refresh` | prune | `LiveRefreshStats`：source、added、updated、skipped、removed、fetchedAt | 无 | 频道刷新是写操作；prune 语义需在契约中重新定义，不要把刷新藏在 GET 里。 |

## 下载/订阅（MoviePilot）

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `DELETE /v1/mp/subscriptions/{media_id}` | media_id*、mediaSource、season | `SubscriptionDeleteResponse`：mediaId、mediaSource、season、deleted | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `GET /v1/mp/downloads` | 无 | `DownloadsResponse`：items、count | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `GET /v1/mp/media/{media_id}` | media_id*、mediaSource、typeName | `MpMediaDetail`：mediaId、mediaSource、title、year、typeName、poster… | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `GET /v1/mp/search` | q、page | `MpSearchResponse`：query、page、items、count、degraded、reason… | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `GET /v1/mp/subscriptions` | 无 | `SubscriptionsResponse`：items、count | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `GET /v1/mp/torrents/{media_id}` | media_id*、mediaSource、season、mtype | `MpTorrentsResponse`：mediaId、mediaSource、season、items、count | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `PATCH /v1/mp/subscriptions/{id}/state` | id*、body:SubscriptionStateRequest | `SubscriptionStateResponse`：id、state | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `POST /v1/mp/download` | body:DownloadRequest | `DownloadAddResponse`：taskId | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |
| `POST /v1/mp/subscriptions` | body:SubscriptionCreateRequest | `SubscriptionCreateResponse`：id、dropped、confirmed | 近似：`GET|POST /v1/downloader/*`、`/v1/subscription/*`、`/v1/pt/*` | MoviePilot 代理被拆分；下载/订阅/PT 三域字段不同，恢复时要明确适配器归属与鉴权边界。 |

## 音乐

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/music/status` | 无 | `MusicStatusResponse`：configured、baseUrl、message | 无 | Folia 状态探测下线；客户端音乐页已按"未配置"降级，恢复需新增独立插件契约。 |
| `POST /v1/music/probe` | 无 | `MusicProbeResponse`：baseUrl、reachable、httpStatus、latencyMs、error、checkedAt | 无 | Folia 状态探测下线；客户端音乐页已按"未配置"降级，恢复需新增独立插件契约。 |

## 在线资源

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/online/search` | q、type、limit、X-NasTv-Unlock | `OnlineSearchResponse`：query、count、local、degraded、items | 近似：`GET /v1/discovery/search|details` | 远程流仅供 TMDB 元数据，不提供播放代理；在线播放需单独安全审计后设计。 |
| `GET /v1/online/sources` | 无 | `OnlineSourcesResponse`：sources、count、degraded | 近似：`GET /v1/discovery` 的插件自述 | 在线源列表不再暴露；如需多源必须重新定义 source 枚举与能力声明。 |
| `GET /v1/online/{source}/{id}/stream` | source*、id*、ep、index | `OnlineStreamResponse`：source、id、ep、index、parse、urls… | 近似：`GET /v1/discovery/search|details` | 远程流仅供 TMDB 元数据，不提供播放代理；在线播放需单独安全审计后设计。 |
| `GET /v1/online/{source}/{id}` | source*、id* | `OnlineDetailResponse`：source、id、title、year、posterUrl、overview… | 近似：`GET /v1/discovery/search|details` | 远程流仅供 TMDB 元数据，不提供播放代理；在线播放需单独安全审计后设计。 |

## 播放进度

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `DELETE /v1/progress/{item_id}` | item_id* | 无响应体/未声明 | 近似：`PUT|GET /v1/playback/progress/{item_id}` | write/get 已覆盖；delete 与 sync 无替代，同步状态字段 syncState 只读。 |
| `GET /v1/progress/recent` | limit、X-NasTv-Unlock | `RecentPage`：items、count | 近似：`GET /v1/playback/progress?limit=` | 新响应只有 itemId/ticks，无标题；标题需联合 catalog/items，或后端在进度行里补 title。 |
| `GET /v1/progress/{item_id}` | item_id* | `ProgressRecord`：itemId、positionTicks、durationTicks、percent、isPaused、playSessionId… | 近似：`PUT|GET /v1/playback/progress/{item_id}` | write/get 已覆盖；delete 与 sync 无替代，同步状态字段 syncState 只读。 |
| `POST /v1/progress/{item_id}/sync` | item_id* | `ProgressSyncResult`：itemId、sync、syncAttempts、nextSyncAt、lastSyncError | 近似：`PUT|GET /v1/playback/progress/{item_id}` | write/get 已覆盖；delete 与 sync 无替代，同步状态字段 syncState 只读。 |
| `POST /v1/progress` | X-NasTv-Unlock、body:ProgressWriteRequest | `ProgressRecord`：itemId、positionTicks、durationTicks、percent、isPaused、playSessionId… | 近似：`PUT /v1/playback/progress/{item_id}` | 写进度改为按条目 PUT；注意 completed/isPaused 由后端推导，客户端不再上报计算值。 |

## 推荐

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/recommend/feed` | cursor、batchSize、X-NasTv-Unlock | `RecommendFeedResponse`：items、batchSize、nextCursor、exhausted、prefetch、degraded… | 无 | cursor/batchSize 的无限流没有替代；可基于 catalog/items 的 page/hasMore 重新设计。 |
| `GET /v1/recommend/sources` | 无 | `RecommendSourcesResponse`：sources、count、degraded | 无 | 新栈没有可枚举推荐来源；客户端已隐藏分类标签，恢复时需同时定义 source 枚举和标签文案。 |
| `GET /v1/recommend` | source、page、count、X-NasTv-Unlock | `RecommendResponse`：source、page、count、degraded、items | 近似：`GET /v1/catalog/overview|items`、`GET /v1/discovery/trending` | 按 source 的推荐已删除；客户端把 showing/movie_hot/tv_hot/anime/top250 分别映射到 overview、目录类型过滤与趋势榜。 |

## 搜索

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `DELETE /v1/search-history/{entry_id}` | entry_id* | 无响应体/未声明 | 近似：`GET /v1/catalog/search` | type 过滤参数在新栈没有；需要类型过滤应加 query 参数而不是复用 discovery。 |
| `DELETE /v1/search-history` | 无 | 无响应体/未声明 | 近似：`GET /v1/catalog/search` | type 过滤参数在新栈没有；需要类型过滤应加 query 参数而不是复用 discovery。 |
| `GET /v1/search-history` | limit | `SearchHistoryPage`：items、count | 近似：`GET /v1/catalog/search` | type 过滤参数在新栈没有；需要类型过滤应加 query 参数而不是复用 discovery。 |
| `GET /v1/search` | q、limit、type、X-NasTv-Unlock | `MediaSearchPage`：items、count | 近似：`GET /v1/catalog/search` | type 过滤参数在新栈没有；需要类型过滤应加 query 参数而不是复用 discovery。 |
| `POST /v1/search-history` | body:SearchHistoryRequest | `SearchHistoryEntry`：id、keyword、createdAt、hitCount | 近似：`GET /v1/catalog/search` | type 过滤参数在新栈没有；需要类型过滤应加 query 参数而不是复用 discovery。 |

## 安全与设置

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/security/state` | X-NasTv-Unlock | `SecurityStateResponse`：locked、expiresAt | 无（新栈仅 `/v1/auth/status` 报告认证配置） | 旧的 X-NasTv-Unlock 头已取消；若恢复敏感库，用 Bearer + ErrorEnvelope 重新设计锁定状态机，不要把 PIN 放进 URL。 |
| `POST /v1/security/lock` | 无 | `SecurityLockResponse`：locked | 无（新栈仅 `/v1/auth/status` 报告认证配置） | 旧的 X-NasTv-Unlock 头已取消；若恢复敏感库，用 Bearer + ErrorEnvelope 重新设计锁定状态机，不要把 PIN 放进 URL。 |
| `POST /v1/security/pin` | body:ChangePinRequest | `ChangePinResponse`：changed | 无（新栈仅 `/v1/auth/status` 报告认证配置） | 旧的 X-NasTv-Unlock 头已取消；若恢复敏感库，用 Bearer + ErrorEnvelope 重新设计锁定状态机，不要把 PIN 放进 URL。 |
| `POST /v1/security/unlock` | body:UnlockRequest | `UnlockResponse`：token、expiresAt | 无（新栈仅 `/v1/auth/status` 报告认证配置） | 旧的 X-NasTv-Unlock 头已取消；若恢复敏感库，用 Bearer + ErrorEnvelope 重新设计锁定状态机，不要把 PIN 放进 URL。 |
| `POST /v1/settings/reset` | body:SettingsResetRequest | `SettingsResetResponse`：reset、requiresRestart | 近似：`PATCH /v1/settings` | reset 改为逐字段 patch；需要原子语义时先在契约里定义 reset 操作，不要用空 body 的 PATCH 冒充。 |

## 存储

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `GET /v1/storage/alerts` | limit | `StorageAlertsResponse`：alerts、count | 无 | 存储容量/告警/孤儿文件全部缺失；恢复时排除只读探针带来的路径泄漏。 |
| `GET /v1/storage/orphans` | 无 | `StorageOrphansResponse`：path、directories、count、generatedAt | 无 | 存储容量/告警/孤儿文件全部缺失；恢复时排除只读探针带来的路径泄漏。 |
| `GET /v1/storage/status` | 无 | `StorageStatusResponse`：path、totalBytes、usedBytes、freeBytes、usedPercent、thresholdPercent… | 无 | 存储容量/告警/孤儿文件全部缺失；恢复时排除只读探针带来的路径泄漏。 |
| `POST /v1/storage/check` | 无 | `StorageCheckResponse`：recorded、status | 无 | 存储容量/告警/孤儿文件全部缺失；恢复时排除只读探针带来的路径泄漏。 |

## 字幕

| 旧接口 | 旧参数 | 旧响应要点 | 新栈近似替代 | 重做规则/注意事项 |
|---|---|---|---|---|
| `DELETE /v1/subtitles/{item_id}/{subtitle_id}` | item_id*、subtitle_id* | 无响应体/未声明 | 近似：`POST /v1/subtitles/download`、`PATCH /v1/subtitles/files/{item_id}/{subtitle_hash}` | offset 改为文件级 PATCH；activate 与 delete 无替代，激活态建议放 collections/settings 而非字幕文件。 |
| `GET /v1/subtitles/search` | itemId、q、source | `SubtitleSearchResponse`：itemId、query、source、cached、fellBackTo、attribution… | 近似：`GET /v1/subtitles/candidates` | q/source 参数需重新定义；返回项应带可下载标识。 |
| `PATCH /v1/subtitles/{item_id}/offset` | item_id*、body:SubtitleOffsetRequest | `SubtitleOffsetResponse`：subtitleId、offsetMs、path | 近似：`POST /v1/subtitles/download`、`PATCH /v1/subtitles/files/{item_id}/{subtitle_hash}` | offset 改为文件级 PATCH；activate 与 delete 无替代，激活态建议放 collections/settings 而非字幕文件。 |
| `POST /v1/subtitles/{item_id}/activate` | item_id*、body:SubtitleActivateRequest | `SubtitleFile`：subtitleId、itemId、source、externalId、path、format… | 近似：`POST /v1/subtitles/download`、`PATCH /v1/subtitles/files/{item_id}/{subtitle_hash}` | offset 改为文件级 PATCH；activate 与 delete 无替代，激活态建议放 collections/settings 而非字幕文件。 |
| `POST /v1/subtitles/{item_id}/download` | item_id*、body:SubtitleDownloadRequest | `SubtitleDownloadResponse`：subtitleId、itemId、path、format、offsetMs、active… | 近似：`POST /v1/subtitles/download`、`PATCH /v1/subtitles/files/{item_id}/{subtitle_hash}` | offset 改为文件级 PATCH；activate 与 delete 无替代，激活态建议放 collections/settings 而非字幕文件。 |
