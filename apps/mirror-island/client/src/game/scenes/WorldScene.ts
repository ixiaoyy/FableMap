import Phaser from "phaser";
import type { GameState } from "../../../../domain/state/game-state.ts";
import type { WorldCatalog } from "../../../../domain/world/regions.ts";
import {
  dispatchLocalGameCommand,
  getLocalGameSession,
  tickLocalGameSession,
} from "../../session/local-game-session.ts";
import { setActionFeedback, setDialogue } from "../../stores/game-store.ts";
import { getDialogueDefinition } from "../dialogue/definitions.ts";
import { ActionTimeline } from "../entities/ActionTimeline.ts";
import {
  EntityFactory,
  FarmPlotEntity,
  NpcEntity,
  RockEntity,
  TreeEntity,
} from "../entities/WorldEntities.ts";
import { getWorldCatalog, worldRegionSources } from "../world/world-catalog.ts";

const FOUNDATION_TEXTURE_KEY = "foundation-test-tiles";
const TRANSITION_DURATION_MS = 180;
const NPC_INTERACTION_DISTANCE = 42;

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
  readonly tool: Phaser.GameObjects.Rectangle;
}

type TransitionPhase = "idle" | "fading-out" | "fading-in";

export class WorldScene extends Phaser.Scene {
  private readonly catalog: WorldCatalog = getWorldCatalog();
  private playerView: PlayerView | null = null;
  private readonly treeViews = new Map<string, TreeEntity>();
  private readonly rockViews = new Map<string, RockEntity>();
  private readonly farmViews = new Map<string, FarmPlotEntity>();
  private readonly npcViews = new Map<string, NpcEntity>();
  private readonly tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private activeMap: Phaser.Tilemaps.Tilemap | null = null;
  private activeRegionId = "";
  private latestState: GameState | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private stopProjection?: () => void;
  private transitionPhase: TransitionPhase = "idle";
  private entityFactory!: EntityFactory;
  private actionTimeline!: ActionTimeline;

  /** Creates the Tiled-backed scene with catalog entities and one shared player action timeline. */
  constructor() {
    super("World");
  }

  /** Queues every reviewed region map under the same keys used by the validated WorldCatalog. */
  preload(): void {
    for (const source of worldRegionSources()) this.load.tilemapTiledJSON(source.mapKey, source.url);
  }

  /** Creates test tiles, input, entity services and the local state subscription. */
  create(): void {
    this.createFoundationTexture();
    this.entityFactory = new EntityFactory(this);
    this.actionTimeline = new ActionTimeline(this);
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable.");
    this.cursors = keyboard.createCursorKeys();
    this.movementKeys = keyboard.addKeys("W,A,S,D") as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.stopProjection = getLocalGameSession().subscribe((state) => this.renderState(state));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disposeScene());
  }

  /** Applies collision-aware movement, E interaction and one exit transition while no action owns input. */
  override update(_time: number, delta: number): void {
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
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
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.openNearestNpcDialogue();
    const player = this.latestState?.player;
    if (!player) return;
    const exit = this.catalog.exitAt(player.regionId, player.x, player.y);
    if (exit) this.beginRegionTransition(exit.id);
  }

  /** Projects one state snapshot into the active region and every ephemeral entity view. */
  private renderState(state: GameState): void {
    this.latestState = state;
    const playerView = this.playerView ?? this.createPlayerView();
    if (state.player.regionId !== this.activeRegionId) this.renderRegion(state.player.regionId, playerView);
    playerView.container.setPosition(state.player.x, state.player.y);
    const region = this.catalog.requireRegion(state.player.regionId);
    this.renderResources(region.id, state);
    this.renderFarmPlots(region.id, state);
    this.renderNpcs(region.id);
  }

  /** Replaces all current Tilemap layers while preserving GameSession and the player view. */
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

  /** Creates the temporary player marker and visible tool used by the shared action timeline. */
  private createPlayerView(): PlayerView {
    const body = this.add.circle(0, 0, 7, 0xd8f47b, 1).setStrokeStyle(2, 0x07100d, 1);
    const label = this.add.text(0, -15, "YOU", {
      color: "#edf8c9",
      fontFamily: "monospace",
      fontSize: "7px",
    }).setOrigin(0.5);
    const tool = this.add.rectangle(9, -2, 3, 16, 0xe8d19b, 1)
      .setOrigin(0.5, 0.9)
      .setVisible(false);
    const view = { container: this.add.container(0, 0, [body, label, tool]).setDepth(20), tool };
    this.playerView = view;
    return view;
  }

  /** Creates and projects all catalog resources in the active region through EntityFactory. */
  private renderResources(regionId: string, state: GameState): void {
    const spawns = this.catalog.requireRegion(regionId).resources;
    const treeIds = new Set(spawns.filter((spawn) => spawn.kind === "tree").map((spawn) => spawn.entityId));
    const rockIds = new Set(spawns.filter((spawn) => spawn.kind === "stone").map((spawn) => spawn.entityId));
    removeMissing(this.treeViews, treeIds);
    removeMissing(this.rockViews, rockIds);
    for (const spawn of spawns) {
      if (spawn.kind === "tree") {
        const view = this.treeViews.get(spawn.entityId)
          ?? this.entityFactory.createTree(spawn, (entity) => this.playTreeAction(entity));
        this.treeViews.set(spawn.entityId, view);
        const resource = state.resources[spawn.entityId];
        if (resource) view.project(resource);
      } else if (!this.rockViews.has(spawn.entityId)) {
        this.rockViews.set(spawn.entityId, this.entityFactory.createRock(spawn));
      }
    }
  }

  /** Creates and projects catalog farm plots in the active region through EntityFactory. */
  private renderFarmPlots(regionId: string, state: GameState): void {
    const plots = this.catalog.requireRegion(regionId).interactions.filter((interaction) => (
      interaction.kind === "farm-plot"
    ));
    const activeIds = new Set(plots.map((plot) => plot.entityId));
    removeMissing(this.farmViews, activeIds);
    for (const plot of plots) {
      const view = this.farmViews.get(plot.entityId)
        ?? this.entityFactory.createFarmPlot(plot, (entity) => this.playFarmAction(entity));
      this.farmViews.set(plot.entityId, view);
      const tile = state.farmTiles[plot.entityId];
      if (tile) view.project(tile);
    }
  }

  /** Creates fixed-position NPC views for the active region without adding schedules or persistent AI. */
  private renderNpcs(regionId: string): void {
    const spawns = this.catalog.requireRegion(regionId).npcs;
    const activeIds = new Set(spawns.map((spawn) => spawn.entityId));
    removeMissing(this.npcViews, activeIds);
    for (const spawn of spawns) {
      if (!this.npcViews.has(spawn.entityId)) {
        this.npcViews.set(spawn.entityId, this.entityFactory.createNpc(spawn));
      }
    }
  }

  /** Runs one tree windup/impact/recovery sequence and mutates gathering only on impact. */
  private playTreeAction(entity: TreeEntity): void {
    this.playToolAction(entity.spawn.x, 0xe8d19b, () => {
      const feedback = dispatchLocalGameCommand({ type: "gather", targetId: entity.entityId });
      if (feedback?.code === "success") entity.playImpact();
    });
  }

  /** Runs one shared tool sequence for tilling, planting, watering or harvesting. */
  private playFarmAction(entity: FarmPlotEntity): void {
    const targetX = entity.interaction.x + entity.interaction.width / 2;
    this.playToolAction(targetX, 0x8ed3c7, () => {
      const feedback = dispatchLocalGameCommand({ type: "farm-primary", tileId: entity.entityId });
      if (feedback?.tone === "success") entity.playImpact();
    });
  }

  /** Plays the one shared player tool pose while executing exactly one supplied impact callback. */
  private playToolAction(targetX: number, color: number, onImpact: () => void): void {
    const playerView = this.playerView;
    if (!playerView) return;
    const direction = targetX >= playerView.container.x ? 1 : -1;
    this.actionTimeline.play({
      windupMs: 130,
      impactMs: 110,
      recoveryMs: 150,
      onWindup: () => {
        this.tweens.killTweensOf(playerView.tool);
        playerView.tool.setFillStyle(color, 1).setVisible(true).setAlpha(1);
        playerView.tool.setPosition(direction * 9, -2).setRotation(direction > 0 ? -1.05 : 1.05);
        this.tweens.add({
          targets: playerView.tool,
          rotation: direction > 0 ? -0.45 : 0.45,
          duration: 130,
          ease: "Quad.Out",
        });
      },
      onImpact: () => {
        this.tweens.add({
          targets: playerView.tool,
          rotation: direction > 0 ? 1.0 : -1.0,
          duration: 90,
          ease: "Quad.In",
        });
        onImpact();
      },
      onRecovery: () => {
        this.tweens.add({ targets: playerView.tool, alpha: 0, duration: 120 });
      },
      onComplete: () => playerView.tool.setVisible(false).setAlpha(1),
    });
  }

  /** Opens the nearest in-range NPC's fixed Vue dialogue when E is pressed. */
  private openNearestNpcDialogue(): void {
    const player = this.latestState?.player;
    if (!player) return;
    const nearest = Array.from(this.npcViews.values())
      .map((npc) => ({ npc, distance: npc.distanceTo(player.x, player.y) }))
      .sort((left, right) => left.distance - right.distance)[0];
    if (!nearest || nearest.distance > NPC_INTERACTION_DISTANCE) {
      setActionFeedback({ tone: "error", code: "no-npc-nearby", message: "附近没有可交谈的人。" });
      return;
    }
    const dialogue = getDialogueDefinition(nearest.npc.spawn.dialogueId);
    if (!dialogue) {
      setActionFeedback({ tone: "error", code: "missing-dialogue", message: "对话内容暂时不可用。" });
      return;
    }
    setDialogue({ speaker: dialogue.speaker, text: dialogue.text });
  }

  /** Locks input, fades out, then asks GameSession to resolve one reviewed exit ID. */
  private beginRegionTransition(exitId: string): void {
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    this.transitionPhase = "fading-out";
    this.cameras.main.fadeOut(TRANSITION_DURATION_MS, 7, 16, 13);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      dispatchLocalGameCommand({ type: "transition-region", exitId });
    });
  }

  /** Destroys current map/entity views and cancels ephemeral actions before rendering another region. */
  private destroyRegionViews(): void {
    this.actionTimeline?.cancel();
    if (this.playerView) this.playerView.tool.setVisible(false).setAlpha(1);
    for (const layer of this.tileLayers.splice(0)) layer.destroy();
    this.activeMap?.destroy();
    this.activeMap = null;
    destroyAll(this.treeViews);
    destroyAll(this.rockViews);
    destroyAll(this.farmViews);
    destroyAll(this.npcViews);
  }

  /** Releases subscriptions and all region-owned Phaser objects on scene shutdown. */
  private disposeScene(): void {
    this.stopProjection?.();
    this.stopProjection = undefined;
    this.destroyRegionViews();
  }
}

/** Removes entity views whose stable IDs are not present in the current region. */
function removeMissing<T extends { destroy(): void }>(views: Map<string, T>, activeIds: ReadonlySet<string>): void {
  for (const [id, view] of views) {
    if (!activeIds.has(id)) {
      view.destroy();
      views.delete(id);
    }
  }
}

/** Destroys and clears one complete stable-ID entity view map. */
function destroyAll<T extends { destroy(): void }>(views: Map<string, T>): void {
  for (const view of views.values()) view.destroy();
  views.clear();
}

/** Converts one signed integer difference into the closed digital movement axis. */
function toAxis(value: number): -1 | 0 | 1 {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}
