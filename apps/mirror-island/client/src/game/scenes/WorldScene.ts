import Phaser from "phaser";
import { ITEM_ID, getItemDefinition } from "../../../../domain/items/definitions.ts";
import type { GameState } from "../../../../domain/state/game-state.ts";
import { facingFromVector, isPointInFacingSector } from "../../../../domain/world/facing.ts";
import { AudioDirector } from "../../audio/AudioDirector.ts";
import { AUDIO_CUE } from "../../audio/audio-catalog.ts";
import { emitAudioCue } from "../../audio/audio-events.ts";
import type {
  ExitDefinition,
  RegionDefinition,
  WorldCatalog,
  WorldPoint,
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
  isGameClockPaused,
  openGiftConfirmation,
  openShop,
  openRequestBoard,
  openSleepConfirmation,
  selectHotbarSlot,
  setActionFeedback,
  setDialogue,
  setWorldActionBusy,
  openContainer,
  openShippingBin,
  openBuildingService,
  openBackpackUpgrade,
  beginWorldPlacement,
  closeWorldPlacement,
  setPlacementPreview,
} from "../../stores/game-store.ts";
import { StorageWorldView, createWorldDropView, registerStorageFrames } from "../entities/StorageWorldView.ts";
import { MEDIA_KEYS, MEDIA_URLS } from "../assets/media-catalog.ts";
import {
  PET_MEDIA_KEYS,
  PET_MEDIA_URLS,
  petMediaProfile,
} from "../assets/pet-media.ts";
import { GARDENS_ICON_URL } from "../assets/item-icons.ts";
import { PASTORAL_PREVIEW } from "../assets/pastoral-art-preview.ts";
import { GARDENS_TEXTURE_KEY, registerItemTextures } from "../assets/item-textures.ts";
import { FarmingActionPresenter, farmActionForItem, type FarmAction } from "../presentation/FarmingActionPresenter.ts";
import { COTTAGE_BACKDROP, registerCottageArt } from "../presentation/cottage-art.ts";
import { registerShopInteriorArt } from "../presentation/shop-interiors-art.ts";
import { characterAppearanceKey, LayeredPlayerArtwork, registerCharacterTextures } from "../presentation/LayeredPlayerArtwork.ts";
import {
  activeEntityMediaProfiles,
  entityMediaForRegion,
  fixedInteriorViewAnchorForRegion,
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
  FishingSpotEntity,
  ForageEntity,
  InspectEntity,
  NpcEntity,
  PetEntity,
  RockEntity,
  TreeEntity,
  WeedEntity,
  worldLabelStyle,
} from "../entities/WorldEntities.ts";
import { isOutdoorRegion } from "../world/region-environment.ts";
import { getWorldCatalog, worldRegionMaps } from "../world/world-catalog.ts";
import { petAnchorsForRegion } from "../pets/pet-presentation.ts";
import { subscribeWorldAction } from "../world/world-input.ts";

const TRANSITION_DURATION_MS = 180;
const NPC_INTERACTION_DISTANCE = 42;
const PET_INTERACTION_DISTANCE = 42;
const BED_INTERACTION_DISTANCE = 42;
const ROCK_INTERACTION_DISTANCE = 42;
const WEED_INTERACTION_DISTANCE = 42;
const INSPECT_INTERACTION_DISTANCE = 48;
const EXIT_HINT_DISTANCE = 52;
const WORLD_CAMERA_ZOOM = 2;
const FOOTSTEP_INTERVAL_MS = 280;

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly actions: FarmingActionPresenter;
  readonly artwork: LayeredPlayerArtwork;
}

type TransitionPhase = "idle" | "fading-out" | "fading-in";

export class WorldScene extends Phaser.Scene {
  private readonly catalog: WorldCatalog = getWorldCatalog();
  private readonly playerMedia = playerMediaProfile();
  private appearanceKey = "";
  private playerView: PlayerView | null = null;
  private readonly treeViews = new Map<string, TreeEntity>();
  private readonly rockViews = new Map<string, RockEntity>();
  private readonly weedViews = new Map<string, WeedEntity>();
  private readonly farmViews = new Map<string, FarmPlotEntity>();
  private readonly fishingSpotViews = new Map<string, FishingSpotEntity>();
  private readonly forageViews = new Map<string, ForageEntity>();
  private readonly bedViews = new Map<string, BedEntity>();
  private readonly inspectViews = new Map<string, InspectEntity>();
  private readonly exitHintViews = new Map<string, ExitHintEntity>();
  private readonly npcViews = new Map<string, NpcEntity>();
  private readonly storageViews = new Map<string, StorageWorldView>();
  private readonly dropViews = new Map<string, Phaser.GameObjects.Container>();
  private readonly serviceViews = new Map<string, Phaser.GameObjects.Container>();
  private placementWasOpen = false;
  private placementGhost: Phaser.GameObjects.Graphics | null = null;
  private chestPunchId: string | null = null;
  private chestHitAt = 0;
  private petView: PetEntity | null = null;
  private readonly tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private pastoralCottage: Phaser.GameObjects.Image | null = null;
  private pastoralInterior: Phaser.GameObjects.Image | null = null;
  private activeMap: Phaser.Tilemaps.Tilemap | null = null;
  private activeRegionId = "";
  private latestState: GameState | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private hotbarKeys!: readonly Phaser.Input.Keyboard.Key[];
  private attackKey!: Phaser.Input.Keyboard.Key;
  private useKey!: Phaser.Input.Keyboard.Key;
  private tileCursor: Phaser.GameObjects.Graphics | null = null;
  private fishingLine: Phaser.GameObjects.Graphics | null = null;
  private stopProjection?: () => void;
  private stopWorldAction?: () => void;
  private transitionPhase: TransitionPhase = "idle";
  private entityFactory!: EntityFactory;
  private actionTimeline!: ActionTimeline;
  private audioDirector: AudioDirector | null = null;
  private facing: Facing = "down";
  private lastFootstepAt = 0;
  private inputWasLocked = false;
  private disposed = false;

  /** Creates the Tiled-backed scene with catalog entities and one shared player action timeline. */
  constructor() {
    super("World");
  }

  /** 加载场景纹理，并把已校验的地图副本交给 Phaser，地图不再重复下载。 */
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
    this.load.spritesheet(VECTORAITH_MEDIA_KEYS.npcs, VECTORAITH_MEDIA_URLS.npcs, {
      frameWidth: 16,
      frameHeight: 32,
    });
    this.load.spritesheet(PET_MEDIA_KEYS.cat, PET_MEDIA_URLS.cat, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet(PET_MEDIA_KEYS.dog, PET_MEDIA_URLS.dog, { frameWidth: 32, frameHeight: 32 });
    this.load.image(GARDENS_TEXTURE_KEY, GARDENS_ICON_URL);
    if (PASTORAL_PREVIEW) {
      this.load.image(PASTORAL_PREVIEW.tools.key, PASTORAL_PREVIEW.tools.url);
      this.load.image(PASTORAL_PREVIEW.cottage.key, PASTORAL_PREVIEW.cottage.url);
      this.load.image(PASTORAL_PREVIEW.interior.key, PASTORAL_PREVIEW.interior.url);
    }
    for (const source of worldRegionMaps()) this.load.tilemapTiledJSON(source.mapKey, source.data);
  }

  /** Creates test tiles, input, entity services and the local state subscription. */
  create(): void {
    this.disposed = false;
    this.createTilemapFloorTexture();
    registerItemTextures(this);
    this.registerMediaFrames();
    registerCottageArt(this);
    registerShopInteriorArt(this);
    registerStorageFrames(this);
    registerCharacterTextures(this, getLocalGameSession().snapshot().player.appearance);
    this.appearanceKey = characterAppearanceKey(getLocalGameSession().snapshot().player.appearance);
    this.createPlayerAnimations();
    this.actionTimeline = new ActionTimeline(this);
    this.audioDirector = new AudioDirector(() => {
      setActionFeedback({
        tone: "error",
        code: "audio-playback-blocked",
        message: "浏览器尚未启用声音，请打开声音设置并点击测试声音。",
      });
    });
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
      Phaser.Input.Keyboard.KeyCodes.NINE,
      Phaser.Input.Keyboard.KeyCodes.ZERO,
      Phaser.Input.Keyboard.KeyCodes.MINUS,
      Phaser.Input.Keyboard.KeyCodes.PLUS,
    ].map((code) => keyboard.addKey(code));
    keyboard.addCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.useKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.tileCursor = this.add.graphics().setDepth(9);
    this.fishingLine = this.add.graphics().setDepth(9_900);
    this.placementGhost = this.add.graphics().setDepth(20_000);
    window.addEventListener("keydown", this.handleStorageKey);
    this.input.on(Phaser.Input.Events.POINTER_WHEEL, this.handleHotbarWheel, this);
    this.stopWorldAction = subscribeWorldAction(() => this.useFacingItem());
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handleWorldPointer, this);
    this.stopProjection = getLocalGameSession().subscribe((state) => this.renderState(state));
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleScaleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disposeScene(true));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.disposeScene(false));
  }

  /** Applies collision-aware movement and one exit transition while no action or modal owns input. */
  override update(time: number, delta: number): void {
    tickLocalGameSession(
      Date.now(),
      this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isGameClockPaused(),
      document.hidden,
    );
    const worldInputLocked = isWorldInputLocked();
    // DOM dialogs own keyup after taking focus; do not retain a world key pressed before the handoff.
    if (worldInputLocked && !this.inputWasLocked) this.input.keyboard?.resetKeys();
    this.inputWasLocked = worldInputLocked;
    this.syncPlacementView();
    if (gameUiState.worldPlacement) {
      this.drawPlacementPreview();
      this.setIdleFrame();
      return;
    }
    this.renderTileCursor(worldInputLocked);
    this.renderFishingLine();
    if (this.activeRegionId) this.renderNpcs(this.activeRegionId);
    this.petView?.advance(
      delta,
      worldInputLocked || this.transitionPhase !== "idle" || this.actionTimeline.isBusy(),
    );
    this.projectInteractionAffordances(worldInputLocked);
    if (this.latestState) {
      for (const view of this.storageViews.values()) view.affordance(this.latestState.player.x, this.latestState.player.y, worldInputLocked);
    }
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    if (worldInputLocked) {
      this.setIdleFrame();
      return;
    }
    this.updateHotbarSelectionInput();
    if (Phaser.Input.Keyboard.JustDown(this.useKey)) { this.useFacingItem(); return; }
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
      const before = this.latestState?.player;
      const beforeX = before?.x;
      const beforeY = before?.y;
      this.setMovementAnimation(xAxis, yAxis);
      dispatchLocalGameCommand({ type: "move", xAxis, yAxis, deltaMs: delta });
      const after = this.latestState?.player;
      const moved = after && (after.x !== beforeX || after.y !== beforeY);
      if (moved && time - this.lastFootstepAt >= FOOTSTEP_INTERVAL_MS) {
        this.lastFootstepAt = time;
        emitAudioCue(AUDIO_CUE.footstep);
      }
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
    const previousQueueLength = this.latestState?.shippingQueue.length;
    const previousDay = this.latestState?.day;
    const previousPlayer = this.latestState?.player;
    if (previousDay === state.day && previousPlayer?.regionId === state.player.regionId) {
      this.facing = facingFromVector(state.player.x - previousPlayer.x, state.player.y - previousPlayer.y, this.facing);
    }
    this.latestState = state;
    const nextAppearanceKey = characterAppearanceKey(state.player.appearance);
    if (nextAppearanceKey !== this.appearanceKey) {
      registerCharacterTextures(this, state.player.appearance);
      this.appearanceKey = nextAppearanceKey;
    }
    const playerView = this.playerView ?? this.createPlayerView();
    const buildingPreview = gameUiState.worldPlacement && gameUiState.worldPlacement.request.kind !== "chest";
    const visibleRegionId = buildingPreview ? "farm" : state.player.regionId;
    if (visibleRegionId !== this.activeRegionId) this.renderRegion(visibleRegionId);
    playerView.container.setVisible(!buildingPreview);
    this.audioDirector?.setWeather(state.weather.current);
    playerView.container.setPosition(state.player.x, state.player.y);
    playerView.container.setDepth(100 + Math.floor(state.player.y));
    const region = this.catalog.requireRegion(visibleRegionId);
    this.renderResources(region.id, state);
    this.renderForage(region.id);
    this.renderFarmPlots(region.id, state);
    this.renderBeds(region.id);
    this.renderInspects(region.id);
    this.renderExitHints(region);
    this.renderNpcs(region.id);
    this.renderPet(region.id, state);
    this.renderFishingSpots(region);
    this.renderStorageObjects(region.id, state);
    this.renderStorageServices(region.id, state);
    if (previousQueueLength !== undefined && state.shippingQueue.length > previousQueueLength) {
      for (const view of this.storageViews.values()) view.pulse();
      emitAudioCue(AUDIO_CUE.pickup);
    }
    if (previousDay !== undefined && previousDay !== state.day) {
      this.fadeIntoWorld(400);
      emitAudioCue(AUDIO_CUE.sleep);
    }
  }

  /** Replaces all current Tilemap layers while preserving GameSession and the player view. */
  private renderRegion(regionId: string): void {
    this.destroyRegionViews();
    const region = this.catalog.requireRegion(regionId);
    // Share the atlas void color directly so finite map edges cannot expose a different camera background.
    const defaultBackground = this.game.config.backgroundColor.color;
    this.cameras.main.setBackgroundColor(regionId === "cottage" ? COTTAGE_BACKDROP : defaultBackground);
    const previewCottage = PASTORAL_PREVIEW && regionId === "farm"
      && this.textures.exists(PASTORAL_PREVIEW.cottage.key) ? PASTORAL_PREVIEW.cottage : null;
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
      if (previewCottage && (layerName === "Buildings" || layerName === "AbovePlayer")) {
        // Hide only the original cottage's pixels; domain collision and door coordinates stay intact.
        layer.forEachTile((tile) => { tile.alpha = 0; }, undefined, 17, 8, 5, 6);
      }
      if (layerName === "Water" && regionId !== "farm") {
        this.tweens.add({ targets: layer, alpha: { from: 0.88, to: 1 }, duration: 1100, yoyo: true, repeat: -1 });
      }
      this.tileLayers.push(layer);
    }
    this.entityFactory = new EntityFactory(this, entityMediaForRegion(regionId));
    if (previewCottage) {
      this.pastoralCottage = this.add.image(312, 224, previewCottage.key)
        .setOrigin(0.5, 1).setDisplaySize(88, 100).setDepth(10_000);
    }
    this.renderPastoralInteriorPreview(regionId);
    this.activeMap = map;
    this.activeRegionId = regionId;
    this.audioDirector?.setRegion(regionId);
    this.layoutWorldCamera();
    if (this.transitionPhase === "fading-out") {
      this.fadeIntoWorld(TRANSITION_DURATION_MS);
    }
  }

  /** Overlays a loaded DEV cottage candidate on its exact 288×176 Tiled room bounds, retaining all domain geometry. */
  private renderPastoralInteriorPreview(regionId: string): void {
    if (!PASTORAL_PREVIEW || regionId !== "cottage") return;
    if (!this.textures.exists(PASTORAL_PREVIEW.interior.key)) {
      setActionFeedback({
        tone: "error",
        code: "pastoral-interior-load-failed",
        message: "清新田园室内预览未能加载，当前显示原版小屋；请检查候选图片后刷新。",
      });
      return;
    }
    this.pastoralInterior = this.add.image(176, 256, PASTORAL_PREVIEW.interior.key)
      .setOrigin(0, 0).setDisplaySize(288, 176).setDepth(8);
    // The retained ground also supplies the room's surrounding backdrop; every old prop is below the candidate.
    for (const layer of this.tileLayers) {
      if (layer.layer.name !== "Ground") layer.setVisible(false);
    }
  }

  /** Restores the world over the supplied duration, retaining the shared keyboard/touch lock until visible. */
  private fadeIntoWorld(durationMs: number): void {
    this.transitionPhase = "fading-in";
    setWorldActionBusy(true);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      this.transitionPhase = "idle";
      setWorldActionBusy(false);
      this.setIdleFrame();
    });
    this.cameras.main.fadeIn(durationMs, 7, 16, 13);
  }

  /** Creates the saved avatar and its shared production item/action layers. */
  private createPlayerView(): PlayerView {
    const container = this.add.container(0, 0);
    const artwork = new LayeredPlayerArtwork(this, container, this.playerMedia);
    const sprite = artwork.body;
    const actions = new FarmingActionPresenter(this, container, sprite, this.playerMedia);
    const view = { container, sprite, actions, artwork };
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

    }
  }

  /** Updates ephemeral facing and starts the matching directional walk cycle. */
  private setMovementAnimation(xAxis: -1 | 0 | 1, yAxis: -1 | 0 | 1): void {
    const player = this.playerView;
    if (!player) return;
    this.facing = facingFromVector(xAxis, yAxis, this.facing);
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

  /** Rotates saved hotbar rows only when the world has focus; dialogs retain native Tab navigation. */
  private readonly handleStorageKey = (event: KeyboardEvent): void => {
    const focus = document.activeElement;
    if (gameUiState.worldPlacement && focus instanceof HTMLElement && focus.closest(".game-canvas")
      && gameUiState.storageSave.phase === "idle") {
      if (event.key === "Escape") { event.preventDefault(); closeWorldPlacement(); return; }
      const offsets: Readonly<Record<string, readonly [number, number]>> = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
      };
      const delta = offsets[event.key];
      if (delta) {
        event.preventDefault();
        this.selectPlacementTile(gameUiState.worldPlacement.column + delta[0], gameUiState.worldPlacement.row + delta[1]);
        return;
      }
    }
    if (event.key !== "Tab" || event.repeat || isWorldInputLocked() || this.transitionPhase !== "idle"
      || this.actionTimeline.isBusy() || !(focus instanceof HTMLElement) || !focus.closest(".game-canvas")) return;
    event.preventDefault();
    dispatchLocalGameCommand({ type: "rotate-hotbar-row", direction: event.shiftKey ? -1 : 1 });
  };

  /** Selects one of the current twelve slots from a canvas wheel event, without intercepting dialog scrolling. */
  private handleHotbarWheel(_pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number): void {
    if (!deltaY || isWorldInputLocked() || this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    const current = gameUiState.selectedInventoryIndex ?? (deltaY > 0 ? -1 : 0);
    selectHotbarSlot((current + (deltaY > 0 ? 1 : -1) + 12) % 12);
    this.projectHeldItem();
  }

  /** Reflows only the scene camera after its canvas changes size, preserving the selected tile and all world coordinates. */
  private handleScaleResize(): void {
    if (this.disposed) return;
    this.cameras.main.setSize(this.scale.gameSize.width, this.scale.gameSize.height);
    this.layoutWorldCamera();
  }

  /** Projects the active region into the current viewport; only the whole-farm preview uses fractional zoom to leave room for its controls. */
  private layoutWorldCamera(): void {
    if (!this.playerView || !this.activeRegionId) return;
    const region = this.catalog.requireRegion(this.activeRegionId);
    const camera = this.cameras.main;
    const placement = gameUiState.worldPlacement;
    if (placement && placement.request.kind !== "chest") {
      const availableHeight = Math.max(80, camera.height - 180);
      camera.stopFollow();
      camera.removeBounds();
      camera.setZoom(Math.min(WORLD_CAMERA_ZOOM, camera.width / region.widthPixels,
        availableHeight / region.heightPixels));
      camera.centerOn(region.widthPixels / 2,
        region.heightPixels / 2 + (camera.height - availableHeight) / (2 * camera.zoom));
      return;
    }
    camera.setZoom(WORLD_CAMERA_ZOOM);
    const anchorId = fixedInteriorViewAnchorForRegion(region.id);
    if (anchorId) {
      const anchor = this.catalog.requireSpawn(region.id, anchorId);
      camera.stopFollow();
      camera.removeBounds();
      camera.centerOn(anchor.x, anchor.y);
    } else {
      camera.setBounds(0, 0, region.widthPixels, region.heightPixels);
      camera.startFollow(this.playerView.container, true, 1, 1);
    }
  }

  /** Switches a carpenter preview to the actual farm map and restores the player camera after cancel or save. */
  private syncPlacementView(): void {
    const placement = gameUiState.worldPlacement;
    if (Boolean(placement) === this.placementWasOpen) return;
    this.placementWasOpen = Boolean(placement);
    const state = this.latestState;
    if (!state || !this.playerView) return;
    this.renderState(state);
    this.layoutWorldCamera();
    if (placement?.request.kind !== "chest" && placement) {
      const object = state.worldObjects.find((candidate) => candidate.id === placement.request.objectId);
      this.selectPlacementTile(object?.column ?? 23, object?.row ?? 14);
    } else if (placement) {
      this.selectPlacementTile(placement.column, placement.row);
    } else {
      this.placementGhost?.clear();
    }
  }

  /** Projects one selected tile through the shared occupancy owner; no preview mutates the farm. */
  private selectPlacementTile(column: number, row: number): void {
    const placement = gameUiState.worldPlacement;
    if (!placement) return;
    const kind = placement.request.kind === "chest" ? "chest" : "shipping-bin";
    const result = getLocalGameSession().placementPreview(kind, column, row, placement.request.objectId);
    setPlacementPreview(column, row, result.valid, result.message);
  }

  /** Draws a one- or two-tile placement footprint from the latest read-only verdict. */
  private drawPlacementPreview(): void {
    const ghost = this.placementGhost;
    const placement = gameUiState.worldPlacement;
    ghost?.clear();
    this.tileCursor?.clear();
    if (!ghost || !placement) return;
    const width = placement.request.kind === "chest" ? 16 : 32;
    const color = placement.valid ? 0xa1d37f : 0xe38470;
    ghost.fillStyle(color, 0.3).fillRect(placement.column * 16, placement.row * 16, width, 16);
    ghost.lineStyle(1, color, 1).strokeRect(placement.column * 16, placement.row * 16, width, 16);
  }

  /** Maintains stable storage and drop views for the visible region using only published saved state. */
  private renderStorageObjects(regionId: string, state: GameState): void {
    const objects = state.worldObjects.filter((object) => object.regionId === regionId);
    removeMissing(this.storageViews, new Set(objects.map((object) => object.id)));
    for (const object of objects) {
      const view = this.storageViews.get(object.id)
        ?? new StorageWorldView(this, object, (id) => this.interactStorageObject(id));
      view.project(object);
      this.storageViews.set(object.id, view);
    }
    const drops = state.worldDrops.filter((drop) => drop.regionId === regionId);
    removeMissing(this.dropViews, new Set(drops.map((drop) => drop.id)));
    for (const drop of drops) {
      if (!this.dropViews.has(drop.id)) this.dropViews.set(drop.id, createWorldDropView(this, drop, () => {
        if (isWorldInputLocked() || this.actionTimeline.isBusy() || this.transitionPhase !== "idle") return;
        dispatchLocalGameCommand({ type: "collect-world-drop", dropId: drop.id });
      }));
    }
  }

  /** Creates independent counter/display affordances and removes the backpack display after the final upgrade. */
  private renderStorageServices(regionId: string, state: GameState): void {
    const interactions = this.catalog.requireRegion(regionId).interactions.filter((interaction) =>
      interaction.kind === "building-service" || (interaction.kind === "backpack-display" && state.inventoryCapacity < 36));
    removeMissing(this.serviceViews, new Set(interactions.map((interaction) => interaction.entityId)));
    for (const interaction of interactions) {
      if (this.serviceViews.has(interaction.entityId)) continue;
      const marker = this.add.text(0, -9, interaction.kind === "backpack-display" ? "背包" : "木匠", {
        ...worldLabelStyle("#fff1c8"), backgroundColor: "#63452c", padding: { x: 3, y: 2 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      marker.on("pointerdown", () => this.openStorageService(interaction.entityId));
      this.serviceViews.set(interaction.entityId, this.add.container(interaction.x + interaction.width / 2,
        interaction.y + interaction.height / 2, [marker]).setDepth(200 + interaction.y));
    }
  }

  /** Opens a reachable object, ships the held stack, or primes and repeats an intentional chest hit. */
  private interactStorageObject(id: string, emptyHandHit = false): void {
    const state = this.latestState;
    if (!state || isWorldInputLocked() || this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    const object = state.worldObjects.find((candidate) => candidate.id === id);
    if (!object) return;
    if (!getLocalGameSession().canInteractWorldObject(id)) {
      setActionFeedback({ tone: "error", code: "storage-too-far", message: "走近箱子再操作。" });
      return;
    }
    this.facePoint(object.column * 16 + 8, object.row * 16 + 8);
    const itemId = gameUiState.selectedItemId;
    const definition = getItemDefinition(itemId);
    if (object.kind === "shipping-bin") {
      if (definition?.canShip && gameUiState.selectedInventoryIndex !== null) {
        dispatchLocalGameCommand({ type: "ship-item", objectId: id, sourceIndex: gameUiState.selectedInventoryIndex, quantity: "stack" });
      } else openShippingBin(id);
      return;
    }
    const empty = object.slots.every((slot) => slot.itemId === "");
    if (empty && definition?.category === "tool") {
      dispatchLocalGameCommand({ type: "recover-empty-chest", objectId: id, itemId });
      return;
    }
    const pushingTool = itemId === ITEM_ID.axe || itemId === ITEM_ID.pickaxe || itemId === ITEM_ID.hoe;
    if ((emptyHandHit && itemId === "") || (!empty && pushingTool)) {
      const repeats = this.chestPunchId === id && this.time.now - this.chestHitAt <= 1_200;
      this.chestPunchId = id;
      this.chestHitAt = this.time.now;
      this.storageViews.get(id)?.pulse();
      if (!repeats) {
        setActionFeedback({ tone: "success", code: "storage-hit-ready", message: empty ? "再敲一下，收回空箱。" : "再敲一下，把箱子移到附近空地。" });
        return;
      }
      this.chestPunchId = null;
      if (empty) dispatchLocalGameCommand({ type: "recover-empty-chest", objectId: id, itemId: "" });
      else if (pushingTool) dispatchLocalGameCommand({ type: "push-chest", objectId: id, itemId, facing: this.facing });
      else setActionFeedback({ tone: "error", code: "storage-not-empty", message: "箱内还有物品；用斧、镐或锄连续敲击可移动。" });
      return;
    }
    openContainer(id);
  }

  /** Opens only a domain-validated local service point; this method never infers business hours in the renderer. */
  private openStorageService(interactionId: string): void {
    if (isWorldInputLocked() || this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    const session = getLocalGameSession();
    if (session.backpackServiceAvailable(interactionId)) { openBackpackUpgrade(interactionId); return; }
    if (session.buildingServiceAvailable(interactionId)) { openBuildingService(interactionId); return; }
    setActionFeedback({ tone: "error", code: "storage-service-unavailable", message: "请走到陈列或柜台旁；木匠服务还需要墨子正在柜台。" });
  }

  /** Projects the selected item in the saved avatar's hand while no action or region transition owns it. */
  private projectHeldItem(): void {
    if (!this.playerView || this.actionTimeline.isBusy() || this.transitionPhase !== "idle") return;
    this.playerView.actions.hold(gameUiState.selectedItemId, this.facing);
  }

  /** Creates and projects all catalog resources in the active region through EntityFactory. */
  private renderResources(regionId: string, state: GameState): void {
    const spawns = this.catalog.requireRegion(regionId).resources;
    const treeIds = new Set(spawns.filter((spawn) => spawn.kind === "tree").map((spawn) => spawn.entityId));
    const rockIds = new Set(spawns.filter((spawn) => spawn.kind === "stone").map((spawn) => spawn.entityId));
    const weedIds = new Set(spawns.filter((spawn) => spawn.kind === "weed").map((spawn) => spawn.entityId));
    removeMissing(this.treeViews, treeIds);
    removeMissing(this.rockViews, rockIds);
    removeMissing(this.weedViews, weedIds);
    for (const spawn of spawns) {
      if (spawn.kind === "tree") {
        const view = this.treeViews.get(spawn.entityId)
          ?? this.entityFactory.createTree(spawn, (entity) => this.playTreeAction(entity));
        this.treeViews.set(spawn.entityId, view);
        const resource = state.resources[spawn.entityId];
        if (resource) view.project(resource);
      } else if (spawn.kind === "stone") {
        const view = this.rockViews.get(spawn.entityId)
          ?? this.entityFactory.createRock(spawn, (entity) => this.playRockAction(entity));
        this.rockViews.set(spawn.entityId, view);
        const resource = state.resources[spawn.entityId];
        if (resource) view.project(resource);
      } else if (spawn.kind === "weed") {
        const view = this.weedViews.get(spawn.entityId)
          ?? this.entityFactory.createWeed(spawn, (entity) => this.playWeedAction(entity));
        this.weedViews.set(spawn.entityId, view);
        const resource = state.resources[spawn.entityId];
        if (resource) view.project(resource);
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
    const tiles = regionId === "farm" ? Object.values(state.farmTiles) : [];
    const activeIds = new Set(tiles.map((tile) => tile.id));
    removeMissing(this.farmViews, activeIds);
    for (const tile of tiles) {
      const interaction = {
        entityId: tile.id,
        regionId: "farm",
        kind: "farm-plot" as const,
        x: tile.column * 16,
        y: tile.row * 16,
        width: 16,
        height: 16,
      };
      const view = this.farmViews.get(tile.id)
        ?? this.entityFactory.createFarmPlot(interaction, (entity) => this.playFarmAction(entity));
      this.farmViews.set(tile.id, view);
      view.project(tile);
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
      this.bedViews.get(bed.entityId)?.setArtworkVisible(this.pastoralInterior === null);
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

  /** Projects stable fishing markers for only the current region's authored zones. */
  private renderFishingSpots(region: RegionDefinition): void {
    removeMissing(this.fishingSpotViews, new Set(region.fishingZones.map((zone) => zone.id)));
    for (const zone of region.fishingZones) {
      if (!this.fishingSpotViews.has(zone.id)) {
        this.fishingSpotViews.set(zone.id, this.entityFactory.createFishingSpot(zone, () => this.startFishing(zone.id)));
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

  /** Projects an adopted pet only in its domain-owned region and saved movement position. */
  private renderPet(regionId: string, state: GameState): void {
    const pet = state.pet;
    if (!pet || pet.regionId !== regionId) {
      this.petView?.destroy();
      this.petView = null;
      return;
    }
    const anchors = petAnchorsForRegion(this.catalog, pet.regionId);
    if (this.petView) {
      this.petView.project(pet, state.day, anchors);
      return;
    }
    this.petView = this.entityFactory.createPet(
      pet,
      state.day,
      anchors,
      petMediaProfile(pet.species),
      (entity) => this.interactWithPet(entity),
    );
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
      ...Array.from(this.fishingSpotViews.values(), (view) => ({
        view, distance: view.distanceTo(player.x, player.y), limit: 52,
      })),
      ...(this.petView ? [{
        view: this.petView,
        distance: this.petView.distanceTo(player.x, player.y),
        limit: PET_INTERACTION_DISTANCE,
      }] : []),
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
    this.facePoint(entity.spawn.x, entity.spawn.y);
    const selectedItemId = gameUiState.selectedItemId;
    this.playToolAction(entity.spawn, farmActionForItem(selectedItemId), () => {
      let succeeded = false;
      entity.playImpact(() => {
        const code = dispatchLocalGameCommand({
          type: "use-item-on-target",
          itemId: selectedItemId,
          targetId: entity.entityId,
        })?.code;
        succeeded = code === "success" || code === "stump-cleared";
        return succeeded;
      });
      return succeeded;
    });
  }

  /** Runs one surface-mining sequence and mutates the stone only at the captured impact. */
  private playRockAction(entity: RockEntity): void {
    const player = this.latestState?.player;
    if (!player || isWorldInputLocked() || this.transitionPhase !== "idle") return;
    this.facePoint(entity.spawn.x, entity.spawn.y);
    const selectedItemId = gameUiState.selectedItemId;
    if (
      player.regionId !== entity.spawn.regionId
      || Math.hypot(player.x - entity.spawn.x, player.y - entity.spawn.y) > ROCK_INTERACTION_DISTANCE
    ) {
      dispatchLocalGameCommand({ type: "use-item-on-target", itemId: selectedItemId, targetId: entity.entityId });
      return;
    }
    if (selectedItemId !== ITEM_ID.pickaxe) {
      dispatchLocalGameCommand({
        type: "use-item-on-target",
        itemId: selectedItemId,
        targetId: entity.entityId,
      });
      entity.playTap();
      return;
    }
    this.playToolAction(entity.spawn, "pickaxe", () => {
      let succeeded = false;
      entity.playImpact(() => {
        succeeded = dispatchLocalGameCommand({
          type: "use-item-on-target",
          itemId: selectedItemId,
          targetId: entity.entityId,
        })?.code === "mined";
        return succeeded;
      });
      return succeeded;
    });
  }

  /** Runs one facing-aware scythe sequence while domain state selects every weed hit at impact. */
  private playWeedAction(entity: WeedEntity, preserveFacing = false): void {
    const player = this.latestState?.player;
    if (!player || isWorldInputLocked() || this.transitionPhase !== "idle") return;
    if (!preserveFacing) this.facePoint(entity.spawn.x, entity.spawn.y);
    const selectedItemId = gameUiState.selectedItemId;
    const facing = this.facing;
    if (
      player.regionId !== entity.spawn.regionId
      || Math.hypot(player.x - entity.spawn.x, player.y - entity.spawn.y) > WEED_INTERACTION_DISTANCE
    ) {
      dispatchLocalGameCommand({
        type: "use-item-on-target",
        itemId: selectedItemId,
        targetId: entity.entityId,
        facing,
      });
      return;
    }
    if (selectedItemId !== ITEM_ID.scythe) {
      dispatchLocalGameCommand({
        type: "use-item-on-target",
        itemId: selectedItemId,
        targetId: entity.entityId,
        facing,
      });
      entity.playTap();
      return;
    }
    this.playToolAction(entity.spawn, "scythe", () => (
      dispatchLocalGameCommand({
        type: "use-item-on-target",
        itemId: selectedItemId,
        targetId: entity.entityId,
        facing,
      })?.code === "cut"
    ));
  }

  /** Runs one shared tool sequence for tilling, planting, watering or harvesting. */
  private playFarmAction(entity: FarmPlotEntity): void {
    if (isWorldInputLocked()) return;
    const targetX = entity.interaction.x + entity.interaction.width / 2;
    this.facePoint(targetX, entity.interaction.y + entity.interaction.height / 2);
    this.playFarmTile(Math.floor(entity.interaction.x / 16), Math.floor(entity.interaction.y / 16));
  }

  /** Plays one selected-item action against an existing or newly tillable coordinate without changing facing mid-action. */
  private playFarmTile(column: number, row: number): void {
    if (isWorldInputLocked()) return;
    const selectedItemId = gameUiState.selectedItemId;
    const facing = this.facing;
    const action = farmActionForItem(selectedItemId);
    const harvestedItemId = this.latestState?.farmTiles[`farm:${column}:${row}`]?.cropId;
    this.playToolAction({ x: column * 16 + 8, y: row * 16 + 8 }, action, () => {
      const feedback = dispatchLocalGameCommand({
        type: "use-item-on-tile",
        itemId: selectedItemId,
        column,
        row,
        facing,
      });
      if (feedback?.tone === "success") this.farmViews.get(`farm:${column}:${row}`)?.playImpact();
      return feedback?.tone === "success";
    }, harvestedItemId);
  }

  /** Runs the captured visual pose around exactly one impact command and its success feedback. */
  private playToolAction(
    target: WorldPoint,
    action: FarmAction,
    onImpact: () => boolean,
    harvestedItemId?: string,
  ): void {
    const playerView = this.playerView;
    if (!playerView || this.actionTimeline.isBusy()) return;
    const facing = this.facing;
    const heldItemId = gameUiState.selectedItemId;
    setWorldActionBusy(true);
    const started = this.actionTimeline.play({
      windupMs: 220,
      impactMs: 160,
      recoveryMs: 220,
      onWindup: () => playerView.actions.begin(action, facing, heldItemId),
      onImpact: () => playerView.actions.impact(onImpact(), target, harvestedItemId),
      onRecovery: () => playerView.actions.recover(),
      onComplete: () => {
        this.resetPlayerActionVisuals(playerView);
        setWorldActionBusy(false);
        this.setIdleFrame();
      },
    });
    if (!started) setWorldActionBusy(false);
  }

  /** Clears only the current avatar's transient pose and effects at action/scene boundaries. */
  private resetPlayerActionVisuals(playerView: PlayerView): void {
    playerView.actions.reset();
  }

  /** Starts one empty-hand punch and returns whether this frame entered the shared action timeline. */
  private playPunch(): boolean {
    const playerView = this.playerView;
    const player = this.latestState?.player;
    if (!playerView || !player || gameUiState.selectedItemId !== "" || isWorldInputLocked()) return false;
    const chest = this.latestState?.worldObjects.filter((object) => object.kind === "chest" && object.regionId === player.regionId)
      .filter((object) => isPointInFacingSector(player, { x: object.column * 16 + 8, y: object.row * 16 + 8 }, this.facing))
      .sort((left, right) => Math.hypot(left.column * 16 + 8 - player.x, left.row * 16 + 8 - player.y)
        - Math.hypot(right.column * 16 + 8 - player.x, right.row * 16 + 8 - player.y))[0];
    if (chest && Math.hypot(chest.column * 16 + 8 - player.x, chest.row * 16 + 8 - player.y) <= 42) {
      this.interactStorageObject(chest.id, true);
      return true;
    }
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

  /** Routes bare-map clicks into dynamic tilling, water refill or one authored fishing zone. */
  private handleWorldPointer(pointer: Phaser.Input.Pointer): void {
    if (gameUiState.worldPlacement) {
      if (gameUiState.storageSave.phase !== "idle") return;
      const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.selectPlacementTile(Math.floor(point.x / 16), Math.floor(point.y / 16));
      return;
    }
    const state = this.latestState;
    if (
      !state
      || this.transitionPhase !== "idle"
      || this.actionTimeline.isBusy()
      || isWorldInputLocked()
    ) return;
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const column = Math.floor(point.x / 16);
    const row = Math.floor(point.y / 16);
    if (gameUiState.selectedItemId === ITEM_ID.chest && gameUiState.selectedInventoryIndex !== null) {
      beginWorldPlacement({ kind: "chest", inventoryIndex: gameUiState.selectedInventoryIndex });
      this.selectPlacementTile(column, row);
      return;
    }
    if (gameUiState.selectedItemId === ITEM_ID.wateringCan && this.catalog.isWaterSource(state.player.regionId, column, row)) {
      const feedback = dispatchLocalGameCommand({ type: "refill-watering-can", column, row });
      if (feedback?.tone === "success") emitAudioCue(AUDIO_CUE.watering);
      return;
    }
    if (gameUiState.selectedItemId === ITEM_ID.fishingRod) {
      const zone = this.catalog.requireRegion(state.player.regionId).fishingZones.find((candidate) => (
        point.x >= candidate.x
        && point.x <= candidate.x + candidate.width
        && point.y >= candidate.y
        && point.y <= candidate.y + candidate.height
      ));
      if (zone) this.startFishing(zone.id);
      return;
    }
    if (state.player.regionId !== "farm" || gameUiState.selectedItemId !== ITEM_ID.hoe) return;
    if (state.farmTiles[`farm:${column}:${row}`]) return;
    this.facePoint(column * 16 + 8, row * 16 + 8);
    this.playFarmTile(column, row);
  }

  /** Applies C or the touch action button to the facing tile or a nearby context target. */
  private useFacingItem(): void {
    const state = this.latestState;
    if (!state || isWorldInputLocked() || this.actionTimeline.isBusy() || this.transitionPhase !== "idle") return;
    const itemId = gameUiState.selectedItemId;
    const vector = facingVector(this.facing);
    const column = Math.floor(state.player.x / 16) + vector.x;
    const row = Math.floor(state.player.y / 16) + vector.y;
    if (itemId === ITEM_ID.chest && gameUiState.selectedInventoryIndex !== null) {
      beginWorldPlacement({ kind: "chest", inventoryIndex: gameUiState.selectedInventoryIndex });
      this.selectPlacementTile(column, row);
      return;
    }
    const frontObject = state.worldObjects.find((object) => object.regionId === state.player.regionId
      && object.row === row && column >= object.column && column < object.column + (object.kind === "shipping-bin" ? 2 : 1));
    if (frontObject) { this.interactStorageObject(frontObject.id); return; }
    if (itemId === ITEM_ID.fishingRod) {
      const zone = [...this.fishingSpotViews.values()].sort((a, b) => a.distanceTo(state.player.x, state.player.y) - b.distanceTo(state.player.x, state.player.y))[0];
      if (zone) this.startFishing(zone.entityId);
      else setActionFeedback({ tone: "error", code: "missing-zone", message: "去湖岸旧码头的浮漂标记处抛竿。" });
      return;
    }
    if (itemId === ITEM_ID.axe) {
      const tree = [...this.treeViews.values()].filter((view) => state.resources[view.entityId]?.phase !== "cleared")
        .sort((a, b) => Math.hypot(a.spawn.x - state.player.x, a.spawn.y - state.player.y) - Math.hypot(b.spawn.x - state.player.x, b.spawn.y - state.player.y))[0];
      if (tree && Math.hypot(tree.spawn.x - state.player.x, tree.spawn.y - state.player.y) <= 42) this.playTreeAction(tree);
      return;
    }
    if (itemId === ITEM_ID.pickaxe) {
      const rock = [...this.rockViews.values()].filter((view) => state.resources[view.entityId]?.phase === "standing")
        .sort((a, b) => Math.hypot(a.spawn.x - state.player.x, a.spawn.y - state.player.y) - Math.hypot(b.spawn.x - state.player.x, b.spawn.y - state.player.y))[0];
      if (rock && Math.hypot(rock.spawn.x - state.player.x, rock.spawn.y - state.player.y) <= ROCK_INTERACTION_DISTANCE) {
        this.playRockAction(rock);
      }
      return;
    }
    if (itemId === ITEM_ID.scythe) {
      const weed = [...this.weedViews.values()]
        .filter((view) => state.resources[view.entityId]?.phase === "standing")
        .filter((view) => Math.hypot(view.spawn.x - state.player.x, view.spawn.y - state.player.y) <= WEED_INTERACTION_DISTANCE)
        .filter((view) => isPointInFacingSector(state.player, view.spawn, this.facing))
        .sort((left, right) => {
          const leftDistance = Math.hypot(left.spawn.x - state.player.x, left.spawn.y - state.player.y);
          const rightDistance = Math.hypot(right.spawn.x - state.player.x, right.spawn.y - state.player.y);
          return leftDistance - rightDistance || (left.entityId < right.entityId ? -1 : left.entityId > right.entityId ? 1 : 0);
        })[0];
      if (weed) this.playWeedAction(weed, true);
      return;
    }
    if (itemId === ITEM_ID.wateringCan && this.catalog.isWaterSource(state.player.regionId, column, row)) {
      dispatchLocalGameCommand({ type: "refill-watering-can", column, row });
      return;
    }
    const tile = state.farmTiles[`farm:${column}:${row}`];
    if (state.player.regionId === "farm" && (itemId === ITEM_ID.hoe || itemId === ITEM_ID.wateringCan
      || getItemDefinition(itemId)?.category === "seed" || (itemId === "" && tile?.phase === "mature"))) {
      this.playFarmTile(column, row);
      return;
    }
    const choices: Array<{ distance: number; action: () => void }> = [
      ...state.worldObjects.filter((object) => object.regionId === state.player.regionId).map((object) => ({
        distance: Math.hypot(object.column * 16 + (object.kind === "chest" ? 8 : 16) - state.player.x, object.row * 16 + 8 - state.player.y),
        action: () => this.interactStorageObject(object.id),
      })),
      ...this.catalog.requireRegion(state.player.regionId).interactions.filter((interaction) => interaction.kind === "building-service" || (interaction.kind === "backpack-display" && state.inventoryCapacity < 36))
        .map((interaction) => ({ distance: Math.hypot(interaction.x + interaction.width / 2 - state.player.x, interaction.y + interaction.height / 2 - state.player.y),
          action: () => this.openStorageService(interaction.entityId) })),
      ...state.worldDrops.filter((drop) => drop.regionId === state.player.regionId).map((drop) => ({
        distance: Math.hypot(drop.originX - state.player.x, drop.originY - state.player.y),
        action: () => { dispatchLocalGameCommand({ type: "collect-world-drop", dropId: drop.id }); },
      })),
      ...[...this.npcViews.values()].map((view) => ({ distance: view.distanceTo(state.player.x, state.player.y), action: () => this.interactWithNpc(view) })),
      ...[...this.bedViews.values()].map((view) => ({ distance: view.distanceTo(state.player.x, state.player.y), action: () => this.requestSleepConfirmation(view) })),
      ...[...this.inspectViews.values()].map((view) => ({ distance: view.distanceTo(state.player.x, state.player.y), action: () => this.inspectEnvironment(view) })),
    ];
    if (itemId === "") {
      for (const view of this.forageViews.values()) choices.push({
        distance: Math.hypot(view.spawn.x - state.player.x, view.spawn.y - state.player.y),
        action: () => { dispatchLocalGameCommand({ type: "use-item-on-target", itemId: "", targetId: view.entityId }); },
      });
      const pet = this.petView;
      if (pet) choices.push({ distance: pet.distanceTo(state.player.x, state.player.y), action: () => this.interactWithPet(pet) });
    }
    choices.filter((candidate) => candidate.distance <= 42).sort((a, b) => a.distance - b.distance)[0]?.action();
  }

  /** Faces a clicked world point while preserving the previous direction for an exact overlap. */
  private facePoint(x: number, y: number): void {
    const player = this.latestState?.player;
    if (!player) return;
    const dx = x - player.x;
    const dy = y - player.y;
    this.facing = facingFromVector(dx, dy, this.facing);
  }

  /** Starts a single authored fishing interaction only when the player is holding the rod. */
  private startFishing(zoneId: string): void {
    if (isWorldInputLocked() || this.transitionPhase !== "idle" || this.actionTimeline.isBusy()) return;
    if (gameUiState.selectedItemId !== ITEM_ID.fishingRod) {
      setActionFeedback({ tone: "error", code: "rod-not-selected", message: "先从背包选中竹制鱼竿；Day 7 起可向祥子领取。" });
      return;
    }
    dispatchLocalGameCommand({ type: "start-fishing", zoneId });
  }

  /** Shows the adjacent tool target with a tile-sized outline; validity still belongs to the domain. */
  private renderTileCursor(locked: boolean): void {
    const view = this.tileCursor;
    view?.clear();
    const state = this.latestState;
    if (!view || !state || locked || state.player.regionId !== "farm") return;
    const item = getItemDefinition(gameUiState.selectedItemId);
    if (!item || (item.id !== ITEM_ID.hoe && item.id !== ITEM_ID.wateringCan && item.category !== "seed")) return;
    const vector = facingVector(this.facing);
    const column = Math.floor(state.player.x / 16) + vector.x;
    const row = Math.floor(state.player.y / 16) + vector.y;
    const valid = this.catalog.isTillable("farm", column, row) || (item.id === ITEM_ID.wateringCan && this.catalog.isWaterSource("farm", column, row));
    view.lineStyle(1, valid ? 0xffefb1 : 0xac4d3b, .95).strokeRect(column * 16, row * 16, 16, 16);
  }

  /** Draws the current rod line and bobber from the read-only fishing projection. */
  private renderFishingLine(): void {
    const view = this.fishingLine;
    view?.clear();
    const state = this.latestState;
    const fishing = gameUiState.fishing;
    if (!view || !state || !fishing.zoneId || fishing.phase === "idle" || fishing.phase === "casting") return;
    const zone = this.catalog.fishingZone(fishing.zoneId);
    if (!zone || zone.regionId !== state.player.regionId) return;
    const x = zone.x + zone.width / 2;
    const y = zone.y + zone.height + 8 + fishing.castPower * .4 + (fishing.bite ? 4 : 0);
    view.lineStyle(1, 0xf4ecd1, .8).lineBetween(state.player.x + 3, state.player.y - 16, x, y);
    view.fillStyle(0xf4ecd1).fillRect(x - 1, y - 6, 3, 7);
    view.fillStyle(0xa4513f).fillRect(x - 1, y - 8, 3, 4);
  }

  /** Opens the exact nearby clicked NPC's existing dialogue or shop projection. */
  private interactWithNpc(npc: NpcEntity): void {
    const state = this.latestState;
    const player = state?.player;
    if (!player || this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    if (npc.spawn.interactionType === "building-service") {
      this.openStorageService("town-house-west-carpenter-counter");
      return;
    }
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
    const heldItem = getItemDefinition(gameUiState.selectedItemId);
    if (heldItem && heldItem.category !== "tool" && heldItem.category !== "seed") {
      openGiftConfirmation({ npcId: npc.spawn.npcId, npcName: dialogue.speaker, itemId: heldItem.id });
      return;
    }
    const interaction = dispatchLocalGameCommand({ type: "talk-to-npc", npcId: npc.spawn.npcId });
    if (!interaction) return;
    const selectedDialogue = getDialogueDefinition(interaction.dialogueId, {
      day: state.day,
      minuteOfDay: state.minuteOfDay,
      shopAvailable: interaction.shopAvailable,
    });
    if (!selectedDialogue) {
      setActionFeedback({ tone: "error", code: "missing-dialogue", message: "对话内容暂时不可用。" });
      return;
    }
    if (interaction.firstTalkToday && gameUiState.friendships[npc.spawn.npcId]?.lastTalkedDay === gameUiState.day) {
      npc.playFriendshipPulse();
      if (!interaction.feedback) setActionFeedback({
        tone: "success",
        code: "friendship-talked",
        message: `与${selectedDialogue.speaker}更熟悉了一点。`,
      });
    }
    if (interaction.shopAvailable && !interaction.dialogueId.startsWith("event:")) {
      openShop(selectedDialogue.lines[0]);
      return;
    }
    setDialogue({
      dialogueId: interaction.dialogueId,
      wateringServiceAvailable: interaction.wateringServiceAvailable,
      npcId: interaction.npcId,
      speaker: selectedDialogue.speaker,
      lines: selectedDialogue.lines,
    });
  }

  /** Opens one nearby environment hotspot through the existing transient dialogue projection. */
  private inspectEnvironment(entity: InspectEntity): void {
    const state = this.latestState;
    const player = state?.player;
    if (!state || !player || this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    if (player.regionId !== entity.interaction.regionId) return;
    if (entity.distanceTo(player.x, player.y) > INSPECT_INTERACTION_DISTANCE) {
      setActionFeedback({ tone: "error", code: "inspect-too-far", message: "走近一些再查看。" });
      return;
    }
    if (entity.entityId === "town-notice-board") {
      openRequestBoard();
      return;
    }
    if (entity.entityId === "lakeshore-dock" && gameUiState.selectedItemId === ITEM_ID.fishingRod) {
      const zone = this.catalog.requireRegion(player.regionId).fishingZones[0];
      if (zone) this.startFishing(zone.id);
      return;
    }
    const dialogue = getDialogueDefinition(entity.interaction.dialogueId, {
      day: state.day,
      minuteOfDay: state.minuteOfDay,
    });
    if (!dialogue) {
      setActionFeedback({ tone: "error", code: "missing-dialogue", message: "这里暂时没有可查看的内容。" });
      return;
    }
    setDialogue({ speaker: dialogue.speaker, lines: dialogue.lines });
  }

  /** Requests the save-first overnight transaction; the day-status panel owns waiting and retry. */
  private beginSleep(bedId: string): void {
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    dispatchLocalGameCommand({ type: "sleep", bedId });
  }

  /** Locks input, fades out, then asks GameSession to resolve one reviewed exit ID. */
  private beginRegionTransition(exitId: string): void {
    if (this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    const exit = this.catalog.requireRegion(this.activeRegionId).exits.find((candidate) => candidate.id === exitId);
    const playsDoor = Boolean(exit && isOutdoorRegion(this.activeRegionId) !== isOutdoorRegion(exit.targetRegionId));
    this.transitionPhase = "fading-out";
    setWorldActionBusy(true);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const feedback = dispatchLocalGameCommand({ type: "transition-region", exitId });
      if (feedback !== null) this.fadeIntoWorld(TRANSITION_DURATION_MS);
      else if (playsDoor) emitAudioCue(AUDIO_CUE.door);
    });
    this.cameras.main.fadeOut(TRANSITION_DURATION_MS, 7, 16, 13);
  }

  /** Dispatches one nearby pet interaction and plays a heart only for the first valid touch that day. */
  private interactWithPet(pet: PetEntity): void {
    const state = this.latestState;
    const player = state?.player;
    if (!state || !player || this.transitionPhase !== "idle" || this.actionTimeline.isBusy() || isWorldInputLocked()) return;
    if (pet.distanceTo(player.x, player.y) > PET_INTERACTION_DISTANCE) {
      setActionFeedback({ tone: "error", code: "pet-too-far", message: `再靠近${state.pet?.name ?? "伙伴"}一点。` });
      return;
    }
    const feedback = dispatchLocalGameCommand({ type: "pet-home-pet" });
    if (feedback?.code === "pet-petted") pet.playHeartPulse();
  }

  /** Destroys current map/entity views and cancels ephemeral actions before rendering another region. */
  private destroyRegionViews(): void {
    this.pastoralCottage?.destroy();
    this.pastoralCottage = null;
    this.pastoralInterior?.destroy();
    this.pastoralInterior = null;
    this.actionTimeline?.cancel();
    setWorldActionBusy(false);
    if (this.playerView) this.resetPlayerActionVisuals(this.playerView);
    for (const layer of this.tileLayers.splice(0)) layer.destroy();
    this.activeMap?.destroy();
    this.activeMap = null;
    destroyAll(this.treeViews);
    destroyAll(this.rockViews);
    destroyAll(this.weedViews);
    destroyAll(this.forageViews);
    destroyAll(this.farmViews);
    destroyAll(this.fishingSpotViews);
    this.fishingLine?.clear();
    this.tileCursor?.clear();
    destroyAll(this.bedViews);
    destroyAll(this.inspectViews);
    destroyAll(this.exitHintViews);
    destroyAll(this.npcViews);
    destroyAll(this.storageViews);
    destroyAll(this.dropViews);
    destroyAll(this.serviceViews);
    this.petView?.destroy();
    this.petView = null;
  }

  /** Releases subscriptions and optionally destroys views while the scene systems are still valid. */
  private disposeScene(destroyViews: boolean): void {
    if (this.disposed) return;
    this.disposed = true;
    this.playerView?.artwork.release();
    cancelSleepConfirmation();
    this.audioDirector?.destroy();
    this.audioDirector = null;
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handleWorldPointer, this);
    this.input.off(Phaser.Input.Events.POINTER_WHEEL, this.handleHotbarWheel, this);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleScaleResize, this);
    window.removeEventListener("keydown", this.handleStorageKey);
    this.stopProjection?.();
    this.stopWorldAction?.();
    this.stopWorldAction = undefined;
    this.stopProjection = undefined;
    if (destroyViews) this.destroyRegionViews();
    else {
      this.petView = null;
      setWorldActionBusy(false);
    }
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
