# 字体文件放置说明

本目录**不包含**字体二进制文件。仓库只保留目录约定与一份 `@font-face` 模板，
`.woff2` 文件需使用者自备，放入下面列出的路径后才能精细还原设计稿字形。

## 为什么不在仓库里

项目设计稿使用 SF Pro / SF Compact / SF Mono / New York / PingFang SC 这几套苹果专有字体。
这些字体受 Apple 授权限制，不允许随代码公开分发，因此本仓库只保留声明模板与目录约定，
字体文件一律通过 `.gitignore` 排除。

## 如何启用本地字体

```bash
# 1) 把模板复制为本地文件（该文件已被 .gitignore 忽略）
cp src/styles/fonts.local.css.example src/styles/fonts.local.css
# 2) 按下面的路径放入自备的 19 个 woff2
```

`src/styles/fonts.css` 只保留 `--font-*` 回退栈；`fonts.local.css` 只在存在时被
`main.tsx` 用 `import.meta.glob` 自动打包，不存在时直接跳过，**不影响构建**。

## 需要自备的文件（按模板中的引用路径）

```
src/fonts/sf-pro-display/SF-Pro-Display-Light.woff2      (300)
src/fonts/sf-pro-display/SF-Pro-Display-Regular.woff2    (400)
src/fonts/sf-pro-display/SF-Pro-Display-Medium.woff2     (500)
src/fonts/sf-pro-display/SF-Pro-Display-Semibold.woff2   (600)
src/fonts/sf-pro-display/SF-Pro-Display-Bold.woff2       (700)
src/fonts/sf-pro-text/SF-Pro-Text-Regular.woff2          (400)
src/fonts/sf-pro-text/SF-Pro-Text-Medium.woff2           (500)
src/fonts/sf-pro-text/SF-Pro-Text-Semibold.woff2         (600)
src/fonts/sf-pro-text/SF-Pro-Text-Bold.woff2             (700)
src/fonts/sf-compact-text/SF-Compact-Text-Regular.woff2  (400)
src/fonts/sf-compact-text/SF-Compact-Text-Medium.woff2   (500)
src/fonts/sf-mono/SF-Mono-Regular.woff2                  (400)
src/fonts/sf-mono/SF-Mono-Medium.woff2                   (500)
src/fonts/new-york-large/NewYorkLarge-Regular.woff2      (400)
src/fonts/new-york-large/NewYorkLarge-Semibold.woff2     (600)
src/fonts/pingfang-sc/PingFangSC-Light.woff2             (300)
src/fonts/pingfang-sc/PingFangSC-Regular.woff2           (400)
src/fonts/pingfang-sc/PingFangSC-Medium.woff2            (500)
src/fonts/pingfang-sc/PingFangSC-Semibold.woff2          (600)
```

## 没有字体时的降级

缺字体不会导致构建失败：`fonts.css` 不含任何 `url()` 引用，Vite 不解析不存在的字体文件；
`font-display: swap` 先渲染回退字体。`--font-*` 变量自带系统字体栈，页面仍可用，
只是字形与设计稿不一致。

## 开源可选替代

不想使用苹果字体时，可把 `fonts.css` 里的 `font-family` 改为系统字体（`-apple-system`、
`PingFang SC`、`Microsoft YaHei`）或开源字体：

- 拉丁文/无衬线：Inter（OFL，本目录保留了许可证文本 `FONT-LICENSE-OFL.txt`）
- 中文：Noto Sans SC / Source Han Sans（OFL）
