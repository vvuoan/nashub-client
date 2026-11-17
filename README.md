# NasHub Client（NasTv）

NAS 媒体中心的 10-foot 大屏客户端：Tauri 2 + React 19 + Vite + TypeScript。
面向电视/投影/沙发场景，全部界面以遥控器方向键与确认键操作，后端为独立的 NasHub 服务。

## 技术栈

| 层 | 选型 |
|---|---|
| 桌面壳 | Tauri 2（Rust，`src-tauri/`） |
| 前端 | React 19 + TypeScript + Vite 7 |
| 样式 | 原生 CSS + 设计 token（`src/styles/tokens.css`），无 UI 组件库 |
| 数据 | 仅通过 HTTP 调 NasHub 后端 OpenAPI；不持有业务数据 |
| 焦点 | 自研焦点管理器（`src/focus/`），支持方向键、回退栈、滚动到可见 |

## 目录结构

```
nashub-client/
├─ src/                        前端源码
│  ├─ App.tsx / main.tsx       应用入口、路由与全局样式引入
│  ├─ pages/                   页面级组件（首页、媒体库、详情、播放器、直播、音乐、设置等）
│  ├─ components/              跨页面复用组件
│  │  ├─ base/                 基础控件（按钮、焦点、弹层、骨架、进度等）
│  │  └─ media/                媒体类组件（海报卡、货架、节目单、播放控制等）
│  ├─ player/                  播放器后端封装（MPV IPC / 宿主）
│  ├─ focus/                   空间焦点与方向键导航
│  ├─ hooks/                   数据与交互 hooks
│  ├─ data/                    API 客户端、首页聚合、导航配置
│  ├─ styles/                  token、字体回退栈、页面与首页样式
│  ├─ lib/                     图标与缩放工具
│  ├─ ui/                      跨页共享的 UI 状态定义
│  ├─ fonts/                   字体放置目录（二进制不入库，见该目录 README）
│  └─ types.ts                 领域类型
├─ src-tauri/                  Rust 侧
│  ├─ src/                     入口、窗口与播放器实现
│  ├─ capabilities/            权限清单（Tauri 2 capability）
│  ├─ icons/                   各平台应用图标（仓库内，不排除）
│  ├─ Cargo.toml / Cargo.lock  Rust 依赖
│  ├─ tauri.conf.json          窗口、打包与安全配置
│  └─ build.rs                 构建脚本
├─ docs/
│  ├─ README.md                文档索引
│  └─ design/                  UI / 交互 / 字体规范与审计记录
├─ index.html                   Vite 入口 HTML
├─ package.json                依赖与脚本
├─ tsconfig.json               TypeScript 配置
├─ vite.config.ts              Vite 配置（端口、构建输出）
├─ .gitattributes              行尾与二进制处理
└─ .gitignore                  排除依赖、产物、字体与本地配置
```

### 新增内容该放哪

| 要做的事 | 放哪 | 注意 |
|---|---|---|
| 新增一个页面 | `src/pages/<Name>Page.tsx` | 在 `src/App.tsx` 注册路由；页面内只用 `--font-*` 变量 |
| 新增跨页面组件 | `src/components/` | 基础控件放 `base/`，媒体相关放 `media/` |
| 新增数据请求 | `src/hooks/use<Thing>.ts` + `src/data/api.ts` | 不留 mock 数据；后端不可达时显示真实失败态 |
| 改设计 token | `src/styles/tokens.css` + `docs/design/09-tokens` | 字号/颜色/间距必须落到 token |
| 改字体栈 | `src/styles/fonts.css` | 不要写 `url()`；本地字形放 `fonts.local.css`（不入库） |
| 改播放器 | `src/player/` + `src-tauri/src/player.rs` | 前端与 Rust 命令需同时改 |
| 加 Tauri 权限 | `src-tauri/capabilities/default.json` | 最小权限，新增能力要写清用途 |
| 加设计规范 | `docs/design/` | 编号沿用现有序列，更新 `docs/design/README.md` 索引 |

## 本地启动

前置：Node 20+、Rust 工具链、Tauri 2 对应的系统依赖（Windows 需 WebView2 与 MSVC 构建工具）。

```bash
npm install

# 仅前端（浏览器里调，默认 http://127.0.0.1:1420）
npm run dev

# 桌面窗口开发
npm run tauri:dev

# 打包（Windows 产出 NSIS 安装包）
npm run tauri:build
```

后端地址与访问令牌由应用内「设置 → 网络」配置，不在代码里写死；未配置或后端不可达时
界面显示真实的失败态（unreachable / unauthorized / error），不伪造数据。

## 字体如何处理

设计稿使用 SF Pro / SF Compact / SF Mono / New York / PingFang SC 等苹果专有字体，
受 Apple 授权限制，**字体二进制不随仓库分发**：

- `src/styles/fonts.css` 只保留 `--font-*` 回退栈，不含任何 `url()`
- `src/styles/fonts.local.css.example` 保存 19 条 `@font-face` 模板；复制为
  `fonts.local.css`（已 gitignore）并自备 woff2 后，`main.tsx` 会自动打包
- 没有字体文件时构建照常通过，字形回退到系统字体；文件清单见 [src/fonts/README.md](src/fonts/README.md)

## 设计规范文档

索引见 [docs/design/README.md](docs/design/README.md)：

| 文档 | 内容 |
|---|---|
| [09-ui-spec-generic.md](docs/design/09-ui-spec-generic.md) | 通用 UI 规范（跨页面适用的版面、层级、焦点、动效规则） |
| [09-ui-tokens-generic.json](docs/design/09-ui-tokens-generic.json) | 通用设计 token |
| [08-ui-spec.md](docs/design/08-ui-spec.md) | 本项目 UI 规范（页面级） |
| [08-ui-tokens.json](docs/design/08-ui-tokens.json) | 项目设计 token |
| [10-typography.md](docs/design/10-typography.md) | 字体规范：字号阶梯、字重、行高、中英混排 |
| [13-ui-interaction-visual-spec.md](docs/design/13-ui-interaction-visual-spec.md) | 交互与视觉规范：焦点态、过渡、加载/空/错态 |
| [14-component-state-contract.md](docs/design/14-component-state-contract.md) | 组件状态契约：每个组件必须实现的态 |
| [11-design-vs-impl-diff.md](docs/design/11-design-vs-impl-diff.md) | 设计 vs 实现审计（差异清单） |
| [12-design-vs-impl-fix-report.md](docs/design/12-design-vs-impl-fix-report.md) | 审计差异的修复记录 |
| [15-remote-walkthrough-findings.md](docs/design/15-remote-walkthrough-findings.md) | 遥控器走查结论 |

> 审计截图未入库：截图里含个人媒体库内容，规范文档以文字与 token 为准。
