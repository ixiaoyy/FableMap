import Phaser from "phaser";
import type {
  FarmTileState,
  GameState,
  ResourceState,
} from "../../../../domain/state/game-state.ts";
import type {
  InteractionDefinition,
  ResourceSpawnDefinition,
  WorldCatalog,
} from "../../../../domain/world/regions.ts";
import {
  dispatchLocalGameCommand,
  getLocalGameSession,
  tickLocalGameSession,
} from "../../session/local-game-session.ts";
import {
  getWorldCatalog,
  worldRegionSources,
} from "../world/world-catalog.ts";

const FOUNDATION_TEXTURE_KEY = "foundation-test-tiles";
const TRANSITION_DURATION_MS = 180;

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

type TransitionPhase = "idle" | "fading-out" | "fading-in";

export class WorldScene extends Phaser.Scene {
  private readonly catalog: WorldCatalog = getWorldCatalog();
  private playerView: PlayerView | null = null;
  private readonly resourceViews = new Map<string, ResourceView>();
  private readonly farmViews = new Map<string, FarmView>();
  private readonly tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private activeMap: Phaser.Tilemaps.Tilemap | null = null;
  private activeRegionId = "";
  private latestState: GameState | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private stopProjection?: () => void;
  private transitionPhase: TransitionPhase = "idle";

  /** Creates the first Tiled-backed Phaser scene for the active local GameSession. */
  constructor() {
    super("World");
  }

  /** Queues both reviewed region maps under the same keys used by the validated WorldCatalog. */
  preload(): void {
    for (const source of worldRegionSources()) this.load.tilemapTiledJSON(source.mapKey, source.url);
  }

  /** Creates test tile textures, input bindings and the local state subscription. */
  create(): void {
    this.createFoundationTexture();
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable.");
    this.cursors = keyboard.createCursorKeys();
    this.movementKeys = keyboard.addKeys("W,A,S,D") as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    this.stopProjection = getLocalGameSession().subscribe((state) => this.renderState(state));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disposeScene());
  }

  /** Applies collision-aware local movement and starts one exit transition when the player enters its rectangle. */
  override update(_time: number, delta: number): void {
    if (this.transitionPhase !== "idle") return;
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
    const player = this.latestState?.player;
    if (!player) return;
    const exit = this.catalog.exitAt(player.regionId, player.x, player.y);
    if (exit) this.beginRegionTransition(exit.id);
  }

  /** Projects one complete state snapshot into the active region and its temporary entity views. */
  private renderState(state: GameState): void {
    this.latestState = state;
    const playerView = this.playerView ?? this.createPlayerView();
    if (state.player.regionId !== this.activeRegionId) this.renderRegion(state.player.regionId, playerView);
    playerView.container.setPosition(state.player.x, state.player.y);
    const region = this.catalog.requireRegion(state.player.regionId);
    this.renderResources(region.resources, state.resources);
    this.renderFarmTiles(
      region.interactions.filter((interaction) => interaction.kind === "farm-plot"),
      state.farmTiles,
    );
  }

  /** Replaces all current Tilemap layers while preserving the GameSession and player view. */
  private renderRegion(regionId: string, playerView: PlayerView): void {
    this.destroyRegionViews();
    const region = this.catalog.requireRegion(regionId);
    const map = this.make.tilemap({ key: region.mapKey });
    const tileset = map.addTilesetImage("foundation", FOUNDATION_TEXTURE_KEY, 16, 16, 0, 0);
    if (!tileset) throw new Error(`Tileset could not be created for region ${regionId}.`);
    const depths: Readonly<Record<string, number>> = {
      Ground: 0,
      GroundDetail: 2,
      Water: 4,
      Buildings: 8,
      AbovePlayer: 30,
    };
    for (const layerName of ["Ground", "GroundDetail", "Water", "Buildings", "AbovePlayer"] as const) {
      const layer = map.createLayer(layerName, tileset, 0, 0);
      if (!layer || !(layer instanceof Phaser.Tilemaps.TilemapLayer)) {
        throw new Error(`Tilemap layer ${layerName} did not use the reviewed standard renderer.`);
      }
      layer.setDepth(depths[layerName]!);
      this.tileLayers.push(layer);
    }
    this.activeMap = map;
    this.activeRegionId = regionId;
    playerView.container.setDepth(20);
    this.cameras.main.setBounds(0, 0, region.widthPixels, region.heightPixels);
    this.cameras.main.startFollow(playerView.container, true, 1, 1);
    if (this.transitionPhase === "fading-out") {
      this.transitionPhase = "fading-in";
      this.cameras.main.fadeIn(TRANSITION_DURATION_MS, 7, 16, 13);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.transitionPhase = "idle";
      });
    }
  }

  /** Creates one six-color runtime test tileset without adding image binaries to Git. */
  private createFoundationTexture(): void {
    if (this.textures.exists(FOUNDATION_TEXTURE_KEY)) return;
    const texture = this.textures.createCanvas(FOUNDATION_TEXTURE_KEY, 96, 16);
    if (!texture) throw new Error("Foundation test texture could not be created.");
    const colors = ["#244c36", "#8e7a4e", "#315d68", "#76573c", "#9b7852", "#18251e"];
    colors.forEach((color, index) => {
      texture.context.fillStyle = color;
      texture.context.fillRect(index * 16, 0, 16, 16);
    });
    texture.refresh();
  }

  /** Creates the temporary local-player marker retained until Commit C loads the reviewed sprite. */
  private createPlayerView(): PlayerView {
    const body = this.add.circle(0, 0, 7, 0xd8f47b, 1).setStrokeStyle(2, 0x07100d, 1);
    const label = this.add.text(0, -15, "YOU", {
      color: "#edf8c9",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const view = { container: this.add.container(0, 0, [body, label]).setDepth(20) };
    this.playerView = view;
    return view;
  }

  /** Creates and updates code-drawn tree views from catalog positions and save-owned availability. */
  private renderResources(
    spawns: readonly ResourceSpawnDefinition[],
    resources: Readonly<Record<string, ResourceState>>,
  ): void {
    const trees = spawns.filter((spawn) => spawn.kind === "tree");
    const activeIds = new Set(trees.map((spawn) => spawn.entityId));
    for (const [id, view] of this.resourceViews) {
      if (!activeIds.has(id)) {
        view.container.destroy(true);
        this.resourceViews.delete(id);
      }
    }
    for (const spawn of trees) {
      const resource = resources[spawn.entityId];
      if (!resource) continue;
      const view = this.resourceViews.get(spawn.entityId) ?? this.createResourceView(spawn);
      view.container.setPosition(spawn.x, spawn.y);
      view.crown.setFillStyle(resource.available ? 0x7fbf5b : 0x4c574d, 1);
      view.container.setAlpha(resource.available ? 1 : 0.48);
      view.label.setText(resource.available ? "TREE" : "DEPLETED");
    }
  }

  /** Creates one clickable tree view whose stable ID is owned by the Tiled object property. */
  private createResourceView(spawn: ResourceSpawnDefinition): ResourceView {
    const trunk = this.add.rectangle(0, 7, 7, 18, 0x735033, 1);
    const crown = this.add.circle(0, -4, 16, 0x7fbf5b, 1)
      .setStrokeStyle(2, 0x243a2c, 1)
      .setInteractive({ useHandCursor: true });
    crown.on(Phaser.Input.Events.POINTER_DOWN, () => {
      dispatchLocalGameCommand({ type: "gather", targetId: spawn.entityId });
    });
    const label = this.add.text(0, 24, "TREE", {
      color: "#b8d9a9",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const view = {
      container: this.add.container(spawn.x, spawn.y, [trunk, crown, label]).setDepth(18),
      crown,
      label,
    };
    this.resourceViews.set(spawn.entityId, view);
    return view;
  }

  /** Creates and updates code-drawn farm views from catalog rectangles and save-owned phases. */
  private renderFarmTiles(
    interactions: readonly InteractionDefinition[],
    farmTiles: Readonly<Record<string, FarmTileState>>,
  ): void {
    const activeIds = new Set(interactions.map((interaction) => interaction.entityId));
    for (const [id, view] of this.farmViews) {
      if (!activeIds.has(id)) {
        view.container.destroy(true);
        this.farmViews.delete(id);
      }
    }
    for (const interaction of interactions) {
      const tile = farmTiles[interaction.entityId];
      if (!tile) continue;
      const view = this.farmViews.get(interaction.entityId) ?? this.createFarmView(interaction);
      const appearance = farmAppearance(tile);
      view.container.setPosition(
        interaction.x + interaction.width / 2,
        interaction.y + interaction.height / 2,
      );
      view.soil.setFillStyle(appearance.color, 1);
      view.label.setText(appearance.label);
    }
  }

  /** Creates one clickable farm view that sends only its stable Tiled-owned entity ID. */
  private createFarmView(interaction: InteractionDefinition): FarmView {
    const soil = this.add.rectangle(0, 0, interaction.width, interaction.height, 0x52654a, 1)
      .setStrokeStyle(2, 0x263528, 1)
      .setInteractive({ useHandCursor: true });
    soil.on(Phaser.Input.Events.POINTER_DOWN, () => {
      dispatchLocalGameCommand({ type: "farm-primary", tileId: interaction.entityId });
    });
    const label = this.add.text(0, interaction.height / 2 + 10, "SOIL", {
      color: "#d9c69b",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const view = {
      container: this.add.container(
        interaction.x + interaction.width / 2,
        interaction.y + interaction.height / 2,
        [soil, label],
      ).setDepth(16),
      soil,
      label,
    };
    this.farmViews.set(interaction.entityId, view);
    return view;
  }

  /** Locks input, fades out, then asks GameSession to resolve one reviewed exit ID. */
  private beginRegionTransition(exitId: string): void {
    if (this.transitionPhase !== "idle") return;
    this.transitionPhase = "fading-out";
    this.cameras.main.fadeOut(TRANSITION_DURATION_MS, 7, 16, 13);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      dispatchLocalGameCommand({ type: "transition-region", exitId });
    });
  }

  /** Destroys active region layers and ephemeral entity views before rendering another map. */
  private destroyRegionViews(): void {
    for (const layer of this.tileLayers.splice(0)) layer.destroy();
    this.activeMap?.destroy();
    this.activeMap = null;
    for (const view of this.resourceViews.values()) view.container.destroy(true);
    for (const view of this.farmViews.values()) view.container.destroy(true);
    this.resourceViews.clear();
    this.farmViews.clear();
  }

  /** Releases scene subscriptions and region-owned Phaser objects on shutdown. */
  private disposeScene(): void {
    this.stopProjection?.();
    this.stopProjection = undefined;
    this.destroyRegionViews();
  }
}

/** Maps one farm state to the temporary color and phase label retained until Commit C. */
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
