import Phaser from "phaser";
import type { FarmTileState, ResourceState } from "../../../../domain/state/game-state.ts";
import type {
  InteractionDefinition,
  NpcSpawnDefinition,
  ResourceSpawnDefinition,
} from "../../../../domain/world/regions.ts";
import type { EntityMediaProfile } from "../assets/visual-profile.ts";

export class TreeEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly tree: Phaser.GameObjects.Image;
  private readonly stump: Phaser.GameObjects.Image;
  private available = true;
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
      .setVisible(false);
    this.container = scene.add.container(spawn.x, spawn.y, [this.stump, this.tree]).setDepth(100 + spawn.y);
  }

  /** Projects save-owned availability without calculating or mutating resource state. */
  project(state: ResourceState): void {
    this.available = state.available;
    if (!this.impactAnimating) this.applyProjection();
  }

  /** Commits one impact while keeping the tree visible through its shake, then projects depletion. */
  playImpact(commit: () => boolean): void {
    this.impactAnimating = true;
    this.tree.setVisible(true);
    this.stump.setVisible(false);
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
      onStart: () => this.tree.setTint(0xffe3a1),
      onComplete: () => {
        this.tree.clearTint();
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

  /** Applies the latest save-owned availability after any impact animation releases its visual lock. */
  private applyProjection(): void {
    this.tree.setVisible(this.available);
    this.stump.setVisible(!this.available);
    this.container.setAlpha(1);
  }
}

export class RockEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;

  /** Creates one non-minable rock from the supplied regional atlas without adding mining behavior. */
  constructor(scene: Phaser.Scene, readonly spawn: ResourceSpawnDefinition, media: EntityMediaProfile) {
    this.entityId = spawn.entityId;
    const body = scene.add.image(0, 0, media.rock.textureKey, media.rock.frame.name).setOrigin(0.5, 1);
    this.container = scene.add.container(spawn.x, spawn.y, [body]).setDepth(100 + spawn.y);
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
  private readonly growingCropFrame: string | null;
  private readonly matureCropFrame: string | null;

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
    this.crop = media.farmCrop
      ? scene.add.image(0, -4, media.farmCrop.textureKey, media.farmCrop.growingFrame.name).setVisible(false)
      : null;
    this.growingCropFrame = media.farmCrop?.growingFrame.name ?? null;
    this.matureCropFrame = media.farmCrop?.matureFrame.name ?? null;
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
      const cropFrame = tile.phase === "mature"
        ? this.matureCropFrame
        : tile.phase === "growing"
          ? this.growingCropFrame
          : null;
      this.crop.setVisible(cropFrame !== null);
      if (cropFrame) this.crop.setFrame(cropFrame);
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

export class NpcEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;

  /** Creates one fixed NPC from the supplied atlas while dialogue metadata remains catalog-owned. */
  constructor(scene: Phaser.Scene, readonly spawn: NpcSpawnDefinition, media: EntityMediaProfile) {
    this.entityId = spawn.entityId;
    const body = scene.add.sprite(0, 0, media.npcTextureKey, 0).setScale(2).setOrigin(0.5, 0.75);
    const prompt = scene.add.text(0, -16, "E", {
      ...textStyle("#ffe7b5"),
      backgroundColor: "#3d2918",
      padding: { x: 3, y: 1 },
    }).setOrigin(0.5);
    this.container = scene.add.container(spawn.x, spawn.y, [body, prompt]).setDepth(100 + spawn.y);
  }

  /** Returns Euclidean world distance from this NPC spawn to one player position. */
  distanceTo(x: number, y: number): number {
    return Math.hypot(x - this.spawn.x, y - this.spawn.y);
  }

  /** Destroys the complete temporary NPC view. */
  destroy(): void {
    this.container.destroy(true);
  }
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

  /** Creates the reviewed non-minable rock entity kind. */
  createRock(spawn: ResourceSpawnDefinition): RockEntity {
    return new RockEntity(this.scene, spawn, this.media);
  }

  /** Creates one farm plot entity from an interaction definition. */
  createFarmPlot(
    interaction: InteractionDefinition,
    onInteract: (entity: FarmPlotEntity) => void,
  ): FarmPlotEntity {
    return new FarmPlotEntity(this.scene, interaction, this.media, onInteract);
  }

  /** Creates one fixed NPC entity from its catalog spawn metadata. */
  createNpc(spawn: NpcSpawnDefinition): NpcEntity {
    return new NpcEntity(this.scene, spawn, this.media);
  }
}

/** Returns the shared compact code-drawn entity label style. */
function textStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return { color, fontFamily: "monospace", fontSize: "7px" };
}

/** Maps one save-owned farm phase to the temporary B-stage appearance. */
function farmAppearance(tile: FarmTileState): { readonly tint: number; readonly alpha: number } {
  switch (tile.phase) {
    case "untilled": return { tint: 0x73944c, alpha: 0.42 };
    case "tilled": return { tint: 0xffffff, alpha: 1 };
    case "growing": return {
      tint: tile.watered ? 0x67b5a6 : 0x9fc65d,
      alpha: 1,
    };
    case "mature": return { tint: 0xd9ff6f, alpha: 1 };
  }
}
