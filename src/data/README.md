# src/data/ — 数据访问与配置

| 文件 | 作用 |
|---|---|
| `api.ts` | 后端 HTTP 客户端：base URL、Bearer、错误归一化、超时；所有请求的唯一出口 |
| `home.ts` | 首页聚合：把多个接口结果拼成首页所需的货架结构 |
| `navigation.ts` | 侧边导航项与路由的静态配置 |

## 约定

- 组件不直接 `fetch`；新增接口先在 `api.ts` 暴露函数，再由 hooks 调用。
- 不写死后端地址与令牌；运行时从设置读取。
- 后端不可达时抛出带 `kind` 的错误（unreachable / unauthorized / error），由 UI 显示真实失败态。
