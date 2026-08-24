import Phaser from "phaser";
import type { FarmTileState, ResourceState } from "../../../../domain/state/game-state.ts";
import type {
  InteractionDefinition,
  NpcSpawnDefinition,
  ResourceSpawnDefinition,
} from "../../../../domain/world/regions.ts";

export class TreeEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly crown: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;

  /** Creates one clickable tree view at a Tiled-owned spawn without owning persistent availability. */
  constructor(
    private readonly scene: Phaser.Scene,
    readonly spawn: ResourceSpawnDefinition,
    onInteract: (entity: TreeEntity) => void,
  ) {
    this.entityId = spawn.entityId;
    const trunk = scene.add.rectangle(0, 7, 7, 18, 0x735033, 1);
    this.crown = scene.add.circle(0, -4, 16, 0x7fbf5b, 1)
      .setStrokeStyle(2, 0x243a2c, 1)
      .setInteractive({ useHandCursor: true });
    this.crown.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.label = scene.add.text(0, 24, "TREE", textStyle("#b8d9a9")).setOrigin(0.5);
    this.container = scene.add.container(spawn.x, spawn.y, [trunk, this.crown, this.label]).setDepth(18);
  }

  /** Projects save-owned availability without calculating or mutating resource state. */
  project(state: ResourceState): void {
    this.crown.setFillStyle(state.available ? 0x7fbf5b : 0x4c574d, 1);
    this.container.setAlpha(state.available ? 1 : 0.48);
    this.label.setText(state.available ? "TREE" : "DEPLETED");
  }

  /** Plays one visible hit shake and emits temporary code-drawn wood chips at impact. */
  playImpact(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      x: this.spawn.x + 3,
      duration: 45,
      yoyo: true,
      repeat: 2,
      ease: "Sine.InOut",
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
}

export class RockEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;

  /** Creates one non-minable rock view so EntityFactory covers the reviewed resource kind without adding mining. */
  constructor(scene: Phaser.Scene, readonly spawn: ResourceSpawnDefinition) {
    this.entityId = spawn.entityId;
    const body = scene.add.polygon(0, 0, [-10, 7, -7, -7, 2, -12, 11, -4, 9, 8], 0x768078, 1)
      .setStrokeStyle(2, 0x37423b, 1);
    const label = scene.add.text(0, 17, "ROCK", textStyle("#aeb7ad")).setOrigin(0.5);
    this.container = scene.add.container(spawn.x, spawn.y, [body, label]).setDepth(17);
  }

  /** Destroys the complete temporary rock view. */
  destroy(): void {
    this.container.destroy(true);
  }
}

export class FarmPlotEntity {
  readonly entityId: string;
  readonly container: Phaser.GameObjects.Container;
  private readonly soil: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;

  /** Creates one clickable farm plot at a Tiled interaction rectangle. */
  constructor(
    private readonly scene: Phaser.Scene,
    readonly interaction: InteractionDefinition,
    onInteract: (entity: FarmPlotEntity) => void,
  ) {
    this.entityId = interaction.entityId;
    this.soil = scene.add.rectangle(0, 0, interaction.width, interaction.height, 0x52654a, 1)
      .setStrokeStyle(2, 0x263528, 1)
      .setInteractive({ useHandCursor: true });
    this.soil.on(Phaser.Input.Events.POINTER_DOWN, () => onInteract(this));
    this.label = scene.add.text(0, interaction.height / 2 + 10, "SOIL", textStyle("#d9c69b")).setOrigin(0.5);
    this.container = scene.add.container(
      interaction.x + interaction.width / 2,
      interaction.y + interaction.height / 2,
      [this.soil, this.label],
    ).setDepth(16);
  }

  /** Projects save-owned farming phase into the temporary plot view. */
  project(tile: FarmTileState): void {
    const appearance = farmAppearance(tile);
    this.soil.setFillStyle(appearance.color, 1);
    this.label.setText(appearance.label);
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

  /** Creates one fixed-position NPC marker whose dialogue metadata remains catalog-owned. */
  constructor(scene: Phaser.Scene, readonly spawn: NpcSpawnDefinition) {
    this.entityId = spawn.entityId;
    const body = scene.add.circle(0, 0, 7, 0xffc66d, 1).setStrokeStyle(2, 0x3d2918, 1);
    const prompt = scene.add.text(0, -16, "E", {
      ...textStyle("#ffe7b5"),
      backgroundColor: "#3d2918",
      padding: { x: 3, y: 1 },
    }).setOrigin(0.5);
    const label = scene.add.text(0, 14, "KEEPER", textStyle("#e4c99b")).setOrigin(0.5);
    this.container = scene.add.container(spawn.x, spawn.y, [body, prompt, label]).setDepth(19);
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
  /** Creates one scene-bound entity factory without retaining persistent GameState. */
  constructor(private readonly scene: Phaser.Scene) {}

  /** Creates the reviewed tree entity kind and wires its typed interaction callback. */
  createTree(spawn: ResourceSpawnDefinition, onInteract: (entity: TreeEntity) => void): TreeEntity {
    return new TreeEntity(this.scene, spawn, onInteract);
  }

  /** Creates the reviewed non-minable rock entity kind. */
  createRock(spawn: ResourceSpawnDefinition): RockEntity {
    return new RockEntity(this.scene, spawn);
  }

  /** Creates one farm plot entity from an interaction definition. */
  createFarmPlot(
    interaction: InteractionDefinition,
    onInteract: (entity: FarmPlotEntity) => void,
  ): FarmPlotEntity {
    return new FarmPlotEntity(this.scene, interaction, onInteract);
  }

  /** Creates one fixed NPC entity from its catalog spawn metadata. */
  createNpc(spawn: NpcSpawnDefinition): NpcEntity {
    return new NpcEntity(this.scene, spawn);
  }
}

/** Returns the shared compact code-drawn entity label style. */
function textStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return { color, fontFamily: "monospace", fontSize: "7px" };
}

/** Maps one save-owned farm phase to the temporary B-stage appearance. */
function farmAppearance(tile: FarmTileState): { readonly color: number; readonly label: string } {
  switch (tile.phase) {
    case "untilled": return { color: 0x52654a, label: "SOIL" };
    case "tilled": return { color: 0x73513b, label: "TILLED" };
    case "growing": return {
      color: tile.watered ? 0x356f67 : 0x5f7042,
      label: tile.watered ? "GROWING" : "WATER",
    };
    case "mature": return { color: 0xb8ff62, label: "HARVEST" };
  }
}
