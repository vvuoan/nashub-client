# 10 · 字体使用规范

> 适用：客厅 TV 客户端（1920×1080 画布，`--u` 等比缩放）
> 状态：19 个字体已转为 WOFF2 并打包进客户端（`src/fonts/`，随 Vite 输出到 `dist/assets/`）；苹果字体以 `Nastv ...` 私有族名声明，不再依赖系统安装；中文为苹方子集（GB2312 一级二级 + 项目全量文案），项目字符缺失 0。本文数值、体积与族名均与画布、fontTools 和 WebView2 实测对齐。
> 公开仓库说明：SF Pro / SF Compact / SF Mono / New York / PingFang SC 为苹果专有字体，**字体二进制不入库**；仓库只保留 `src/styles/fonts.css` 的 `@font-face` 声明与放置约定，使用者需自备（见 `src/fonts/README.md`）。文中“已打包 / 体积”描述的是本地构建时的处理方式，不代表仓库内含字体文件。
> 原则：字号与字重只按画布/现有实现取值；换字族后只允许调字距、行高和内边距，不改画布字号。

---

## 1. 字族分工

| 字族 | 主要职责 | 建议字号 | 可用字重 | 适用边界 | 不适用场景 |
| --- | --- | --- | --- | --- | --- |
| **SF Pro Display** | 大字号标题、主视觉片名、页面大标题 | 30–128 | 300 / 400 / 500 / 600 / 700 | 影视主视觉 76、详情片名 62、设置标题 44、面板标题 38、分区标题 30、时钟 128 | 正文、小字、按钮内 22 以下文字、表格行 |
| **SF Pro Text** | 正文、UI 标签、按钮、元信息、小字 | 12–29 | 400 / 500 / 600 / 700 | 磁贴/导航 20、日期 26、元信息 24、简介 23、眉题 22、卡片标题 18、设置行 19、状态胶囊 15、键位 20–24 | 76/62 级片名、128 时钟、密集等宽数据 |
| **SF Compact Text** | 密集列表、窄列、备选字族 | 18–20 | 400 / 500（600 回退 400） | 分集条目 20（整块列表统一使用） | 与 SF Pro Text 在同一组件内混用；标题；大字号；正文长段落；设置行标签与值分别使用；打包族名固定为 `"Nastv SF Compact Text"`，不再依赖本机 `"SF Text"` 别名 |
| **SF Mono** | 时间码、版本号、traceId、开发面板技术信息 | 12–20 | 400 / 500 | 播放时间码 18、关于版本 16、traceId 16、构建时间/日志 14–16、集号 15 | 中文正文、影视标题、按钮文案、普通设置说明 |
| **New York** | 可选编辑性标题、片名（仅品牌/专题） | 30–76 | 400 / 600 | 专题页、活动页、编辑性片名；需单独评审 | 常规 UI、导航、按钮、设置、状态、技术信息 |
| **PingFang SC** | 所有中文字形 | 跟随所在层级 | 300 / 400 / 500 / 600 | 中文标题、中文正文、中文标签、中文状态；所有 SF 族的中文回退 | 单独承担中英混排中的西文；与 SF 争夺同一段西文 |

### 1.1 字族边界补充

- SF Pro Display 只用于 **30px 及以上** 的标题类。20–29px 的元信息、导航、卡片标题一律 SF Pro Text。
- SF Pro Text 是默认 UI 字族。除 Display 标题、Mono 技术信息、Compact 密集列表外，其余界面文字都归 Text。
- SF Compact 是 **备选**，不是默认。只有整块列表（如分集列表）需要压缩横向宽度时，整块切换到 Compact；不允许只把某一行换成 Compact，也不允许同一行里标签用 Text、值用 Compact。
- SF Mono 只承载等宽数据，不承载中文句子。中文说明仍回 PingFang SC。Mono 可以与 Text 同屏，但仅限数字/技术字段，不能用来排正文。
- New York 暂不进入现有页面。若使用，仅限编辑性标题，不能与 SF Pro Text 在同一行混排。

---

## 2. 字号阶梯

以下数值均来自画布变量或现有 CSS；`--u` 为缩放因子。行高与字距列出“画布/实现值”，并在需要换字补偿的地方给出目标规则。

| 层级 | 典型场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据 |
| --- | --- | ---: | --- | ---: | --- | --- | --- |
| 时钟 | 首页时间 | 128 | SF Pro Display | 300 | 1.02（约 131） | -0.01em | `home.css --clock-time`、`.clock` |
| 主视觉片名 | 影视首屏 | 76 | SF Pro Display | 300 | 110 | 画布 +1px；换 SF 后目标 0 至 -0.5px | `--fs-title`、`.lhero-title` |
| 详情片名 | 详情页 | 62 | SF Pro Display | 300 | 1.1（约 68） | 画布 +1px；换 SF 后目标 0 | `pages.css .detail-title` |
| 设置页标题 | 设置 | 44 | SF Pro Display | 600 | 60 | 0 | `pages.css .set-head h1` |
| 面板标题 | 壁纸面板 | 38 | SF Pro Display | 700 | normal | 0 | `home.css .panel h3` |
| 搜索输入 | 搜索框 | 34 | SF Pro Text | 600 | normal | 0 | `home.css .sinput-text` |
| 分区标题 | 行标题/订阅分组 | 30 | SF Pro Display | 600 | 43 | 0 | `--fs-section`、`.crow-t`、`.subs-group h2` |
| 日期 | 首页日期 | 26 | SF Pro Text | 500 | normal | 0 | `--clock-date`、`.clockbox .date` |
| 搜索结果标题 | 搜索 | 26 | SF Pro Text | 600 | normal | 0 | `home.css .sresult-t` |
| 元信息 | 主视觉信息行 | 24 | SF Pro Text | 500 | 35 | 0 | `--fs-meta`、`.lhero-meta` |
| 分类标签 | 影视分类 | 24 | SF Pro Text | 500（选中 600） | normal | 0 | `home.css .ctab` |
| 按钮主文案 | 主视觉按钮 | 24 | SF Pro Text | 600 | normal | 0 | `home.css .btn` |
| 简介 | 主视觉简介 | 23 | SF Pro Text | 400 | 32 | 0 | `--fs-desc`、`.lhero-desc` |
| 眉题 | 主视觉眉题 | 22 | SF Pro Text | 600 | normal | 0 | `--fs-eyebrow`、`.media-eyebrow` |
| 筛选胶囊 | 筛选 | 22 | SF Pro Text | 500（选中 600） | normal | 0 | `home.css .fchip` |
| 详情按钮 | 详情操作 | 22 | SF Pro Text | 600 | normal | 0 | `pages.css .dbtn` |
| 设置组件标签 | 组件 `SettingItem` | 22 | SF Pro Text | 400 | normal | 0 | `home.css .setting-item .label` |
| 详情元信息 | 详情信息行 | 21 | SF Pro Text | 400 | 32 | 0 | `pages.css .detail-meta` |
| 连接提示 | 顶部连接状态 | 21 | SF Pro Text | 600 | 1.25 | 0 | `home.css .conn` |
| 磁贴标签 | 六入口 | 20 | SF Pro Text | 500 | normal | 0 | 画布 `--fs-card-title`；实现 `.tile .nm` 暂为 24，收敛目标 20 |
| 导航标签 | 左侧导航 | 20 | SF Pro Text | 500（选中 600） | normal | 0 | `--nav-label`、`.navitem` |
| 卡片标题 | 信息层卡片 | 18 | SF Pro Text | 600 | normal | 0 | `home.css .mcard-t` |
| 分集条目 | 分集列表 | 20 | SF Compact Text | 400 | normal | 0 | `home.css .episode` |
| 设置行标题 | 设置 | 19 | SF Pro Text | 500 | normal | 0 | `pages.css .set-label` |
| 设置导航 | 设置 | 18 | SF Pro Text | 500（选中 600） | normal | 0 | `pages.css .set-navitem` |
| 设置说明 | 设置 | 14 | SF Pro Text | 400 | 1.5 | 0 | `pages.css .set-desc` |
| 播放时间码 | 播放控制 | 18 | SF Mono | 400 | normal | 0，启用 `tabular-nums` | `home.css .time` |
| 状态胶囊 | 订阅/下载 | 15 | SF Pro Text | 600 | normal | 0 | `pages.css .chip`、`.mcard-badge` |
| 集号 | 分集卡 | 15 | SF Mono | 400 | normal | 0，启用 `tabular-nums` | `pages.css .epcard-idx` |
| 版本号/traceId | 关于/开发 | 16 | SF Mono | 400 | normal | 0，启用 `tabular-nums` | `pages.css .set-value`、`.set-value-bar` 对应行 |
| 键位字母 | 搜索键盘 | 24 | SF Pro Text | 500 | normal | 0 | `home.css .kkey` |
| 中文键位 | 搜索键盘末行 | 22 | PingFang SC | 500 | normal | 0 | `home.css .krow.last .kkey` |

> 说明：磁贴标签的画布值为 20，现有实现 `.tile .nm` 为 24。本规范以画布 20 为目标；落地换字时一并收敛，不改动其他字号。

---

## 3. 场景映射（可直接查表）

### 3.1 首页

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 时钟 `23:59` | 128 | SF Pro Display | 300 | 1.02 | -0.01em | `.clockbox .clock`，容器宽 640 |
| 日期 | 26 | SF Pro Text | 500 | normal | 0 | `.clockbox .date`，单行 |
| 天气 | 24 | SF Pro Text | 500 | normal | 0 | `.clockbox .wx` |
| 继续观看提示 | 22 | SF Pro Text | 500 | normal | 0 | `.cue` |
| 提示内计数 | 20 | SF Pro Text | 500 | normal | 0 | `.cue .n` |
| 六入口标签 | 20 | SF Pro Text | 500 | normal | 0 | 画布 20；实现暂 24，目标 20 |
| 继续观看卡标题 | 20 | SF Pro Text | 600 | normal | 0 | `.ccard .tit`，单行省略 |
| 继续观看进度 | — | — | — | — | — | 4px 进度条，无文字 |
| 分区标题 | 30 | SF Pro Display | 600 | 43 | 0 | `.cont-h` / `.crow-t` |

### 3.2 影视首屏与列表

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 主视觉眉题 | 22 | SF Pro Text | 600 | normal | 0 | `.media-eyebrow` |
| 主视觉片名 | 76 | SF Pro Display | 300 | 110 | 画布 +1px；目标 0 至 -0.5px | `.lhero-title` |
| 主视觉元信息 | 24 | SF Pro Text | 500 | 35 | 0 | `.lhero-meta` |
| 主视觉简介 | 23 | SF Pro Text | 400 | 32 | 0 | `.lhero-desc` |
| 主视觉按钮 | 22 | SF Pro Text | 600 | normal | 0 | `.lbtn`，148×60，内边距 26 |
| 主视觉缩小态片名 | 40 | SF Pro Display | 300 | 58 | 0 | `.lhero.shrink .lhero-title` |
| 主视觉缩小态元信息 | 19 | SF Pro Text | 500 | 28 | 0 | `.lhero.shrink .lhero-meta` |
| 主视觉缩小态简介 | 21 | SF Pro Text | 400 | 32 | 0 | `.lhero.shrink .lhero-desc` |
| 卡片标题 | 18 | SF Pro Text | 600 | normal | 0 | `.mcard-t`，单行省略 |
| 卡片元信息 | 15 | SF Pro Text | 400 | normal | 0 | `.mcard-m`，单行省略 |
| 海报变体标题 | 22 | SF Pro Text | 600 | normal | 0 | `.mcard-on .mcard-t` |
| 海报变体元信息 | 16 | SF Pro Text | 400 | normal | 0 | `.mcard-on .mcard-m` |
| 卡片评分 | 17 | SF Pro Text | 600 | normal | 0，启用 `tabular-nums` | `.mcard-rate` |
| 分类标签 | 24 | SF Pro Text | 500 / 选中 600 | normal | 0 | `.ctab`，高 56 |
| 筛选胶囊 | 22 | SF Pro Text | 500 / 选中 600 | normal | 0 | `.fchip`，120×56 |
| 筛选面板标题 | 26 | SF Pro Display | 300 | normal | 0 | `.fpanel-head h3` |
| 筛选分组标题 | 22 | SF Pro Text | 600 | normal | 0 | `.fgroup h4` |

### 3.3 详情页

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 片名 | 62 | SF Pro Display | 300 | 1.1 | 画布 +1px；目标 0 | `.detail-title` |
| 元信息 | 21 | SF Pro Text | 400 | 32 | 0 | `.detail-meta` |
| 简介占位 | — | — | — | — | — | 无数据，色条占位；接真实数据后按 21/32 |
| 操作按钮 | 22 | SF Pro Text | 600 | normal | 0 | `.dbtn`，高 60 |
| 季标签 | 24 | SF Pro Text | 500 / 选中 600 | normal | 0 | `.dtab`，高 56 |
| 内容区标题 | 24 | SF Pro Display | 600 | normal | 0 | `.detail-files h2` |
| 文件字段名 | 16 | SF Pro Text | 400 | normal | 0 | `.detail-file .k` |
| 分集卡集号 | 15 | SF Mono | 400 | normal | 0，`tabular-nums` | `.epcard-idx` |
| 分集卡标题 | 17 | SF Pro Text | 400 | normal | 0 | `.epcard-t`，单行省略 |
| 分集状态标记 | 13 | SF Pro Text | 600 | normal | 0 | `.epcard-live` |
| 分集锁标 | 14 | SF Pro Text | 400 | normal | 0 | `.epcard-lock` |
| 演职人员姓名 | 15 | SF Pro Text | 500 | normal | 0 | `.cast-t` |
| 演职人员角色 | 12 | SF Pro Text | 400 | normal | 0 | `.cast-r` |

### 3.4 分集列表与订阅

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 分集条目 | 20 | SF Compact Text | 400 | normal | 0 | `.episode`，高 64 |
| 分集序号 | 20 | SF Mono | 400 | normal | 0，`tabular-nums` | `.episode .idx` |
| 分集状态 | 17 | SF Pro Text | 400 | normal | 0 | `.episode .st` |
| 订阅分组标题 | 30 | SF Pro Display | 600 | 43 | 0 | `.subs-group h2` |
| 订阅卡状态胶囊 | 13 | SF Pro Text | 600 | normal | 0 | `.mcard-badge`，高 24 |
| 下载卡标题 | 16 | SF Pro Text | 600 | normal | 0 | `.dl-title` |
| 下载任务数量 | 13 | SF Pro Text | 400 | normal | 0 | `.dl-count` |
| 下载百分比 | 12 | SF Mono | 400 | normal | 0，`tabular-nums` | `.dl-task-pct` |
| 下载速度行 | 13 | SF Pro Text | 400 | normal | 0 | `.dl-foot` |
| 订阅详情状态 | 15 | SF Pro Text | 600 | normal | 0 | `.chip` |
| 订阅元数据标签 | 15 | SF Pro Text | 400 | normal | 0 | `.meta-field .k` |
| 订阅元数据值 | 19 | SF Pro Text | 400 | normal | 0 | `.meta-field .v` |
| 订阅内容区标题 | 24 | SF Pro Display | 600 | normal | 0 | `.subs-cast h2` 等 |

### 3.5 设置

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 页面标题 | 44 | SF Pro Display | 600 | 60 | 0 | `.set-head h1` |
| 页面说明 | 16 | SF Pro Text | 400 | normal | 0 | `.set-head p` |
| 分组导航 | 18 | SF Pro Text | 500 / 选中 600 | normal | 0 | `.set-navitem`，高 56 |
| 行标题 | 19 | SF Pro Text | 500 | normal | 0 | `.set-label` |
| 行说明 | 14 | SF Pro Text | 400 | 1.5 | 0 | `.set-desc` |
| 行值 | 16 | SF Pro Text | 400 | normal | 0 | `.set-value`、`.set-input` |
| 按钮文字 | 16 | SF Pro Text | 500 | normal | 0 | `.set-control .btn`，高 44 |
| 分段选择 | 15 | SF Pro Text | 500 / 选中 600 | normal | 0 | `.segopt` |
| 步进器数值 | 16 | SF Mono | 400 | normal | 0，`tabular-nums` | `.step-val` |
| 步进器符号 | 18 | SF Pro Text | 400 | normal | 0 | `.step` |
| 警示说明 | 14 | SF Pro Text | 400 | 1.5 | 0 | `.set-warn` |
| 页脚 | 14 | SF Pro Text | 400 | normal | 0 | `.set-foot` |
| 版本号 | 16 | SF Mono | 400 | normal | 0，`tabular-nums` | 关于分组 |

### 3.6 搜索

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 搜索输入 | 34 | SF Pro Text | 600 | normal | 0 | `.sinput-text`，输入区 632×88 |
| 结果标题 | 26 | SF Pro Text | 600 | normal | 0 | `.sresult-t` |
| 结果卡标题 | 18 | SF Pro Text | 600 | normal | 0 | `.mcard-t` |
| 空结果 | 22 | SF Pro Text | 400 | normal | 0 | `.sresult-empty` |
| 键盘字母 | 24 | SF Pro Text | 500 | normal | 0 | `.kkey`，56×62 |
| 键盘中文 | 22 | PingFang SC | 500 | normal | 0 | `.krow.last .kkey` |
| 键盘动作键 | 22 | PingFang SC | 500 | normal | 0 | `.krow.last .kkey`，空格/清空/删除/搜索 |

### 3.7 播放页

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 时间码 | 18 | SF Mono | 400 | normal | 0，`tabular-nums` | `.time`，最小宽 56 |
| 播放状态 | 18 | SF Pro Text | 400 | normal | 0 | `.player-status` |
| 音轨/字幕菜单行 | 20 | SF Pro Text | 400（选中 600） | normal | 0 | `.menu-row`，高 60 |
| 菜单辅助信息 | 17 | SF Pro Text | 400 | normal | 0 | `.menu-row .d` |
| 字幕菜单“关闭字幕” | 20 | PingFang SC | 400 | normal | 0 | `SubtitleMenu` |
| 字幕正文层 | — | — | — | — | — | 尚未实现；落地时按画布补，不在本规范凭空定义 |

### 3.8 开发面板与状态

| 场景 | 字号 | 字族 | 字重 | 行高 | 字距 | 依据/备注 |
| --- | ---: | --- | ---: | --- | --- | --- |
| 开发页标题 | 40 | SF Pro Display | 300 | normal | 0 | `.dev-head h1` |
| 开发页说明 | 18 | SF Pro Text | 400 | normal | 0 | `.dev-head p` |
| 分区标题 | 24 | SF Pro Display | 600 | normal | 0 | `.dev-title` |
| 组件名标签 | 18 | SF Pro Text | 400 | 60 | 0 | `.dev-label` |
| 页面入口链接 | 17 | SF Pro Text | 500 | normal | 0 | `.dev-link` |
| 连接提示标题 | 21 | SF Pro Text | 600 | 1.25 | 0 | `.conn .ct` |
| 连接提示说明 | 19 | SF Pro Text | 400 | 1.25 | 0 | `.conn .cd` |
| traceId / 构建时间 | 16 | SF Mono | 400 | normal | 0，`tabular-nums` | 开发分组 |

---

## 4. 中西混排

### 4.1 字体栈顺序

每个变量都按“打包 SF 族 → 系统 SF 族 → Inter → 苹方 → 思源”排列（实际值见 `src/styles/tokens.css`）：

```css
--font-ui:
  "Nastv SF Pro Text", "Nastv SF Pro Display", "SF Pro Text", Inter,
  "Nastv PingFang SC", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
--font-display:
  "Nastv SF Pro Display", "Nastv SF Pro Text", "SF Pro Display", Inter,
  "Nastv PingFang SC", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
--font-compact:
  "Nastv SF Compact Text", "SF Compact Text", "SF Text", "Nastv SF Pro Text", Inter,
  "Nastv PingFang SC", "PingFang SC", "Noto Sans SC", sans-serif;
--font-mono:
  "Nastv SF Mono", "SF Mono", ui-monospace, "Cascadia Mono", Consolas,
  "Nastv PingFang SC", "PingFang SC", monospace;
--font-editorial:
  "Nastv New York Large", "New York Large", "New York",
  "Nastv SF Pro Display", "Nastv PingFang SC", "PingFang SC", serif;
```

规则：

- 西文字母、数字、版本号优先走前面的 SF 族；SF 缺字重/缺文件时走 Inter。
- 中文字形走 `PingFang SC`；Inter 不含 CJK，所以中文字符会自然落到苹方；苹方缺文件时再走 `Noto Sans SC`。
- 不要把 `PingFang SC` 放在 Inter 前面：苹方自带拉丁字形，会提前截走本该由 Inter 兜底的西文。
- 同一段中英混排不需要拆 `<span>`；由字体栈按字形逐字回退。
- 中文标点（，。！？：；「」）使用苹方；西文括号、单位、代码片段使用 SF/Inter。
- 数字与中文单位之间沿用现有文案空格（如“5 分钟”），不新增全角空格。

### 4.2 行高与基线补偿

- 混排行使用 **固定行高（画布 px）**，不要让苹方和 SF 各自撑开 line box。
- 中文回退后若整行视觉偏低/偏高，只允许：
  1. 调整该组件的 `padding-top` / `padding-bottom`，范围 1–2 设计 px；
  2. 调整固定 `line-height` ±2 设计 px；
  3. 调整 `vertical-align`（仅限 inline 场景）。
- 不允许通过改 `font-size`、`transform: translateY` 大范围位移、或 `scale` 来“对齐”。
- 大字号标题（62/76/128）必须使用固定行高，避免苹方行高把标题块撑高。
- 时间码、版本号、traceId 启用 `font-variant-numeric: tabular-nums;`，避免数字宽度跳动。

---

## 5. 字重层级原则

- 同一内容层最多 **3 种字重**；全屏叠加上覆盖层（弹层/侧面板）时最多 **4 种**。
- 推荐组合：
  - 展示型：300（标题）+ 500（标签/导航）+ 600（选中/按钮/分区标题）
  - 信息型：400（正文）+ 500（行标题）+ 600（页面标题/选中）
  - 技术型：400（等宽数据）+ 500（行标签）+ 600（分区标题）
- 覆盖层允许额外一个 700（仅面板标题，如 38px 壁纸面板），但覆盖层正文仍不得使用 700。
- **什么时候用 Medium（500）而不是 Semibold（600）：**
  - 非点击、非标题的行标题、导航默认态、设置项标签、键位、元信息 → 500。
  - 可点击的选中态、CTA、分区标题、页面标题、状态强调 → 600。
  - 中文小字（18–20）优先 500；600 只用于选中/短按钮，避免中文糊成一团。
- 禁用组合：
  - 同屏 300 + 700（覆盖层面板标题单独成层时除外）。
  - 正文用 600 或 700。
  - 中文 13–15px 用 700。
  - 用 500 冒充 600 的选中态，导致焦点不明确。
  - 用 600 冒充 22 号按钮文字的字号放大。

---

## 6. 行高与字距

### 6.1 大字号（≥40）

- 行高使用画布固定值：76→110、62→68（1.1）、44→60、40→58。
- 字距：
  - 128 时钟：**-0.01em**（现有实现）。
  - 76 片名：画布 +1px；换 SF Pro Display 后目标 **0 ~ -0.5px**。
  - 62 详情片名：画布 +1px；换 SF Pro Display 后目标 **0**。
  - 40–44：**0 ~ -0.5px**。
- 大字号只收紧西文；中文标题不加负字距，避免笔画粘连。

### 6.2 中字号（20–39）

- 行高区间：**1.25–1.45**；已有固定值的按固定值（30/43、24/35、23/32）。
- 字距：**0**。不追踪中文标签。
- 搜索输入 34 保持 0；若 SF Pro Text 变宽导致光标贴近文字，优先加 2px 内边距，不加字距。

### 6.3 小字号（≤19）

- 行高区间：**1.35–1.5**；设置说明 14 使用 1.5。
- 字距：**0 ~ 0.01em**，只对纯西文/数字生效；中文 0。
- 时间码/版本号/traceId 用等宽数字，不靠字距对齐。

> 字距是“换字后的补偿”，不是新画布值。任何字距调整都必须保持原字号、原字重，并在验收截图里标注。

---

## 7. 加载与回退

### 7.1 字体文件目录与命名（当前：打包进客户端）

当前选择 **放项目、随包分发**。字体位于：

`C:\Users\vvuoan\Documents\Trae-CN\projects\tv-media-client\client\nastv-tauri\src\fonts\`

```text
src/fonts/
  sf-pro-display/                 Latin 子集
    SF-Pro-Display-Light.woff2      300
    SF-Pro-Display-Regular.woff2    400
    SF-Pro-Display-Medium.woff2     500
    SF-Pro-Display-Semibold.woff2   600
    SF-Pro-Display-Bold.woff2       700
  sf-pro-text/                    Latin 子集
    SF-Pro-Text-Regular.woff2       400
    SF-Pro-Text-Medium.woff2        500
    SF-Pro-Text-Semibold.woff2      600
    SF-Pro-Text-Bold.woff2          700
  sf-compact-text/                Latin 子集
    SF-Compact-Text-Regular.woff2   400
    SF-Compact-Text-Medium.woff2    500
  sf-mono/                        整字体
    SF-Mono-Regular.woff2           400
    SF-Mono-Medium.woff2            500
  new-york-large/                 整字体
    NewYorkLarge-Regular.woff2      400
    NewYorkLarge-Semibold.woff2     600
  pingfang-sc/                    GB2312 + 项目文案子集
    PingFangSC-Light.woff2          300
    PingFangSC-Regular.woff2        400
    PingFangSC-Medium.woff2         500
    PingFangSC-Semibold.woff2       600
```

- 全部为 **WOFF2**；Vite 构建时输出到 `dist/assets/*-<hash>.woff2`，不需要额外的 copy 插件。
- SF Pro Display / Text / Compact 先做 **Latin 子集**（基本拉丁、拉丁扩展、常用符号），因为界面中文全部由苹方承担；不做子集直接转 WOFF2 每个约 3.3 MB，19 个会超过 36 MB。
- SF Mono / New York Large 本身只有 100–143 KB，直接整字体转 WOFF2。
- 苹方四字重先 `pyftsubset`（GB2312 一级二级 6763 汉字 + 项目实际出现的全部非 ASCII 字符 + 中文标点与全角符号），再用 `--flavor=woff2` 输出，单字重约 1.12–1.15 MB。
- `src/fonts` 下**只放 `.woff2`**，不要放 `.ttf` / `.otf` 源文件，避免被 Vite 一起打进 `dist`。
- 源文件字重错位问题见 7.6；打包文件已按真实字重命名。

### 7.2 `@font-face`：私有族名 + `unicode-range` 分流

```css
@font-face {
  font-family: "Nastv SF Pro Display";
  src: url("../fonts/sf-pro-display/SF-Pro-Display-Light.woff2") format("woff2");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007E, U+00A0-024F, U+1E00-1EFF, U+20A0-20CF, U+2100-214F,
    U+2190-21FF, U+2200-22FF, U+25A0-25FF, U+2600-26FF;
}

@font-face {
  font-family: "Nastv PingFang SC";
  src: url("../fonts/pingfang-sc/PingFangSC-Light.woff2") format("woff2");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
  unicode-range: U+2000-206F, U+2E80-2EFF, U+3000-303F, U+3400-4DBF, U+4E00-9FFF,
    U+F900-FAFF, U+FE30-FE4F, U+FF00-FFEF;
}
```

- 族名统一加 `Nastv ` 前缀（如 `"Nastv PingFang SC"`），保证命中打包字体：系统里装过的苹果字体不会被误用，`document.fonts.check` 也能明确区分。
- `unicode-range` 中文与西文互斥：`U+2000–206F`（引号、破折号、省略号等中文标点）只出现在苹方范围，西文范围刻意不含它，避免同一段文字同时拉取两套字体。
- 每个真实字重单独一条声明，不使用可变字重区间。
- 全站 `font-display: swap`；`body` 已启用 `font-synthesis: none`，禁止伪粗体/伪斜体。
- 字体变量集中在 `src/styles/tokens.css`，`fonts.css` 只声明 face；组件只引用 `var(--font-*)`。

### 7.3 缺字重回退

不合成，不跳级：

| 缺失字重 | 回退到 | 说明 |
| ---: | ---: | --- |
| 300 | 400 | 大标题略重，可接受；不降到 200 |
| 400 | 500 | 正文略重，保证小字可读 |
| 500 | 400 | 标签回到常规，避免中文糊 |
| 600 | 500 | 选中态改用 Medium，仍保留层级 |
| 700 | 600 | 最重只到 Semibold |

回退映射写在 `@font-face` 的 `font-weight` 描述里，不通过浏览器合成实现。

### 7.4 文件缺失兜底

- SF 文件缺失：`--font-ui` 落到 `Inter`；中文继续落到 `PingFang SC` / `Noto Sans SC`。
- 苹方缺失：中文落到 `Noto Sans SC`。
- Inter 缺失：西文落到苹方自带拉丁，再落到 `sans-serif`。
- 等宽场景（时间码/版本/traceId）：SF Mono 缺失时用 `ui-monospace` / `Cascadia Mono` / `Consolas`，不强行用 Inter。
- 加载检测（必须写 `Nastv ...` 族名，检查的是打包字体本身）：

```ts
document.fonts.load('300 128px "Nastv SF Pro Display"', 'ABC');
document.fonts.load('500 20px "Nastv PingFang SC"', '中文');
document.fonts.check('400 20px "Nastv SF Pro Text"', 'Hello');
```

`document.fonts.status === "loaded"` 且上述 `load()` 返回至少 1 个 `FontFace` 时，才认为打包字体生效；任一为 false 时只在 `<html>` 上标记 `data-font="fallback"` 供开发核对，**不改字号、不改布局**。

> `document.fonts.check` 对系统里已安装的同名字体可能误报 `true`，所以运行期最终判定用 CDP `CSS.getPlatformFontsForNode` 看 `isCustomFont`。

### 7.5 装到系统 vs 放项目（本次选择：放项目）

| 路径 | 具体位置 | 是否进安装包 | 权限 | 适用 |
| --- | --- | --- | --- | --- |
| 系统 | `%LOCALAPPDATA%\Microsoft\Windows\Fonts` | 否 | 当前用户，无需管理员 | 个人自用；所有应用可用；换机需重装 |
| **项目（当前）** | `...\nastv-tauri\src\fonts\` | 是，Vite 输出到 `dist/assets` | 无 | 换机即用；体积增加约 5.1 MB |

- 客户端只依赖 `src/fonts` 里的 WOFF2；已装到系统的 19 个字体可以保留，但**不是运行前提**，删掉也不影响渲染。
- 新增字体先按 7.1 转 WOFF2/子集，再在 `fonts.css` 增加对应字重的 `@font-face`，最后更新 `tokens.css` 的字体栈。
- 体积红线：新增一个中文字重的子集应控制在 1–3 MB；超过 3 MB 说明子集范围失控，先检查 charset 是否混入了非项目字符。

### 7.6 苹方源文件的字重错位（重要）

`<字体素材目录>/中文字体` 下 6 个 `.ttf` 的**文件名与内部真实字重不一致**，这是分卷工具按错误顺序命名的结果。必须按 `name` 表（platform 0）的 ID2 与 PANOSE `bWeight` 取值：

| 源文件名 | 内部真实字重 | PANOSE bWeight | 处理 |
| --- | --- | ---: | --- |
| `PingFang ExtraLight_0.ttf` | Ultralight | 1 | 不使用 |
| `PingFang Light_0.ttf` | Thin | 2 | 不使用 |
| `PingFang Regular_0.ttf` | **Light（300）** | 3 | 导出为 `PingFangSC-Light.ttf` |
| `PingFang Medium_0.ttf` | **Regular（400）** | 4 | 导出为 `PingFangSC-Regular.ttf` |
| `PingFang Bold_0.ttf` | **Medium（500）** | 6 | 导出为 `PingFangSC-Medium.ttf` |
| `PingFang Heavy_0.ttf` | **Semibold（600）** | 8 | 导出为 `PingFangSC-Semibold.ttf` |

导出时只改 `name` 表（ID 1/2/4/6/16/17）与 `OS/2.usWeightClass`、`fsSelection`、`panose.bWeight`，把四个字重统一到同一族名 `PingFang SC`；`glyf`、`cmap`、`hmtx` 均未改动。

---

## 8. 禁止项

1. 组件内散写 `font-family`。组件只允许用 `var(--font-ui)` / `var(--font-display)` / `var(--font-compact)` / `var(--font-mono)` / `var(--font-editorial)`。
2. 用字重冒充字号：禁止用 700 让 18px 看起来像 24px。
3. 拉伸字体：禁止 `transform: scaleX()`、`font-stretch`、`font-size-adjust` 做视觉适配。
4. 混用两套西文字族：同一组件内不允许 SF Pro Text + SF Compact，或 SF + New York 混排。
5. 用 `.ttc` 直接上线；必须先提取单字重。
6. 用伪粗体/伪斜体补字重。
7. 对中文标签加正字距来“撑满”容器。
8. 为了塞进按钮而缩小字号；只能调内边距或字距。
9. 引用来源不明或改名的苹果字体文件。

---

## 9. 落地检查清单（换字后逐项验收）

| 检查点 | 画布/容器 | 判定 | 只允许的修正 |
| --- | --- | --- | --- |
| 时钟 128 | 容器宽 640 | `scrollWidth ≤ 640`，单行 | 字距 -0.01em ~ -0.015em；左右 padding ±2px |
| 影视标题 76 | 容器宽 1000，行高 110 | 不超出 2 行，不压到按钮 | 字距 0 ~ -0.5px；行高 108–112 |
| 磁贴标签 20 | 磁贴 268×150 | 单行不溢出 | 字距 0 ~ -0.2px；内边距 0 8px |
| 导航标签 20 | 导航宽 76 | 两字中文不换行 | 字距 0 ~ -0.2px；不改宽度 |
| 设置行文本 19/14 | 文本列自适应，控件 flex-none | 标签最多 2 行，说明不压控件 | 行间距 32→24；padding ±2px |
| 按钮 148×60 | 内边距 26 | 文字 + 图标不溢出 | 内边距 26→20；字距 0；字号不变 |
| 详情片名 62 | 宽 1120，行高 1.1 | 不超出内容区 | 字距 +1→0；不改字号 |
| 搜索输入 34 | 输入框 632×88 | 光标不贴文字 | 内边距 +2px；字距 0 |
| 时间码 18 | 最小宽 56 | `00:00` / `--:--` 不跳宽 | `tabular-nums`；宽度 56–60 |
| 状态胶囊 15/13 | 高 24–28 | 单行不裁切 | 左右 padding ±2px；字重 600 不变 |

验收时必须同时看：
- 纯中文、纯西文、中英混排三种样本；
- 默认态与聚焦态；
- 1280×720、1920×1080 两个视口（`--u` 缩放后）；
- 缺字重时的回退效果。

---

## 10. 与现有实现的差异（已落地）

| 项 | 现状 | 本规范目标 |
| --- | --- | --- |
| 字族声明 | 已收敛到 `src/styles/tokens.css` 的 5 个变量；组件不再散写字体栈 | 保持；新增文字只引用变量 |
| 苹果字体 | 19 个 WOFF2 打包在 `src/fonts/`（5,351,788 B），以 `Nastv ...` 族名随构建进 `dist` | 按 7.1 / 7.2 维护；换机无需安装 |
| 磁贴标签 | 实现 24 | 画布 20，落地时收敛 |
| 面板标题 | 38/700 | 保留 38/700；同屏不再出现第二个 700 |
| 详情片名 | 62/300/+1px | 62/300，换 SF 后字距目标 0 |
| 集号 | 15，已改为 SF Mono + `tabular-nums` | 保持 |
| 时间码 | 18，默认字族 | 18，SF Mono + `tabular-nums` |
| 版本号/traceId | 16，默认字族 | 16，SF Mono + `tabular-nums` |
| 字幕正文层 | 未实现 | 不凭空定义；随画布补 |
| 缺字重 | `font-synthesis: none` 已开启 | 相邻字重回退，不合成 |

已收敛位置：

- `src/styles/tokens.css`：`--font-ui` / `--font-display` / `--font-compact` / `--font-mono` / `--font-editorial`（唯一字体栈来源）
- `src/styles/fonts.css`：19 条 `@font-face`，`Nastv ...` 族名 + `font-display: swap` + 中/西文 `unicode-range`
- `src/main.tsx`：`tokens.css`、`fonts.css` 在 `home.css` / `pages.css` 之前导入
- `body`、`.clockbox .clock`、`.saver-clock`、`.kkey`、`.krow.last .kkey` 全部使用 `var(--font-*)`
- 大字号标题统一 `var(--font-display)`：`.lhero-title`、`.section-title`、`.panel h3`、`.modal-title`
- `src/styles/pages.css`：`.detail-title`、`.set-head h1`、`.subs-group h2` 使用 `var(--font-display)`；`.epcard-idx` 使用 `var(--font-mono)` + `tabular-nums`
- 全项目 `font-family` 只剩 `fonts.css` 的 `@font-face` 声明与 `var(--font-*)` 引用，没有散写字体栈

---

## 附录 A · `<字体素材目录>` 实况与实测族名

### A.1 目录清单

`<字体素材目录>` 根目录下只有 8 个 `.dmg`，没有直接的 `.otf` / `.ttf` / `.ttc`，也没有 `.pkg`。

| 文件 | 大小 | 类型 | 包内结构 | 提取结果 |
| --- | ---: | --- | --- | --- |
| `SF-Pro.dmg` | 208.69 MB | DMG | `SFProFonts.pkg` | 47 个字体：Display / Text / Rounded 各字重，另有可变 `SF-Pro.ttf` |
| `SF-Compact.dmg` | 170.11 MB | DMG | `SFCompactFonts.pkg` | Display / Text / Rounded 各字重，另有可变 `SF-Compact.ttf` |
| `SF-Mono.dmg` | 1.53 MB | DMG | `SFMonoFonts/SF Mono Fonts.pkg` | 12 个 SF Mono OTF（含斜体） |
| `NY.dmg` | 5.25 MB | DMG | `NYFonts/NY Fonts.pkg` | `NewYork.ttf` 可变字体 + NewYork Small / Medium / Large / ExtraLarge 各字重 |
| `SF-Arabic.dmg` | 1.43 MB | DMG | 阿拉伯文专用 | 未提取 |
| `SF-Armenian.dmg` | 0.92 MB | DMG | 亚美尼亚文专用 | 未提取 |
| `SF-Georgian.dmg` | 0.95 MB | DMG | 格鲁吉亚文专用 | 未提取 |
| `SF-Hebrew.dmg` | 1.59 MB | DMG | 希伯来文专用 | 未提取 |

曾提取到临时目录（**现已安装到用户字体目录，临时目录已清理**）：

- `%TEMP%\apple-fonts-extract\pro-fonts\Library\Fonts\`（已删除）
- `...\compact-fonts\Library\Fonts\`（已删除）
- `...\mono-fonts\Library\Fonts\`（已删除）
- `...\ny-fonts\Library\Fonts\`（已删除）

中文目录 `<字体素材目录>/中文字体` 没有子目录，只有 6 个已拆好的 `.ttf`（合计约 65.8 MB）：

| 文件 | 大小 | 内部真实字重 | 是否导出 |
| --- | ---: | --- | --- |
| `PingFang ExtraLight_0.ttf` | 10.52 MB | Ultralight | 否 |
| `PingFang Light_0.ttf` | 10.51 MB | Thin | 否 |
| `PingFang Regular_0.ttf` | 10.49 MB | Light（300） | 是 → `split\PingFangSC-Light.ttf` |
| `PingFang Medium_0.ttf` | 10.46 MB | Regular（400） | 是 → `split\PingFangSC-Regular.ttf` |
| `PingFang Bold_0.ttf` | 10.42 MB | Medium（500） | 是 → `split\PingFangSC-Medium.ttf` |
| `PingFang Heavy_0.ttf` | 10.39 MB | Semibold（600） | 是 → `split\PingFangSC-Semibold.ttf` |

没有 `.ttc`、`.dmg`、`.pkg`，也没有 PingFang HK / TC；本目录全部是 `PingFang SC`。

### A.2 提取方法（Windows）

使用 7-Zip（本机 `7z.exe`）逐层解开：

```powershell
# 1. DMG -> pkg
7z x "<字体素材目录>\SF-Pro.dmg" -o<TEMP>\pro-dmg -y

# 2. pkg -> Payload
7z x "<TEMP>\pro-dmg\SFProFonts.pkg" -o<TEMP>\pro-pkg -y

# 3. gzip Payload -> Payload~（cpio）
7z x "<TEMP>\pro-pkg\SFProFontsPackage.pkg\Payload" -o<TEMP>\pro-payload -y

# 4. cpio -> Library/Fonts/*.otf
7z x "<TEMP>\pro-payload\Payload~" -o<TEMP>\pro-fonts -y
```

- `.pkg` 是 xar 包，内含 `Payload`（gzip 压缩的 cpio）。
- 解到 `Library/Fonts/` 的就是可直接安装的 `.otf` / `.ttf`。
- 不要直接双击 DMG；Windows 不识别 HFS/APFS。

### A.3 fontTools 实测族名与字重

用 `fontTools.ttLib.TTFont` 读取 `name` 表（ID 1/2/4/6/16/17）与 `OS/2.usWeightClass`，结果如下：

| 文件 | family（ID1/16） | subfamily（ID2/17） | usWeightClass | CSS `font-family` | CSS `font-weight` |
| --- | --- | --- | ---: | --- | ---: |
| `SF-Pro-Display-Light.otf` | SF Pro Display | Light | 300 | `"SF Pro Display"` | 300 |
| `SF-Pro-Display-Regular.otf` | SF Pro Display | Regular | 400 | `"SF Pro Display"` | 400 |
| `SF-Pro-Display-Medium.otf` | SF Pro Display | Medium | 500 | `"SF Pro Display"` | 500 |
| `SF-Pro-Display-Semibold.otf` | SF Pro Display | Semibold | 600 | `"SF Pro Display"` | 600 |
| `SF-Pro-Display-Bold.otf` | SF Pro Display | Bold | 700 | `"SF Pro Display"` | 700 |
| `SF-Pro-Text-Regular.otf` | SF Pro Text | Regular | 400 | `"SF Pro Text"` | 400 |
| `SF-Pro-Text-Medium.otf` | SF Pro Text | Medium | 500 | `"SF Pro Text"` | 500 |
| `SF-Pro-Text-Semibold.otf` | SF Pro Text | Semibold | 600 | `"SF Pro Text"` | 600 |
| `SF-Pro-Text-Bold.otf` | SF Pro Text | Bold | 700 | `"SF Pro Text"` | 700 |
| `SF-Compact-Text-Regular.otf` | SF Compact Text | Regular | 400 | `"SF Text"`（本机实测） | 400 |
| `SF-Compact-Text-Medium.otf` | SF Compact Text | Medium | 500 | `"SF Text"`（本机实测） | 500 |
| `SF-Mono-Regular.otf` | SF Mono | Regular | 400 | `"SF Mono"` | 400 |
| `SF-Mono-Medium.otf` | SF Mono | Medium | 500 | `"SF Mono"` | 500 |
| `SF-Pro.ttf` | SF Pro | Regular | 400 | `"SF Pro"` | 可变：`wght` 1–1000，`opsz` 17–28，`wdth` 30–150 |
| `NewYork.ttf` | New York | Regular | 400 | `"New York"` | 可变：`wght` 400–1000，`opsz` 12–256 |
| `NewYorkLarge-Regular.otf` | New York Large | Regular | 400 | `"New York Large"` | 400 |
| `NewYorkLarge-Semibold.otf` | New York Large | Semibold | 600 | `"New York Large"` | 600 |
| `PingFangSC-Light.ttf` | PingFang SC | Light | 300 | `"PingFang SC"` | 300 |
| `PingFangSC-Regular.ttf` | PingFang SC | Regular | 400 | `"PingFang SC"` | 400 |
| `PingFangSC-Medium.ttf` | PingFang SC | Medium | 500 | `"PingFang SC"` | 500 |
| `PingFangSC-Semibold.ttf` | PingFang SC | Semibold | 600 | `"PingFang SC"` | 600 |

结论：

- 设计稿里的 `SF Pro Display` / `SF Pro Text` / `SF Mono` / `PingFang SC` 都是 **真实族名**，可以直接写进 CSS。
- `SF Compact Text` 的 name 表族名是 `SF Compact Text`，但本机 DirectWrite/WebView2 曾把它映射为 **`SF Text`**；打包后统一声明为 `"Nastv SF Compact Text"`，不依赖该系统别名，字重仍只有 400/500。
- 打包字体族名统一加 `Nastv ` 前缀；系统安装版可以保留作设计预览，客户端渲染只认打包字体。
- `SF-Pro.ttf` 的族名是 **SF Pro**，不能当 Display/Text 用；它适合用可变轴统一缩放字重，但会改变现有族名映射，不建议首批使用。
- `New York`（`NewYork.ttf`）与 `New York Large`（`NewYorkLarge-*.otf`）是两个族名，不能互换。
- 苹方 6 个源文件的文件名与内部字重错位；已按 name 表校正为 `PingFang SC` 单族四字重，CSS 只写一个族名。

### A.4 苹方实测、拆分与验证（已完成）

`<字体素材目录>/中文字体` 里是 6 个已经拆好的 `.ttf`，本次不需要 `TTCollection`。处理步骤：

1. 用 `TTFont` 读取每个文件的 `name` 表；**以 platform 0 的 ID2 为准**，platform 3 的 ID1 已被错误改写（例如文件名 `Bold_0` 的 platform 3 写 `PingFang SC Bold`，platform 0 实际是 `Medium`）。
2. 用 `OS/2.panose.bWeight` 与字形包围盒交叉验证字重顺序，结果与 platform 0 一致。
3. 按真实字重选择 Light / Regular / Medium / Semibold 四个源文件，重写 `name` 与 `OS/2` 元数据，另存到 `<字体素材目录>/中文字体/split/`。
4. 用 fontTools 复读 4 个导出文件，验证结果：

| 导出文件 | family / subfamily | usWeightClass | numGlyphs | cmap | CJK 覆盖 | 永 bbox |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `PingFangSC-Light.ttf` | PingFang SC / Light | 300 | 42199 | 29924 | 13174 | 48, -98, 956, 818 |
| `PingFangSC-Regular.ttf` | PingFang SC / Regular | 400 | 42199 | 29924 | 13174 | 42, -101, 960, 820 |
| `PingFangSC-Medium.ttf` | PingFang SC / Medium | 500 | 42199 | 29924 | 13174 | 34, -104, 965, 824 |
| `PingFangSC-Semibold.ttf` | PingFang SC / Semibold | 600 | 42199 | 29924 | 13174 | 31, -105, 968, 826 |

- 四个文件都不是空壳：字形数 42199、cmap 29924、CJK 覆盖 13174，`永` 的包围盒随字重单调加粗。
- `hhea` 为 1060 / -340 / 0，`OS/2` typo 为 860 / -140 / 400，行高均为 1.4em，与源文件一致。
- 本机 fontTools 已安装：`python -m pip install --user fonttools`。
- 若后续拿到 `PingFang.ttc`，再用 `TTCollection` 遍历 face，按 name 表选出 `PingFang SC` 的 Light / Regular / Medium / Semibold，不要按索引猜；拆完同样复读验证。

### A.5 打包结果、字符覆盖与 WebView2 实测（2026-11-16）

**字体清单与体积**（源文件取系统安装目录 / `split`，打包文件取 `src/fonts`）：

| 文件 | 字重 | 源文件 B | 打包后 B | 压缩率 | 处理 |
| --- | ---: | ---: | ---: | ---: | --- |
| `SF-Pro-Display-Light.woff2` | 300 | 6,327,664 | 51,552 | 99.19% | Latin 子集 + WOFF2 |
| `SF-Pro-Display-Regular.woff2` | 400 | 6,174,740 | 44,368 | 99.28% | Latin 子集 + WOFF2 |
| `SF-Pro-Display-Medium.woff2` | 500 | 6,354,924 | 51,476 | 99.19% | Latin 子集 + WOFF2 |
| `SF-Pro-Display-Semibold.woff2` | 600 | 6,415,144 | 51,700 | 99.19% | Latin 子集 + WOFF2 |
| `SF-Pro-Display-Bold.woff2` | 700 | 6,390,756 | 49,500 | 99.23% | Latin 子集 + WOFF2 |
| `SF-Pro-Text-Regular.woff2` | 400 | 6,177,364 | 43,964 | 99.29% | Latin 子集 + WOFF2 |
| `SF-Pro-Text-Medium.woff2` | 500 | 6,328,376 | 50,836 | 99.20% | Latin 子集 + WOFF2 |
| `SF-Pro-Text-Semibold.woff2` | 600 | 6,387,648 | 50,392 | 99.21% | Latin 子集 + WOFF2 |
| `SF-Pro-Text-Bold.woff2` | 700 | 6,366,092 | 48,396 | 99.24% | Latin 子集 + WOFF2 |
| `SF-Compact-Text-Regular.woff2` | 400 | 6,338,508 | 44,344 | 99.30% | Latin 子集 + WOFF2 |
| `SF-Compact-Text-Medium.woff2` | 500 | 6,350,004 | 44,740 | 99.30% | Latin 子集 + WOFF2 |
| `SF-Mono-Regular.woff2` | 400 | 109,692 | 61,888 | 43.58% | 整字体 WOFF2 |
| `SF-Mono-Medium.woff2` | 500 | 110,632 | 62,636 | 43.38% | 整字体 WOFF2 |
| `NewYorkLarge-Regular.woff2` | 400 | 140,688 | 71,980 | 48.83% | 整字体 WOFF2 |
| `NewYorkLarge-Semibold.woff2` | 600 | 143,080 | 73,584 | 48.57% | 整字体 WOFF2 |
| `PingFangSC-Light.woff2` | 300 | 11,004,496 | 1,124,112 | 89.78% | GB2312 + 项目子集 + WOFF2 |
| `PingFangSC-Regular.woff2` | 400 | 10,968,208 | 1,134,716 | 89.65% | GB2312 + 项目子集 + WOFF2 |
| `PingFangSC-Medium.woff2` | 500 | 10,923,048 | 1,152,368 | 89.45% | GB2312 + 项目子集 + WOFF2 |
| `PingFangSC-Semibold.woff2` | 600 | 10,898,372 | 1,139,236 | 89.55% | GB2312 + 项目子集 + WOFF2 |
| **合计** | | **113,909,436** | **5,351,788** | **95.30%** | |

分组：SF Pro Display 248,596 B；SF Pro Text 193,588 B；SF Compact 89,084 B；SF Mono 124,524 B；New York 145,564 B；PingFang 4,550,432 B。

**dist 体积变化**：

| 状态 | dist 总字节 | 说明 |
| --- | ---: | --- |
| 打包前 | 368,508 | 仅 JS/CSS/HTML |
| 打包后 | 5,725,894 | JS 306,430 + CSS 67,284 + HTML 392 + 字体 5,351,788 |
| 增量 | +5,357,386 | 字体占 dist 的 93.5% |

**字符覆盖验证**：

- 扫描 92 个项目源文件（`src/**/*.tsx` / `*.ts` / `*.css` / `*.html` / `*.json`）。
- 字符集构成：GB2312 一级二级 6763 汉字 + 项目实际非 ASCII 649 字（过滤 BOM/控制字符后 648）+ 中文标点与全角符号，去重后 6798 字。
- 项目侧 CJK + 中文标点 640 字、其他符号 8 字。
- 四个苹方子集逐一比对：`missing_cjk = 0`、`missing_other = 0`；**缺失字符数 0**，不存在缺字方块。
- SF Latin 子集覆盖项目全部拉丁字符，缺失 0；`New York Large` 本身不含 `→`，该字族未用于 UI 符号，由回退字体处理。

**`document.fonts` 实测**：

| 检查 | 结果 |
| --- | --- |
| `document.fonts.status` | `loaded` |
| `document.fonts.load('300 16px "Nastv SF Pro Display"', 'ABC 123')` | 返回 1 个 FontFace，`check = true` |
| `document.fonts.load('400 16px "Nastv SF Pro Text"', 'ABC 123')` | 返回 1 个 FontFace，`check = true` |
| `document.fonts.load('500 16px "Nastv PingFang SC"', '中文测试')` | 返回 1 个 FontFace，`check = true` |
| `document.fonts.load('600 16px "Nastv PingFang SC"', '中文测试')` | 返回 1 个 FontFace，`check = true` |
| `document.fonts.load('400 16px "Nastv SF Mono"', '12:34')` | 返回 1 个 FontFace，`check = true` |

WebView2 实际字形命中（CDP `CSS.getPlatformFontsForNode`，不是 `document.fonts.check`）：

| 元素 | 实际字体 | `isCustomFont` |
| --- | --- | --- |
| 首页时钟 `.clockbox .clock` | `SFProDisplay-Light` | `true` |
| 首页日期 `.clockbox .date` | 中文 `PingFangSC-Medium` + 数字 `SFProText-Medium` | `true` |
| 首页磁贴标签 `.tile .nm` | `PingFangSC-Medium` | `true` |
| 导航选中态 `.navitem.on span` | `PingFangSC-Semibold` | `true` |
| 详情主按钮 `.dbtn.primary` | `PingFangSC-Semibold` | `true` |
| 详情季标签 `.detail-tabs button` | 数字 `SFProText-Semibold` + 中文 `PingFangSC-Semibold` | `true` |
| 分集序号 `.epcard-idx` | `SFMono-Regular` | `true` |

`isCustomFont: true` 证明命中的是打包的 webfont，而不是系统字体。

**溢出复测**（1920×1080 设计尺寸，与系统字体版本一致）：

| 检查点 | 实测 | 判定 |
| --- | --- | --- |
| 时钟 128 | 292.3 / 640 | 通过 |
| 影视标题 76 | 2 行，最大行宽 924 / 1000 | 通过 |
| 日期 26 | 164.1 / 640 | 通过 |
| 磁贴标签 20 | 80 / 238 | 通过 |
| 导航标签 20 | 60 / 76 | 通过 |
| 设置行 19 | 文本列 380 内 2 行 | 通过 |
| 按钮 148×60 | 文字 176.4×60 内 | 通过 |
| 长简介 23/32 | 3 行，最大 850 / 860 | 通过 |

结论：WOFF2 字体的字宽与系统安装版一致，**没有为字宽变化调整字距或内边距**；唯一主动设置是集号 `.epcard-idx` 使用 SF Mono + `tabular-nums`，属于原有设计。

截图（`C:\Users\vvuoan\Documents\Trae-CN\temp_20261113_01\_verify\`）：

- `bundle-after-home.png` / `bundle-after-settings.png` / `bundle-after-detail.png`
- `bundle-compare-home.png` / `bundle-compare-settings.png`（系统字体 vs 打包字体对比）

注意：

- 已装到系统的 19 个字体仍然保留，但客户端渲染不读取它们；在未安装这些字体的机器上，`Nastv ...` 族名只会匹配打包字体。
- `SF Compact Text` 在部分 DirectWrite 环境下被映射为 `"SF Text"`；打包后统一使用 `"Nastv SF Compact Text"`，不再受该别名影响。

---

## 11. 变更记录

| 日期 | 版本 | 说明 |
| --- | --- | --- |
| 2026-11-16 | 0.1 | 首版；字族分工、字号阶梯、场景映射、混排、字重、行高字距、加载回退、禁止项、验收清单 |
| 2026-11-16 | 0.2 | 按 `<字体素材目录>` 实测结果校正族名与文件名；新增系统安装/项目打包对比、DMG 提取步骤、fontTools 实测表；标注苹方缺失 |
| 2026-11-16 | 0.3 | 苹方到位：记录 6 个 `.ttf` 的真实字重、纠正文件名错位；拆出 `PingFangSC-Light/Regular/Medium/Semibold.ttf` 到 `<字体素材目录>/中文字体/split/`，补安装清单与 fontTools 复读验证数据 |
| 2026-11-16 | 0.4 | 19 个字体已安装并写入 HKCU；CSS 收敛为 5 个字体变量并切换 SF + 苹方；补 `font-synthesis: none`、SF Mono 集号、实际渲染验证与溢出测量结果 |
| 2026-11-16 | 0.5 | 改为随包分发：19 个 WOFF2 打包进 `src/fonts/`（5,351,788 B），SF 做 Latin 子集、苹方做 GB2312 + 项目文案子集；`Nastv ...` 私有族名 + `unicode-range` 中西分流；字体变量迁到 `tokens.css`；补字符覆盖 0 缺失、`document.fonts` 与 `isCustomFont` 实测、dist 体积与对比截图 |
