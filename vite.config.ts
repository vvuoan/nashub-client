import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite 只负责 Web 层；Tauri 的 devUrl 固定 1420，strictPort 防止端口漂移。
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "127.0.0.1",
    watch: { ignored: ["**/src-tauri/**"] },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "chrome105",
    sourcemap: false,
  },
});
