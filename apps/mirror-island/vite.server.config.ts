import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "server/index.ts",
    outDir: "dist/runtime",
    emptyOutDir: true,
    target: "node22",
    minify: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
      },
    },
  },
});
