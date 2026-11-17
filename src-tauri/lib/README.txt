把 Windows 运行库放在这个目录，打包时由 tauri.conf.json 的 bundle.resources 带入：

  libmpv-2.dll        zhongfly/mpv-winbuild 的 mpv-dev-lgpl-x86_64-*.7z
  libmpv-wrapper.dll  nini22P/libmpv-wrapper releases 的 windows-x86_64.zip

也可以直接运行：npm run setup:libmpv

注意：本目录的 dll 不提交到 git（见 .gitignore）。
