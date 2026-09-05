import Phaser from "phaser";
import type { WorldDropState, WorldObjectState } from "../../../../domain/world/world-object-state.ts";
import { itemIconForItem } from "../assets/item-icons.ts";
import { itemTextureFrame } from "../assets/item-textures.ts";
import { VECTORAITH_MEDIA_KEYS } from "../assets/visual-profile.ts";
import { worldLabelStyle } from "./WorldEntities.ts";

const CHEST_TINTS: Readonly<Record<string, number>> = {
  default: 0xffffff, red: 0xf07669, orange: 0xf0a15b, yellow: 0xf4d87a, lime: 0xc2df80,
  green: 0x85bd80, teal: 0x77b4a2, cyan: 0x92d8d2, sky: 0x94cdeb, blue: 0x84a7d7,
  indigo: 0x9994cb, purple: 0xb692cc, violet: 0xc9a0e2, magenta: 0xd890bf, pink: 0xf0b4c4,
  rose: 0xd69098, tan: 0xe4c392, brown: 0xb48c69, gray: 0xb0b7b4, black: 0x74767b, white: 0xfff6df,
};

/** Registers named frames from the already verified immutable Buildings atlas; the PNG itself stays unchanged. */
export function registerStorageFrames(scene: Phaser.Scene): void {
  const texture = scene.textures.get(VECTORAITH_MEDIA_KEYS.buildings);
  const chest = itemIconForItem("chest");
  if (chest?.kind !== "atlas") throw new Error("The reviewed storage box frame is unavailable.");
  if (!texture.has("farm-chest")) texture.add("farm-chest", 0, chest.x, chest.y, chest.width, chest.height);
  if (!texture.has("shipping-closed")) texture.add("shipping-closed", 0, 80, 0, 32, 32);
  if (!texture.has("shipping-open")) texture.add("shipping-open", 0, 80, 32, 32, 32);
}

export class StorageWorldView {
  readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Text;
  private current: WorldObjectState;
  private hovered = false;

  /** Builds one stable-ID world object view; all clicks send intent through the supplied scene callback. */
  constructor(scene: Phaser.Scene, object: WorldObjectState, onInteract: (id: string) => void) {
    this.current = object;
    const chest = object.kind === "chest";
    const size = chest ? 16 : 32;
    const shadow = scene.add.rectangle(0, 2, chest ? 14 : 28, 4, 0x263223, 0.25);
    this.body = scene.add.image(0, 0, VECTORAITH_MEDIA_KEYS.buildings,
      chest ? "farm-chest" : "shipping-closed").setDisplaySize(size, size)
      .setOrigin(0.5, chest ? 0.75 : 0.875).setInteractive({ useHandCursor: true });
    this.label = scene.add.text(0, chest ? -22 : -38, chest ? "储物箱" : "出货箱", {
      ...worldLabelStyle("#fff4d3"), backgroundColor: "#405239",
      padding: { x: 3, y: 2 },
    }).setOrigin(0.5).setVisible(false);
    this.container = scene.add.container(0, 0, [shadow, this.body, this.label]);
    this.body.on("pointerdown", () => onInteract(this.current.id));
    this.body.on("pointerover", () => { this.hovered = true; });
    this.body.on("pointerout", () => { this.hovered = false; });
    this.project(object);
  }

  /** Projects saved position and color without moving, opening or mutating the underlying object. */
  project(object: WorldObjectState): void {
    this.current = object;
    const x = object.column * 16 + (object.kind === "chest" ? 8 : 16);
    const y = object.row * 16 + 12;
    this.container.setPosition(x, y).setDepth(100 + y);
    this.body.setTint(object.kind === "chest" ? CHEST_TINTS[object.colorId] ?? 0xffffff : 0xffffff);
  }

  /** Shows local proximity and the bin lid without storing animation or pointer hover state. */
  affordance(playerX: number, playerY: number, locked: boolean): void {
    const near = Math.hypot(this.container.x - playerX, this.container.y - playerY) <= 42;
    this.label.setVisible(!locked && (near || this.hovered));
    if (this.current.kind === "shipping-bin") this.body.setFrame(near ? "shipping-open" : "shipping-closed");
  }

  /** Gives a saved-action highlight without stretching source pixels or disturbing the footprint-aligned scale. */
  pulse(): void {
    this.container.scene.tweens.killTweensOf(this.body);
    this.body.setAlpha(0.72);
    this.container.scene.tweens.add({ targets: this.body, alpha: 1, duration: 160, ease: "Sine.Out" });
  }

  /** Releases this view and all children when its ID disappears or the scene changes region. */
  destroy(): void { this.container.scene.tweens.killTweensOf(this.body); this.container.destroy(true); }
}

/** Creates one persistent-drop projection with a click callback; picking up is always a domain command. */
export function createWorldDropView(scene: Phaser.Scene, drop: WorldDropState, onCollect: () => void): Phaser.GameObjects.Container {
  const frame = itemTextureFrame(drop.stack.itemId);
  const icon = frame ? scene.add.image(0, 0, frame.texture, frame.frame).setDisplaySize(16, 16)
    : scene.add.text(0, 0, "物", worldLabelStyle("#fff0ca")).setOrigin(0.5);
  const halo = scene.add.rectangle(0, 2, 16, 13, 0xf4d47f, 0.2).setStrokeStyle(1, 0xf4d47f, 0.65);
  const container = scene.add.container(drop.originX, drop.originY, [halo, icon]).setDepth(105 + drop.originY).setSize(20, 20);
  container.setInteractive({ useHandCursor: true }).on("pointerdown", onCollect);
  return container;
}
