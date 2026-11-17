# 设计规范索引

本目录是客户端的 UI / 交互规范与审计记录。

## 规范性文档

| 文档 | 内容 |
|---|---|
| [09-ui-spec-generic.md](./09-ui-spec-generic.md) | 通用 UI 规范：版面、层级、间距、焦点、动效的跨页面规则 |
| [09-ui-tokens-generic.json](./09-ui-tokens-generic.json) | 通用设计 token（与实现中的 `--*` 变量对应） |
| [08-ui-spec.md](./08-ui-spec.md) | 本项目页面级 UI 规范 |
| [08-ui-tokens.json](./08-ui-tokens.json) | 项目设计 token |
| [10-typography.md](./10-typography.md) | 字体规范：字号阶梯、字重、行高、中英混排、10-foot 可读性下限 |
| [13-ui-interaction-visual-spec.md](./13-ui-interaction-visual-spec.md) | 交互与视觉规范：焦点态、过渡时长、加载/空/错/降级态 |
| [14-component-state-contract.md](./14-component-state-contract.md) | 组件状态契约：每个组件必须具备的状态与文案 |

## 审计与走查记录

| 文档 | 内容 |
|---|---|
| [11-design-vs-impl-diff.md](./11-design-vs-impl-diff.md) | 设计稿与实现逐项对照的差异清单（含严重度） |
| [12-design-vs-impl-fix-report.md](./12-design-vs-impl-fix-report.md) | 差异修复记录与回归结论 |
| [15-remote-walkthrough-findings.md](./15-remote-walkthrough-findings.md) | 遥控器实机走查结论与待办 |

## 截图为什么不在仓库里

审计与走查过程产生的截图（`audit-*`、`shots/`）取自真实媒体库，包含个人片库内容，
不适合公开。需要对照时请用本地环境自行复现：按规范文档里的页面清单与状态清单各截一张，
或用组件状态契约里的状态矩阵自查。

## 阅读顺序建议

1. 先读 `09-ui-spec-generic.md` 建立通用规则，再看 `08-ui-spec.md` 的项目落法
2. 排版类改动用 `10-typography.md` + token 文件
3. 新组件先过 `14-component-state-contract.md`，再对照 `13-ui-interaction-visual-spec.md`
4. 改动前后用 `11-design-vs-impl-diff.md` 的条目自查，结论补到 `12-...-fix-report.md`
