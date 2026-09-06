import type Phaser from "phaser";
import { ITEM_DEFINITIONS } from "../../../../domain/items/definitions.ts";
import { GARDENS_ICON_URL, itemIconForItem } from "./item-icons.ts";
import { paintPixelArt } from "./pixel-art.ts";
import { VECTORAITH_MEDIA_KEYS, VECTORAITH_MEDIA_URLS } from "./visual-profile.ts";
import { PASTORAL_PREVIEW } from "./pastoral-art-preview.ts";

export const GARDENS_TEXTURE_KEY = "item-gardens";

const ATLAS_KEYS: Readonly<Record<string, string>> = {
  [GARDENS_ICON_URL]: GARDENS_TEXTURE_KEY,
  [VECTORAITH_MEDIA_URLS.crops]: VECTORAITH_MEDIA_KEYS.crops,
  [VECTORAITH_MEDIA_URLS.details]: VECTORAITH_MEDIA_KEYS.details,
  [VECTORAITH_MEDIA_URLS.buildings]: VECTORAITH_MEDIA_KEYS.buildings,
};

/** Registers UI-identical item frames on loaded originals or small source-authored runtime textures. */
export function registerItemTextures(scene: Phaser.Scene): void {
  for (const item of Object.values(ITEM_DEFINITIONS)) {
    const icon = itemIconForItem(item.id);
    const frame = itemTextureFrame(item.id);
    if (!icon || !frame) continue;
    if (icon.kind === "pixels") {
      if (scene.textures.exists(frame.texture)) continue;
      const texture = scene.textures.createCanvas(frame.texture, 16, 16);
      if (!texture) throw new Error(`Item texture could not be created: ${item.id}`);
      paintPixelArt(texture.context, icon.art);
      texture.refresh();
    } else {
      const texture = scene.textures.get(frame.texture);
      if (!texture.has(frame.frame!)) texture.add(frame.frame!, 0, icon.x, icon.y, icon.width, icon.height);
    }
  }
}

/** Resolves a known item into a registered Phaser texture/frame; empty or unknown hands return null. */
export function itemTextureFrame(itemId: string): { texture: string; frame?: string } | null {
  const icon = itemIconForItem(itemId);
  if (!icon) return null;
  if (icon.kind === "pixels") return { texture: `item-original-${itemId}` };
  const texture = PASTORAL_PREVIEW && icon.url === PASTORAL_PREVIEW.tools.url
    ? PASTORAL_PREVIEW.tools.key : ATLAS_KEYS[icon.url];
  return texture ? { texture, frame: `item-${itemId}` } : null;
}
