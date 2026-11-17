# 14. 组件状态模型与后端数据映射契约

> 目标：每个组件、每个按钮都有唯一的状态定义；后端按状态返回数据，前端不再自行猜测。
> 代码落点：`src/ui/state.ts`、`src/components/base/StateSlot.tsx`、`Button`、`Focusable`、`StatusChip`。

## 1. 状态词汇

**数据态（六个，唯一取值）**

| 状态 | 含义 | 后端信号 |
|---|---|---|
| `idle` | 还没发起请求 | 无请求 |
| `loading` | 请求进行中 | 请求已发出、未返回 |
| `ok` | 有可用数据 | 2xx 且数据非空 |
| `empty` | 请求成功但没有内容 | 2xx 且 `items.length === 0`、`current === null && upcoming === []` |
| `error` | 请求失败 | 401/403、5xx、网络失败 |
| `disabled` | 能力关闭，不是失败 | `capabilities.* = false` 或本地未配置 |

错误细分（沿用连接层 `ConnState`）：`unreachable`（连不上）、`unauthorized`（401/403）、`error`（5xx / 解析失败）。
`statusOf(conn)` 把它们统一映射到 `error`，文案分开。

**交互态（三个，叠加在数据态上，不写进数据态）**

- `focused`：遥控焦点，统一 2.5u 内描边（`--card-focus-ring`）。
- `selected`：当前页签 / 当前频道 / 已选筛选项 / 开关打开，白底黑字或下划线，不改变布局尺寸。
- `disabled`：不可点；`aria-disabled`，且不进入焦点序列（`Focusable disabled`）。
- `loading` 的按钮保持可聚焦、`aria-busy`、禁止重复触发（不置灰移除焦点）。

## 2. 状态机

```
idle ──请求──▶ loading ──2xx 有数据──▶ ok
                    ├──2xx 空数据──▶ empty
                    ├──401/403────▶ error(unauthorized)
                    ├──连不上──────▶ error(unreachable)
                    └──5xx────────▶ error(server)
ok / empty / error ──重试──▶ loading
任意态 ──能力关闭──▶ disabled
```

硬规则：

1. 骨架只用于 `loading`，禁止用假数据冒充内容。
2. `empty` 与 `error` 文案不能混用；`empty` 必须给下一步动作（换分组 / 去设置），`error` 必须给重试。
3. `loading` 不覆盖已有内容时用局部骨架，不整块闪烁。
4. 同一个列表里各行状态互相独立：某行空/错不影响其他行。

## 3. 组件状态清单

| 组件 | 数据态 | 交互态 | 视觉规则 |
|---|---|---|---|
| 导航项 | — | selected / focused / disabled | 选中白底黑字；焦点内描边；disabled 灰且不可聚焦 |
| 分组页签（影视分类、直播分组、设置分组、季标签） | — | selected / focused | **焦点到位即切换**，确认键不参与 |
| 海报卡 | — | focused / selected（正在播）/ disabled（无源） | 焦点内描边；selected 角标；disabled 降透明度 |
| 主视觉按钮 | loading / disabled | focused / selected | loading 转圈 + 保留文案，不重复触发 |
| 设置行 | loading / empty / error / disabled | focused | 右侧控件独立状态，行本身不置灰 |
| 开关 / 分段 / 步进 / 滑杆 | disabled | selected / focused | 值变化即时生效；disabled 不可聚焦 |
| 下载卡 | loading / empty / error | selected（展开） | 收起只裁剪行，任务数始终为总数 |
| 订阅剧集卡 | empty / disabled | focused / selected | 空态给「去发现」，disabled 不聚焦 |
| 节目单课程表行 | loading / empty / error / ok | selected（选中频道） | 骨架行 → 节目块；无节目单显示「暂无节目单」 |
| 节目块 | — | live / past / selected | 正在播提亮；已播淡化；当前时刻红线在上层 |
| 连接提示 | error(unreachable/unauthorized/server) | — | 必须带重试按钮 |
| 空态 / 骨架容器 | loading / empty / error / disabled | — | 统一用 `StateSlot`，文案 20u + 17u |

## 4. 后端数据映射契约

**列表型端点统一形状**

```json
{ "items": [], "total": 0, "updatedAt": "2026-11-17T21:00:00Z", "partial": false }
```

| 组件 | 端点 | 状态推导 |
|---|---|---|
| 推荐墙 | `GET /v1/recommend` | `rows.length === 0` → empty；单行 `row.items.length === 0` → 该行 empty；`partial === true` → 行尾「部分数据」 |
| 分类页 | `GET /v1/library/{kind}` | `items.length === 0` → empty |
| 收藏 | `GET /v1/favorites` | 分组后各组为空 → 各组 empty，全空 → 整页 empty |
| 直播频道 | `GET /v1/live/channels?group=` | `items.length === 0` → empty（该分组）；分组无 count → 页签 disabled |
| 节目单 | `GET /v1/live/{id}/epg?limit=` | `current === null && upcoming.length === 0` → 该行 empty；`matched === false` → empty（无匹配源） |
| 订阅 | `GET /v1/subscriptions` | `items.length === 0` → empty |
| 下载任务 | `GET /v1/downloads` | 单任务 `status: queued\|running\|done\|error` → 行 loading/ok/error；`items.length === 0` → empty；卡片计数恒为 `total` |
| 播放进度 | `GET /v1/progress/{id}` | 404 → empty（未看）；5xx → error |
| 健康检查 | `GET /v1/health` | 2xx → ok；其余 → error |

**错误码映射**

| HTTP / 传输 | 数据态 | 文案 |
|---|---|---|
| 401 / 403 | error | 需要在设置里重新授权 |
| 404（整端点） | error | 接口不存在，检查后端版本 |
| 404（资源） | empty | 内容不存在或已下架 |
| 5xx | error | 后端出错，稍后重试 |
| fetch reject | error(unreachable) | 连不上后端 |
| `capabilities.x = false` | disabled | 当前不可用 |

## 5. 实现落点与迁移

| 层 | 文件 | 说明 |
|---|---|---|
| 类型 / 映射 | `src/ui/state.ts` | `UiStatus`、`STATUS_LABEL`、`STATUS_TONE`、`statusOf(ConnState)` |
| 状态容器 | `src/components/base/StateSlot.tsx` | 统一渲染 loading/empty/error/disabled |
| 按钮 | `src/components/base/Button.tsx` | `loading` / `selected` / `disabled` |
| 可聚焦壳 | `src/components/base/Focusable.tsx` | `ariaBusy` / `ariaPressed` |
| 状态胶囊 | `src/components/base/StatusChip.tsx` | `status={...}` 自动取文案与配色 |

已落地示范：设置 → 网络 → **测试连接**（idle → loading → ok / error，胶囊与按钮同步）。
后续按此顺序迁移：设置 → 直播（频道/节目单）→ 推荐与分类墙 → 订阅与下载 → 详情与播放。
