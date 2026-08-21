import Phaser from "phaser";
import { WORLD_HEIGHT_PIXELS, WORLD_WIDTH_PIXELS } from "../../../../shared/constants/simulation.ts";
import {
  sendFarmPrimaryIntent,
  sendInteractIntent,
  sendMoveIntent,
} from "../../network/world-connection.ts";
import {
  subscribeWorldProjection,
  type FarmTileProjection,
  type PlayerProjection,
  type ResourceProjection,
  type WorldProjection,
} from "../../stores/world-store.ts";

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
  readonly body: Phaser.GameObjects.Arc;
  readonly label: Phaser.GameObjects.Text;
}

interface ResourceView {
  readonly container: Phaser.GameObjects.Container;
  readonly crown: Phaser.GameObjects.Arc;
  readonly label: Phaser.GameObjects.Text;
}

interface FarmView {
  readonly container: Phaser.GameObjects.Container;
  readonly soil: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
}

export class WorldScene extends Phaser.Scene {
  private readonly playerViews = new Map<string, PlayerView>();
  private readonly resourceViews = new Map<string, ResourceView>();
  private readonly farmViews = new Map<string, FarmView>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private stopProjection?: () => void;
  private previousXAxis: -1 | 0 | 1 = 0;
  private previousYAxis: -1 | 0 | 1 = 0;
  private lastInputSentAt = 0;

  constructor() {
    super("World");
  }

  /** Creates the code-drawn world surface, input bindings and typed projection subscription. */
  create(): void {
    this.drawWorld();
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable.");
    this.cursors = keyboard.createCursorKeys();
    this.movementKeys = keyboard.addKeys("W,A,S,D") as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    this.stopProjection = subscribeWorldProjection((projection) => this.renderProjection(projection));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopProjection?.());
  }

  /** Converts keyboard state into digital intent only when the axes change. */
  override update(time: number): void {
    const xAxis = toAxis(
      Number(this.cursors.right.isDown || this.movementKeys.D.isDown)
      - Number(this.cursors.left.isDown || this.movementKeys.A.isDown),
    );
    const yAxis = toAxis(
      Number(this.cursors.down.isDown || this.movementKeys.S.isDown)
      - Number(this.cursors.up.isDown || this.movementKeys.W.isDown),
    );
    const axesChanged = xAxis !== this.previousXAxis || yAxis !== this.previousYAxis;
    if (!axesChanged && time - this.lastInputSentAt < 250) return;
    this.previousXAxis = xAxis;
    this.previousYAxis = yAxis;
    this.lastInputSentAt = time;
    sendMoveIntent(xAxis, yAxis);
  }

  /** Draws a restrained alien field grid without introducing unreviewed image assets. */
  private drawWorld(): void {
    this.cameras.main.setBackgroundColor("#0b1714");
    const graphics = this.add.graphics();
    graphics.fillStyle(0x183228, 1).fillRect(0, 0, WORLD_WIDTH_PIXELS, WORLD_HEIGHT_PIXELS);
    graphics.lineStyle(1, 0x345a46, 0.28);
    for (let coordinate = 0; coordinate <= WORLD_WIDTH_PIXELS; coordinate += 32) {
      graphics.lineBetween(coordinate, 0, coordinate, WORLD_HEIGHT_PIXELS);
      graphics.lineBetween(0, coordinate, WORLD_WIDTH_PIXELS, coordinate);
    }
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH_PIXELS, WORLD_HEIGHT_PIXELS);
  }

  /** Creates, moves and removes player views from a complete authoritative projection. */
  private renderProjection(projection: WorldProjection): void {
    const activeIds = new Set(projection.players.map((player) => player.sessionId));
    for (const [sessionId, view] of this.playerViews) {
      if (!activeIds.has(sessionId)) {
        view.container.destroy(true);
        this.playerViews.delete(sessionId);
      }
    }
    for (const player of projection.players) {
      const view = this.playerViews.get(player.sessionId) ?? this.createPlayerView(player, projection.selfSessionId);
      view.container.setPosition(player.x, player.y);
    }
    this.renderResources(projection.resources);
    this.renderFarmTiles(projection.farmTiles);
  }

  /** Creates one ephemeral player marker and stores it under the Colyseus session ID. */
  private createPlayerView(player: PlayerProjection, selfSessionId: string): PlayerView {
    const isSelf = player.sessionId === selfSessionId;
    const body = this.add.circle(0, 0, 8, isSelf ? 0xb8ff62 : 0xffb65a, 1).setStrokeStyle(2, 0x07100d, 1);
    const label = this.add.text(0, -17, isSelf ? "YOU" : "SIGNAL", {
      color: isSelf ? "#dfffad" : "#ffd6a1",
      fontFamily: "monospace",
      fontSize: "8px",
    }).setOrigin(0.5);
    const container = this.add.container(player.x, player.y, [body, label]);
    const view = { container, body, label };
    this.playerViews.set(player.sessionId, view);
    return view;
  }

  /** Creates, updates and removes code-drawn resource nodes from the authoritative projection. */
  private renderResources(resources: readonly ResourceProjection[]): void {
    const activeIds = new Set(resources.map((resource) => resource.id));
    for (const [id, view] of this.resourceViews) {
      if (!activeIds.has(id)) {
        view.container.destroy(true);
        this.resourceViews.delete(id);
      }
    }
    for (const resource of resources) {
      const view = this.resourceViews.get(resource.id) ?? this.createResourceView(resource);
      view.container.setPosition(resource.x, resource.y);
      view.crown.setFillStyle(resource.available ? 0x7fbf5b : 0x4c574d, 1);
      view.container.setAlpha(resource.available ? 1 : 0.48);
      view.label.setText(resource.available ? "TREE" : "DEPLETED");
    }
  }

  /** Creates one clickable tree view whose pointer action sends only the stable resource ID. */
  private createResourceView(resource: ResourceProjection): ResourceView {
    const trunk = this.add.rectangle(0, 7, 7, 18, 0x735033, 1);
    const crown = this.add.circle(0, -4, 16, 0x7fbf5b, 1)
      .setStrokeStyle(2, 0x243a2c, 1)
      .setInteractive({ useHandCursor: true });
    crown.on(Phaser.Input.Events.POINTER_DOWN, () => sendInteractIntent(resource.id));
    const label = this.add.text(0, 24, "TREE", {
      color: "#b8d9a9",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const container = this.add.container(resource.x, resource.y, [trunk, crown, label]);
    const view = { container, crown, label };
    this.resourceViews.set(resource.id, view);
    return view;
  }

  /** Creates, updates and removes the first-slice farm tile from its server-owned phase. */
  private renderFarmTiles(farmTiles: readonly FarmTileProjection[]): void {
    const activeIds = new Set(farmTiles.map((tile) => tile.id));
    for (const [id, view] of this.farmViews) {
      if (!activeIds.has(id)) {
        view.container.destroy(true);
        this.farmViews.delete(id);
      }
    }
    for (const tile of farmTiles) {
      const view = this.farmViews.get(tile.id) ?? this.createFarmView(tile);
      const appearance = farmAppearance(tile);
      view.container.setPosition(tile.x, tile.y);
      view.soil.setFillStyle(appearance.color, 1);
      view.label.setText(appearance.label);
    }
  }

  /** Creates one clickable farm tile that sends a phase-agnostic primary interaction intent. */
  private createFarmView(tile: FarmTileProjection): FarmView {
    const soil = this.add.rectangle(0, 0, 28, 28, 0x52654a, 1)
      .setStrokeStyle(2, 0x263528, 1)
      .setInteractive({ useHandCursor: true });
    soil.on(Phaser.Input.Events.POINTER_DOWN, () => sendFarmPrimaryIntent(tile.id));
    const label = this.add.text(0, 23, "SOIL", {
      color: "#d9c69b",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const container = this.add.container(tile.x, tile.y, [soil, label]);
    const view = { container, soil, label };
    this.farmViews.set(tile.id, view);
    return view;
  }
}

/** Maps one farm projection to a compact code-drawn color and phase label. */
function farmAppearance(tile: FarmTileProjection): { readonly color: number; readonly label: string } {
  switch (tile.phase) {
    case "untilled": return { color: 0x52654a, label: "SOIL" };
    case "tilled": return { color: 0x73513b, label: "TILLED" };
    case "growing": return {
      color: tile.watered ? 0x356f67 : 0x5f7042,
      label: tile.watered ? "GROWING" : "WATER",
    };
    case "mature": return { color: 0xb8ff62, label: "HARVEST" };
    default: return { color: 0x52654a, label: "UNKNOWN" };
  }
}

/** Converts one signed integer difference into the exact network axis union. */
function toAxis(value: number): -1 | 0 | 1 {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}
