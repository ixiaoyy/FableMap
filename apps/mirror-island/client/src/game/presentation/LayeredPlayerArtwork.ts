import Phaser from "phaser";
import type { PlayerAppearance } from "../../../../domain/player/appearance.ts";
import type { PlayerMediaProfile } from "../assets/visual-profile.ts";
import { FRAME_WIDTH, FRAME_HEIGHT, paintCharacterFrame } from "./character-art.ts";

export const CHARACTER_LAYER_KEYS = { head: "islander-head", top: "islander-top", bottom: "islander-bottom" } as const;
const FACINGS = ["down", "left", "right", "up"] as const;

/** Identifies the eight validated visual choices, excluding legacy preset IDs and all gameplay state. */
export function characterAppearanceKey(appearance: PlayerAppearance): string {
  return [appearance.gender, appearance.head, appearance.top, appearance.bottom, appearance.skinTone,
    appearance.hairColor, appearance.topColor, appearance.bottomColor].join(":");
}

/** Composes the three fixed player atlases from published PNG parts; bounded keys keep repeated wardrobe saves from growing the texture cache. */
export function registerCharacterTextures(scene: Phaser.Scene, appearance: PlayerAppearance): void {
  for (const layer of ["bottom", "top", "head"] as const) {
    const key = CHARACTER_LAYER_KEYS[layer];
    const texture = scene.textures.exists(key)
      ? scene.textures.get(key) as Phaser.Textures.CanvasTexture
      : scene.textures.createCanvas(key, FRAME_WIDTH * 3, FRAME_HEIGHT * 4);
    if (!texture) throw new Error(`Character layer could not be created: ${layer}.`);
    texture.context.clearRect(0, 0, FRAME_WIDTH * 3, FRAME_HEIGHT * 4);
    texture.context.imageSmoothingEnabled = false;
    for (let row = 0; row < FACINGS.length; row += 1) {
      for (let step = 0; step < 3; step += 1) {
        texture.context.save();
        texture.context.translate(step * FRAME_WIDTH, row * FRAME_HEIGHT);
        paintCharacterFrame(texture.context, appearance, FACINGS[row]!, step, layer);
        texture.context.restore();
        const frame = String(row * 3 + step);
        if (!texture.has(frame)) texture.add(frame, 0, step * FRAME_WIDTH, row * FRAME_HEIGHT, FRAME_WIDTH, FRAME_HEIGHT);
      }
    }
    texture.refresh();
  }
}

export class LayeredPlayerArtwork {
  readonly body: Phaser.GameObjects.Sprite;
  private readonly head: Phaser.GameObjects.Sprite;
  private readonly bottom: Phaser.GameObjects.Sprite;

  /** Creates independent lower/clothing/head sprites in one actor container; the top sprite drives existing walk/action animation. */
  constructor(private readonly scene: Phaser.Scene, container: Phaser.GameObjects.Container, media: PlayerMediaProfile) {
    this.bottom = scene.add.sprite(0, 0, CHARACTER_LAYER_KEYS.bottom, media.frames.idle.down);
    this.body = scene.add.sprite(0, 0, CHARACTER_LAYER_KEYS.top, media.frames.idle.down)
      .setScale(media.scale).setOrigin(0.5, media.originY);
    this.head = scene.add.sprite(0, 0, CHARACTER_LAYER_KEYS.head, media.frames.idle.down);
    container.add([this.bottom, this.body, this.head]);
    this.sync();
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.sync, this);
  }

  /** Copies the current animation frame and action transform to the independent layers after animation/tween updates, preventing clothing drift. */
  sync(): void {
    for (const part of [this.bottom, this.head]) {
      part.setFrame(this.body.frame.name).setPosition(this.body.x, this.body.y)
        .setOrigin(this.body.originX, this.body.originY).setScale(this.body.scaleX, this.body.scaleY)
        .setRotation(this.body.rotation).setFlip(this.body.flipX, this.body.flipY)
        .setAlpha(this.body.alpha).setVisible(this.body.visible);
    }
  }

  /** Releases the scene callback before Phaser destroys the actor container and its three owned sprites. */
  release(): void {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.sync, this);
  }
}
