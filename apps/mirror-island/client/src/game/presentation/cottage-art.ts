import type Phaser from "phaser";

export const COTTAGE_TEXTURE_KEY = "cottage-woodwork";
export const COTTAGE_BED_FRAME = "cottage-quilt-bed";
export const COTTAGE_VIEW_SPAWN = "cottage-room-view";

const COLORS = {
  ink: "#493d30", dark: "#5d4632", wood: "#a57748", grain: "#93683e", light: "#cda168",
  floor: "#b58b56", floorLight: "#bc955f", seam: "#956f43", plaster: "#d7c69b",
  paper: "#eee0b7", teal: "#668e81", tealLight: "#86a88e", tealDark: "#476b64",
  rust: "#aa7351", rustDark: "#865c43", leaf: "#73904a", leafLight: "#acc178",
  glass: "#8aadb0", glassLight: "#c8d8c5", stone: "#8b8871", stoneLight: "#b9ad8b",
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
  fill(0, 0, 16, 16, "#18251f");
  for (let variant = 0; variant < 3; variant += 1) {
    const x = (variant + 1) * 16;
    fill(x, 0, 16, 16, variant === 1 ? c.floorLight : c.floor);
    for (const y of [0, 8]) {
      fill(x, y, 16, 1, c.seam);
      fill(x, y + 1, 16, 1, c.light);
      fill(x + ((variant * 5 + y) % 13), y, 1, 8, c.seam);
      fill(x + 3 + variant, y + 4, 4, 1, variant === 1 ? c.floor : c.grain);
      fill(x + 10, y + 6, 3, 1, c.light);
    }
  }
  fill(64, 0, 16, 16, c.plaster);
  fill(64, 0, 16, 2, c.dark);
  fill(64, 2, 16, 1, c.light);
  fill(64, 13, 16, 3, c.wood);
  fill(64, 13, 16, 1, c.light);
  fill(64, 15, 16, 1, c.dark);
  fill(80, 0, 16, 16, c.dark);
  fill(80, 2, 16, 8, c.wood);
  fill(80, 2, 16, 1, c.light);
  fill(80, 11, 16, 2, c.ink);
  fill(80, 14, 16, 2, c.plaster);
  fill(96, 0, 16, 16, c.ink);
  fill(98, 0, 10, 16, c.wood);
  fill(98, 0, 2, 16, c.light);
  fill(106, 0, 2, 16, c.grain);
  fill(112, 0, 16, 16, c.dark);
  fill(112, 2, 16, 8, c.wood);
  fill(112, 2, 16, 2, c.light);
  fill(112, 11, 16, 3, c.ink);
  fill(128, 0, 16, 16, c.floor);
  fill(128, 0, 16, 2, c.paper);
  fill(128, 2, 16, 2, c.wood);
  fill(128, 13, 16, 2, c.grain);
  fill(128, 15, 16, 1, c.dark);

  // Nine-slice woven rug tiles stay flat and walkable, including the pet's existing resting route.
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const x = (9 + column) * 16;
      const y = row * 16;
      fill(x, y, 16, 16, c.tealDark);
      fill(x + (column === 0 ? 2 : 0), y + (row === 0 ? 2 : 0), column === 1 ? 16 : 14, row === 1 ? 16 : 14, c.paper);
      fill(x + (column === 0 ? 4 : 0), y + (row === 0 ? 4 : 0), column === 1 ? 16 : 12, row === 1 ? 16 : 12, c.teal);
      for (let mark = 0; mark < 4; mark += 1) fill(x + 4 * mark, y + 6 + (mark % 2) * 3, 2, 1, c.tealLight);
      if (column === 1 && row === 1) {
        fill(x + 7, y + 4, 2, 8, c.paper);
        fill(x + 4, y + 7, 8, 2, c.paper);
        fill(x + 6, y + 6, 4, 4, c.tealDark);
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

/** Draws a wooden four-pane window with distant greenery at the supplied 32px atlas origin. */
function paintWindow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x, y, 32, 30, c.ink);
  block(ctx, x + 2, y + 1, 28, 27, c.wood);
  block(ctx, x + 4, y + 3, 24, 23, c.glass);
  block(ctx, x + 5, y + 4, 22, 9, c.glassLight);
  block(ctx, x + 5, y + 20, 7, 5, c.leaf);
  block(ctx, x + 21, y + 18, 6, 7, c.leaf);
  block(ctx, x + 6, y + 18, 3, 3, c.leafLight);
  block(ctx, x + 15, y + 3, 2, 24, c.wood);
  block(ctx, x + 4, y + 14, 24, 2, c.wood);
  block(ctx, x + 3, y + 2, 1, 24, c.light);
  block(ctx, x, y + 27, 32, 3, c.light);
  block(ctx, x + 1, y + 30, 30, 2, c.dark);
}

/** Draws a shallow wall shelf with jars and books, keeping its silhouette within a 32px square. */
function paintShelf(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 1, y, 30, 30, c.ink);
  block(ctx, x + 3, y + 2, 26, 25, c.dark);
  for (const shelf of [14, 28]) {
    block(ctx, x, y + shelf, 32, 3, c.wood);
    block(ctx, x, y + shelf, 32, 1, c.light);
  }
  for (const [offset, color, height] of [[5, c.teal, 9], [10, c.rust, 11], [15, c.paper, 8]] as const) {
    block(ctx, x + offset, y + 14 - height, 4, height, color);
    block(ctx, x + offset, y + 14 - height + 2, 3, 1, c.light);
  }
  for (const offset of [6, 18]) {
    block(ctx, x + offset + 1, y + 19, 6, 2, c.paper);
    block(ctx, x + offset, y + 21, 8, 6, c.teal);
    block(ctx, x + offset + 2, y + 22, 2, 3, c.tealLight);
  }
}

/** Draws a small wooden cabinet with two doors and a folded cloth at a 32px atlas origin. */
function paintCabinet(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 1, y + 6, 30, 23, c.ink);
  block(ctx, x + 3, y + 27, 4, 4, c.dark);
  block(ctx, x + 25, y + 27, 4, 4, c.dark);
  block(ctx, x, y + 5, 32, 6, c.light);
  block(ctx, x, y + 10, 32, 2, c.dark);
  block(ctx, x + 3, y + 13, 12, 13, c.wood);
  block(ctx, x + 17, y + 13, 12, 13, c.wood);
  block(ctx, x + 4, y + 14, 1, 11, c.light);
  block(ctx, x + 18, y + 14, 1, 11, c.light);
  block(ctx, x + 11, y + 17, 2, 2, c.paper);
  block(ctx, x + 19, y + 17, 2, 2, c.paper);
  block(ctx, x + 4, y + 3, 14, 4, c.tealDark);
  block(ctx, x + 5, y + 2, 12, 3, c.tealLight);
  block(ctx, x + 24, y + 1, 5, 5, c.rust);
  block(ctx, x + 24, y, 5, 2, c.paper);
}

/** Draws a compact brick cooking hearth with a kettle; the tilemap owns its solid footprint. */
function paintHearth(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 2, y + 9, 28, 21, c.dark);
  block(ctx, x + 1, y + 9, 30, 4, c.stoneLight);
  block(ctx, x + 3, y + 14, 26, 14, c.stone);
  for (const row of [16, 23]) {
    block(ctx, x + 3, y + row, 26, 1, c.dark);
    block(ctx, x + (row === 16 ? 8 : 5), y + row - 3, 1, 3, c.dark);
    block(ctx, x + 23, y + row - 3, 1, 3, c.dark);
  }
  block(ctx, x + 10, y + 18, 12, 10, c.ink);
  block(ctx, x + 12, y + 23, 8, 4, c.rust);
  block(ctx, x + 14, y + 22, 4, 4, c.light);
  block(ctx, x + 15, y + 24, 2, 2, c.paper);
  block(ctx, x + 10, y + 3, 12, 7, c.ink);
  block(ctx, x + 11, y + 2, 10, 2, c.stone);
  block(ctx, x + 13, y + 1, 6, 2, c.ink);
  block(ctx, x + 20, y + 4, 6, 2, c.ink);
  block(ctx, x, y + 29, 32, 3, c.stoneLight);
}

/** Draws a potted bamboo accent in a 16×32 cell with a readable floor-level pot. */
function paintPlant(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 6, y + 4, 2, 20, c.leaf);
  block(ctx, x + 10, y + 9, 1, 14, c.leaf);
  for (const [dx, dy] of [[2, 8], [8, 4], [8, 14], [1, 17], [11, 10]]) {
    block(ctx, x + dx!, y + dy!, 4, 2, c.leaf);
    block(ctx, x + dx! + 1, y + dy! - 1, 3, 1, c.leafLight);
  }
  block(ctx, x + 3, y + 23, 11, 3, c.ink);
  block(ctx, x + 4, y + 26, 9, 5, c.rust);
  block(ctx, x + 5, y + 26, 2, 4, c.light);
  block(ctx, x + 5, y + 31, 7, 1, c.dark);
}

/** Draws the 32×48 bed with wooden posts, linen pillow and stitched quilt for the existing bed interaction. */
function paintBed(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const c = COLORS;
  block(ctx, x + 2, y + 1, 28, 45, c.ink);
  block(ctx, x + 1, y, 4, 48, c.dark);
  block(ctx, x + 27, y, 4, 48, c.dark);
  block(ctx, x + 2, y + 1, 2, 42, c.light);
  block(ctx, x + 28, y + 1, 2, 42, c.light);
  block(ctx, x + 5, y + 2, 22, 7, c.wood);
  block(ctx, x + 6, y + 3, 20, 1, c.light);
  block(ctx, x + 5, y + 9, 22, 32, c.paper);
  block(ctx, x + 7, y + 10, 18, 8, "#c8bd96");
  block(ctx, x + 8, y + 10, 16, 6, "#f3e9c9");
  block(ctx, x + 5, y + 19, 22, 22, c.tealDark);
  block(ctx, x + 6, y + 20, 20, 19, c.teal);
  block(ctx, x + 6, y + 20, 20, 2, c.tealLight);
  block(ctx, x + 7, y + 23, 2, 14, c.paper);
  block(ctx, x + 23, y + 23, 2, 14, c.paper);
  for (const row of [25, 32]) {
    for (const col of [12, 18]) {
      block(ctx, x + col, y + row, 2, 4, c.tealLight);
      block(ctx, x + col - 1, y + row + 1, 4, 2, c.tealLight);
    }
  }
  block(ctx, x + 3, y + 41, 26, 4, c.wood);
  block(ctx, x + 3, y + 41, 26, 1, c.light);
  block(ctx, x + 13, y + 43, 6, 1, c.dark);
}
