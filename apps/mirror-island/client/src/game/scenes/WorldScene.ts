import Phaser from "phaser";
import { ITEM_ID, getItemDefinition } from "../../../../domain/items/definitions.ts";
import type { GameState } from "../../../../domain/state/game-state.ts";
import type {
  ExitDefinition,
  RegionDefinition,
  WorldCatalog,
} from "../../../../domain/world/regions.ts";
import {
  dispatchLocalGameCommand,
  getLocalGameSession,
  tickLocalGameSession,
} from "../../session/local-game-session.ts";
import {
  cancelSleepConfirmation,
  gameUiState,
  isWorldInputLocked,
  openShop,
  openSleepConfirmation,
  selectHotbarSlot,
  setActionFeedback,
  setDialogue,
  setWorldActionBusy,
} from "../../stores/game-store.ts";
import { MEDIA_KEYS, MEDIA_URLS } from "../assets/media-catalog.ts";
import {
  candidateActionForItem,
  GARDENS_ICON_FRAMES,
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
import {
  facingVector,
  selectNpcHitTarget,
  type Facing,
} from "../combat/npc-hit-target.ts";
import { getDialogueDefinition } from "../dialogue/definitions.ts";
import { ActionTimeline } from "../entities/ActionTimeline.ts";
import {
  EntityFactory,
  BedEntity,
  ExitHintEntity,
  FarmPlotEntity,
  ForageEntity,
  InspectEntity,
  NpcEntity,
  RockEntity,
  TreeEntity,
} from "../entities/WorldEntities.ts";
import { isOutdoorRegion } from "../world/region-environment.ts";
import { getWorldCatalog, worldRegionSources } from "../world/world-catalog.ts";

const TRANSITION_DURATION_MS = 180;
const NPC_INTERACTION_DISTANCE = 42;
const BED_INTERACTION_DISTANCE = 42;
const INSPECT_INTERACTION_DISTANCE = 48;
const EXIT_HINT_DISTANCE = 52;
const WORLD_CAMERA_ZOOM = 2;

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly tool: Phaser.GameObjects.Container;
  readonly heldItem: Phaser.GameObjects.Sprite | null;
  readonly candidateTool: Phaser.GameObjects.Sprite | null;
  readonly candidatePlowing: Phaser.GameObjects.Sprite | null;
}

type TransitionPhase = "idle" | "fading-out" | "fading-in";

export class WorldScene extends Phaser.Scene {
  private readonly catalog: WorldCatalog = getWorldCatalog();
  private readonly playerMedia = playerMediaProfile(
    getLocalGameSession().snapshot().player.appearanceId,
  );
  private readonly toolArtCandidateEnabled = isToolArtCandidateEnabled();
  private playerView: PlayerView | null = null;
  private readonly treeViews = new Map<string, TreeEntity>();
  private readonly rockViews = new Map<string, RockEntity>();
  private readonly farmViews = new Map<string, FarmPlotEntity>();
  private readonly forageViews = new Map<string, ForageEntity>();
  private readonly bedViews = new Map<string, BedEntity>();
  private readonly inspectViews = new Map<string, InspectEntity>();
  private readonly exitHintViews = new Map<string, ExitHintEntity>();
  private readonly npcViews = new Map<string, NpcEntity>();
  private readonly tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private activeMap: Phaser.Tilemaps.Tilemap | null = null;
  private activeRegionId = "";
  private latestState: GameState | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private hotbarKeys!: readonly Phaser.Input.Keyboard.Key[];
  private attackKey!: Phaser.Input.Keyboard.Key;
  private stopProjection?: () => void;
  private transitionPhase: TransitionPhase = "idle";
  private entityFactory!: EntityFactory;
  private actionTimeline!: ActionTimeline;
  private facing: Facing = "down";
  private disposed = false;

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
    this.load.spritesheet(VECTORAITH_MEDIA_KEYS.npcs, VECTORAITH_MEDIA_URLS.npcs, {
      frameWidth: 16,
      frameHeight: 32,
    });
    if (this.toolArtCandidateEnabled) {
      this.load.spritesheet(TOOL_ART_CANDIDATE_KEYS.plowing, TOOL_ART_CANDIDATE_URLS.plowing, {
        frameWidth: 32,
        frameHeight: 32,
      });
      this.load.spritesheet(TOOL_ART_CANDIDATE_KEYS.helloTools, TOOL_ART_CANDIDATE_URLS.helloTools, {
        frameWidth: 32,
        frameHeight: 32,
      });
      this.load.spritesheet(TOOL_ART_CANDIDATE_KEYS.gardensIcons, TOOL_ART_CANDIDATE_URLS.gardensIcons, {
        frameWidth: 16,
        frameHeight: 16,
      });
    }
    for (const source of worldRegionSources()) this.load.tilemapTiledJSON(source.mapKey, source.url);
  }

  /** Creates test tiles, input, entity services and the local state subscription. */
  create(): void {
    this.disposed = false;
    this.createTilemapFloorTexture();
    this.registerMediaFrames();
    this.createPlayerAnimations();
    this.actionTimeline = new ActionTimeline(this);
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable.");
    this.cursors = keyboard.createCursorKeys();
    this.movementKeys = keyboard.addKeys("W,A,S,D") as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    this.hotbarKeys = [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.FOUR,
      Phaser.Input.Keyboard.KeyCodes.FIVE,
      Phaser.Input.Keyboard.KeyCodes.SIX,
      Phaser.Input.Keyboard.KeyCodes.SEVEN,
      Phaser.Input.Keyboard.KeyCodes.EIGHT,
    ].map((code) => keyboard.addKey(code));
    keyboard.addCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.stopProjection = getLocalGameSession().subscribe((state) => this.renderState(state));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disposeScene(true));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.disposeScene(false));
  }

  /** Applies collision-aware movement and one exit transition while no action or modal owns input. */
  override update(_time: number, delta: number): void {
    const worldInputLocked = isWorldInputLocked();
    tickLocalGameSession(
      Date.now(),
      this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || worldInputLocked,
    );
    if (this.activeRegionId) this.renderNpcs(this.activeRegionId);
    this.projectInteractionAffordances(worldInputLocked);
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    if (worldInputLocked) {
      this.setIdleFrame();
      return;
    }
    this.updateHotbarSelectionInput();
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.playPunch()) return;
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
    this.renderForage(region.id);
    this.renderFarmPlots(region.id, state);
    this.renderBeds(region.id);
    this.renderInspects(region.id);
    this.renderExitHints(region);
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
    const heldItem = this.toolArtCandidateEnabled
      ? this.add.sprite(0, 0, TOOL_ART_CANDIDATE_KEYS.helloTools, HELLO_RUMIN_TOOL_FRAMES.hoe)
        .setOrigin(0.5, this.playerMedia.originY)
        .setVisible(false)
      : null;
    const candidatePlowing = this.toolArtCandidateEnabled
      ? this.add.sprite(0, 0, TOOL_ART_CANDIDATE_KEYS.plowing, VECTORAITH_PLOWING_FRAMES.down[0])
        .setOrigin(0.5, this.playerMedia.originY)
        .setVisible(false)
      : null;
    const children: Phaser.GameObjects.GameObject[] = [sprite];
    if (heldItem) children.push(heldItem);
    children.push(tool);
    if (candidateTool) children.push(candidateTool);
    if (candidatePlowing) children.push(candidatePlowing);
    const view = {
      container: this.add.container(0, 0, children),
      sprite,
      tool,
      heldItem,
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
      for (const crop of Object.values(media.farmCrops ?? {})) {
        if (!crop) continue;
        this.registerAtlasFrame(crop.textureKey, crop.growingFrame);
        this.registerAtlasFrame(crop.textureKey, crop.matureFrame);
      }
      for (const forage of Object.values(media.forage ?? {})) this.registerAtlasFrame(forage.textureKey, forage.frame);
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
    this.projectHeldItem();
  }

  /** Stops walking and projects the official idle frame for the latest facing. */
  private setIdleFrame(): void {
    const player = this.playerView;
    if (!player || this.actionTimeline.isBusy()) return;
    player.sprite.stop().setFrame(this.playerMedia.frames.idle[this.facing]);
    this.projectHeldItem();
  }

  /** Applies numeric Hotbar toggles only while world input is not owned by a modal or action. */
  private updateHotbarSelectionInput(): void {
    for (let index = 0; index < this.hotbarKeys.length; index += 1) {
      if (Phaser.Input.Keyboard.JustDown(this.hotbarKeys[index]!)) {
        selectHotbarSlot(index);
        this.projectHeldItem();
        return;
      }
    }
  }

  /** Projects the transient selected item as an idle held sprite without touching domain or save state. */
  private projectHeldItem(): void {
    const playerView = this.playerView;
    if (!playerView?.heldItem || this.actionTimeline.isBusy() || this.transitionPhase !== "idle") return;
    if (!this.configureHeldItem(playerView.heldItem, gameUiState.selectedItemId)) {
      playerView.heldItem.setVisible(false);
      return;
    }
    playerView.heldItem
      .setVisible(true)
      .setAlpha(1)
      .setFlipX(this.facing === "left")
      .setPosition(this.facing === "left" ? -3 : 3, 0);
  }

  /** Configures one held sprite from the selected item and returns false for empty/unsupported hands. */
  private configureHeldItem(sprite: Phaser.GameObjects.Sprite, itemId: string): boolean {
    if (itemId === ITEM_ID.axe || itemId === ITEM_ID.hoe || itemId === ITEM_ID.wateringCan) {
      const frame = itemId === ITEM_ID.axe
        ? HELLO_RUMIN_TOOL_FRAMES.axe
        : itemId === ITEM_ID.hoe
          ? HELLO_RUMIN_TOOL_FRAMES.hoe
          : HELLO_RUMIN_TOOL_FRAMES.watering;
      sprite.setTexture(TOOL_ART_CANDIDATE_KEYS.helloTools, frame).setOrigin(0.5, this.playerMedia.originY);
      return true;
    }
    if (getItemDefinition(itemId)?.category === "seed") {
      sprite.setTexture(TOOL_ART_CANDIDATE_KEYS.gardensIcons, GARDENS_ICON_FRAMES.seedBag).setOrigin(0.5);
      return true;
    }
    return false;
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
      } else if (spawn.kind === "stone" && !this.rockViews.has(spawn.entityId)) {
        this.rockViews.set(spawn.entityId, this.entityFactory.createRock(spawn));
      }
    }
  }

  /** Creates active deterministic forage views and removes collected or inactive daily candidates. */
  private renderForage(regionId: string): void {
    const spawns = getLocalGameSession().activeForageSpawnsInRegion(regionId);
    const activeIds = new Set(spawns.map((spawn) => spawn.entityId));
    removeMissing(this.forageViews, activeIds);
    for (const spawn of spawns) {
      if (!this.forageViews.has(spawn.entityId)) {
        this.forageViews.set(spawn.entityId, this.entityFactory.createForage(spawn, (entity) => {
          dispatchLocalGameCommand({
            type: "use-item-on-target",
            itemId: gameUiState.selectedItemId,
            targetId: entity.entityId,
          });
        }));
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
        this.bedViews.set(bed.entityId, this.entityFactory.createBed(bed, (entity) => {
          this.requestSleepConfirmation(entity);
        }));
      }
    }
  }

  /** Creates hover-only inspect hotspots for the active region without adding persistent state. */
  private renderInspects(regionId: string): void {
    const interactions = this.catalog.requireRegion(regionId).interactions.filter((interaction) => (
      interaction.kind === "inspect"
    ));
    const activeIds = new Set(interactions.map((interaction) => interaction.entityId));
    removeMissing(this.inspectViews, activeIds);
    for (const interaction of interactions) {
      if (!this.inspectViews.has(interaction.entityId)) {
        this.inspectViews.set(interaction.entityId, this.entityFactory.createInspect(interaction, (entity) => {
          this.inspectEnvironment(entity);
        }));
      }
    }
  }

  /** Creates stable proximity labels for every automatic door and regional exit. */
  private renderExitHints(region: RegionDefinition): void {
    const activeIds = new Set(region.exits.map((exit) => exit.id));
    removeMissing(this.exitHintViews, activeIds);
    for (const exit of region.exits) {
      if (this.exitHintViews.has(exit.id)) continue;
      this.exitHintViews.set(exit.id, this.entityFactory.createExitHint(
        exit,
        exitHintLabel(region.id, exit.targetRegionId, this.catalog),
        exitHintPosition(exit, region),
      ));
    }
  }

  /** Projects GameSession-owned NPC motion into stable views for the active region. */
  private renderNpcs(regionId: string): void {
    const spawns = getLocalGameSession().activeNpcSpawnsInRegion(regionId);
    const activeIds = new Set(spawns.map((spawn) => spawn.entityId));
    removeMissing(this.npcViews, activeIds);
    for (const spawn of spawns) {
      const current = this.npcViews.get(spawn.entityId);
      if (current) {
        current.project(spawn);
      } else {
        this.npcViews.set(spawn.entityId, this.entityFactory.createNpc(spawn, (entity) => {
          this.interactWithNpc(entity);
        }));
      }
    }
  }

  /** Projects player proximity into every shared interaction hint without mutating gameplay state. */
  private projectInteractionAffordances(worldInputLocked: boolean): void {
    const player = this.latestState?.player;
    if (!player) return;
    const inputLocked = worldInputLocked
      || this.transitionPhase !== "idle"
      || this.actionTimeline.isBusy();
    const candidates: Array<{
      readonly distance: number;
      readonly limit: number;
      readonly view: { projectAffordance(nearby: boolean, locked: boolean): void };
    }> = [
      ...Array.from(this.bedViews.values(), (view) => ({
        view,
        distance: view.distanceTo(player.x, player.y),
        limit: BED_INTERACTION_DISTANCE,
      })),
      ...Array.from(this.inspectViews.values(), (view) => ({
        view,
        distance: view.distanceTo(player.x, player.y),
        limit: INSPECT_INTERACTION_DISTANCE,
      })),
      ...Array.from(this.exitHintViews.values(), (view) => ({
        view,
        distance: view.distanceTo(player.x, player.y),
        limit: EXIT_HINT_DISTANCE,
      })),
      ...Array.from(this.npcViews.values(), (view) => ({
        view,
        distance: view.distanceTo(player.x, player.y),
        limit: NPC_INTERACTION_DISTANCE,
      })),
    ];
    const nearest = candidates.reduce<(typeof candidates)[number] | null>((current, candidate) => {
      if (candidate.distance > candidate.limit) return current;
      return !current || candidate.distance < current.distance ? candidate : current;
    }, null);
    for (const candidate of candidates) {
      candidate.view.projectAffordance(candidate === nearest, inputLocked);
    }
  }

  /** Runs one tree windup/impact/recovery sequence and mutates gathering only on impact. */
  private playTreeAction(entity: TreeEntity): void {
    if (isWorldInputLocked()) return;
    const selectedItemId = gameUiState.selectedItemId;
    this.playToolAction(entity.spawn.x, 0xe8d19b, candidateActionForItem(selectedItemId), () => {
      entity.playImpact(() => (
        dispatchLocalGameCommand({
          type: "use-item-on-target",
          itemId: selectedItemId,
          targetId: entity.entityId,
        })?.code === "success"
      ));
    });
  }

  /** Runs one shared tool sequence for tilling, planting, watering or harvesting. */
  private playFarmAction(entity: FarmPlotEntity): void {
    if (isWorldInputLocked()) return;
    const targetX = entity.interaction.x + entity.interaction.width / 2;
    const selectedItemId = gameUiState.selectedItemId;
    const action = candidateActionForItem(selectedItemId);
    this.playToolAction(targetX, 0x8ed3c7, action, () => {
      const feedback = dispatchLocalGameCommand({
        type: "use-item-on-target",
        itemId: selectedItemId,
        targetId: entity.entityId,
      });
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
    setWorldActionBusy(true);
    const started = this.actionTimeline.play({
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
        if (this.toolArtCandidateEnabled) this.recoverCandidateToolVisual(playerView, action);
        else this.tweens.add({ targets: playerView.tool, alpha: 0, duration: 180 });
      },
      onComplete: () => {
        this.resetPlayerActionVisuals(playerView);
        setWorldActionBusy(false);
        this.setIdleFrame();
      },
    });
    if (!started) setWorldActionBusy(false);
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
    if (action === "plant" && playerView.heldItem) {
      this.configureHeldItem(playerView.heldItem, ITEM_ID.turnipSeed);
      playerView.heldItem.setVisible(true).setAlpha(1).setPosition(direction * 4, -1);
      this.tweens.add({ targets: playerView.heldItem, x: direction * 7, y: 2, duration: 220, ease: "Quad.Out" });
      return;
    }
    this.tweens.add({
      targets: playerView.sprite,
      x: direction * 2,
      y: 2,
      scaleY: this.playerMedia.scale * 0.84,
      duration: 220,
      ease: "Quad.Out",
    });
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

  /** Fades or restores the active candidate layer during the shared recovery phase. */
  private recoverCandidateToolVisual(playerView: PlayerView, action: CandidateToolAction): void {
    if (action === "plow" && playerView.candidatePlowing) {
      this.tweens.add({ targets: playerView.candidatePlowing, alpha: 0, duration: 180 });
      return;
    }
    if ((action === "axe" || action === "water") && playerView.candidateTool) {
      this.tweens.add({ targets: playerView.candidateTool, alpha: 0, duration: 180 });
      return;
    }
    if (action === "plant" && playerView.heldItem) {
      this.tweens.add({ targets: playerView.heldItem, alpha: 0, duration: 180 });
    }
    this.tweens.add({
      targets: playerView.sprite,
      x: 0,
      y: 0,
      scaleX: this.playerMedia.scale,
      scaleY: this.playerMedia.scale,
      duration: 180,
      ease: "Quad.Out",
    });
  }

  /** Hides every ephemeral action layer and restores the reviewed walking sprite defaults. */
  private resetPlayerActionVisuals(playerView: PlayerView): void {
    this.tweens.killTweensOf(playerView.tool);
    if (playerView.candidateTool) this.tweens.killTweensOf(playerView.candidateTool);
    if (playerView.candidatePlowing) this.tweens.killTweensOf(playerView.candidatePlowing);
    if (playerView.heldItem) this.tweens.killTweensOf(playerView.heldItem);
    playerView.tool.setVisible(false).setAlpha(1).setPosition(10, -2).setRotation(0);
    playerView.candidateTool?.stop().setVisible(false).setAlpha(1).setPosition(0, 0).setFlipX(false);
    playerView.candidatePlowing?.stop().setVisible(false).setAlpha(1).setPosition(0, 0).setFlipX(false);
    playerView.heldItem?.stop().setVisible(false).setAlpha(1).setPosition(0, 0).setFlipX(false);
    playerView.sprite.setVisible(true).setPosition(0, 0).setScale(this.playerMedia.scale).setAlpha(1);
  }

  /** Starts one empty-hand punch and returns whether this frame entered the shared action timeline. */
  private playPunch(): boolean {
    const playerView = this.playerView;
    const player = this.latestState?.player;
    if (!playerView || !player || gameUiState.selectedItemId !== "" || isWorldInputLocked()) return false;
    const direction = facingVector(this.facing);
    setWorldActionBusy(true);
    const started = this.actionTimeline.play({
      windupMs: 120,
      impactMs: 90,
      recoveryMs: 180,
      onWindup: () => {
        this.resetPlayerActionVisuals(playerView);
        playerView.sprite.stop().setFrame(this.playerMedia.frames.attack[this.facing]);
        this.tweens.add({
          targets: playerView.sprite,
          x: direction.x * 2,
          y: direction.y * 2,
          scaleX: this.playerMedia.scale * 1.06,
          scaleY: this.playerMedia.scale * 0.92,
          duration: 120,
          ease: "Quad.Out",
        });
      },
      onImpact: () => {
        this.tweens.add({
          targets: playerView.sprite,
          x: direction.x * 4,
          y: direction.y * 4,
          duration: 90,
          ease: "Quad.In",
        });
        const target = selectNpcHitTarget(player, this.facing, Array.from(this.npcViews.values()).map((entity) => ({
          entityId: entity.entityId,
          x: entity.spawn.x,
          y: entity.spawn.y,
          entity,
        })));
        target?.entity.playHitReaction(direction);
      },
      onRecovery: () => {
        this.tweens.add({
          targets: playerView.sprite,
          x: 0,
          y: 0,
          scaleX: this.playerMedia.scale,
          scaleY: this.playerMedia.scale,
          duration: 180,
          ease: "Quad.Out",
        });
      },
      onComplete: () => {
        this.resetPlayerActionVisuals(playerView);
        setWorldActionBusy(false);
        this.setIdleFrame();
      },
    });
    if (!started) setWorldActionBusy(false);
    return started;
  }

  /** Opens one nearby bed confirmation without dispatching sleep until the player chooses yes. */
  private requestSleepConfirmation(bed: BedEntity): void {
    const player = this.latestState?.player;
    if (!player || this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    if (bed.distanceTo(player.x, player.y) > BED_INTERACTION_DISTANCE) {
      setActionFeedback({ tone: "error", code: "bed-too-far", message: "走到床边再休息。" });
      return;
    }
    openSleepConfirmation(() => this.beginSleep(bed.entityId));
  }

  /** Opens the exact nearby clicked NPC's existing dialogue or shop projection. */
  private interactWithNpc(npc: NpcEntity): void {
    const state = this.latestState;
    const player = state?.player;
    if (!player || this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    const dialogue = getDialogueDefinition(npc.spawn.dialogueId, {
      day: state.day,
      minuteOfDay: state.minuteOfDay,
      shopAvailable: npc.spawn.interactionType === "shop",
    });
    if (npc.distanceTo(player.x, player.y) > NPC_INTERACTION_DISTANCE) {
      setActionFeedback({
        tone: "error",
        code: "npc-too-far",
        message: `再靠近${dialogue?.speaker ?? "对方"}一点。`,
      });
      return;
    }
    if (!dialogue) {
      setActionFeedback({ tone: "error", code: "missing-dialogue", message: "对话内容暂时不可用。" });
      return;
    }
    const friendshipBefore = gameUiState.friendships[npc.spawn.npcId];
    const firstTalkToday = friendshipBefore !== undefined && friendshipBefore.lastTalkedDay !== gameUiState.day;
    dispatchLocalGameCommand({ type: "talk-to-npc", npcId: npc.spawn.npcId });
    if (firstTalkToday && gameUiState.friendships[npc.spawn.npcId]?.lastTalkedDay === gameUiState.day) {
      npc.playFriendshipPulse();
      setActionFeedback({
        tone: "success",
        code: "friendship-talked",
        message: `与${dialogue.speaker}更熟悉了一点。`,
      });
    }
    if (npc.spawn.interactionType === "shop") {
      openShop(dialogue.lines[0]);
      return;
    }
    setDialogue({ speaker: dialogue.speaker, lines: dialogue.lines });
  }

  /** Opens one nearby environment hotspot through the existing transient dialogue projection. */
  private inspectEnvironment(entity: InspectEntity): void {
    const player = this.latestState?.player;
    if (!player || this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    if (player.regionId !== entity.interaction.regionId) return;
    if (entity.distanceTo(player.x, player.y) > INSPECT_INTERACTION_DISTANCE) {
      setActionFeedback({ tone: "error", code: "inspect-too-far", message: "走近一些再查看。" });
      return;
    }
    const dialogue = getDialogueDefinition(entity.interaction.dialogueId);
    if (!dialogue) {
      setActionFeedback({ tone: "error", code: "missing-dialogue", message: "这里暂时没有可查看的内容。" });
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
    setWorldActionBusy(false);
    if (this.playerView) this.resetPlayerActionVisuals(this.playerView);
    for (const layer of this.tileLayers.splice(0)) layer.destroy();
    this.activeMap?.destroy();
    this.activeMap = null;
    destroyAll(this.treeViews);
    destroyAll(this.rockViews);
    destroyAll(this.forageViews);
    destroyAll(this.farmViews);
    destroyAll(this.bedViews);
    destroyAll(this.inspectViews);
    destroyAll(this.exitHintViews);
    destroyAll(this.npcViews);
  }

  /** Releases subscriptions and optionally destroys views while the scene systems are still valid. */
  private disposeScene(destroyViews: boolean): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelSleepConfirmation();
    this.stopProjection?.();
    this.stopProjection = undefined;
    if (destroyViews) this.destroyRegionViews();
    else setWorldActionBusy(false);
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

/** Returns one concise proximity label for an automatic transition target. */
function exitHintLabel(currentRegionId: string, targetRegionId: string, catalog: WorldCatalog): string {
  if (!isOutdoorRegion(currentRegionId) && isOutdoorRegion(targetRegionId)) return "出门";
  const targetName = catalog.requireRegion(targetRegionId).displayName;
  return isOutdoorRegion(targetRegionId) ? `前往${targetName}` : `进入${targetName}`;
}

/** Clamps one exit prompt inside the visible world edge without changing its Tiled hit rectangle. */
function exitHintPosition(exit: ExitDefinition, region: RegionDefinition): Readonly<{ x: number; y: number }> {
  return {
    x: Phaser.Math.Clamp(exit.x + exit.width / 2, 34, region.widthPixels - 34),
    y: Phaser.Math.Clamp(exit.y + exit.height / 2, 18, region.heightPixels - 18),
  };
}
