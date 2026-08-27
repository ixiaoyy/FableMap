import Phaser from "phaser";
import type { GameState } from "../../../../domain/state/game-state.ts";
import type { WorldCatalog } from "../../../../domain/world/regions.ts";
import {
  dispatchLocalGameCommand,
  getLocalGameSession,
  tickLocalGameSession,
} from "../../session/local-game-session.ts";
import {
  advanceDialogue,
  isWorldInputLocked,
  isDialogueOpen,
  openShop,
  setActionFeedback,
  setDialogue,
} from "../../stores/game-store.ts";
import { MEDIA_KEYS, MEDIA_URLS } from "../assets/media-catalog.ts";
import {
  HELLO_RUMIN_TOOL_FRAMES,
  isToolArtCandidateEnabled,
  TOOL_ART_CANDIDATE_KEYS,
  TOOL_ART_CANDIDATE_URLS,
  VECTORAITH_PLOWING_FRAMES,
  type CandidateToolAction,
} from "../assets/tool-art-candidate.ts";
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
  BedEntity,
  FarmPlotEntity,
  NpcEntity,
  RockEntity,
  TreeEntity,
} from "../entities/WorldEntities.ts";
import { getWorldCatalog, worldRegionSources } from "../world/world-catalog.ts";

const TRANSITION_DURATION_MS = 180;
const NPC_INTERACTION_DISTANCE = 42;
const BED_INTERACTION_DISTANCE = 42;
const WORLD_CAMERA_ZOOM = 2;

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly tool: Phaser.GameObjects.Container;
  readonly candidateTool: Phaser.GameObjects.Sprite | null;
  readonly candidatePlowing: Phaser.GameObjects.Sprite | null;
}

type TransitionPhase = "idle" | "fading-out" | "fading-in";
type Facing = "down" | "up" | "left" | "right";

export class WorldScene extends Phaser.Scene {
  private readonly catalog: WorldCatalog = getWorldCatalog();
  private readonly playerMedia = playerMediaProfile();
  private readonly toolArtCandidateEnabled = isToolArtCandidateEnabled();
  private playerView: PlayerView | null = null;
  private readonly treeViews = new Map<string, TreeEntity>();
  private readonly rockViews = new Map<string, RockEntity>();
  private readonly farmViews = new Map<string, FarmPlotEntity>();
  private readonly bedViews = new Map<string, BedEntity>();
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
    this.load.image(VECTORAITH_MEDIA_KEYS.terrain, VECTORAITH_MEDIA_URLS.terrain);
    this.load.image(VECTORAITH_MEDIA_KEYS.buildings, VECTORAITH_MEDIA_URLS.buildings);
    this.load.image(VECTORAITH_MEDIA_KEYS.details, VECTORAITH_MEDIA_URLS.details);
    this.load.image(VECTORAITH_MEDIA_KEYS.orchard, VECTORAITH_MEDIA_URLS.orchard);
    this.load.image(VECTORAITH_MEDIA_KEYS.crops, VECTORAITH_MEDIA_URLS.crops);
    this.load.spritesheet(VECTORAITH_MEDIA_KEYS.farmer, VECTORAITH_MEDIA_URLS.farmer, {
      frameWidth: 16,
      frameHeight: 32,
    });
    this.load.image(VECTORAITH_MEDIA_KEYS.npcs, VECTORAITH_MEDIA_URLS.npcs);
    if (this.toolArtCandidateEnabled) {
      this.load.spritesheet(TOOL_ART_CANDIDATE_KEYS.plowing, TOOL_ART_CANDIDATE_URLS.plowing, {
        frameWidth: 32,
        frameHeight: 32,
      });
      this.load.spritesheet(TOOL_ART_CANDIDATE_KEYS.helloTools, TOOL_ART_CANDIDATE_URLS.helloTools, {
        frameWidth: 32,
        frameHeight: 32,
      });
    }
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
    tickLocalGameSession(Date.now());
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    if (isWorldInputLocked()) {
      this.setIdleFrame();
      if (isDialogueOpen() && Phaser.Input.Keyboard.JustDown(this.interactKey)) advanceDialogue();
      return;
    }
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
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.interactNearestTarget();
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
    this.renderBeds(region.id);
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

  /** Creates the reviewed player plus default and explicitly enabled candidate action layers. */
  private createPlayerView(): PlayerView {
    const sprite = this.add.sprite(0, 0, this.playerMedia.textureKey, this.playerMedia.frames.idle.down)
      .setScale(this.playerMedia.scale)
      .setOrigin(0.5, this.playerMedia.originY);
    const handle = this.add.rectangle(0, 0, 3, 18, 0x7e512e, 1).setOrigin(0.5, 0.85);
    const blade = this.add.rectangle(4, -7, 8, 6, 0xd9e3d4, 1).setOrigin(0.5);
    const tool = this.add.container(10, -2, [handle, blade]).setVisible(false);
    const candidateTool = this.toolArtCandidateEnabled
      ? this.add.sprite(0, 0, TOOL_ART_CANDIDATE_KEYS.helloTools, HELLO_RUMIN_TOOL_FRAMES.axe)
        .setOrigin(0.5, this.playerMedia.originY)
        .setVisible(false)
      : null;
    const candidatePlowing = this.toolArtCandidateEnabled
      ? this.add.sprite(0, 0, TOOL_ART_CANDIDATE_KEYS.plowing, VECTORAITH_PLOWING_FRAMES.down[0])
        .setOrigin(0.5, this.playerMedia.originY)
        .setVisible(false)
      : null;
    const children: Phaser.GameObjects.GameObject[] = [sprite, tool];
    if (candidateTool) children.push(candidateTool);
    if (candidatePlowing) children.push(candidatePlowing);
    const view = {
      container: this.add.container(0, 0, children),
      sprite,
      tool,
      candidateTool,
      candidatePlowing,
    };
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
      for (const frame of Object.values(media.npc.frames)) {
        this.registerAtlasFrame(media.npc.textureKey, frame);
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
      if (!this.toolArtCandidateEnabled) continue;
      const plowingKey = `tool-art-plowing-${facing}`;
      if (this.anims.exists(plowingKey)) continue;
      this.anims.create({
        key: plowingKey,
        frames: VECTORAITH_PLOWING_FRAMES[facing].map((frame) => ({
          key: TOOL_ART_CANDIDATE_KEYS.plowing,
          frame,
        })),
        frameRate: 7,
        repeat: 0,
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

  /** Creates functional bed views from the active region's decoded interaction layer. */
  private renderBeds(regionId: string): void {
    const beds = this.catalog.requireRegion(regionId).interactions.filter((interaction) => (
      interaction.kind === "bed"
    ));
    const activeIds = new Set(beds.map((bed) => bed.entityId));
    removeMissing(this.bedViews, activeIds);
    for (const bed of beds) {
      if (!this.bedViews.has(bed.entityId)) {
        this.bedViews.set(bed.entityId, this.entityFactory.createBed(bed));
      }
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
    if (isWorldInputLocked()) return;
    this.playToolAction(entity.spawn.x, 0xe8d19b, "axe", () => {
      entity.playImpact(() => (
        dispatchLocalGameCommand({ type: "gather", targetId: entity.entityId })?.code === "success"
      ));
    });
  }

  /** Runs one shared tool sequence for tilling, planting, watering or harvesting. */
  private playFarmAction(entity: FarmPlotEntity): void {
    if (isWorldInputLocked()) return;
    const targetX = entity.interaction.x + entity.interaction.width / 2;
    const phase = this.latestState?.farmTiles[entity.entityId]?.phase;
    const action: CandidateToolAction = phase === "untilled"
      ? "plow"
      : phase === "tilled"
        ? "plant"
        : phase === "growing"
          ? "water"
          : "harvest";
    this.playToolAction(targetX, 0x8ed3c7, action, () => {
      const feedback = dispatchLocalGameCommand({ type: "farm-primary", tileId: entity.entityId });
      if (feedback?.tone === "success") entity.playImpact();
    });
  }

  /** Plays the one shared player tool pose while executing exactly one supplied impact callback. */
  private playToolAction(
    targetX: number,
    color: number,
    action: CandidateToolAction,
    onImpact: () => void,
  ): void {
    const playerView = this.playerView;
    if (!playerView) return;
    const direction = targetX >= playerView.container.x ? 1 : -1;
    this.facing = direction > 0 ? "right" : "left";
    this.actionTimeline.play({
      windupMs: 220,
      impactMs: 160,
      recoveryMs: 220,
      onWindup: () => {
        if (this.toolArtCandidateEnabled) this.beginCandidateToolVisual(playerView, action, direction);
        else this.beginDefaultToolVisual(playerView, direction, color);
      },
      onImpact: () => {
        if (this.toolArtCandidateEnabled) this.impactCandidateToolVisual(playerView, action, direction);
        else this.impactDefaultToolVisual(playerView, direction);
        onImpact();
      },
      onRecovery: () => {
        const target = this.toolArtCandidateEnabled
          ? action === "plow" ? playerView.candidatePlowing : playerView.candidateTool
          : playerView.tool;
        if (target) this.tweens.add({ targets: target, alpha: 0, duration: 180 });
      },
      onComplete: () => {
        this.resetPlayerActionVisuals(playerView);
        this.setIdleFrame();
      },
    });
  }

  /** Starts the legacy code-drawn placeholder used whenever the local candidate flag is absent. */
  private beginDefaultToolVisual(playerView: PlayerView, direction: 1 | -1, color: number): void {
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
  }

  /** Commits the visual swing of the legacy placeholder without owning the gameplay impact. */
  private impactDefaultToolVisual(playerView: PlayerView, direction: 1 | -1): void {
    this.tweens.add({
      targets: playerView.tool,
      rotation: direction > 0 ? 1.0 : -1.0,
      duration: 130,
      ease: "Quad.In",
    });
  }

  /** Starts one ignored local candidate pose while leaving command and save state untouched. */
  private beginCandidateToolVisual(
    playerView: PlayerView,
    action: CandidateToolAction,
    direction: 1 | -1,
  ): void {
    this.resetPlayerActionVisuals(playerView);
    if (action === "plow" && playerView.candidatePlowing) {
      playerView.sprite.setVisible(false);
      playerView.candidatePlowing
        .setVisible(true)
        .setAlpha(1)
        .setFlipX(false)
        .play(`tool-art-plowing-${this.facing}`, true);
      return;
    }
    playerView.sprite.stop().setFrame(this.playerMedia.frames.attack[this.facing]);
    if ((action === "axe" || action === "water") && playerView.candidateTool) {
      const frame = action === "axe" ? HELLO_RUMIN_TOOL_FRAMES.axe : HELLO_RUMIN_TOOL_FRAMES.watering;
      playerView.candidateTool
        .stop()
        .setFrame(frame)
        .setFlipX(direction < 0)
        .setPosition(direction * 2, 0)
        .setVisible(true)
        .setAlpha(1);
      this.tweens.add({
        targets: playerView.candidateTool,
        x: direction * 4,
        duration: 220,
        ease: "Quad.Out",
      });
      return;
    }
    this.tweens.add({ targets: playerView.sprite, scale: 0.94, duration: 160, yoyo: true });
  }

  /** Advances one candidate overlay at impact while GameSession remains the only mutation owner. */
  private impactCandidateToolVisual(
    playerView: PlayerView,
    action: CandidateToolAction,
    direction: 1 | -1,
  ): void {
    if ((action === "axe" || action === "water") && playerView.candidateTool) {
      this.tweens.add({
        targets: playerView.candidateTool,
        x: direction * 7,
        y: 2,
        duration: 130,
        ease: "Quad.In",
      });
    }
  }

  /** Hides every ephemeral action layer and restores the reviewed walking sprite defaults. */
  private resetPlayerActionVisuals(playerView: PlayerView): void {
    this.tweens.killTweensOf(playerView.tool);
    if (playerView.candidateTool) this.tweens.killTweensOf(playerView.candidateTool);
    if (playerView.candidatePlowing) this.tweens.killTweensOf(playerView.candidatePlowing);
    playerView.tool.setVisible(false).setAlpha(1).setPosition(10, -2).setRotation(0);
    playerView.candidateTool?.stop().setVisible(false).setAlpha(1).setPosition(0, 0).setFlipX(false);
    playerView.candidatePlowing?.stop().setVisible(false).setAlpha(1).setPosition(0, 0).setFlipX(false);
    playerView.sprite.setVisible(true).setScale(this.playerMedia.scale).setAlpha(1);
  }

  /** Resolves E against a nearby Cottage bed first, then the nearest fixed NPC. */
  private interactNearestTarget(): void {
    const player = this.latestState?.player;
    if (!player) return;
    const nearestBed = Array.from(this.bedViews.values())
      .map((bed) => ({ bed, distance: bed.distanceTo(player.x, player.y) }))
      .sort((left, right) => left.distance - right.distance)[0];
    if (nearestBed && nearestBed.distance <= BED_INTERACTION_DISTANCE) {
      this.beginSleep(nearestBed.bed.entityId);
      return;
    }
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
    if (nearest.npc.spawn.interactionType === "shop") {
      openShop(dialogue.lines[0]);
      return;
    }
    setDialogue({ speaker: dialogue.speaker, lines: dialogue.lines });
  }

  /** Fades once around a single atomic sleep command and blocks repeat input during the transition. */
  private beginSleep(bedId: string): void {
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    this.transitionPhase = "fading-out";
    this.cameras.main.fadeOut(TRANSITION_DURATION_MS, 7, 16, 13);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      dispatchLocalGameCommand({ type: "sleep", bedId });
      this.transitionPhase = "fading-in";
      this.cameras.main.fadeIn(TRANSITION_DURATION_MS, 7, 16, 13);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.transitionPhase = "idle";
      });
    });
  }

  /** Locks input, fades out, then asks GameSession to resolve one reviewed exit ID. */
  private beginRegionTransition(exitId: string): void {
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    this.transitionPhase = "fading-out";
    this.cameras.main.fadeOut(TRANSITION_DURATION_MS, 7, 16, 13);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      dispatchLocalGameCommand({ type: "transition-region", exitId });
    });
  }

  /** Destroys current map/entity views and cancels ephemeral actions before rendering another region. */
  private destroyRegionViews(): void {
    this.actionTimeline?.cancel();
    if (this.playerView) this.resetPlayerActionVisuals(this.playerView);
    for (const layer of this.tileLayers.splice(0)) layer.destroy();
    this.activeMap?.destroy();
    this.activeMap = null;
    destroyAll(this.treeViews);
    destroyAll(this.rockViews);
    destroyAll(this.farmViews);
    destroyAll(this.bedViews);
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
