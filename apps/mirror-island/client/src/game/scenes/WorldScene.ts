import Phaser from "phaser";
import type {
  FarmTileState,
  GameState,
  ResourceState,
} from "../../../../domain/state/game-state.ts";
import {
  WORLD_HEIGHT_PIXELS,
  WORLD_WIDTH_PIXELS,
} from "../../../../domain/world/movement.ts";
import {
  dispatchLocalGameCommand,
  getLocalGameSession,
  tickLocalGameSession,
} from "../../session/local-game-session.ts";

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
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
  private playerView: PlayerView | null = null;
  private readonly resourceViews = new Map<string, ResourceView>();
  private readonly farmViews = new Map<string, FarmView>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private stopProjection?: () => void;

  /** Creates the only first-slice Phaser scene for the active local GameSession. */
  constructor() {
    super("World");
  }

  /** Creates the code-drawn world surface, input bindings and local state subscription. */
  create(): void {
    this.drawWorld();
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable.");
    this.cursors = keyboard.createCursorKeys();
    this.movementKeys = keyboard.addKeys("W,A,S,D") as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    this.stopProjection = getLocalGameSession().subscribe((state) => this.renderState(state));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopProjection?.());
  }

  /** Applies local movement for the elapsed frame and advances time-based domain rules. */
  override update(_time: number, delta: number): void {
    const xAxis = toAxis(
      Number(this.cursors.right.isDown || this.movementKeys.D.isDown)
      - Number(this.cursors.left.isDown || this.movementKeys.A.isDown),
    );
    const yAxis = toAxis(
      Number(this.cursors.down.isDown || this.movementKeys.S.isDown)
      - Number(this.cursors.up.isDown || this.movementKeys.W.isDown),
    );
    if (xAxis !== 0 || yAxis !== 0) {
      dispatchLocalGameCommand({ type: "move", xAxis, yAxis, deltaMs: delta });
    }
    tickLocalGameSession(Date.now());
  }

  /** Draws the temporary field grid that will be replaced by the fixed farm and town Tiled maps. */
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

  /** Projects one complete local state snapshot into the player, resource and farm views. */
  private renderState(state: GameState): void {
    const playerView = this.playerView ?? this.createPlayerView();
    playerView.container.setPosition(state.player.x, state.player.y);
    this.renderResources(Object.values(state.resources));
    this.renderFarmTiles(Object.values(state.farmTiles));
  }

  /** Creates the temporary local-player marker used before reviewed sprite assets are wired. */
  private createPlayerView(): PlayerView {
    const body = this.add.circle(0, 0, 8, 0xb8ff62, 1).setStrokeStyle(2, 0x07100d, 1);
    const label = this.add.text(0, -17, "YOU", {
      color: "#dfffad",
      fontFamily: "monospace",
      fontSize: "8px",
    }).setOrigin(0.5);
    const view = { container: this.add.container(0, 0, [body, label]) };
    this.playerView = view;
    return view;
  }

  /** Creates, updates and removes code-drawn resources from the local domain snapshot. */
  private renderResources(resources: readonly ResourceState[]): void {
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

  /** Creates one clickable resource whose pointer action dispatches its stable local ID. */
  private createResourceView(resource: ResourceState): ResourceView {
    const trunk = this.add.rectangle(0, 7, 7, 18, 0x735033, 1);
    const crown = this.add.circle(0, -4, 16, 0x7fbf5b, 1)
      .setStrokeStyle(2, 0x243a2c, 1)
      .setInteractive({ useHandCursor: true });
    crown.on(Phaser.Input.Events.POINTER_DOWN, () => {
      dispatchLocalGameCommand({ type: "gather", targetId: resource.id });
    });
    const label = this.add.text(0, 24, "TREE", {
      color: "#b8d9a9",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const view = {
      container: this.add.container(resource.x, resource.y, [trunk, crown, label]),
      crown,
      label,
    };
    this.resourceViews.set(resource.id, view);
    return view;
  }

  /** Creates, updates and removes the first local farm tile from its domain phase. */
  private renderFarmTiles(farmTiles: readonly FarmTileState[]): void {
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

  /** Creates one clickable farm tile that asks GameSession for its next legal primary action. */
  private createFarmView(tile: FarmTileState): FarmView {
    const soil = this.add.rectangle(0, 0, 28, 28, 0x52654a, 1)
      .setStrokeStyle(2, 0x263528, 1)
      .setInteractive({ useHandCursor: true });
    soil.on(Phaser.Input.Events.POINTER_DOWN, () => {
      dispatchLocalGameCommand({ type: "farm-primary", tileId: tile.id });
    });
    const label = this.add.text(0, 23, "SOIL", {
      color: "#d9c69b",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const view = {
      container: this.add.container(tile.x, tile.y, [soil, label]),
      soil,
      label,
    };
    this.farmViews.set(tile.id, view);
    return view;
  }
}

/** Maps one farm state to a compact temporary color and phase label. */
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

/** Converts one signed integer difference into the closed digital movement axis. */
function toAxis(value: number): -1 | 0 | 1 {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}
