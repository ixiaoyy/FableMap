import { mediaUrl } from "./media-catalog.ts";

const CHARACTER_ART_PATH = "assets/original/islander/2026-09-07-v3";
const CHARACTER_ART_VERSION = "2026-09-07-v3";
const ATLAS_WIDTH = 432;
const ATLAS_HEIGHT = 1536;
const LOAD_TIMEOUT_MS = 15_000;

/** Decoded source images shared by Vue and Phaser; callers may draw them but must not change their src or dimensions. */
export interface CharacterArtSources {
  readonly layers: HTMLImageElement;
  readonly materials: HTMLImageElement;
}

let sources: Readonly<CharacterArtSources> | null = null;
let pendingLoad: Promise<void> | null = null;

/**
 * Loads one fixed character atlas within fifteen seconds, returning a canvas-readable source image.
 * The filename is project-owned; each 432 × 1536 atlas contains three part columns and six variant rows.
 * Anonymous CORS must be set before src so an explicit media-base override cannot silently taint recoloring canvases.
 */
async function loadCharacterAtlas(filename: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let timeout: number | null = null;

    /** Settles this image request exactly once and releases its handlers/timer; failed requests discard their unfinished source. */
    function finish(error?: Error): void {
      if (settled) return;
      settled = true;
      if (timeout !== null) window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      if (error) {
        image.removeAttribute("src");
        reject(error);
      } else resolve();
    }

    image.onload = () => finish();
    image.onerror = () => finish(new Error(`角色素材 ${filename} 加载失败，请重试。`));
    timeout = window.setTimeout(() => {
      finish(new Error(`角色素材 ${filename} 加载超时（15 秒），请重试。`));
    }, LOAD_TIMEOUT_MS);
    image.src = mediaUrl(`${CHARACTER_ART_PATH}/${filename}`, CHARACTER_ART_VERSION);
  });
  if (image.naturalWidth !== ATLAS_WIDTH || image.naturalHeight !== ATLAS_HEIGHT) {
    throw new Error(`角色素材 ${filename} 尺寸错误，需要 ${ATLAS_WIDTH} × ${ATLAS_HEIGHT}。`);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法准备角色素材画布，请刷新重试。");
  try {
    // Drawing forces the loaded image to decode without relying on a separate decode() promise.
    context.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1);
    context.getImageData(0, 0, 1, 1);
  } catch {
    throw new Error(`角色素材 ${filename} 无法读取像素，请检查素材访问配置后重试。`);
  }
  return image;
}

/**
 * Prepares both character atlases once and resolves only after decode, dimensions and canvas access have passed.
 * Concurrent callers share one promise; failed attempts publish no partial sources and the next call retries both images.
 */
export function ensureCharacterArtReady(): Promise<void> {
  if (sources) return Promise.resolve();
  if (pendingLoad) return pendingLoad;
  pendingLoad = Promise.all([
    loadCharacterAtlas("character-layers-v3.png"),
    loadCharacterAtlas("character-materials-v3.png"),
  ]).then(([layers, materials]) => {
    sources = Object.freeze({ layers, materials });
    pendingLoad = null;
  }).catch((error: unknown) => {
    pendingLoad = null;
    throw error;
  });
  return pendingLoad;
}

/** Returns the fully decoded shared sources for synchronous drawing; callers must await ensureCharacterArtReady first. */
export function getCharacterArtSources(): Readonly<CharacterArtSources> {
  if (!sources) throw new Error("角色素材尚未准备完成，请先等待素材加载。");
  return sources;
}
