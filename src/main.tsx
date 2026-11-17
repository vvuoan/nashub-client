import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/fonts.css";
// 本地字体（苹果专有，不入库）：存在 fonts.local.css 时自动打包，缺失时跳过。
import.meta.glob("./styles/fonts.local.css", { eager: true });
import "./styles/home.css";
import "./styles/pages.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
