# src/data/ — 数据访问与配置

| 文件 | 作用 |
|---|---|
| `openapi.d.ts` | 由 `npm run gen:types` 从 `docs/api/runtime-openapi.json` 生成，禁止手改 |
| `http.ts` | 唯一 HTTP 出口：base URL、Bearer、8s 超时、`ErrorEnvelope` → `ApiClientError` |
| `api/index.ts` | 聚合导出 + `api` 对象；保留页面在用的旧方法名，实现全部指向新契约 |
| `api/catalog.ts` | 目录/检索/推荐/媒体库适配（旧按 source 推荐 → overview / items / trending；kind → collectionType） |
| `api/playback.ts` | 播放进度 + 图片 URL（`images/{kind}`） |
| `api/collections.ts` | 收藏（本地切片以兼容旧 offset/limit 签名） |
| `api/live.ts` | 直播频道、EPG；分组由频道 `group` 字段在前端聚合 |
| `api/discovery.ts` | 趋势榜（top250 的近似替代） |
| `api/shared.ts` | 数值钳制、tick 换算 |
| `api.ts` | 兼容导入层，只 re-export `./api/index`，不再声明任何接口 |
| `home.ts` | 首页聚合：进度 → 继续观看，错误 → UI 状态 |
| `navigation.ts` | 侧边导航项与路由的静态配置 |
| `legacy-api-mapping.md` | 97 个消失接口的排期参考文档（不是代码，不要 import） |

## 约定

- 组件不直接 `fetch`；新接口先在 `src/data/api/<域>.ts` 暴露，再由 hooks 调用。
- 不写死令牌；base URL 优先级：`localStorage.ntv.apiBase` > `VITE_API_BASE` > `http://127.0.0.1:2003`。
- 后端错误统一抛 `ApiClientError`（`status/code/message/traceId/field`）；网络与超时用 `network`/`timeout`。
- 新栈没有的接口（天气农历、音乐状态、推荐来源、直播分组等）在 UI 上降级，不伪造数据。
