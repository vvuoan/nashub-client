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
src/
├── App.tsx / main.tsx     应用入口与路由外壳
├── pages/                 页面：首页、媒体库、详情、播放器、直播、音乐、搜索、设置等
├── components/            复用组件（海报卡、货架、状态面板、连接提示等）
├── player/                播放器封装
├── focus/                 焦点管理（方向键导航、焦点环、回退栈）
├── hooks/                 数据与交互 hooks
├── data/                  后端 API 客户端与演示数据适配（不含真实媒体库数据）
├── styles/                全局样式、token、字体声明、页面样式
├── lib/                   工具函数
├── ui/                    基础 UI 原子
├── fonts/                 字体放置目录（二进制不入库，见下）
└── types.ts               领域类型

src-tauri/                 Rust 侧：窗口、命令、能力声明、打包配置与图标
docs/design/               UI 设计规范、交互规范与审计记录
```

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

- `src/styles/fonts.css` 保留全部 `@font-face` 声明与 `unicode-range`
- 字体文件需自行放入 `src/fonts/<family>/`，具体文件名与路径见 [src/fonts/README.md](src/fonts/README.md)
- 缺字体不会构建失败，`font-display: swap` 与 `--font-*` 回退栈保证可用

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
