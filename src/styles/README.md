# src/styles/ — 样式与 token

| 文件 | 作用 |
|---|---|
| `tokens.css` | 交互与版面 token（缩放基准 `--u`、焦点环、直播布局尺寸等） |
| `fonts.css` | 字体回退栈 `--font-ui/display/compact/mono/editorial`；不含 `url()` |
| `fonts.local.css.example` | 19 条 `@font-face` 模板（苹果专有字体）；复制为 `fonts.local.css` 后生效 |
| `home.css` | 首页专用版面与货架样式 |
| `pages.css` | 其它页面共用样式 |

## 规则

- 颜色、字号、间距、圆角、焦点环都必须来自 token；不在组件里硬编码。
- `fonts.css` 禁止出现 `url()`：缺失字体文件会让 Vite 构建失败。
- 新增页面样式优先进 `pages.css`；单页复杂到需要独立文件时，放在本目录并以页面名命名。
