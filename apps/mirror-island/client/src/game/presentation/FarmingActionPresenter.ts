import type Phaser from "phaser";
import { ITEM_ID, getItemDefinition } from "../../../../domain/items/definitions.ts";
import { facingVector, type Facing } from "../../../../domain/world/facing.ts";
import type { WorldPoint } from "../../../../domain/world/regions.ts";
import { itemTextureFrame } from "../assets/item-textures.ts";
import type { PlayerMediaProfile } from "../assets/visual-profile.ts";

export type FarmAction = "axe" | "pickaxe" | "scythe" | "plow" | "plant" | "water" | "harvest";

interface ToolPose {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
}

const TOOL_POSES: Readonly<Record<Facing, readonly [ToolPose, ToolPose]>> = {
  down: [{ x: 5, y: -2, angle: -65 }, { x: 5, y: 3, angle: 100 }],
  up: [{ x: -5, y: -4, angle: 65 }, { x: -5, y: -7, angle: -35 }],
  right: [{ x: 5, y: -2, angle: -65 }, { x: 8, y: 2, angle: 75 }],
  left: [{ x: -5, y: -2, angle: 65 }, { x: -8, y: 2, angle: -75 }],
};

/** Resolves each source icon's actual grip; mirrored tools must mirror the pivot as well as their pixels. */
function itemGrip(itemId: string, facing: Facing): { x: number; y: number } {
  const grip = itemId === ITEM_ID.hoe ? { x: 0.68, y: 0.25 }
    : itemId === ITEM_ID.axe ? { x: 0.25, y: 0.75 }
      : itemId === ITEM_ID.pickaxe ? { x: 0.22, y: 0.82 }
        : itemId === ITEM_ID.scythe ? { x: 0.18, y: 0.82 }
          : itemId === ITEM_ID.wateringCan ? { x: 0.4, y: 0.2 }
            : { x: 0.5, y: 0.6 };
  return { x: facing === "left" ? 1 - grip.x : grip.x, y: grip.y };
}

/** Maps a hoe's opposite blade/handle orientation to the same directional hand poses as the axe. */
function hoeAngle(facing: Facing, impact: boolean): number {
  const angles: Readonly<Record<Facing, readonly [number, number]>> = {
    down: [150, 0], up: [0, 180], right: [130, -75], left: [-130, 75],
  };
  return angles[facing][impact ? 1 : 0];
}

/** Selects a visual action from the held item; the domain still decides whether the target accepts it. */
export function farmActionForItem(itemId: string): FarmAction {
  if (itemId === ITEM_ID.axe) return "axe";
  if (itemId === ITEM_ID.pickaxe) return "pickaxe";
  if (itemId === ITEM_ID.scythe) return "scythe";
  if (itemId === ITEM_ID.hoe) return "plow";
  if (itemId === ITEM_ID.wateringCan) return "water";
  return getItemDefinition(itemId)?.category === "seed" ? "plant" : "harvest";
}

export class FarmingActionPresenter {
  private readonly tool: Phaser.GameObjects.Sprite;
  private readonly held: Phaser.GameObjects.Sprite;
  private readonly effects = new Set<Phaser.GameObjects.Container>();
  private action: FarmAction = "harvest";
  private facing: Facing = "down";

  /** Creates presentation-owned tool/held layers for this exact avatar, without changing its saved appearance. */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly container: Phaser.GameObjects.Container,
    private readonly body: Phaser.GameObjects.Sprite,
    private readonly media: PlayerMediaProfile,
  ) {
    const frame = itemTextureFrame(ITEM_ID.hoe)!;
    this.tool = scene.add.sprite(0, 0, frame.texture, frame.frame).setVisible(false).setOrigin(0.35, 0.7);
    this.held = scene.add.sprite(0, 0, frame.texture, frame.frame).setVisible(false).setOrigin(0.5, 0.6);
    container.add([this.tool, this.held]);
  }

  /** Projects any supported selected item at the avatar's hand, with north-facing items behind the body. */
  hold(itemId: string, facing: Facing): void {
    const frame = itemTextureFrame(itemId);
    this.held.setVisible(frame !== null);
    if (!frame) return;
    const grip = itemGrip(itemId, facing);
    this.held.setTexture(frame.texture, frame.frame).setAlpha(1).setFlipX(facing === "left")
      .setOrigin(grip.x, grip.y).setPosition(facing === "left" ? -5 : 5, facing === "up" ? -5 : 1);
    if (facing === "up") this.container.sendToBack(this.held);
    else this.container.bringToTop(this.held);
  }

  /** Starts the windup pose for one captured action/held item; it never executes a game command. */
  begin(action: FarmAction, facing: Facing, itemId: string): void {
    this.reset();
    this.action = action;
    this.facing = facing;
    const direction = facingVector(facing);
    const pose = TOOL_POSES[facing][0];
    const frame = itemTextureFrame(itemId);
    this.body.stop().setFrame(this.media.frames.walk[facing][0]!);
    this.scene.tweens.add({
      targets: this.body, x: -direction.x, y: -direction.y,
      scaleY: this.media.scale * (action === "plant" || action === "harvest" ? 0.92 : 1),
      duration: 180, ease: "Quad.Out",
    });
    if (frame && action !== "harvest") {
      const grip = itemGrip(itemId, facing);
      this.tool.setTexture(frame.texture, frame.frame).setFlipX(facing === "left")
        .setOrigin(grip.x, grip.y).setPosition(pose.x, pose.y)
        .setAngle(action === "water" || action === "plant" ? 0 : action === "plow" ? hoeAngle(facing, false) : pose.angle)
        .setVisible(true).setAlpha(1);
      if (facing === "up") this.container.sendToBack(this.tool);
      else this.container.bringToTop(this.tool);
      if (action === "water" || action === "plant") {
        this.tool.setPosition(direction.x * 6 + (direction.x === 0 ? 5 : 0), direction.y < 0 ? -6 : 0);
      }
    }
  }

  /** Advances the contact pose and emits particles only after the existing impact command succeeds. */
  impact(success: boolean, target: WorldPoint, harvestedItemId?: string): void {
    const direction = facingVector(this.facing);
    const pose = TOOL_POSES[this.facing][1];
    const bending = this.action !== "axe" && this.action !== "pickaxe" && this.action !== "scythe";
    this.body.setFrame(this.media.frames.walk[this.facing][2]!);
    this.scene.tweens.add({
      targets: this.body, x: direction.x * 2, y: direction.y * 2 + (bending ? 2 : 0),
      scaleY: this.media.scale * (bending ? 0.9 : 0.97), duration: 100, ease: "Quad.Out",
    });
    this.scene.tweens.add({
      targets: this.tool,
      x: this.action === "plant" ? direction.x * 7 + (direction.x === 0 ? 4 : 0) : pose.x,
      y: this.action === "water" ? (direction.y < 0 ? -7 : 2) : pose.y,
      angle: this.action === "water" ? (this.facing === "left" ? -25 : 25)
        : this.action === "plant" ? 0 : this.action === "plow" ? hoeAngle(this.facing, true) : pose.angle,
      duration: 100, ease: "Quad.In",
    });
    if (success) this.playContact(target, harvestedItemId);
  }

  /** Restores the actor over the timeline's recovery segment while the successful contact settles. */
  recover(): void {
    this.scene.tweens.add({ targets: this.body, x: 0, y: 0, scaleY: this.media.scale, duration: 180, ease: "Quad.Out" });
    this.scene.tweens.add({ targets: this.tool, alpha: 0, duration: 150 });
  }

  /** Cancels owned pose/effect tweens and restores the avatar; safe for action completion and region teardown. */
  reset(): void {
    this.scene.tweens.killTweensOf([this.body, this.tool, this.held]);
    for (const effect of this.effects) {
      this.scene.tweens.killTweensOf(effect);
      effect.destroy(true);
    }
    this.effects.clear();
    this.tool.setVisible(false).setAlpha(1).setAngle(0);
    this.held.setVisible(false).setAlpha(1);
    this.body.setVisible(true).setPosition(0, 0).setScale(this.media.scale).setAlpha(1);
  }

  /** Paints a bounded set of soil, water, seed or harvest marks at the supplied accepted contact point. */
  private playContact(target: WorldPoint, harvestedItemId?: string): void {
    if (this.action === "axe" || this.action === "pickaxe") return;
    const effect = this.scene.add.container(target.x, target.y).setDepth(100 + target.y + 2);
    this.effects.add(effect);
    if (this.action === "scythe") {
      const facingAngle: Readonly<Record<Facing, number>> = { down: 0, right: -90, up: 180, left: 90 };
      effect.setAngle(facingAngle[this.facing]);
      effect.add(this.scene.add.arc(0, -4, 13, 205, 335, false, 0xffffff, 0)
        .setStrokeStyle(2, 0xd9e6c3, 0.9));
      this.scene.tweens.add({
        targets: effect,
        scaleX: { from: 0.65, to: 1.15 },
        scaleY: { from: 0.65, to: 1.15 },
        alpha: 0,
        duration: 220,
        ease: "Quad.Out",
        onComplete: () => { this.effects.delete(effect); effect.destroy(true); },
      });
      return;
    }
    const color = this.action === "water" ? 0xa4e3e3 : this.action === "plant" ? 0xdec684 : 0xb9935b;
    for (let index = 0; index < 6; index += 1) {
      const x = (index % 3 - 1) * 5;
      const y = Math.floor(index / 3) * 4 - 3;
      effect.add(this.scene.add.rectangle(x, y, this.action === "water" ? 1 : 2, 2, color));
    }
    if (this.action === "harvest" && harvestedItemId) {
      const frame = itemTextureFrame(harvestedItemId);
      if (frame) effect.add(this.scene.add.image(0, -6, frame.texture, frame.frame));
    }
    this.scene.tweens.add({
      targets: effect, y: target.y - (this.action === "harvest" ? 16 : 5), alpha: 0,
      duration: 350, ease: "Quad.Out",
      onComplete: () => { this.effects.delete(effect); effect.destroy(true); },
    });
  }
}
