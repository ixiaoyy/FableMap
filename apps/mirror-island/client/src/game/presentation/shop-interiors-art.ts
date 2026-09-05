import type Phaser from "phaser";
import { INTERIOR_PALETTE as c, paintCottageAtlas, paintInteriorBlock as block } from "./cottage-art.ts";

export const SHOP_INTERIOR_TEXTURE_KEY = "shop-interiors";

const IRON = { dark: "#3e4947", shade: "#596866", face: "#83918a", edge: "#bac1ae" } as const;

/** Registers the two shops' original 256px atlas once, reusing the accepted cottage woodwork unchanged. */
export function registerShopInteriorArt(scene: Phaser.Scene): void {
  if (scene.textures.exists(SHOP_INTERIOR_TEXTURE_KEY)) return;
  const texture = scene.textures.createCanvas(SHOP_INTERIOR_TEXTURE_KEY, 256, 256);
  if (!texture) throw new Error("Shop interior texture could not be created.");
  paintShopInteriorAtlas(texture.context);
  texture.refresh();
}

/** Paints the shared woodwork above eight rows of shop-specific furniture and stone-floor tiles. */
export function paintShopInteriorAtlas(ctx: CanvasRenderingContext2D): void {
  paintCottageAtlas(ctx);
  paintSeedRack(ctx, 0, 128);
  paintProduceCrate(ctx, 32, 128);
  paintSeedSacks(ctx, 64, 128);
  paintLedgerDesk(ctx, 96, 128);
  paintSeedSign(ctx, 128, 128);
  paintCounter(ctx, 144, 128);
  paintShopMat(ctx, 192, 128);
  paintForge(ctx, 0, 160);
  paintAnvil(ctx, 48, 160);
  paintToolRack(ctx, 80, 160);
  paintWaterBarrel(ctx, 128, 160);
  paintWorkbench(ctx, 144, 160);
  paintCoalBin(ctx, 176, 160);
  paintLogRack(ctx, 192, 160);
  paintStoneFloor(ctx, 224, 160, false);
  paintStoneFloor(ctx, 240, 160, true);
  paintBellows(ctx, 80, 208);
}

/** Draws a 32px seed shelf with six labeled paper packets at the supplied atlas origin. */
function paintSeedRack(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 1, y, 30, 31, c.ink);
  block(ctx, x + 3, y + 2, 26, 27, c.dark);
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const left = x + 4 + col * 8;
      const top = y + 3 + row * 14;
      block(ctx, left + 1, top, 5, 2, c.grain);
      block(ctx, left, top + 2, 7, 8, c.plaster);
      block(ctx, left + 1, top + 2, 5, 6, c.paper);
      block(ctx, left + 2, top + 4, 3, 3, [c.leaf, c.rust, c.teal, c.leafLight, c.light, c.rustDark][row * 3 + col]!);
      block(ctx, left + 3, top + 3, 1, 1, c.leaf);
    }
    block(ctx, x, y + 13 + row * 14, 32, 3, c.wood);
    block(ctx, x + 1, y + 13 + row * 14, 30, 1, c.light);
  }
  block(ctx, x, y + 30, 32, 2, c.dark);
}

/** Draws a low 32×16 produce box with a split wooden rim and distinct leaf/root shapes. */
function paintProduceCrate(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 1, y + 3, 30, 12, c.dark);
  block(ctx, x + 3, y + 4, 26, 7, c.grain);
  for (const offset of [5, 12, 21]) {
    block(ctx, x + offset, y + 3, 5, 6, offset === 21 ? c.paper : c.leaf);
    block(ctx, x + offset - 1, y + 4, 7, 3, offset === 21 ? c.plaster : c.leafLight);
    block(ctx, x + offset + 2, y + 1, 2, 3, c.leaf);
  }
  block(ctx, x, y + 9, 32, 3, c.light);
  block(ctx, x + 1, y + 12, 30, 3, c.wood);
  block(ctx, x + 2, y + 10, 2, 5, c.dark);
  block(ctx, x + 28, y + 10, 2, 5, c.dark);
  block(ctx, x + 15, y + 10, 2, 4, c.grain);
}

/** Draws two tied seed sacks on a short 32px pallet; their labels stay decorative, not extra products. */
function paintSeedSacks(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x, y + 27, 32, 4, c.dark);
  block(ctx, x + 1, y + 27, 30, 1, c.light);
  for (const offset of [2, 17]) {
    block(ctx, x + offset + 3, y + 5, 6, 3, c.dark);
    block(ctx, x + offset + 2, y + 8, 8, 4, c.plaster);
    block(ctx, x + offset, y + 12, 12, 14, c.grain);
    block(ctx, x + offset + 1, y + 12, 10, 12, c.plaster);
    block(ctx, x + offset + 3, y + 13, 6, 10, c.paper);
    block(ctx, x + offset + 3, y + 9, 6, 2, c.dark);
    block(ctx, x + offset + 4, y + 17, 4, 4, c.teal);
  }
}

/** Draws a 32×16 bookkeeping desk with an open ledger, pencil and coin dish. */
function paintLedgerDesk(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x, y + 3, 32, 12, c.dark);
  block(ctx, x + 1, y + 3, 30, 8, c.light);
  block(ctx, x + 3, y + 1, 18, 8, c.tealDark);
  block(ctx, x + 4, y + 1, 16, 6, c.paper);
  block(ctx, x + 11, y + 1, 1, 6, c.grain);
  for (const line of [3, 5]) {
    block(ctx, x + 6, y + line, 4, 1, c.plaster);
    block(ctx, x + 13, y + line, 5, 1, c.plaster);
  }
  block(ctx, x + 23, y + 5, 6, 3, c.rustDark);
  block(ctx, x + 24, y + 5, 4, 1, c.paper);
  block(ctx, x + 22, y + 1, 1, 5, c.ink);
  block(ctx, x + 3, y + 12, 26, 1, c.wood);
}

/** Draws a narrow wooden seed emblem without baking interface text into the picture. */
function paintSeedSign(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 7, y, 2, 3, c.ink);
  block(ctx, x + 1, y + 3, 14, 25, c.dark);
  block(ctx, x + 2, y + 4, 12, 22, c.light);
  block(ctx, x + 3, y + 5, 10, 20, c.tealDark);
  block(ctx, x + 7, y + 12, 2, 9, c.paper);
  block(ctx, x + 4, y + 11, 4, 3, c.leafLight);
  block(ctx, x + 8, y + 8, 4, 3, c.leafLight);
  block(ctx, x + 5, y + 21, 6, 1, c.paper);
}

/** Draws left/middle/right 16px counter segments for a Tiled-owned continuous shop counter. */
function paintCounter(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x, y, 48, 16, c.ink);
  block(ctx, x + 1, y, 46, 4, c.light);
  block(ctx, x + 1, y + 4, 46, 2, c.dark);
  block(ctx, x + 2, y + 6, 44, 8, c.wood);
  block(ctx, x + 3, y + 7, 42, 1, c.light);
  for (const offset of [14, 30]) block(ctx, x + offset, y + 6, 2, 9, c.grain);
  block(ctx, x + 22, y + 9, 4, 1, c.dark);
  block(ctx, x + 1, y + 14, 46, 1, c.grain);
}

/** Draws three flat welcome-mat segments with a quiet green woven border. */
function paintShopMat(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x, y + 2, 48, 12, c.dark);
  block(ctx, x + 1, y + 3, 46, 10, c.tealDark);
  block(ctx, x + 3, y + 4, 42, 8, c.teal);
  for (let offset = 6; offset < 45; offset += 6) block(ctx, x + offset, y + 7, 3, 1, c.tealLight);
}

/** Draws a 48px cooling forge with a masonry hood, dark firebox and a few banked coals. */
function paintForge(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 7, y, 34, 16, IRON.dark);
  block(ctx, x + 8, y + 1, 32, 12, c.stone);
  block(ctx, x + 8, y + 1, 32, 2, c.stoneLight);
  block(ctx, x + 4, y + 13, 40, 4, IRON.dark);
  block(ctx, x + 5, y + 13, 38, 1, IRON.edge);
  block(ctx, x + 4, y + 17, 40, 27, c.dark);
  block(ctx, x + 5, y + 17, 38, 25, c.stone);
  for (const row of [5, 11, 22, 29, 36]) {
    block(ctx, x + 7, y + row, 34, 1, c.dark);
    for (const column of [12, 24, 36]) block(ctx, x + column - (row % 2) * 4, y + row - 4, 1, 4, c.dark);
  }
  block(ctx, x + 17, y + 19, 14, 3, c.stoneLight);
  block(ctx, x + 14, y + 22, 20, 3, c.stoneLight);
  block(ctx, x + 12, y + 25, 24, 17, IRON.dark);
  block(ctx, x + 15, y + 24, 18, 18, "#302f2b");
  for (const [dx, dy] of [[17, 38], [23, 39], [29, 37]]) {
    block(ctx, x + dx!, y + dy!, 4, 2, "#875446");
    block(ctx, x + dx! + 1, y + dy!, 2, 1, c.rust);
  }
  block(ctx, x + 1, y + 42, 46, 5, IRON.dark);
  block(ctx, x + 2, y + 42, 44, 2, c.stoneLight);
}

/** Draws a 32px anvil with a worn iron face, narrow waist and a wooden working stump. */
function paintAnvil(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 8, y + 21, 18, 10, c.dark);
  block(ctx, x + 9, y + 22, 16, 7, c.wood);
  block(ctx, x + 10, y + 23, 2, 5, c.light);
  block(ctx, x + 20, y + 24, 2, 5, c.grain);
  block(ctx, x + 3, y + 7, 26, 5, IRON.dark);
  block(ctx, x, y + 8, 7, 2, IRON.face);
  block(ctx, x + 5, y + 7, 24, 2, IRON.edge);
  block(ctx, x + 8, y + 10, 20, 6, IRON.face);
  block(ctx, x + 11, y + 14, 13, 5, IRON.shade);
  block(ctx, x + 13, y + 18, 9, 3, IRON.dark);
  block(ctx, x + 8, y + 21, 19, 3, IRON.face);
  block(ctx, x + 9, y + 21, 17, 1, IRON.edge);
}

/** Draws a 48×32 wall rack carrying a hammer, tongs and an axe with individually readable grips. */
function paintToolRack(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x, y + 2, 48, 26, c.dark);
  block(ctx, x + 1, y + 3, 46, 23, c.wood);
  block(ctx, x + 2, y + 3, 44, 1, c.light);
  for (const offset of [4, 18, 34]) {
    block(ctx, x + offset, y + 5, 8, 1, c.grain);
    block(ctx, x + offset + 4, y + 5, 2, 3, IRON.dark);
  }
  block(ctx, x + 8, y + 10, 3, 14, c.dark);
  block(ctx, x + 9, y + 11, 1, 12, c.light);
  block(ctx, x + 4, y + 8, 11, 5, IRON.dark);
  block(ctx, x + 5, y + 8, 9, 2, IRON.edge);
  block(ctx, x + 22, y + 8, 2, 15, IRON.face);
  block(ctx, x + 27, y + 8, 2, 15, IRON.face);
  block(ctx, x + 24, y + 14, 3, 3, IRON.dark);
  block(ctx, x + 21, y + 22, 3, 3, c.ink);
  block(ctx, x + 28, y + 22, 3, 3, c.ink);
  block(ctx, x + 36, y + 9, 3, 15, c.dark);
  block(ctx, x + 37, y + 12, 1, 11, c.light);
  block(ctx, x + 36, y + 7, 10, 6, IRON.dark);
  block(ctx, x + 39, y + 8, 6, 3, IRON.edge);
}

/** Draws a 16×32 quenching barrel as a static prop, not an additional refill command target. */
function paintWaterBarrel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 2, y + 9, 12, 21, c.dark);
  block(ctx, x + 3, y + 10, 10, 19, c.wood);
  block(ctx, x + 4, y + 11, 2, 17, c.light);
  block(ctx, x + 9, y + 11, 1, 17, c.grain);
  block(ctx, x + 2, y + 12, 12, 2, IRON.shade);
  block(ctx, x + 2, y + 24, 12, 2, IRON.shade);
  block(ctx, x + 2, y + 7, 12, 4, c.ink);
  block(ctx, x + 3, y + 7, 10, 3, c.glass);
  block(ctx, x + 5, y + 7, 5, 1, c.glassLight);
}

/** Draws a 32px repair bench with folded apron, fastening parts and a small working hammer. */
function paintWorkbench(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 2, y + 8, 28, 22, c.dark);
  block(ctx, x + 4, y + 17, 3, 12, c.wood);
  block(ctx, x + 25, y + 17, 3, 12, c.wood);
  block(ctx, x, y + 6, 32, 11, c.wood);
  block(ctx, x + 1, y + 6, 30, 2, c.light);
  block(ctx, x + 1, y + 15, 30, 2, c.ink);
  block(ctx, x + 3, y + 4, 12, 13, c.tealDark);
  block(ctx, x + 4, y + 4, 10, 11, c.teal);
  block(ctx, x + 5, y + 5, 2, 9, c.tealLight);
  block(ctx, x + 19, y + 8, 2, 6, c.dark);
  block(ctx, x + 17, y + 7, 6, 2, IRON.face);
  block(ctx, x + 26, y + 9, 3, 2, IRON.edge);
}

/** Draws a low 16px coal bin whose dark contents cannot be confused with collectible ground drops. */
function paintCoalBin(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x, y + 4, 16, 11, c.dark);
  block(ctx, x + 1, y + 5, 14, 7, IRON.dark);
  for (const [dx, dy] of [[3, 5], [7, 7], [11, 4]]) block(ctx, x + dx!, y + dy!, 3, 3, IRON.shade);
  block(ctx, x, y + 11, 16, 2, c.light);
  block(ctx, x + 1, y + 13, 14, 2, c.wood);
}

/** Draws a 32×16 low firewood rack using the common wood and linen palette. */
function paintLogRack(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x, y + 11, 32, 4, c.dark);
  for (const offset of [2, 11, 20]) {
    block(ctx, x + offset, y + 3, 8, 9, c.dark);
    block(ctx, x + offset + 1, y + 4, 6, 7, c.light);
    block(ctx, x + offset + 2, y + 5, 4, 5, c.wood);
    block(ctx, x + offset + 3, y + 6, 2, 3, c.plaster);
  }
  block(ctx, x + 1, y + 13, 30, 1, c.wood);
}

/** Draws one 16px worn stone-floor tile; the second variant changes joints without a new material system. */
function paintStoneFloor(ctx: CanvasRenderingContext2D, x: number, y: number, alternate: boolean): void {
  block(ctx, x, y, 16, 16, "#6f7567");
  block(ctx, x + 1, y + 1, 15, 14, alternate ? "#969984" : "#a09e87");
  block(ctx, x + 2, y + 1, 13, 1, c.stoneLight);
  block(ctx, x + (alternate ? 5 : 11), y + 1, 1, 14, "#858673");
  block(ctx, x + 2, y + 8, 14, 1, "#858673");
  block(ctx, x + (alternate ? 10 : 3), y + 5, 3, 1, "#b0ae94");
  block(ctx, x + 9, y + 12, 2, 1, "#747b6e");
}

/** Draws a resting 32×16 leather bellows beside the cooling forge. */
function paintBellows(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  block(ctx, x + 1, y + 5, 24, 9, c.dark);
  block(ctx, x + 3, y + 4, 20, 8, c.rustDark);
  for (const offset of [5, 10, 15, 20]) block(ctx, x + offset, y + 5, 2, 7, c.rust);
  block(ctx, x, y + 3, 26, 2, c.light);
  block(ctx, x + 2, y + 13, 24, 2, c.wood);
  block(ctx, x + 25, y + 7, 7, 3, IRON.shade);
}
