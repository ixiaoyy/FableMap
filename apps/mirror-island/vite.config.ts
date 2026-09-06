import vue from "@vitejs/plugin-vue";
import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const DEV_ART_PREVIEWS = new Map([
  ["/__dev-art/fresh-pastoral-tools-v1.png", fileURLToPath(new URL("../../artifacts/pastoral-redesign-2026-09-06/tools-v1.png", import.meta.url))],
  ["/__dev-art/fresh-pastoral-cottage-v1.png", fileURLToPath(new URL("../../artifacts/pastoral-redesign-2026-09-06/cottage-v1.png", import.meta.url))],
  ["/__dev-art/fresh-pastoral-interior-v1.png", fileURLToPath(new URL("../../artifacts/pastoral-redesign-2026-09-06/interior-v1.png", import.meta.url))],
]);

/** Serves only the three fixed candidate files for GET/HEAD; unknown or missing previews return text without exposing disk paths. */
async function serveDevArtPreview(request: IncomingMessage, response: ServerResponse, next: () => void): Promise<void> {
  const pathname = (request.url ?? "").split("?", 1)[0] ?? "";
  if (!pathname.startsWith("/__dev-art/")) {
    next();
    return;
  }
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  const candidatePath = DEV_ART_PREVIEWS.get(pathname);
  if (!candidatePath) {
    response.statusCode = 404;
    response.end(request.method === "HEAD" ? undefined : "Unknown development art preview.\n");
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end("Development art previews only support GET and HEAD.\n");
    return;
  }
  try {
    const image = await readFile(candidatePath);
    response.setHeader("Content-Type", "image/png");
    response.setHeader("Content-Length", image.byteLength);
    response.end(request.method === "HEAD" ? undefined : image);
  } catch {
    response.statusCode = 404;
    response.end(request.method === "HEAD" ? undefined : "Development art preview has not been generated yet.\n");
  }
}

/** Adds fixed candidate routes to the Vite development server only; builds, public files and filesystem access rules are unchanged. */
function devArtPreviewPlugin(): Plugin {
  return {
    name: "mirror-island-dev-art-preview",
    apply: "serve",
    /** Registers the allowlisted request handler before Vite's regular development middleware. */
    configureServer(server) {
      server.middlewares.use(serveDevArtPreview);
    },
  };
}

export default defineConfig({
  base: process.env.VITE_MIRROR_BASE_PATH || "/",
  plugins: [vue(), devArtPreviewPlugin()],
  server: {
    port: 8080,
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
});
