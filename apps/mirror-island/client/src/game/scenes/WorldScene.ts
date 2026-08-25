import Phaser from "phaser";
import type { GameState } from "../../../../domain/state/game-state.ts";
import type { WorldCatalog } from "../../../../domain/world/regions.ts";
import {
  dispatchLocalGameCommand,
  getLocalGameSession,
  tickLocalGameSession,
} from "../../session/local-game-session.ts";
import { setActionFeedback, setDialogue } from "../../stores/game-store.ts";
import { MEDIA_KEYS, MEDIA_URLS } from "../assets/media-catalog.ts";
import {
  activeEntityMediaProfiles,
  entityMediaForRegion,
  playerMediaProfile,
  tilesetBindingsForRegion,
  VECTORAITH_MEDIA_KEYS,
  VECTORAITH_MEDIA_URLS,
  type AtlasFrameDefinition,
} from "../assets/visual-profile.ts";
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

const TRANSITION_DURATION_MS = 180;
const NPC_INTERACTION_DISTANCE = 42;
const WORLD_CAMERA_ZOOM = 2;

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly tool: Phaser.GameObjects.Container;
}

type TransitionPhase = "idle" | "fading-out" | "fading-in";
type Facing = "down" | "up" | "left" | "right";

export class WorldScene extends Phaser.Scene {
  private readonly catalog: WorldCatalog = getWorldCatalog();
  private readonly playerMedia = playerMediaProfile();
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
  private facing: Facing = "down";

  /** Creates the Tiled-backed scene with catalog entities and one shared player action timeline. */
  constructor() {
    super("World");
  }

  /** Queues every reviewed region map under the same keys used by the validated WorldCatalog. */
  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      setActionFeedback({
        tone: "error",
        code: "media-load-failed",
        message: `游戏素材 ${file.key} 加载失败，请刷新重试。`,
      });
    });
    this.load.image(MEDIA_KEYS.floor, MEDIA_URLS.floor);
    this.load.image(MEDIA_KEYS.village, MEDIA_URLS.village);
    this.load.image(MEDIA_KEYS.interiorFloor, MEDIA_URLS.interiorFloor);
    this.load.image(MEDIA_KEYS.wall, MEDIA_URLS.wall);
    this.load.spritesheet(MEDIA_KEYS.hero, MEDIA_URLS.hero, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet(MEDIA_KEYS.shopkeeper, MEDIA_URLS.shopkeeper, { frameWidth: 16, frameHeight: 16 });
    this.load.image(VECTORAITH_MEDIA_KEYS.terrain, VECTORAITH_MEDIA_URLS.terrain);
    this.load.image(VECTORAITH_MEDIA_KEYS.buildings, VECTORAITH_MEDIA_URLS.buildings);
    this.load.image(VECTORAITH_MEDIA_KEYS.details, VECTORAITH_MEDIA_URLS.details);
    this.load.image(VECTORAITH_MEDIA_KEYS.entities, VECTORAITH_MEDIA_URLS.entities);
    this.load.spritesheet(VECTORAITH_MEDIA_KEYS.farmer, VECTORAITH_MEDIA_URLS.farmer, {
      frameWidth: 16,
      frameHeight: 32,
    });
    for (const source of worldRegionSources()) this.load.tilemapTiledJSON(source.mapKey, source.url);
  }

  /** Creates test tiles, input, entity services and the local state subscription. */
  create(): void {
    this.createTilemapFloorTexture();
    this.registerMediaFrames();
    this.createPlayerAnimations();
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
      this.setMovementAnimation(xAxis, yAxis);
      dispatchLocalGameCommand({ type: "move", xAxis, yAxis, deltaMs: delta });
    } else {
      this.setIdleFrame();
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
    playerView.container.setDepth(100 + Math.floor(state.player.y));
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
    const tilesets = tilesetBindingsForRegion(regionId).map((binding) => (
      map.addTilesetImage(binding.tiledName, binding.textureKey, 16, 16, 0, 0)
    ));
    if (tilesets.some((tileset) => !tileset)) throw new Error(`Tilesets could not be created for region ${regionId}.`);
    const depths: Readonly<Record<string, number>> = {
      Ground: 0,
      GroundDetail: 2,
      Water: 4,
      Buildings: 8,
      AbovePlayer: 10_000,
    };
    for (const layerName of ["Ground", "GroundDetail", "Water", "Buildings", "AbovePlayer"] as const) {
      const layer = map.createLayer(layerName, tilesets.filter((tileset) => tileset !== null), 0, 0);
      if (!layer || !(layer instanceof Phaser.Tilemaps.TilemapLayer)) {
        throw new Error(`Tilemap layer ${layerName} did not use the reviewed standard renderer.`);
      }
      layer.setDepth(depths[layerName]!);
      if (layerName === "Water" && regionId !== "farm") {
        this.tweens.add({ targets: layer, alpha: { from: 0.88, to: 1 }, duration: 1100, yoyo: true, repeat: -1 });
      }
      this.tileLayers.push(layer);
    }
    this.entityFactory = new EntityFactory(this, entityMediaForRegion(regionId));
    this.activeMap = map;
    this.activeRegionId = regionId;
    this.cameras.main.setBounds(0, 0, region.widthPixels, region.heightPixels);
    this.cameras.main.setZoom(WORLD_CAMERA_ZOOM);
    this.cameras.main.startFollow(playerView.container, true, 1, 1);
    if (this.transitionPhase === "fading-out") {
      this.transitionPhase = "fading-in";
      this.cameras.main.fadeIn(TRANSITION_DURATION_MS, 7, 16, 13);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.transitionPhase = "idle";
      });
    }
  }

  /** Creates the reviewed player sprite and a code-drawn tool overlay used by ActionTimeline. */
  private createPlayerView(): PlayerView {
    const sprite = this.add.sprite(0, 0, this.playerMedia.textureKey, this.playerMedia.frames.idle.down)
      .setScale(this.playerMedia.scale)
      .setOrigin(0.5, this.playerMedia.originY);
    const handle = this.add.rectangle(0, 0, 3, 18, 0x7e512e, 1).setOrigin(0.5, 0.85);
    const blade = this.add.rectangle(4, -7, 8, 6, 0xd9e3d4, 1).setOrigin(0.5);
    const tool = this.add.container(10, -2, [handle, blade]).setVisible(false);
    const view = { container: this.add.container(0, 0, [sprite, tool]), sprite, tool };
    this.playerView = view;
    return view;
  }

  /** Crops the source floor atlas's unused final pixel row into a warning-free runtime tilemap texture. */
  private createTilemapFloorTexture(): void {
    if (this.textures.exists(MEDIA_KEYS.floorTilemap)) return;
    const source = this.textures.get(MEDIA_KEYS.floor).getSourceImage();
    if (!(source instanceof HTMLImageElement) && !(source instanceof HTMLCanvasElement)) {
      throw new Error("Source floor texture is not canvas-compatible.");
    }
    const texture = this.textures.createCanvas(MEDIA_KEYS.floorTilemap, 352, 416);
    if (!texture) throw new Error("Tilemap floor texture could not be created.");
    texture.context.drawImage(source, 0, 0, 352, 416, 0, 0, 352, 416);
    texture.refresh();
  }

  /** Registers reviewed atlas subframes used by formal tree, rock and farm entity views. */
  private registerMediaFrames(): void {
    for (const media of activeEntityMediaProfiles()) {
      this.registerAtlasFrame(media.tree.textureKey, media.tree.frame);
      this.registerAtlasFrame(media.tree.stumpTextureKey, media.tree.stumpFrame);
      this.registerAtlasFrame(media.rock.textureKey, media.rock.frame);
      this.registerAtlasFrame(media.farmSoil.textureKey, media.farmSoil.frame);
      if (media.farmCrop) {
        this.registerAtlasFrame(media.farmCrop.textureKey, media.farmCrop.growingFrame);
        this.registerAtlasFrame(media.farmCrop.textureKey, media.farmCrop.matureFrame);
      }
    }
  }

  /** Registers one reviewed named atlas frame on a preloaded texture exactly once. */
  private registerAtlasFrame(textureKey: string, frame: AtlasFrameDefinition): void {
    const texture = this.textures.get(textureKey);
    if (!texture.has(frame.name)) texture.add(frame.name, 0, frame.x, frame.y, frame.width, frame.height);
  }

  /** Creates four directional walk animations from the official source frame contract. */
  private createPlayerAnimations(): void {
    for (const facing of ["down", "up", "left", "right"] as const) {
      const key = `hero-walk-${facing}`;
      if (this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.playerMedia.frames.walk[facing].map((frame) => ({
          key: this.playerMedia.textureKey,
          frame,
        })),
        frameRate: 6,
        repeat: -1,
      });
    }
  }

  /** Updates ephemeral facing and starts the matching directional walk cycle. */
  private setMovementAnimation(xAxis: -1 | 0 | 1, yAxis: -1 | 0 | 1): void {
    const player = this.playerView;
    if (!player) return;
    if (Math.abs(xAxis) >= Math.abs(yAxis) && xAxis !== 0) this.facing = xAxis < 0 ? "left" : "right";
    else if (yAxis !== 0) this.facing = yAxis < 0 ? "up" : "down";
    player.sprite.play(`hero-walk-${this.facing}`, true);
  }

  /** Stops walking and projects the official idle frame for the latest facing. */
  private setIdleFrame(): void {
    const player = this.playerView;
    if (!player || this.actionTimeline.isBusy()) return;
    player.sprite.stop().setFrame(this.playerMedia.frames.idle[this.facing]);
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
      entity.playImpact(() => (
        dispatchLocalGameCommand({ type: "gather", targetId: entity.entityId })?.code === "success"
      ));
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
    this.facing = direction > 0 ? "right" : "left";
    this.actionTimeline.play({
      windupMs: 220,
      impactMs: 160,
      recoveryMs: 220,
      onWindup: () => {
        this.tweens.killTweensOf(playerView.tool);
        playerView.sprite.stop().setFrame(this.playerMedia.frames.attack[this.facing]);
        playerView.tool.list.forEach((child, index) => {
          if (child instanceof Phaser.GameObjects.Rectangle) {
            child.setFillStyle(index === 0 ? 0x7e512e : color, 1);
          }
        });
        playerView.tool.setVisible(true).setAlpha(1);
        playerView.tool.setPosition(direction * 9, -2).setRotation(direction > 0 ? -1.05 : 1.05);
        this.tweens.add({
          targets: playerView.tool,
          rotation: direction > 0 ? -0.45 : 0.45,
          duration: 220,
          ease: "Quad.Out",
        });
      },
      onImpact: () => {
        this.tweens.add({
          targets: playerView.tool,
          rotation: direction > 0 ? 1.0 : -1.0,
          duration: 130,
          ease: "Quad.In",
        });
        onImpact();
      },
      onRecovery: () => {
        this.tweens.add({ targets: playerView.tool, alpha: 0, duration: 180 });
      },
      onComplete: () => {
        playerView.tool.setVisible(false).setAlpha(1);
        this.setIdleFrame();
      },
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
