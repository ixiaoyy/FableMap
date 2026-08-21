import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_MIRROR_BASE_PATH || "/",
  plugins: [vue()],
  server: {
    port: 8080,
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
});
