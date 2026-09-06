import type Phaser from "phaser";

export const COTTAGE_TEXTURE_KEY = "cottage-woodwork";
export const COTTAGE_BED_FRAME = "cottage-quilt-bed";
export const COTTAGE_VIEW_SPAWN = "cottage-room-view";
export const COTTAGE_BACKDROP = "#405b4d";

const COLORS = {
  ink: "#596953", dark: "#866547", wood: "#c7965d", grain: "#b58250", light: "#efc98b",
  floor: "#e8c48e", floorLight: "#eaca97", seam: "#d6b382", plaster: "#fff1d8",
  paper: "#fffaf0", teal: "#8dbca3", tealLight: "#c3ddbd", tealDark: "#568b7b",
  rust: "#e79870", rustDark: "#b86e51", leaf: "#599e5b", leafLight: "#a8cc64",
  glass: "#80cfe0", glassLight: "#d3f1ed", stone: "#a0b4ac", stoneLight: "#dce3cc",
  blue: "#81b8d1", blueLight: "#b6dbea", blueDark: "#577f95", shadow: "#d3d2af",
} as const;

export { COLORS as INTERIOR_PALETTE, block as paintInteriorBlock };

/** Creates the fixed original pixel woodwork atlas once; it has no file/CDN URL or saved gameplay data. */
export function registerCottageArt(scene: Phaser.Scene): void {
  if (scene.textures.exists(COTTAGE_TEXTURE_KEY)) return;
  const texture = scene.textures.createCanvas(COTTAGE_TEXTURE_KEY, 256, 128);
  if (!texture) throw new Error("Cottage woodwork texture could not be created.");
  paintCottageAtlas(texture.context);
  texture.refresh();
  texture.add(COTTAGE_BED_FRAME, 0, 0, 80, 32, 48);
}

/** Paints the source-authored 16px tiles and fixed furniture frames, shared by the map and its bed entity. */
export function paintCottageAtlas(context: CanvasRenderingContext2D): void {
  const c = COLORS;
  /** Places one palette rectangle while authoring the fixed-size tile atlas. */
  const fill = (x: number, y: number, width: number, height: number, color: string): void => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  };
  fill(0, 0, 16, 16, COTTAGE_BACKDROP);
  for (let variant = 0; variant < 3; variant += 1) {
    const x = (variant + 1) * 16;
    fill(x, 0, 16, 16, variant === 1 ? c.floorLight : c.floor);
    for (const y of [0, 8]) {
      fill(x, y, 16, 1, c.seam);
      fill(x, y + 1, 16, 1, "#eed0a1");
      if (variant === 0 || (variant === 2 && y === 8)) {
        fill(x + ((variant * 5 + y) % 13), y, 1, 8, c.seam);
      }
    }
  }
  fill(64, 0, 16, 16, c.plaster);
  fill(64, 0, 16, 1, c.wood);
  fill(64, 1, 16, 1, c.light);
  fill(64, 11, 16, 5, c.teal);
  fill(64, 11, 16, 1, c.tealLight);
  fill(64, 15, 16, 1, c.tealDark);
  fill(80, 0, 16, 16, c.dark);
  fill(80, 2, 16, 8, c.wood);
  fill(80, 2, 16, 1, c.light);
  fill(80, 11, 16, 2, c.grain);
  fill(80, 14, 16, 2, c.plaster);
  fill(96, 0, 16, 16, c.dark);
  fill(98, 0, 10, 16, c.wood);
  fill(98, 0, 2, 16, c.light);
  fill(106, 0, 2, 16, c.grain);
  fill(112, 0, 16, 16, c.dark);
  fill(112, 2, 16, 8, c.wood);
  fill(112, 2, 16, 2, c.light);
  fill(112, 11, 16, 3, c.grain);
  fill(128, 0, 16, 16, c.floor);
  fill(128, 0, 16, 2, c.paper);
  fill(128, 2, 16, 2, c.wood);
  fill(128, 13, 16, 2, c.grain);
  fill(128, 15, 16, 1, c.dark);

  // A quiet linen center and blue woven edges preserve the existing walkable nine-slice footprint.
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const x = (9 + column) * 16;
      const y = row * 16;
      fill(x, y, 16, 16, c.paper);
      if (column !== 1) {
        const edge = column === 0 ? 1 : 12;
        fill(x + edge, y, 3, 16, c.blue);
        fill(x + (column === 0 ? 5 : 10), y, 1, 16, c.blueLight);
        for (let mark = 1; mark < 16; mark += 4) fill(x + edge, y + mark, 1, 2, c.paper);
      }
      if (row !== 1) {
        const edge = row === 0 ? 1 : 12;
        fill(x, y + edge, 16, 3, c.blue);
        fill(x, y + (row === 0 ? 5 : 10), 16, 1, c.blueLight);
        for (let mark = 1; mark < 16; mark += 4) fill(x + mark, y + edge, 2, 1, c.paper);
      }
    }
  }

  paintWindow(context, 0, 32);
  paintShelf(context, 32, 32);
  paintCabinet(context, 64, 32);
  paintHearth(context, 96, 32);
  paintPlant(context, 128, 32);
  paintBed(context, 0, 80);
}

/** Fills a pixel-aligned rectangle with one explicit palette color on the target atlas. */
function block(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

/** Draws a sunlit four-pane window and linen curtains within the supplied 32px atlas origin. */
function paintWindow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 2, y + 1, 28, 29, c.dark);
  block(ctx, x + 3, y + 2, 26, 26, c.light);
  block(ctx, x + 6, y + 3, 20, 24, c.glass);
  block(ctx, x + 7, y + 4, 18, 8, c.glassLight);
  block(ctx, x + 8, y + 7, 5, 2, c.paper);
  block(ctx, x + 9, y + 6, 3, 1, c.paper);
  block(ctx, x + 6, y + 22, 20, 5, c.leafLight);
  block(ctx, x + 7, y + 20, 6, 5, c.leaf);
  block(ctx, x + 21, y + 19, 5, 7, c.leaf);
  block(ctx, x + 15, y + 3, 2, 24, c.wood);
  block(ctx, x + 6, y + 14, 20, 2, c.wood);
  block(ctx, x + 15, y + 3, 1, 24, c.light);
  block(ctx, x + 1, y + 1, 5, 24, c.paper);
  block(ctx, x + 26, y + 1, 5, 24, c.paper);
  block(ctx, x + 2, y + 2, 1, 22, c.stoneLight);
  block(ctx, x + 28, y + 2, 1, 22, c.stoneLight);
  block(ctx, x + 3, y + 16, 3, 2, c.blue);
  block(ctx, x + 26, y + 16, 3, 2, c.blue);
  block(ctx, x, y, 32, 1, c.dark);
  block(ctx, x, y + 27, 32, 2, c.light);
  block(ctx, x + 1, y + 29, 30, 2, c.wood);
  block(ctx, x + 4, y + 31, 24, 1, c.shadow);
}

/** Draws a shallow wall shelf with jars and books, keeping its silhouette within a 32px square. */
function paintShelf(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 2, y + 2, 28, 29, c.dark);
  block(ctx, x + 3, y + 3, 26, 25, c.wood);
  block(ctx, x + 5, y + 4, 22, 23, "#ab8559");
  block(ctx, x + 1, y, 30, 3, c.wood);
  block(ctx, x + 2, y, 28, 1, c.light);
  block(ctx, x + 3, y + 3, 1, 25, c.light);
  for (const shelf of [14, 28]) {
    block(ctx, x, y + shelf, 32, 3, c.wood);
    block(ctx, x, y + shelf, 32, 1, c.light);
  }
  for (const [offset, color, height] of [[6, c.blue, 8], [10, c.rust, 10], [14, c.paper, 7]] as const) {
    block(ctx, x + offset, y + 14 - height, 4, height, color);
    block(ctx, x + offset, y + 14 - height + 2, 3, 1, c.light);
  }
  block(ctx, x + 21, y + 8, 5, 5, c.paper);
  block(ctx, x + 20, y + 7, 7, 2, c.stoneLight);
  block(ctx, x + 23, y + 5, 1, 3, c.leaf);
  block(ctx, x + 21, y + 4, 3, 2, c.leafLight);
  block(ctx, x + 24, y + 3, 3, 3, c.leaf);
  for (const offset of [6, 18]) {
    block(ctx, x + offset + 1, y + 19, 6, 2, c.light);
    block(ctx, x + offset, y + 21, 8, 5, c.teal);
    block(ctx, x + offset + 1, y + 26, 6, 1, c.tealDark);
    block(ctx, x + offset + 1, y + 21, 2, 4, c.glassLight);
    block(ctx, x + offset + 3, y + 22, 4, 3, c.paper);
  }
}

/** Draws a mint two-door cabinet with pale worktop and folded linen in the existing 32px cell. */
function paintCabinet(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 3, y + 29, 27, 2, c.shadow);
  block(ctx, x + 2, y + 8, 28, 21, c.tealDark);
  block(ctx, x + 3, y + 27, 3, 4, c.tealDark);
  block(ctx, x + 26, y + 27, 3, 4, c.tealDark);
  block(ctx, x + 1, y + 5, 30, 6, c.light);
  block(ctx, x + 1, y + 5, 30, 3, c.paper);
  block(ctx, x + 2, y + 10, 28, 1, c.grain);
  for (const left of [4, 17]) {
    block(ctx, x + left, y + 12, 11, 14, c.teal);
    block(ctx, x + left, y + 12, 11, 1, c.tealLight);
    block(ctx, x + left, y + 12, 1, 14, c.tealLight);
    block(ctx, x + left + 2, y + 14, 7, 10, c.tealLight);
    block(ctx, x + left + 3, y + 15, 6, 9, c.teal);
  }
  block(ctx, x + 12, y + 16, 2, 2, c.light);
  block(ctx, x + 18, y + 16, 2, 2, c.light);
  block(ctx, x + 5, y + 3, 12, 3, c.blue);
  block(ctx, x + 6, y + 2, 10, 2, c.paper);
  block(ctx, x + 8, y + 2, 1, 4, c.blueLight);
  block(ctx, x + 13, y + 2, 1, 4, c.blueLight);
  block(ctx, x + 24, y + 2, 5, 4, c.rust);
  block(ctx, x + 24, y + 1, 5, 2, c.paper);
}

/** Draws a pale enamel cooking hearth and steel kettle; its existing solid footprint stays Tiled-owned. */
function paintHearth(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 3, y + 29, 28, 2, c.shadow);
  block(ctx, x + 2, y + 10, 28, 19, c.tealDark);
  block(ctx, x + 3, y + 12, 26, 16, c.stoneLight);
  block(ctx, x + 4, y + 13, 24, 13, c.paper);
  block(ctx, x + 1, y + 9, 30, 4, c.ink);
  block(ctx, x + 2, y + 9, 28, 1, c.stoneLight);
  block(ctx, x + 5, y + 14, 3, 2, c.blueDark);
  block(ctx, x + 23, y + 14, 3, 2, c.blueDark);
  block(ctx, x + 10, y + 17, 12, 9, c.tealDark);
  block(ctx, x + 11, y + 18, 10, 6, c.ink);
  block(ctx, x + 12, y + 18, 8, 1, c.stone);
  block(ctx, x + 12, y + 22, 8, 2, c.rustDark);
  block(ctx, x + 14, y + 22, 2, 1, c.rust);
  block(ctx, x + 19, y + 23, 1, 1, c.light);
  block(ctx, x + 10, y + 3, 12, 6, c.blueDark);
  block(ctx, x + 11, y + 3, 10, 5, c.stone);
  block(ctx, x + 12, y + 4, 2, 3, c.glassLight);
  block(ctx, x + 13, y + 1, 6, 1, c.ink);
  block(ctx, x + 12, y + 2, 1, 2, c.ink);
  block(ctx, x + 19, y + 2, 1, 2, c.ink);
  block(ctx, x + 21, y + 5, 3, 2, c.blueDark);
  block(ctx, x + 23, y + 4, 2, 2, c.stone);
  block(ctx, x + 5, y + 29, 3, 2, c.tealDark);
  block(ctx, x + 24, y + 29, 3, 2, c.tealDark);
}

/** Draws a broad-leaf houseplant in a warm clay pot, confined to the existing 16×32 accent cell. */
function paintPlant(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 4, y + 30, 10, 2, c.shadow);
  block(ctx, x + 7, y + 6, 2, 20, c.tealDark);
  for (const [dx, dy, right] of [[1, 8, false], [9, 4, true], [9, 13, true], [0, 16, false]] as const) {
    block(ctx, x + dx + 1, y + dy, 4, 2, c.leaf);
    block(ctx, x + dx, y + dy + 2, 6, 3, c.leaf);
    block(ctx, x + dx + 2, y + dy + 5, 3, 1, c.tealDark);
    block(ctx, x + dx + 1, y + dy + 1, 3, 2, c.leafLight);
    block(ctx, x + (right ? 8 : 5), y + dy + 4, 3, 1, c.tealDark);
  }
  block(ctx, x + 3, y + 23, 11, 3, c.rustDark);
  block(ctx, x + 3, y + 23, 11, 1, c.light);
  block(ctx, x + 4, y + 26, 9, 3, c.rust);
  block(ctx, x + 5, y + 29, 7, 2, c.rustDark);
  block(ctx, x + 5, y + 26, 2, 3, c.light);
}

/** Draws the 32×48 bed with wooden posts, linen pillow and stitched quilt for the existing bed interaction. */
function paintBed(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 3, y + 3, 27, 42, c.dark);
  block(ctx, x + 2, y + 7, 3, 34, c.wood);
  block(ctx, x + 27, y + 7, 3, 34, c.grain);
  for (const left of [1, 27]) {
    block(ctx, x + left, y + 1, 4, 8, c.dark);
    block(ctx, x + left, y + 39, 4, 9, c.dark);
    block(ctx, x + left + 1, y + 1, 2, 7, c.wood);
    block(ctx, x + left + 1, y + 39, 2, 7, c.wood);
    block(ctx, x + left + 1, y + 39, 2, 2, c.light);
  }
  block(ctx, x + 2, y, 2, 2, c.light);
  block(ctx, x + 28, y, 2, 2, c.light);
  block(ctx, x + 5, y + 4, 22, 5, c.wood);
  block(ctx, x + 8, y + 2, 16, 5, c.wood);
  block(ctx, x + 10, y + 1, 12, 1, c.light);
  block(ctx, x + 8, y + 2, 2, 1, c.light);
  block(ctx, x + 22, y + 2, 2, 1, c.light);
  block(ctx, x + 5, y + 4, 3, 1, c.light);
  block(ctx, x + 24, y + 4, 3, 1, c.light);
  block(ctx, x + 5, y + 9, 22, 32, c.paper);
  block(ctx, x + 7, y + 11, 18, 7, c.shadow);
  block(ctx, x + 8, y + 10, 16, 7, c.plaster);
  block(ctx, x + 9, y + 10, 14, 6, c.paper);
  block(ctx, x + 5, y + 20, 22, 21, c.blueDark);
  block(ctx, x + 6, y + 20, 20, 20, c.blueLight);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      block(ctx, x + 6 + column * 5, y + 20 + row * 5, 5, 5, (row + column) % 2 === 0 ? c.blue : c.paper);
    }
  }
  block(ctx, x + 6, y + 19, 20, 3, c.paper);
  block(ctx, x + 6, y + 22, 20, 1, c.blueLight);
  block(ctx, x + 25, y + 23, 1, 17, c.blueDark);
  block(ctx, x + 6, y + 39, 19, 1, c.blueLight);
  block(ctx, x + 3, y + 41, 26, 4, c.wood);
  block(ctx, x + 3, y + 41, 26, 1, c.light);
  block(ctx, x + 5, y + 44, 22, 1, c.grain);
}
