import { ITEM_ID, type ItemId } from "../../../../domain/items/definitions.ts";
import type { PixelArt } from "./pixel-art.ts";

const FISH_INK = "#354a48";
const FISH_EYE = "#202e2f";

/** Defines one original 16-pixel fish silhouette with its own scales and fins; dots stay transparent. */
function fish(rows: readonly string[], body: string, shade: string, light: string, fin: string): PixelArt {
  return { rows, palette: { o: FISH_INK, e: FISH_EYE, b: body, s: shade, h: light, f: fin, w: "#f3e9c5" } };
}

export const ITEM_PIXEL_ART: Readonly<Partial<Record<ItemId, PixelArt>>> = {
  [ITEM_ID.wood]: {
    rows: [
      "................", "................", "......oooooo....", ".....ollllbbo...",
      "....olslllbbo...", "....ololllbbo...", ".....ollssbbo...", "..oooooooooo....",
      ".olllbbolllbbo..", "olollbbolollbbo.", "ollslbbolllsbbo.", "olllsbbolllsbbo.",
      ".osssbboossbbo..", "..ooooooooooo...", "................", "................",
    ],
    palette: { o: "#5a4835", l: "#dfb77a", s: "#b0834f", b: "#92704c" },
  },
  [ITEM_ID.springWildflower]: {
    rows: [
      "................", ".........pp.....", "....pp..ppyp....", "...ppyp..pp.....",
      "....pp....g.....", ".....g....g.....", "..pp.g...gg.....", ".ppypg..glg.....",
      "..pp.gg.gg......", "...g..ggg.......", "...gl.ggg.ll....", "....glgg.ll.....",
      ".....gggg.......", "......gg........", "................", "................",
    ],
    palette: { p: "#ce7e98", y: "#f3d791", g: "#4f7045", l: "#94ae62" },
  },
  [ITEM_ID.lakeCarp]: fish([
    "................", "................", "................", ".......oo.......",
    "......offoo.....", ".....oobbboo....", "oo..obbhhhhbo...", "ofooobhbwbhebo..",
    "offfobbbbbbboo..", "ofooossbbbsbo...", "oo...osssboo....", "......offo......",
    ".......oo.......", "................", "................", "................",
  ], "#bd9860", "#8d754c", "#e2c283", "#ad744b"),
  [ITEM_ID.silverMinnow]: fish([
    "................", "................", "................", "................",
    "................", "........oo......", ".......offo.....", "oo..oooohhhooo..",
    "ofoobhhhhhhwebo.", "offbbbbbbbbsbo..", "oo..ossssoooo...", "......ofo.......",
    ".......o........", "................", "................", "................",
  ], "#a6bdc3", "#728d9a", "#deece5", "#9ba9a8"),
  [ITEM_ID.rainLoach]: fish([
    "................", "................", "................", "................",
    "................", "........oooo....", ".....ooohhhboo..", "....ohhbsbbwebo.",
    "...obbsbbsssboo.", "..obbsbooooo....", "..obsbo.........", ".obsbo..........",
    ".osoo...........", "..o.............", "................", "................",
  ], "#a39669", "#716e50", "#cec393", "#9a8060"),
  [ITEM_ID.windDace]: fish([
    "................", "................", "................", ".........o......",
    "........ofo.....", ".......offo.....", ".oo...obhhbooo..", "offooobhhhhwebo.",
    ".offbbbsbbbssbo.", "offooosssboooo..", ".oo...offo......", ".......oo.......",
    "................", "................", "................", "................",
  ], "#91b3a5", "#527e79", "#d4e1bf", "#af9869"),
  [ITEM_ID.duskPerch]: fish([
    "................", "................", "......o.o.......", ".....ofofo......",
    "....oofffoo.....", "...obbsbsbbo....", "oo.obhshshhbo...", "ofoobbsbsbwebo..",
    "offbbbsbsbbbbo..", "ofoosbsbsbsbo...", "oo..osssssbo....", ".....offffo.....",
    "......oooo......", "................", "................", "................",
  ], "#a1b471", "#4f7357", "#d5dc9b", "#bd7f51"),
  [ITEM_ID.jadeBream]: fish([
    "................", "................", ".......oo.......", "......offo......",
    ".....obhhbo.....", "....obhbhhbo....", "oo.obhbhbhhbo...", "ofoobbhbhbwebo..",
    "offbbbhbhbbbbo..", "ofoobsbbsbsbo...", "oo..osbsssbo....", ".....osssbo.....",
    "......offo......", ".......oo.......", "................", "................",
  ], "#75b8a2", "#427d72", "#b5e0be", "#d0b879"),
  [ITEM_ID.fishingRod]: {
    rows: [
      "..........ooo...", ".........obowo..", "........oboo.w..", ".......oboo..w..",
      "......ogoo...w..", ".....oboo....w..", "....oboo.....w..", "...ogoo......w..",
      "..oboo.......w..", ".oboo........w..", ".ogo........fff.", ".obo........fff.",
      ".obo.........w..", "..o.........w...", "................", "................",
    ],
    palette: { o: "#425342", b: "#c2a464", g: "#7c8b50", w: "#e8ddba", f: "#b45f47" },
  },
  [ITEM_ID.bambooShoot]: {
    rows: [
      "................", ".......o........", "......ogo.......", "......oggo......",
      ".....ogggo......", ".....olgggo.....", "....olllsgo.....", "....olsssggo....",
      "...ollllssgo....", "...olsssssgo....", "..olllllssggo...", "..osssssssggo...",
      "...ollllllgo....", "....ooooooo.....", "................", "................",
    ],
    palette: { o: "#4a5638", g: "#7d9850", s: "#a28b50", l: "#ddc989" },
  },
};
