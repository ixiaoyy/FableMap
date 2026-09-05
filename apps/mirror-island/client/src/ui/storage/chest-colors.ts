import type { ChestColorId } from "../../../../domain/world/world-object-state.ts";

export const CHEST_COLOR_PRESENTATION: Readonly<Record<ChestColorId, { readonly name: string; readonly hex: string }>> = {
  default: { name: "原木棕", hex: "#b78247" }, red: { name: "朱红", hex: "#c84c44" },
  orange: { name: "橙色", hex: "#d98b44" }, yellow: { name: "鹅黄", hex: "#e9c75b" },
  lime: { name: "嫩绿", hex: "#aec858" }, green: { name: "草绿", hex: "#659351" },
  teal: { name: "青绿", hex: "#4f9e8a" }, cyan: { name: "青色", hex: "#67bebd" },
  sky: { name: "天蓝", hex: "#75b9d9" }, blue: { name: "湖蓝", hex: "#507dbb" },
  indigo: { name: "靛蓝", hex: "#58639c" }, purple: { name: "紫色", hex: "#825c9e" },
  violet: { name: "浅紫", hex: "#ad85be" }, magenta: { name: "紫红", hex: "#b85796" },
  pink: { name: "粉红", hex: "#d69ab8" }, rose: { name: "玫红", hex: "#c56b7d" },
  tan: { name: "浅褐", hex: "#c3aa82" }, brown: { name: "深棕", hex: "#785640" },
  gray: { name: "灰色", hex: "#8f928d" }, black: { name: "墨黑", hex: "#3b4140" },
  white: { name: "米白", hex: "#e5e0d1" },
};
