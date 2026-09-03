import Phaser from "phaser";
import type { FarmTileState, ResourceState } from "../../../../domain/state/game-state.ts";
import type { PetState } from "../../../../domain/pets/definitions.ts";
import { cropDefinition } from "../../../../domain/farming/crops.ts";
import type { NpcRuntimeSpawn } from "../../../../domain/world/npc-motions.ts";
import type { Facing } from "../../../../domain/world/facing.ts";
import type {
  ExitDefinition,
  FishingZoneDefinition,
  InspectInteractionDefinition,
  InteractionDefinition,
  ResourceSpawnDefinition,
  WorldPoint,
} from "../../../../domain/world/regions.ts";
import type { PetMediaProfile } from "../assets/pet-media.ts";
import type { EntityMediaProfile } from "../assets/visual-profile.ts";

const INTERACTION_PROMPT_DEPTH = 10_100;
const INSPECT_PROMPT_LABELS: Readonly<Record<string, string>> = {
  "blacksmith-forge": "查看锻炉",
  "blacksmith-tool-rack": "查看工具架",
  "foothills-mine-mouth": "暂不可进",
  "foothills-spring": "查看山泉",
  "foothills-trail-sign": "查看路牌",
  "lakeshore-dock": "查看码头",
  "lakeshore-picnic": "查看休憩处",
  "lakeshore-waystone": "查看石标",
  "town-notice-board": "查看公告",
  "town-house-table": "查看餐桌",
  "town-house-window": "查看窗边",
  "town-house-east-map": "查看航图",
  "town-house-east-window": "查看窗台",
  "town-house-north-cabinet": "查看矮柜",
  "town-house-north-tea": "查看茶桌",
  "town-house-southwest-pantry": "查看食品柜",
  "town-house-southwest-sewing": "查看针线桌",
  "town-house-west-hearth": "查看壁炉",
  "town-house-west-shelf": "查看置物架",
};

export class TreeEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly tree: Phaser.GameObjects.Image;
  private readonly stump: Phaser.GameObjects.Image;
  private phase: ResourceState["phase"] = "standing";
  private impactAnimating = false;

  /** Creates one clickable tree view from the supplied regional atlas without owning persistent availability. */
  constructor(
    private readonly scene: Phaser.Scene,
    readonly spawn: ResourceSpawnDefinition,
    media: EntityMediaProfile,
    onInteract: (entity: TreeEntity) => void,
  ) {
    this.entityId = spawn.entityId;
    this.tree = scene.add.image(0, 0, media.tree.textureKey, media.tree.frame.name)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true });
    this.tree.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.stump = scene.add.image(0, 0, media.tree.stumpTextureKey, media.tree.stumpFrame.name)
      .setOrigin(0.5, 1)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.stump.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.container = scene.add.container(spawn.x, spawn.y, [this.stump, this.tree]).setDepth(100 + spawn.y);
  }

  /** Projects the save-owned standing/stump/cleared phase without mutating resource rules. */
  project(state: ResourceState): void {
    this.phase = state.phase;
    if (!this.impactAnimating) this.applyProjection();
  }

  /** Commits one impact while keeping the tree visible through its shake, then projects depletion. */
  playImpact(commit: () => boolean): void {
    this.impactAnimating = true;
    const target = this.phase === "standing" ? this.tree : this.stump;
    this.tree.setVisible(this.phase === "standing");
    this.stump.setVisible(this.phase === "stump");
    if (!commit()) {
      this.impactAnimating = false;
      this.applyProjection();
      return;
    }
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      x: this.spawn.x + 3,
      duration: 45,
      yoyo: true,
      repeat: 2,
      ease: "Sine.InOut",
      onStart: () => target.setTint(0xffe3a1),
      onComplete: () => {
        target.clearTint();
        this.impactAnimating = false;
        this.applyProjection();
      },
    });
    for (let index = 0; index < 5; index += 1) {
      const chip = this.scene.add.rectangle(this.spawn.x, this.spawn.y - 2, 3, 2, 0xc99754, 1).setDepth(25);
      const direction = index % 2 === 0 ? -1 : 1;
      this.scene.tweens.add({
        targets: chip,
        x: this.spawn.x + direction * (10 + index * 2),
        y: this.spawn.y - 10 - index * 2,
        alpha: 0,
        duration: 260,
        onComplete: () => chip.destroy(),
      });
    }
  }

  /** Destroys the complete Phaser view and its pointer listeners. */
  destroy(): void {
    this.container.destroy(true);
  }

  /** Applies the latest save-owned resource phase after any impact animation releases its visual lock. */
  private applyProjection(): void {
    this.tree.setVisible(this.phase === "standing");
    this.stump.setVisible(this.phase === "stump");
    this.container.setAlpha(1);
  }
}

export class RockEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Image;

  /** Creates one tappable non-minable rock without adding drops, durability or persistent mining state. */
  constructor(
    private readonly scene: Phaser.Scene,
    readonly spawn: ResourceSpawnDefinition,
    media: EntityMediaProfile,
    onInteract: (entity: RockEntity) => void,
  ) {
    this.entityId = spawn.entityId;
    this.body = scene.add.image(0, 0, media.rock.textureKey, media.rock.frame.name)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true });
    this.body.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.container = scene.add.container(spawn.x, spawn.y, [this.body]).setDepth(100 + spawn.y);
  }

  /** Plays one short presentation-only stone tap without mutating world or inventory state. */
  playTap(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      x: { from: this.spawn.x - 1, to: this.spawn.x + 1 },
      duration: 45,
      yoyo: true,
      repeat: 1,
      onComplete: () => this.container.setPosition(this.spawn.x, this.spawn.y),
    });
  }

  /** Destroys the complete temporary rock view. */
  destroy(): void {
    this.container.destroy(true);
  }
}

export class FarmPlotEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly soil: Phaser.GameObjects.Image;
  private readonly crop: Phaser.GameObjects.Image | null;
  private readonly cropFrames: EntityMediaProfile["farmCrops"];

  /** Creates one clickable farm plot at a Tiled rectangle using the supplied presentation-only soil frame. */
  constructor(
    private readonly scene: Phaser.Scene,
    readonly interaction: InteractionDefinition,
    media: EntityMediaProfile,
    onInteract: (entity: FarmPlotEntity) => void,
  ) {
    this.entityId = interaction.entityId;
    this.soil = scene.add.image(0, 0, media.farmSoil.textureKey, media.farmSoil.frame.name)
      .setInteractive({ useHandCursor: true });
    this.soil.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    const initialCrop = Object.values(media.farmCrops ?? {}).find(Boolean);
    this.crop = initialCrop
      ? scene.add.image(0, -4, initialCrop.textureKey, initialCrop.growingFrame.name).setVisible(false)
      : null;
    this.cropFrames = media.farmCrops;
    this.container = scene.add.container(
      interaction.x + interaction.width / 2,
      interaction.y + interaction.height / 2,
      this.crop ? [this.soil, this.crop] : [this.soil],
    ).setDepth(100 + interaction.y + interaction.height);
  }

  /** Projects save-owned farming phase into the temporary plot view. */
  project(tile: FarmTileState): void {
    const appearance = farmAppearance(tile);
    this.soil.setTint(appearance.tint);
    this.soil.setAlpha(appearance.alpha);
    if (this.crop) {
      const frames = tile.cropId === "" ? null : this.cropFrames?.[tile.cropId] ?? null;
      const cropFrame = tile.phase === "mature" ? frames?.matureFrame.name
        : tile.phase === "growing" ? frames?.growingFrame.name : null;
      this.crop.setVisible(Boolean(cropFrame));
      if (cropFrame && frames) {
        this.crop.setTexture(frames.textureKey);
        this.crop.setFrame(cropFrame);
        this.crop.setScale(cropScale(tile));
        this.crop.setAlpha(tile.phase === "growing" && tile.growthDays === 0 ? 0.72 : 1);
      }
    }
  }

  /** Plays one short impact pulse shared by tilling, planting, watering and harvesting. */
  playImpact(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.16,
      scaleY: 1.16,
      duration: 70,
      yoyo: true,
      ease: "Quad.Out",
    });
  }

  /** Destroys the complete Phaser farm view and pointer listeners. */
  destroy(): void {
    this.container.destroy(true);
  }
}

export class BedEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly prompt: Phaser.GameObjects.Text;
  private hovered = false;
  private nearby = false;
  private inputLocked = false;

  /** Creates one clickable Cottage bed while its stable position remains Tiled-owned. */
  constructor(
    scene: Phaser.Scene,
    readonly interaction: InteractionDefinition,
    onInteract: (entity: BedEntity) => void,
  ) {
    this.entityId = interaction.entityId;
    const frame = scene.add.rectangle(0, 0, interaction.width, interaction.height, 0x81502f, 1)
      .setStrokeStyle(2, 0x4d311f, 1)
      .setInteractive({ useHandCursor: true });
    frame.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    frame.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.hovered = true;
      this.refreshPrompt();
    });
    frame.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.hovered = false;
      this.refreshPrompt();
    });
    const blanket = scene.add.rectangle(
      0,
      interaction.height * 0.13,
      Math.max(8, interaction.width - 6),
      interaction.height * 0.54,
      0x78945e,
      1,
    ).setStrokeStyle(1, 0x506a45, 1);
    const pillow = scene.add.rectangle(
      0,
      -interaction.height * 0.31,
      Math.max(8, interaction.width - 8),
      Math.max(6, interaction.height * 0.18),
      0xead9ae,
      1,
    );
    this.prompt = scene.add.text(
      interaction.x + interaction.width / 2,
      interaction.y - 6,
      "休息",
      {
      ...textStyle("#ffe7b5"),
      backgroundColor: "#3d2918",
      padding: { x: 3, y: 1 },
      },
    ).setOrigin(0.5).setDepth(INTERACTION_PROMPT_DEPTH).setVisible(false);
    this.container = scene.add.container(
      interaction.x + interaction.width / 2,
      interaction.y + interaction.height / 2,
      [frame, blanket, pillow],
    ).setDepth(100 + interaction.y + interaction.height);
  }

  /** Returns Euclidean distance from the bed center to one player position. */
  distanceTo(x: number, y: number): number {
    return Math.hypot(x - this.container.x, y - this.container.y);
  }

  /** Projects proximity and modal ownership into one touch-safe bed affordance. */
  projectAffordance(nearby: boolean, inputLocked: boolean): void {
    this.nearby = nearby;
    this.inputLocked = inputLocked;
    this.refreshPrompt();
  }

  /** Destroys the complete temporary bed view. */
  destroy(): void {
    this.prompt.destroy();
    this.container.destroy(true);
  }

  /** Shows the bed verb only while hover or player proximity makes it actionable. */
  private refreshPrompt(): void {
    this.prompt.setVisible(!this.inputLocked && (this.hovered || this.nearby));
  }
}

export class ForageEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;

  /** Creates one clickable seasonal forage view from a Tiled candidate and reviewed atlas frame. */
  constructor(
    scene: Phaser.Scene,
    readonly spawn: ResourceSpawnDefinition,
    media: EntityMediaProfile,
    onInteract: (entity: ForageEntity) => void,
  ) {
    this.entityId = spawn.entityId;
    const visual = spawn.kind === "spring-wildflower" || spawn.kind === "bamboo-shoot"
      ? media.forage?.[spawn.kind]
      : null;
    if (!visual && spawn.kind !== "fallen-branch") {
      throw new Error(`Forage appearance is missing for ${spawn.kind}.`);
    }
    const body = visual
      ? scene.add.image(0, 0, visual.textureKey, visual.frame.name).setOrigin(0.5, 1)
      : scene.add.rectangle(0, -2, 12, 4, 0x8f603a, 1).setAngle(-12);
    body.setInteractive({ useHandCursor: true });
    body.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.container = scene.add.container(spawn.x, spawn.y, [body]).setDepth(100 + spawn.y);
  }

  /** Destroys the temporary forage view and pointer listener. */
  destroy(): void { this.container.destroy(true); }
}

export class FishingSpotEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly prompt: Phaser.GameObjects.Text;
  private hovered = false;
  private nearby = false;
  private locked = false;

  /** Creates a small fishing marker at one Tiled zone without inventing cast rules or coordinates. */
  constructor(scene: Phaser.Scene, readonly zone: FishingZoneDefinition, onInteract: () => void) {
    this.entityId = zone.id;
    const x = zone.x + zone.width / 2;
    const y = zone.y + zone.height / 2;
    const marker = scene.add.rectangle(0, -5, 3, 12, 0xebe3bb).setStrokeStyle(1, 0x6b5433);
    const cap = scene.add.rectangle(0, -11, 3, 5, 0xa4513f);
    const hit = scene.add.rectangle(0, -5, 28, 28, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    hit.on(Phaser.Input.Events.POINTER_DOWN, onInteract);
    hit.on(Phaser.Input.Events.POINTER_OVER, () => { this.hovered = true; this.refreshPrompt(); });
    hit.on(Phaser.Input.Events.POINTER_OUT, () => { this.hovered = false; this.refreshPrompt(); });
    this.prompt = scene.add.text(x, y - 25, "钓鱼", { ...textStyle("#fff0c2"), backgroundColor: "#3d4c36", padding: { x: 3, y: 2 } })
      .setOrigin(0.5).setDepth(INTERACTION_PROMPT_DEPTH).setVisible(false);
    this.container = scene.add.container(x, y, [marker, cap, hit]).setDepth(105 + zone.y + zone.height);
  }

  /** Returns player-foot distance to this authored fishing marker. */
  distanceTo(x: number, y: number): number { return Math.hypot(x - this.container.x, y - this.container.y); }

  /** Shows the marker label only when discoverable and no modal owns world input. */
  projectAffordance(nearby: boolean, locked: boolean): void {
    this.nearby = nearby;
    this.locked = locked;
    this.refreshPrompt();
  }

  /** Removes the complete transient fishing marker and its listeners. */
  destroy(): void { this.prompt.destroy(); this.container.destroy(true); }

  /** Applies the current hover/proximity state without changing gameplay availability. */
  private refreshPrompt(): void { this.prompt.setVisible(!this.locked && (this.nearby || this.hovered)); }
}

export class InspectEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly prompt: Phaser.GameObjects.Text;
  private hovered = false;
  private nearby = false;
  private inputLocked = false;

  /** Creates one invisible Tiled-owned inspect hotspot with a hover-only affordance. */
  constructor(
    scene: Phaser.Scene,
    readonly interaction: InspectInteractionDefinition,
    onInteract: (entity: InspectEntity) => void,
  ) {
    this.entityId = interaction.entityId;
    const hitArea = scene.add.rectangle(0, 0, interaction.width, interaction.height, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    this.prompt = scene.add.text(
      interaction.x + interaction.width / 2,
      interaction.y + interaction.height / 2 + inspectPromptOffsetY(interaction.height),
      inspectPromptLabel(interaction.dialogueId),
      {
        ...textStyle("#ffe7b5"),
        backgroundColor: "#3d2918",
        padding: { x: 3, y: 1 },
      },
    ).setOrigin(0.5).setDepth(INTERACTION_PROMPT_DEPTH).setVisible(false);
    hitArea.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.hovered = true;
      this.refreshPrompt();
    });
    hitArea.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.hovered = false;
      this.refreshPrompt();
    });
    hitArea.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.container = scene.add.container(
      interaction.x + interaction.width / 2,
      interaction.y + interaction.height / 2,
      [hitArea],
    ).setDepth(100 + interaction.y + interaction.height);
  }

  /** Returns Euclidean distance from the hotspot center to one player position. */
  distanceTo(x: number, y: number): number {
    return Math.hypot(x - this.container.x, y - this.container.y);
  }

  /** Projects proximity and modal ownership into one touch-safe inspect affordance. */
  projectAffordance(nearby: boolean, inputLocked: boolean): void {
    this.nearby = nearby;
    this.inputLocked = inputLocked;
    this.refreshPrompt();
  }

  /** Destroys the complete temporary inspect hotspot and all pointer listeners. */
  destroy(): void {
    this.prompt.destroy();
    this.container.destroy(true);
  }

  /** Shows the exact inspect verb only while the hotspot is locally discoverable. */
  private refreshPrompt(): void {
    this.prompt.setVisible(!this.inputLocked && (this.hovered || this.nearby));
  }
}

export class ExitHintEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly prompt: Phaser.GameObjects.Text;

  /** Creates one non-clickable proximity hint for an automatic Tiled-owned exit. */
  constructor(
    scene: Phaser.Scene,
    readonly exit: ExitDefinition,
    label: string,
    promptPosition: Readonly<{ x: number; y: number }>,
  ) {
    this.entityId = exit.id;
    this.prompt = scene.add.text(0, 0, label, {
      ...textStyle("#fff0c2"),
      backgroundColor: "#3d2918",
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setVisible(false);
    this.container = scene.add.container(promptPosition.x, promptPosition.y, [this.prompt])
      .setDepth(INTERACTION_PROMPT_DEPTH);
  }

  /** Returns the shortest world distance from one player point to the exit rectangle. */
  distanceTo(x: number, y: number): number {
    return pointToRectDistance(x, y, this.exit);
  }

  /** Shows an automatic transition label only while the player is approaching it. */
  projectAffordance(nearby: boolean, inputLocked: boolean): void {
    this.prompt.setVisible(nearby && !inputLocked);
  }

  /** Destroys the complete temporary exit hint. */
  destroy(): void {
    this.container.destroy(true);
  }
}

export class NpcEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Sprite;
  private readonly activityMark: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Text;
  private readonly friendshipPulse: Phaser.GameObjects.Text;
  private currentSpawn: NpcRuntimeSpawn;
  private reactionAnimating = false;
  private hovered = false;
  private nearby = false;
  private inputLocked = false;
  private activityLabel = "";

  /** Creates one clickable NPC projection while runtime position remains GameSession-owned. */
  constructor(
    scene: Phaser.Scene,
    spawn: NpcRuntimeSpawn,
    media: EntityMediaProfile,
    onInteract: (entity: NpcEntity) => void,
  ) {
    this.entityId = spawn.entityId;
    this.currentSpawn = spawn;
    const frame = media.npc.frames[spawn.npcId];
    if (!frame) throw new Error(`NPC appearance is missing for ${spawn.npcId}.`);
    this.body = scene.add.sprite(0, 0, media.npc.textureKey, frame.name)
      .setOrigin(0.5, 0.82)
      .setInteractive({ useHandCursor: true });
    this.body.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.body.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.hovered = true;
      this.refreshPrompt();
    });
    this.body.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.hovered = false;
      this.refreshPrompt();
    });
    this.prompt = scene.add.text(spawn.x, spawn.y - 28, npcInteractionLabel(spawn), {
      ...textStyle("#ffe7b5"),
      backgroundColor: "#3d2918",
      padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(INTERACTION_PROMPT_DEPTH).setVisible(false);
    this.activityMark = scene.add.text(8, -15, "", {
      ...textStyle("#fff0b0"),
      backgroundColor: "#2d2117",
      padding: { x: 2, y: 1 },
    }).setOrigin(0.5).setVisible(false);
    this.friendshipPulse = scene.add.text(spawn.x, spawn.y - 31, "♥", {
      ...textStyle("#ff8a82"),
      fontSize: "12px",
      stroke: "#5b2f2d",
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(INTERACTION_PROMPT_DEPTH + 1).setVisible(false);
    this.container = scene.add.container(
      spawn.x,
      spawn.y,
      [this.body, this.activityMark],
    ).setDepth(100 + spawn.y);
    this.project(spawn);
  }

  /** Returns the latest defensive runtime projection used by click, hit and dialogue routing. */
  get spawn(): NpcRuntimeSpawn {
    return this.currentSpawn;
  }

  /** Returns Euclidean world distance from this NPC spawn to one player position. */
  distanceTo(x: number, y: number): number {
    return Math.hypot(x - this.spawn.x, y - this.spawn.y);
  }

  /** Projects one GameSession-owned runtime position without rebuilding the stable NPC view. */
  project(spawn: NpcRuntimeSpawn): void {
    if (spawn.entityId !== this.entityId) throw new Error("NPC runtime identity cannot change in-place.");
    const previous = this.currentSpawn;
    this.currentSpawn = spawn;
    this.container.setAlpha(spawn.opacity).setDepth(100 + Math.floor(spawn.y));
    if (!this.reactionAnimating) this.container.setPosition(spawn.x, spawn.y);
    const visual = npcActivityVisual(spawn);
    this.body.setPosition(visual.bodyX, visual.bodyY).setAngle(visual.bodyAngle);
    if (spawn.motion === "walking" && Math.abs(spawn.x - previous.x) > 0.05) {
      this.body.setFlipX(spawn.x < previous.x);
    }
    this.activityMark.setPosition(this.body.flipX ? -8 : 8, -15);
    this.activityLabel = visual.label;
    this.activityMark.setText(visual.label);
    this.prompt.setText(npcInteractionLabel(spawn)).setPosition(spawn.x, spawn.y - 28).setAlpha(spawn.opacity);
    if (!this.friendshipPulse.visible) {
      this.friendshipPulse.setPosition(spawn.x, spawn.y - 31).setAlpha(spawn.opacity);
    }
    this.refreshPrompt();
  }

  /** Projects proximity and modal ownership into one touch-safe NPC interaction affordance. */
  projectAffordance(nearby: boolean, inputLocked: boolean): void {
    this.nearby = nearby;
    this.inputLocked = inputLocked;
    this.refreshPrompt();
  }

  /** Plays one restrained heart pulse after the first valid conversation of a day. */
  playFriendshipPulse(): void {
    this.container.scene.tweens.killTweensOf(this.friendshipPulse);
    this.friendshipPulse
      .setVisible(true)
      .setAlpha(1)
      .setPosition(this.spawn.x, this.spawn.y - 31)
      .setScale(0.75);
    this.container.scene.tweens.add({
      targets: this.friendshipPulse,
      y: this.spawn.y - 42,
      alpha: 0,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 720,
      ease: "Quad.Out",
      onComplete: () => this.friendshipPulse.setVisible(false),
    });
  }

  /** Plays one non-stacking presentation-only flash before restoring the latest runtime position. */
  playHitReaction(direction: Readonly<{ x: number; y: number }>): boolean {
    if (this.reactionAnimating) return false;
    this.reactionAnimating = true;
    this.body.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.container.setPosition(this.spawn.x, this.spawn.y);
    this.container.scene.tweens.add({
      targets: this.container,
      x: this.spawn.x + direction.x * 6,
      y: this.spawn.y + direction.y * 6,
      duration: 70,
      hold: 80,
      yoyo: true,
      ease: "Quad.Out",
      onComplete: () => this.resetHitReaction(),
    });
    return true;
  }

  /** Destroys the complete temporary NPC view. */
  destroy(): void {
    this.container.scene.tweens.killTweensOf(this.container);
    this.container.scene.tweens.killTweensOf(this.friendshipPulse);
    this.resetHitReaction();
    this.prompt.destroy();
    this.friendshipPulse.destroy();
    this.container.destroy(true);
  }

  /** Shows the exact NPC verb only while hover or player proximity makes it actionable. */
  private refreshPrompt(): void {
    const transitionVisible = this.spawn.motion !== "leaving"
      && this.spawn.motion !== "arriving"
      && this.spawn.opacity >= 0.75;
    const discoverable = !this.inputLocked && transitionVisible && (this.hovered || this.nearby);
    this.prompt.setVisible(discoverable);
    this.activityMark.setVisible(discoverable && this.activityLabel !== "");
  }

  /** Restores transient hit presentation to the latest GameSession-owned runtime position. */
  private resetHitReaction(): void {
    this.reactionAnimating = false;
    this.body.clearTint();
    this.container.setPosition(this.spawn.x, this.spawn.y);
  }
}

type PetMotionKind = "idle" | "walking" | "resting";

const PET_WALK_SPEED_PIXELS_PER_SECOND = 18;
const PET_IDLE_DURATION_MS = 1_400;
const PET_REST_DURATION_MS = 2_600;

export class PetEntity {
  readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Sprite;
  private readonly prompt: Phaser.GameObjects.Text;
  private readonly heart: Phaser.GameObjects.Text;
  private readonly usesFormalTexture: boolean;
  private currentPet: PetState;
  private anchors: readonly WorldPoint[];
  private currentDay: number;
  private anchorIndex: number;
  private motion: PetMotionKind = "idle";
  private pauseRemainingMs = PET_IDLE_DURATION_MS;
  private facing: Facing = "down";
  private hovered = false;
  private nearby = false;
  private inputLocked = false;
  private animationPaused = false;

  /** Creates one non-colliding client pet over a reviewed home-anchor loop. */
  constructor(
    scene: Phaser.Scene,
    pet: PetState,
    day: number,
    anchors: readonly WorldPoint[],
    private readonly media: PetMediaProfile,
    onInteract: (entity: PetEntity) => void,
  ) {
    if (anchors.length < 2) throw new Error("Pet presentation requires at least two anchors.");
    if (pet.species !== media.species) throw new Error("Pet media species does not match durable state.");
    this.currentPet = { ...pet };
    this.currentDay = day;
    this.anchors = [...anchors];
    this.anchorIndex = petAnchorIndex(pet, day, anchors.length);
    const start = this.anchors[this.anchorIndex]!;
    this.usesFormalTexture = scene.textures.exists(media.textureKey);
    const textureKey = this.usesFormalTexture
      ? media.textureKey
      : createPetFallbackTexture(scene, media);
    if (this.usesFormalTexture) registerPetWalkAnimations(scene, media);
    this.body = scene.add.sprite(0, 0, textureKey, this.usesFormalTexture ? media.idle.down : 0)
      .setOrigin(0.5, 0.76)
      .setDisplaySize(this.usesFormalTexture ? 32 : 18, this.usesFormalTexture ? 32 : 18)
      .setInteractive({ useHandCursor: true });
    this.body.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.body.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.hovered = true;
      this.refreshPrompt();
    });
    this.body.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.hovered = false;
      this.refreshPrompt();
    });
    this.prompt = scene.add.text(start.x, start.y - 23, `${pet.name} · 抚摸`, {
      ...textStyle("#fff0c6"),
      backgroundColor: "#4a321f",
      padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(INTERACTION_PROMPT_DEPTH).setVisible(false);
    this.heart = scene.add.text(start.x, start.y - 25, "♥", {
      ...textStyle("#ff8d86"),
      fontSize: "12px",
      stroke: "#663433",
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(INTERACTION_PROMPT_DEPTH + 1).setVisible(false);
    this.container = scene.add.container(start.x, start.y, [this.body]).setDepth(100 + start.y);
    this.refreshVisual();
  }

  /** Returns Euclidean distance from the pet's presentation position to one player point. */
  distanceTo(x: number, y: number): number {
    return Math.hypot(x - this.container.x, y - this.container.y);
  }

  /** Projects durable identity changes while preserving unsaved movement within the same day and region. */
  project(pet: PetState, day: number, anchors: readonly WorldPoint[]): void {
    if (pet.species !== this.currentPet.species) throw new Error("Adopted pet species cannot change.");
    this.currentPet = { ...pet };
    this.prompt.setText(`${pet.name} · 抚摸`);
    if (day === this.currentDay) return;
    this.currentDay = day;
    this.anchors = [...anchors];
    this.anchorIndex = petAnchorIndex(pet, day, anchors.length);
    const start = this.anchors[this.anchorIndex]!;
    this.container.setPosition(start.x, start.y).setDepth(100 + start.y);
    this.motion = "idle";
    this.pauseRemainingMs = PET_IDLE_DURATION_MS;
    this.refreshVisual();
    this.refreshDetachedObjects();
  }

  /** Advances deterministic short-path idle, walk and rest presentation without touching GameState. */
  advance(deltaMs: number, paused: boolean): void {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
    if (paused) {
      this.pauseAnimation();
      return;
    }
    this.resumeAnimation();
    const elapsed = Math.min(deltaMs, 100);
    if (this.motion !== "walking") {
      this.pauseRemainingMs -= elapsed;
      if (this.pauseRemainingMs <= 0) this.startWalking();
      return;
    }
    this.advanceWalking(elapsed);
  }

  /** Projects proximity and modal ownership into one touch-safe pet affordance. */
  projectAffordance(nearby: boolean, inputLocked: boolean): void {
    this.nearby = nearby;
    this.inputLocked = inputLocked;
    this.refreshPrompt();
  }

  /** Plays the once-per-day heart response and briefly settles the pet into a resting pose. */
  playHeartPulse(): void {
    this.motion = "resting";
    this.pauseRemainingMs = 1_800;
    this.refreshVisual();
    this.container.scene.tweens.killTweensOf(this.heart);
    this.heart
      .setVisible(true)
      .setAlpha(1)
      .setPosition(this.container.x, this.container.y - 25)
      .setScale(0.75);
    this.container.scene.tweens.add({
      targets: this.heart,
      y: this.container.y - 39,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 760,
      ease: "Quad.Out",
      onComplete: () => this.heart.setVisible(false),
    });
  }

  /** Destroys the complete transient pet view and any detached feedback objects. */
  destroy(): void {
    this.container.scene.tweens.killTweensOf(this.heart);
    this.prompt.destroy();
    this.heart.destroy();
    this.container.destroy(true);
  }

  /** Starts the next direct anchor leg and chooses a four-direction walk animation. */
  private startWalking(): void {
    const target = this.anchors[(this.anchorIndex + 1) % this.anchors.length]!;
    this.facing = petFacingForDelta(target.x - this.container.x, target.y - this.container.y);
    this.motion = "walking";
    this.refreshVisual();
  }

  /** Consumes one bounded walking slice and settles exactly on the reviewed target anchor. */
  private advanceWalking(deltaMs: number): void {
    const targetIndex = (this.anchorIndex + 1) % this.anchors.length;
    const target = this.anchors[targetIndex]!;
    const deltaX = target.x - this.container.x;
    const deltaY = target.y - this.container.y;
    const distance = Math.hypot(deltaX, deltaY);
    const step = PET_WALK_SPEED_PIXELS_PER_SECOND * deltaMs / 1_000;
    if (distance <= step || distance === 0) {
      this.container.setPosition(target.x, target.y);
      this.anchorIndex = targetIndex;
      this.motion = (this.currentDay + targetIndex + (this.currentPet.species === "dog" ? 1 : 0)) % 3 === 0
        ? "resting"
        : "idle";
      this.pauseRemainingMs = this.motion === "resting" ? PET_REST_DURATION_MS : PET_IDLE_DURATION_MS;
      this.refreshVisual();
    } else {
      this.container.setPosition(
        this.container.x + deltaX / distance * step,
        this.container.y + deltaY / distance * step,
      );
    }
    this.container.setDepth(100 + Math.floor(this.container.y));
    this.refreshDetachedObjects();
  }

  /** Applies one formal frame/animation or leaves the code-drawn fallback stable and readable. */
  private refreshVisual(): void {
    if (!this.usesFormalTexture) return;
    if (this.motion === "walking") {
      this.body.play(petWalkAnimationKey(this.media, this.facing), true);
      return;
    }
    this.body.stop();
    if (this.motion === "resting") {
      this.body.setFrame(this.media.rest[this.facing === "left" ? "left" : "right"]);
    } else {
      this.body.setFrame(this.media.idle[this.facing]);
    }
  }

  /** Keeps prompt and hidden heart origins synchronized with the moving container. */
  private refreshDetachedObjects(): void {
    this.prompt.setPosition(this.container.x, this.container.y - 23);
    if (!this.heart.visible) this.heart.setPosition(this.container.x, this.container.y - 25);
  }

  /** Shows the pet verb only while hover or nearest-player proximity makes it actionable. */
  private refreshPrompt(): void {
    this.prompt.setVisible(!this.inputLocked && (this.hovered || this.nearby));
  }

  /** Pauses an in-flight walk animation while modal or transition ownership freezes the world. */
  private pauseAnimation(): void {
    if (!this.usesFormalTexture || this.animationPaused || !this.body.anims.isPlaying) return;
    this.body.anims.pause();
    this.animationPaused = true;
  }

  /** Resumes only the walk animation paused by the pet's own presentation owner. */
  private resumeAnimation(): void {
    if (!this.animationPaused) return;
    this.body.anims.resume();
    this.animationPaused = false;
  }
}

/** Creates a stable starting anchor from durable identity and the current absolute day. */
function petAnchorIndex(pet: PetState, day: number, anchorCount: number): number {
  if (!Number.isInteger(anchorCount) || anchorCount < 1) throw new Error("Pet anchor count is invalid.");
  return (pet.adoptedDay + day + (pet.species === "dog" ? 1 : 0)) % anchorCount;
}

/** Chooses the dominant four-direction facing for one short client-only route leg. */
function petFacingForDelta(deltaX: number, deltaY: number): Facing {
  if (Math.abs(deltaX) >= Math.abs(deltaY)) return deltaX < 0 ? "left" : "right";
  return deltaY < 0 ? "up" : "down";
}

/** Returns one globally stable Phaser animation key for a species and facing. */
function petWalkAnimationKey(media: PetMediaProfile, facing: Facing): string {
  return `${media.textureKey}-walk-${facing}`;
}

/** Registers four non-duplicated walk loops over one reviewed LPC sprite sheet. */
function registerPetWalkAnimations(scene: Phaser.Scene, media: PetMediaProfile): void {
  for (const facing of ["down", "left", "right", "up"] as const) {
    const key = petWalkAnimationKey(media, facing);
    if (scene.anims.exists(key)) continue;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(media.textureKey, { frames: [...media.walk[facing]] }),
      frameRate: 6,
      repeat: -1,
    });
  }
}

/** Generates a small species-colored texture only when reviewed CDN media is unavailable. */
function createPetFallbackTexture(scene: Phaser.Scene, media: PetMediaProfile): string {
  const key = `${media.textureKey}-fallback`;
  if (scene.textures.exists(key)) return key;
  const graphics = scene.add.graphics().setVisible(false);
  graphics.fillStyle(media.fallbackAccent, 1);
  graphics.fillRect(4, 3, 3, 3);
  graphics.fillRect(9, 3, 3, 3);
  graphics.fillRect(3, 6, 10, 7);
  graphics.fillStyle(media.fallbackColor, 1);
  graphics.fillRect(4, 5, 8, 7);
  graphics.fillRect(2, 8, 3, 3);
  graphics.fillStyle(0x241b16, 1);
  graphics.fillRect(6, 7, 1, 1);
  graphics.fillRect(9, 7, 1, 1);
  graphics.generateTexture(key, 16, 16);
  graphics.destroy();
  return key;
}

interface NpcActivityVisual {
  readonly label: string;
  readonly bodyX: number;
  readonly bodyY: number;
  readonly bodyAngle: number;
}

/** Maps one domain-owned activity kind and phase to a small body-local presentation offset. */
function npcActivityVisual(spawn: NpcRuntimeSpawn): NpcActivityVisual {
  const direction = spawn.activityPhase === 0 ? -1 : 1;
  const walkStride = spawn.motion === "walking"
    ? (Math.floor((spawn.x + spawn.y) / 4) % 2 === 0 ? -1 : 1)
    : 0;
  const waitingSuffix = spawn.motion === "waiting" ? "·" : "";
  let visual: NpcActivityVisual;
  switch (spawn.activity) {
    case null: visual = { label: spawn.motion === "waiting" ? "稍候" : "", bodyX: 0, bodyY: 0, bodyAngle: 0 }; break;
    case "serve": visual = {
      label: "迎",
      bodyX: direction,
      bodyY: 0,
      bodyAngle: direction,
    }; break;
    case "forge": visual = {
      label: "锻",
      bodyX: direction,
      bodyY: spawn.activityPhase,
      bodyAngle: direction * 2,
    }; break;
    case "tend": visual = {
      label: "护",
      bodyX: 0,
      bodyY: spawn.activityPhase,
      bodyAngle: 0,
    }; break;
    case "repair": visual = {
      label: "修",
      bodyX: direction,
      bodyY: spawn.activityPhase,
      bodyAngle: direction * 2,
    }; break;
    case "mountain-patrol": visual = {
      label: "巡",
      bodyX: 0,
      bodyY: spawn.motion === "walking" ? direction : 0,
      bodyAngle: 0,
    }; break;
    case "observe": visual = {
      label: "望",
      bodyX: 0,
      bodyY: spawn.activityPhase === 0 ? 0 : -1,
      bodyAngle: 0,
    }; break;
    case "organize": visual = {
      label: "理",
      bodyX: direction,
      bodyY: 0,
      bodyAngle: 0,
    }; break;
    case "dock-watch": visual = {
      label: "守",
      bodyX: spawn.motion === "walking" ? direction : 0,
      bodyY: spawn.motion === "walking" ? 0 : -spawn.activityPhase,
      bodyAngle: 0,
    }; break;
    case "stock": visual = {
      label: "备",
      bodyX: direction,
      bodyY: 0,
      bodyAngle: direction,
    }; break;
    case "close": visual = {
      label: "收",
      bodyX: direction,
      bodyY: spawn.activityPhase,
      bodyAngle: direction,
    }; break;
    case "prepare": visual = {
      label: "备",
      bodyX: 0,
      bodyY: spawn.activityPhase,
      bodyAngle: direction,
    }; break;
    case "tea": visual = {
      label: "茶",
      bodyX: direction,
      bodyY: -spawn.activityPhase,
      bodyAngle: 0,
    }; break;
    case "record": visual = {
      label: "记",
      bodyX: direction,
      bodyY: 0,
      bodyAngle: direction,
    }; break;
    case "sew": visual = {
      label: "缝",
      bodyX: direction,
      bodyY: spawn.activityPhase,
      bodyAngle: direction * 2,
    }; break;
    case "rope-check": visual = {
      label: "绳",
      bodyX: direction,
      bodyY: spawn.activityPhase,
      bodyAngle: 0,
    }; break;
  }
  return {
    label: visual.label ? `${visual.label}${waitingSuffix}` : visual.label,
    bodyX: visual.bodyX,
    bodyY: visual.bodyY + walkStride,
    bodyAngle: visual.bodyAngle + walkStride,
  };
}

export class EntityFactory {
  /** Creates one scene-bound entity factory with presentation-only atlas bindings and no persistent state. */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly media: EntityMediaProfile,
  ) {}

  /** Creates the reviewed tree entity kind and wires its typed interaction callback. */
  createTree(spawn: ResourceSpawnDefinition, onInteract: (entity: TreeEntity) => void): TreeEntity {
    return new TreeEntity(this.scene, spawn, this.media, onInteract);
  }

  /** Creates the reviewed non-minable rock entity kind with a presentation-only tap callback. */
  createRock(spawn: ResourceSpawnDefinition, onInteract: (entity: RockEntity) => void): RockEntity {
    return new RockEntity(this.scene, spawn, this.media, onInteract);
  }

  /** Creates one farm plot entity from an interaction definition. */
  createFarmPlot(
    interaction: InteractionDefinition,
    onInteract: (entity: FarmPlotEntity) => void,
  ): FarmPlotEntity {
    return new FarmPlotEntity(this.scene, interaction, this.media, onInteract);
  }

  /** Creates one functional Cottage bed from its decoded Tiled interaction. */
  createBed(interaction: InteractionDefinition, onInteract: (entity: BedEntity) => void): BedEntity {
    return new BedEntity(this.scene, interaction, onInteract);
  }

  /** Creates one transient environment-inspection hotspot from decoded Tiled metadata. */
  createInspect(
    interaction: InspectInteractionDefinition,
    onInteract: (entity: InspectEntity) => void,
  ): InspectEntity {
    return new InspectEntity(this.scene, interaction, onInteract);
  }

  /** Creates one active seasonal forage entity with its empty-hand interaction callback. */
  createForage(spawn: ResourceSpawnDefinition, onInteract: (entity: ForageEntity) => void): ForageEntity {
    return new ForageEntity(this.scene, spawn, this.media, onInteract);
  }

  /** Creates one discoverable fishing marker from an authored fishing zone. */
  createFishingSpot(zone: FishingZoneDefinition, onInteract: () => void): FishingSpotEntity {
    return new FishingSpotEntity(this.scene, zone, onInteract);
  }

  /** Creates one automatic-exit proximity hint with a camera-safe prompt position. */
  createExitHint(
    exit: ExitDefinition,
    label: string,
    promptPosition: Readonly<{ x: number; y: number }>,
  ): ExitHintEntity {
    return new ExitHintEntity(this.scene, exit, label, promptPosition);
  }

  /** Creates one runtime-projected NPC entity from catalog identity and transient motion metadata. */
  createNpc(spawn: NpcRuntimeSpawn, onInteract: (entity: NpcEntity) => void): NpcEntity {
    return new NpcEntity(this.scene, spawn, this.media, onInteract);
  }

  /** Creates one presentation-only home pet without adding it to NPC or collision collections. */
  createPet(
    pet: PetState,
    day: number,
    anchors: readonly WorldPoint[],
    media: PetMediaProfile,
    onInteract: (entity: PetEntity) => void,
  ): PetEntity {
    return new PetEntity(this.scene, pet, day, anchors, media, onInteract);
  }
}

/** Returns the shared compact code-drawn entity label style. */
function textStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return { color, fontFamily: "monospace", fontSize: "7px" };
}

/** Maps inspect dialogue identities to short verbs that do not promise unavailable behavior. */
function inspectPromptLabel(dialogueId: string): string {
  if (dialogueId.endsWith("private-room")) return "内屋止步";
  return INSPECT_PROMPT_LABELS[dialogueId] ?? "查看";
}

/** Keeps one inspect prompt inside its target's upper edge so camera bounds cannot clip it. */
function inspectPromptOffsetY(height: number): number {
  return -Math.min(12, Math.max(6, height / 3));
}

/** Returns the concise verb for one NPC's current interaction mode. */
function npcInteractionLabel(spawn: NpcRuntimeSpawn): string {
  return spawn.interactionType === "shop" ? "购买" : "交谈";
}

/** Returns shortest distance from one point to a closed world rectangle. */
function pointToRectDistance(x: number, y: number, rect: ExitDefinition): number {
  const deltaX = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
  const deltaY = Math.max(rect.y - y, 0, y - (rect.y + rect.height));
  return Math.hypot(deltaX, deltaY);
}

/** Maps one save-owned farm phase to the temporary B-stage appearance. */
function farmAppearance(tile: FarmTileState): { readonly tint: number; readonly alpha: number } {
  switch (tile.phase) {
    case "untilled": return { tint: 0xffffff, alpha: 0 };
    case "tilled": return { tint: 0xffffff, alpha: 1 };
    case "growing": return {
      tint: tile.watered ? 0x67b5a6 : 0x9fc65d,
      alpha: 1,
    };
    case "mature": return { tint: 0xd9ff6f, alpha: 1 };
  }
}

/** Maps generic watered-day progress to a restrained presentation-only crop scale. */
function cropScale(tile: FarmTileState): number {
  if (tile.phase === "mature") return 1;
  if (tile.cropId === "") return 0.5;
  const crop = cropDefinition(tile.cropId);
  return crop ? 0.5 + 0.38 * Math.min(1, tile.growthDays / crop.growthDays) : 0.5;
}
