import { CraftingSystem, type CraftingResult } from "../crafting/CraftingSystem.ts";
import { FarmingSystem, type FarmingResult } from "../farming/FarmingSystem.ts";
import { GatheringSystem, type GatheringResult } from "../gathering/GatheringSystem.ts";
import { ForageSystem, type ForageResult } from "../gathering/ForageSystem.ts";
import { WeedCuttingSystem, type WeedCuttingResult } from "../gathering/WeedCuttingSystem.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, getItemDefinition, type ItemId } from "../items/definitions.ts";
import { MiningSystem, type MiningResult } from "../mining/MiningSystem.ts";
import {
  DEFAULT_PLAYER_APPEARANCE_ID,
  type PlayerAppearanceId,
} from "../player/appearance.ts";
import {
  FriendshipSystem,
} from "../social/FriendshipSystem.ts";
import {
  DailyRequestSystem,
  type DailyRequestSubmission,
} from "../requests/DailyRequestSystem.ts";
import { NpcDialogueSystem } from "../dialogue/NpcDialogueSystem.ts";
import {
  FirstWeekMilestoneSystem,
  getFirstWeekMilestone,
  type FirstWeekMilestoneResult,
} from "../retention/FirstWeekMilestoneSystem.ts";
import {
  UpgradeSystem,
  type BackpackUpgradeResult,
  type WateringCanUpgradeResult,
} from "../progression/UpgradeSystem.ts";
import {
  PetSystem,
  type PetAdoptionResult,
  type PetInteractionResult,
} from "../pets/PetSystem.ts";
import {
  MAIN_SAVE_SLOT,
  createStoredGame,
  type SaveRepository,
} from "../persistence/SaveRepository.ts";
import {
  cloneGameState,
  createInitialGameState,
  reconcileGameStateWithCatalog,
  type GameState,
} from "../state/game-state.ts";
import {
  ShopSystem,
  type BuyResult,
  type SellResult,
} from "../shop/ShopSystem.ts";
import {
  DAY_END_MINUTE,
  DAY_START_MINUTE,
  MIDNIGHT_MINUTE,
  MAX_CLOCK_TICK_DELTA_MS,
  REAL_MILLISECONDS_PER_TIME_STEP,
  advanceGameMinute,
  schedulePhaseAt,
} from "../time/game-time.ts";
import { movePlayer } from "../world/movement.ts";
import {
  NpcMotionRuntime,
  type NpcRuntimeSpawn,
} from "../world/npc-motions.ts";
import type { ResourceSpawnDefinition, WorldCatalog } from "../world/regions.ts";
import type { Facing } from "../world/facing.ts";
import { StaminaSystem, type EatResult } from "../stamina/StaminaSystem.ts";
import { GiftSystem, type GiftResult } from "../social/GiftSystem.ts";
import { WeatherSystem } from "../weather/WeatherSystem.ts";
import {
  FishingSystem,
  type FishingTickResult,
  type StartFishingResult,
} from "../fishing/FishingSystem.ts";
import { fishingPausesClock, type FishingSnapshot, type FishingSaveStatus } from "../fishing/definitions.ts";
import { IDLE_DAY_SETTLEMENT, type DayEndReason, type DaySettlementSnapshot } from "./day-settlement.ts";
import type {
  ActionFeedback,
  GameCommand,
  GameCommandResult,
  NpcInteractionResult,
} from "./commands.ts";

const MOVEMENT_CHECKPOINT_INTERVAL_MS = 500;
const SLEEP_INTERACTION_DISTANCE_PIXELS = 42;
const NPC_INTERACTION_DISTANCE_PIXELS = 42;

type SleepResult = "day-saving" | "missing-bed" | "too-far" | "already-saving" | "day-limit";
type NpcInteractionCommand = Extract<GameCommand, { readonly type: "talk-to-npc" }>;
type NonNpcGameCommand = Exclude<GameCommand, NpcInteractionCommand>;

export type GameStateListener = (state: GameState) => void;
export type FishingStateListener = (state: FishingSnapshot) => void;
export type DaySettlementListener = (state: DaySettlementSnapshot) => void;

interface PendingDaySettlement {
  readonly state: GameState;
  readonly reason: DayEndReason;
  readonly goldLost: number;
}

export class GameSession {
  private readonly inventory = new InventorySystem();
  private readonly stamina = new StaminaSystem(this.inventory);
  private readonly gathering: GatheringSystem;
  private readonly mining: MiningSystem;
  private readonly weedCutting: WeedCuttingSystem;
  private readonly forage: ForageSystem;
  private readonly crafting = new CraftingSystem(this.inventory);
  private readonly farming: FarmingSystem;
  private readonly shop: ShopSystem;
  private readonly friendship = new FriendshipSystem();
  private readonly gifts = new GiftSystem(this.inventory);
  private readonly requests = new DailyRequestSystem(this.inventory, this.friendship);
  private readonly dialogue = new NpcDialogueSystem();
  private readonly firstWeekMilestones = new FirstWeekMilestoneSystem();
  private readonly upgrades = new UpgradeSystem(this.inventory);
  private readonly pets = new PetSystem();
  private readonly weather = new WeatherSystem();
  private readonly npcMotions: NpcMotionRuntime;
  private readonly fishing: FishingSystem;
  private readonly listeners = new Set<GameStateListener>();
  private readonly fishingListeners = new Set<FishingStateListener>();
  private lastFishingProjection: FishingSnapshot | null = null;
  private fishingSaveStatus: FishingSaveStatus = "not-needed";
  private readonly daySettlementListeners = new Set<DaySettlementListener>();
  private state: GameState | null = null;
  private movementDirty = false;
  private lastMovementCheckpointAt = 0;
  private saveQueue: Promise<void> = Promise.resolve();
  private lastSaveError: unknown = null;
  private daySettlement: DaySettlementSnapshot = { ...IDLE_DAY_SETTLEMENT };
  private pendingDaySettlement: PendingDaySettlement | null = null;
  private daySavePromise: Promise<void> = Promise.resolve();
  private pendingFeedback: ActionFeedback | null = null;
  private lastClockTickAt: number | null = null;
  private clockAccumulatorMs = 0;

  /** Creates the sole mutable session owner for one opaque account key and local save slot. */
  constructor(
    private readonly repository: SaveRepository,
    private readonly ownerKey: string,
    private readonly catalog: WorldCatalog,
    private readonly slotId = MAIN_SAVE_SLOT,
    private readonly now: () => number = Date.now,
  ) {
    if (!ownerKey.trim() || !slotId.trim()) throw new Error("Local save identity is invalid.");
    this.gathering = new GatheringSystem(this.inventory, catalog, this.stamina);
    this.mining = new MiningSystem(this.inventory, this.stamina, catalog);
    this.weedCutting = new WeedCuttingSystem(this.inventory, catalog);
    this.forage = new ForageSystem(this.inventory, catalog);
    this.farming = new FarmingSystem(this.inventory, this.stamina, catalog);
    this.shop = new ShopSystem(this.inventory);
    this.npcMotions = new NpcMotionRuntime(catalog);
    this.fishing = new FishingSystem(this.inventory, this.stamina, catalog);
  }

  /** Reports whether this authenticated browser profile has a valid local save record. */
  async hasSave(): Promise<boolean> {
    return this.repository.has(this.ownerKey, this.slotId);
  }

  /** Replaces the current slot with one chosen appearance and persists it before play begins. */
  async newGame(
    appearanceId: PlayerAppearanceId = DEFAULT_PLAYER_APPEARANCE_ID,
  ): Promise<GameState> {
    await this.daySavePromise;
    await this.saveQueue;
    const state = createInitialGameState(this.catalog, appearanceId, worldSeedForNewGame(this.ownerKey, this.now()));
    await this.repository.save(this.ownerKey, this.slotId, createStoredGame(state, this.now()));
    this.state = state;
    this.npcMotions.reset(state.minuteOfDay, { day: state.day, weather: state.weather.current });
    this.lastSaveError = null;
    this.daySettlement = { ...IDLE_DAY_SETTLEMENT };
    this.pendingDaySettlement = null;
    this.movementDirty = false;
    const currentNow = this.now();
    this.lastMovementCheckpointAt = currentNow;
    this.resetClockBaseline(currentNow);
    if (state.weather.current === "rain") this.farming.applyRain(state);
    this.resetFishing();
    this.publish();
    this.publishFishing();
    this.publishDaySettlement();
    return cloneGameState(state);
  }

  /** Loads, validates and reconciles the current slot without advancing day-owned crop progress. */
  async continueGame(): Promise<GameState> {
    await this.flush();
    const stored = await this.repository.load(this.ownerKey, this.slotId);
    if (!stored) throw new Error("No local save exists for this account.");
    const candidate = stored.state;
    reconcileGameStateWithCatalog(candidate, this.catalog);
    if (candidate.weather.current === "rain") this.farming.applyRain(candidate);
    await this.persistSnapshot(candidate);
    this.state = candidate;
    this.npcMotions.reset(this.state.minuteOfDay, { day: this.state.day, weather: this.state.weather.current });
    this.lastSaveError = null;
    this.daySettlement = { ...IDLE_DAY_SETTLEMENT };
    this.pendingDaySettlement = null;
    this.movementDirty = false;
    const currentNow = this.now();
    this.lastMovementCheckpointAt = currentNow;
    this.resetClockBaseline(currentNow);
    this.resetFishing();
    this.publish();
    this.publishFishing();
    this.publishDaySettlement();
    return this.snapshot();
  }

  /** Applies one typed NPC interaction and returns its saved dialogue selection. */
  dispatch(command: NpcInteractionCommand): NpcInteractionResult | null;
  /** Applies one typed non-NPC local intent and returns fixed action feedback. */
  dispatch(command: NonNpcGameCommand): ActionFeedback | null;
  /** Applies a caller-held command union and returns the corresponding closed result union. */
  dispatch(command: GameCommand): GameCommandResult;
  /** Applies one typed local intent while preserving narrow result types for NPC and action callers. */
  dispatch(command: GameCommand): GameCommandResult {
    const state = this.requireState();
    if (command.type === "retry-day-settlement") {
      if (this.daySettlement.phase !== "failed" || !this.pendingDaySettlement) return null;
      this.persistPendingDay();
      return { tone: "success", code: "day-saving", message: "正在重新保存这一天。" };
    }
    if (this.daySettlement.phase !== "idle") {
      return command.type === "talk-to-npc" ? null : {
        tone: "error", code: "day-settlement-pending", message: "日结尚未保存，请等待或重试。",
      };
    }
    if (this.fishing.snapshot().phase !== "idle"
      && command.type !== "set-fishing-input" && command.type !== "dismiss-fishing"
      && command.type !== "retry-fishing-save") {
      return command.type === "talk-to-npc" ? null : {
        tone: "error", code: "fishing-active", message: "先收好鱼竿，再进行其他操作。",
      };
    }
    switch (command.type) {
      case "move": {
        const activeNpcs = this.npcMotions.activeSpawnsInRegion(state.player.regionId);
        if (movePlayer(state, this.catalog, command.xAxis, command.yAxis, command.deltaMs, activeNpcs)) {
          this.movementDirty = true;
          this.publish();
        }
        return null;
      }
      case "use-item-on-target": return this.useItemOnTarget(
        state,
        command.itemId,
        command.targetId,
        command.facing,
      );
      case "use-item-on-tile": {
        const itemId = command.itemId === "" ? "" : getItemDefinition(command.itemId)?.id;
        if (itemId === undefined) return null;
        const result = this.farming.use(state, command.column, command.row, itemId, command.facing);
        if (["tilled", "planted", "watered", "harvested"].includes(result)) this.commitCriticalChange();
        return farmingFeedback(result);
      }
      case "refill-watering-can": {
        const result = this.farming.refill(state, command.column, command.row);
        if (result === "refilled") this.commitCriticalChange();
        return farmingFeedback(result);
      }
      case "eat-item": {
        const result = this.stamina.eat(state, command.itemId);
        if (result === "ate") this.commitCriticalChange();
        return eatingFeedback(result, command.itemId);
      }
      case "craft": {
        const result = this.crafting.craft(state, command.recipeId);
        if (result === "success") this.commitCriticalChange();
        return craftingFeedback(result);
      }
      case "sleep": {
        const result = this.sleep(state, command.bedId);
        return sleepFeedback(result);
      }
      case "claim-fishing-rod": {
        const npc = this.npcMotions.activeByNpcId(command.npcId);
        if (state.day < 7 || npc?.npcId !== "town-resident-xiangzi" || npc.regionId !== state.player.regionId
          || Math.hypot(state.player.x - npc.x, state.player.y - npc.y) > NPC_INTERACTION_DISTANCE_PIXELS) {
          return { tone: "error", code: "fishing-rod-unavailable", message: "Day 7 起可以向祥子领取竹制鱼竿。" };
        }
        if (this.inventory.quantity(state.inventory, ITEM_ID.fishingRod) > 0) {
          return { tone: "error", code: "fishing-rod-owned", message: "你已经有一支竹制鱼竿了。" };
        }
        if (!this.inventory.add(state.inventory, ITEM_ID.fishingRod, 1)) {
          return { tone: "error", code: "inventory-full", message: "背包已满，留一个空格再来领取鱼竿。" };
        }
        this.commitCriticalChange();
        return { tone: "success", code: "fishing-rod-received", message: "领到了竹制鱼竿，到旧码头试试吧。" };
      }
      case "talk-to-npc": {
        const result = this.talkToNpc(state, command.npcId);
        if (result) this.commitCriticalChange();
        return result;
      }
      case "gift-item-to-npc": {
        const result = this.gifts.give(state, this.npcMotions.activeSpawns(), command.npcId, command.itemId);
        if (result.kind === "given") this.commitCriticalChange();
        return giftFeedback(result, command.itemId);
      }
      case "buy-item": {
        const result = this.shop.buySeed(state, this.npcMotions.activeSpawns(), command.itemId);
        if (result === "bought") this.commitCriticalChange();
        return buyFeedback(result, command.itemId);
      }
      case "sell-item": {
        const result = this.shop.sellItem(state, this.npcMotions.activeSpawns(), command.itemId);
        if (result === "sold") this.commitCriticalChange();
        return sellFeedback(result, command.itemId);
      }
      case "upgrade-watering-can": {
        const result = this.upgrades.upgradeWateringCan(state, this.npcMotions.activeSpawns());
        if (result === "upgraded-watering-can") this.commitCriticalChange();
        return wateringCanUpgradeFeedback(result);
      }
      case "upgrade-backpack": {
        const result = this.upgrades.upgradeBackpack(state, this.npcMotions.activeSpawns());
        if (result === "upgraded-backpack") this.commitCriticalChange();
        return backpackUpgradeFeedback(result);
      }
      case "acknowledge-retention-event": {
        const result = this.firstWeekMilestones.acknowledge(state, command.eventId);
        if (result === "milestone-acknowledged") this.commitCriticalChange();
        return firstWeekMilestoneFeedback(result, command.eventId);
      }
      case "adopt-pet": {
        const result = this.pets.adopt(state, command.species, command.name);
        if (result === "adopted") this.commitCriticalChange();
        return petAdoptionFeedback(result, state.pet?.name ?? command.name);
      }
      case "pet-home-pet": {
        const result = this.pets.pet(state);
        if (result === "petted") this.commitCriticalChange();
        return petInteractionFeedback(result, state.pet?.name ?? "伙伴");
      }
      case "start-fishing": {
        const result = this.fishing.start(state, command.zoneId);
        if (result === "started") {
          this.commitCriticalChange();
          this.publishFishing();
        }
        return startFishingFeedback(result);
      }
      case "set-fishing-input": {
        this.fishing.setHeld(state, command.held);
        this.publishFishing();
        return null;
      }
      case "dismiss-fishing": {
        if (this.fishing.snapshot().phase === "caught" && this.fishingSaveStatus !== "saved") {
          return { tone: "error", code: "fishing-save-pending", message: "请先保存这次鱼获，失败时可以重试。" };
        }
        this.resetFishing();
        this.publishFishing();
        return null;
      }
      case "retry-fishing-save": {
        if (this.fishing.snapshot().phase === "caught" && this.fishingSaveStatus === "failed") this.saveCaughtFish();
        return null;
      }
      case "transition-region": {
        const exit = this.catalog.exitAt(
          state.player.regionId,
          state.player.x,
          state.player.y,
        );
        if (exit?.id !== command.exitId) {
          return { tone: "error", code: "missing-exit", message: "区域出口不存在。" };
        }
        const spawn = this.catalog.requireSpawn(exit.targetRegionId, exit.targetSpawnId);
        state.player.regionId = exit.targetRegionId;
        state.player.x = spawn.x;
        state.player.y = spawn.y;
        this.resetFishing();
        this.publishFishing();
        this.commitCriticalChange();
        return null;
      }
    }
  }

  /** Advances visible fishing and the pause-aware clock; hidden pages pass activityPaused to freeze both. */
  tick(now = this.now(), paused = false, activityPaused = false): ActionFeedback | null {
    const state = this.requireState();
    if (!Number.isFinite(now)) return null;
    let feedback = this.pendingFeedback;
    this.pendingFeedback = null;
    const previousClockTick = this.lastClockTickAt;
    this.lastClockTickAt = now;
    const elapsed = previousClockTick === null
      ? 0
      : Math.max(0, Math.min(now - previousClockTick, MAX_CLOCK_TICK_DELTA_MS));
    if (this.daySettlement.phase !== "idle" || activityPaused) return feedback;
    if (state.minuteOfDay >= DAY_END_MINUTE) {
      this.beginDaySettlement(state, "passed-out", DAY_END_MINUTE);
      return { tone: "success", code: "day-saving", message: "已经 02:00，正在保存并送你回家。" };
    }
    let shouldSave = false;
    if (this.movementDirty && now - this.lastMovementCheckpointAt >= MOVEMENT_CHECKPOINT_INTERVAL_MS) {
      this.movementDirty = false;
      this.lastMovementCheckpointAt = now;
      shouldSave = true;
    }
    const fishingResult = this.fishing.tick(state, elapsed);
    if (fishingResult?.kind === "caught") this.saveCaughtFish();
    else this.publishFishing();
    if (fishingResult) {
      feedback = fishingTickFeedback(fishingResult);
    }
    if (!paused && !fishingPausesClock(this.fishing.snapshot().phase) && previousClockTick !== null) {
      this.npcMotions.advance(elapsed, state.player);
      if (state.minuteOfDay < DAY_END_MINUTE) {
        this.clockAccumulatorMs += elapsed;
        if (this.clockAccumulatorMs >= REAL_MILLISECONDS_PER_TIME_STEP) {
          this.clockAccumulatorMs -= REAL_MILLISECONDS_PER_TIME_STEP;
          const previousPhase = schedulePhaseAt(state.minuteOfDay);
          state.minuteOfDay = advanceGameMinute(state.minuteOfDay);
          if (schedulePhaseAt(state.minuteOfDay) !== previousPhase) {
            this.npcMotions.transitionTo(state.minuteOfDay, { day: state.day, weather: state.weather.current });
          }
          if (state.minuteOfDay === MIDNIGHT_MINUTE && state.lateWarningDay !== state.day) {
            state.lateWarningDay = state.day;
            feedback = { tone: "error", code: "late-night-warning", message: "已经午夜了，02:00 前记得回家休息。" };
          }
          if (state.minuteOfDay >= DAY_END_MINUTE) {
            this.beginDaySettlement(state, "passed-out", DAY_END_MINUTE);
            return { tone: "success", code: "day-saving", message: "已经 02:00，正在保存并送你回家。" };
          }
          this.publish();
          shouldSave = true;
        }
      }
    }
    if (shouldSave) this.queueSave();
    return feedback;
  }

  /** Routes one selected inventory item or empty hand to the catalog-owned target at impact time. */
  private useItemOnTarget(
    state: GameState,
    rawItemId: string,
    targetId: string,
    facing?: Facing,
  ): ActionFeedback | null {
    const itemId = rawItemId === "" ? "" : getItemDefinition(rawItemId)?.id;
    if (itemId === undefined) return null;
    if (itemId !== "" && this.inventory.quantity(state.inventory, itemId) < 1) return null;
    const resource = this.catalog.resource(targetId);
    if (resource && resource.kind !== "tree" && resource.kind !== "stone" && resource.kind !== "weed") {
      if (itemId !== "") return null;
      const result = this.forage.collect(state, targetId);
      if (result === "collected") this.commitCriticalChange();
      return forageFeedback(result);
    }
    if (resource?.kind === "tree") {
      const result = this.gathering.use(state, targetId, itemId);
      if (result === "success" || result === "stump-cleared") this.commitCriticalChange();
      return gatheringFeedback(result);
    }
    if (resource?.kind === "stone") {
      const result = this.mining.use(state, targetId, itemId);
      if (result === "mined") this.commitCriticalChange();
      return miningFeedback(result);
    }
    if (resource?.kind === "weed") {
      const result = this.weedCutting.use(state, targetId, itemId, facing);
      if (result.code === "cut") this.commitCriticalChange();
      return weedCuttingFeedback(result);
    }
    return null;
  }

  /** Returns a defensive state snapshot and never exposes the session-owned mutable object. */
  snapshot(): GameState {
    return cloneGameState(this.requireState());
  }

  /** Validates one nearby NPC, settles its request/talk rewards and records one dialogue selection. */
  private talkToNpc(state: GameState, npcId: string): NpcInteractionResult | null {
    const npc = this.npcMotions.activeByNpcId(npcId);
    if (
      !npc
      || npc.regionId !== state.player.regionId
      || Math.hypot(state.player.x - npc.x, state.player.y - npc.y) > NPC_INTERACTION_DISTANCE_PIXELS
    ) return null;
    const friendship = state.friendships[npcId];
    if (!friendship) throw new Error(`NPC friendship is missing: ${npcId}.`);
    const firstTalkToday = friendship.lastTalkedDay !== state.day;
    const submission = this.requests.submitForNpc(state, npcId);
    const talkResult = this.friendship.talk(state, npcId);
    if (talkResult === "missing-friendship") throw new Error(`NPC friendship is missing: ${npcId}.`);
    const selection = this.dialogue.select(state, npc, submission);
    return {
      kind: "npc-interaction",
      npcId,
      dialogueId: selection.dialogueId,
      baseDialogueId: selection.baseDialogueId,
      shopAvailable: npc.interactionType === "shop",
      wateringServiceAvailable: npcId === "town-blacksmith"
        && this.upgrades.wateringServiceAvailable(state, this.npcMotions.activeSpawns()),
      firstTalkToday,
      feedback: requestSubmissionFeedback(submission),
    };
  }

  /** Returns defensive runtime projections for every NPC without exposing transient motion state. */
  activeNpcSpawns(): readonly NpcRuntimeSpawn[] {
    return this.npcMotions.activeSpawns();
  }

  /** Returns defensive runtime NPC projections currently belonging to one region. */
  activeNpcSpawnsInRegion(regionId: string): readonly NpcRuntimeSpawn[] {
    return this.npcMotions.activeSpawnsInRegion(regionId);
  }

  /** Returns one current runtime NPC projection by stable npcId or null when unknown. */
  activeNpcById(npcId: string): NpcRuntimeSpawn | null {
    return this.npcMotions.activeByNpcId(npcId);
  }

  /** Returns active deterministic forage candidates in one region for the current saved day. */
  activeForageSpawnsInRegion(regionId: string): readonly ResourceSpawnDefinition[] {
    return this.forage.activeSpawns(this.requireState(), regionId);
  }

  /** Publishes current and future defensive snapshots and returns an explicit disposer. */
  subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    if (this.state) listener(cloneGameState(this.state));
    return () => this.listeners.delete(listener);
  }

  /** Flushes pending and dirty movement saves, surfacing the most recent persistence failure. */
  async flush(): Promise<void> {
    if (this.state && this.movementDirty && this.daySettlement.phase === "idle") {
      this.queueSave();
      this.movementDirty = false;
      this.lastMovementCheckpointAt = this.now();
    }
    await this.daySavePromise;
    await this.saveQueue;
    if (this.lastSaveError) {
      throw new Error("Local game save failed.", { cause: this.lastSaveError });
    }
  }

  /** Publishes a committed gameplay mutation, queues one durable snapshot and returns its completion. */
  private commitCriticalChange(): Promise<void> {
    this.movementDirty = false;
    this.lastMovementCheckpointAt = this.now();
    this.publish();
    return this.queueSave();
  }

  /** Serializes all repository writes and returns the queue tail for callers that need an input lock. */
  private queueSave(): Promise<void> {
    if (!this.state) return this.saveQueue;
    this.persistSnapshot(this.state);
    return this.saveQueue;
  }

  /** Serializes one supplied snapshot and returns its rejecting write while keeping the queue recoverable. */
  private persistSnapshot(state: GameState): Promise<void> {
    const stored = createStoredGame(state, this.now());
    const write = this.saveQueue.then(() => this.repository.save(this.ownerKey, this.slotId, stored));
    this.saveQueue = write.then(
      () => { this.lastSaveError = null; },
      (error: unknown) => { this.lastSaveError = error; },
    );
    return write;
  }

  /** Atomically settles one reviewed sleep request and moves the player to the Cottage safe spawn. */
  private sleep(state: GameState, bedId: string): SleepResult {
    if (this.daySettlement.phase !== "idle") return "already-saving";
    const bed = this.catalog.interaction(bedId);
    if (
      !bed
      || bed.kind !== "bed"
      || bed.regionId !== "cottage"
      || state.player.regionId !== bed.regionId
    ) {
      return "missing-bed";
    }
    const targetX = bed.x + bed.width / 2;
    const targetY = bed.y + bed.height / 2;
    if (Math.hypot(state.player.x - targetX, state.player.y - targetY) > SLEEP_INTERACTION_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (state.day >= Number.MAX_SAFE_INTEGER) return "day-limit";
    this.beginDaySettlement(state, "slept", state.minuteOfDay);
    return "day-saving";
  }

  /** Publishes current and future defensive fishing projections and returns an explicit disposer. */
  subscribeFishing(listener: FishingStateListener): () => void {
    this.fishingListeners.add(listener);
    listener({ ...this.fishing.snapshot(), saveStatus: this.fishingSaveStatus });
    return () => this.fishingListeners.delete(listener);
  }

  /** Builds an isolated overnight candidate so storage failure cannot alter the playable day's state. */
  private beginDaySettlement(current: GameState, reason: DayEndReason, sleepMinute: number): void {
    if (this.pendingDaySettlement || this.daySettlement.phase !== "idle") return;
    if (current.day >= Number.MAX_SAFE_INTEGER - 2) throw new Error("Game day has reached its safe integer limit.");
    const state = cloneGameState(current);
    const passedOutOutside = reason === "passed-out" && state.player.regionId !== "cottage";
    const goldLost = passedOutOutside ? Math.min(1_000, Math.floor(state.gold * 0.1)) : 0;
    state.gold -= goldLost;
    this.stamina.settleSleep(state, sleepMinute);
    this.friendship.settleDay(state);
    this.farming.settleDay(state);
    state.day += 1;
    this.dialogue.settleDay(state);
    this.gathering.settleDay(state);
    this.mining.settleDay(state);
    this.weedCutting.settleDay(state);
    this.weather.settleDay(state);
    state.dailyForage = { day: state.day, collectedIds: [] };
    this.requests.settleDay(state);
    if (state.weather.current === "rain") this.farming.applyRain(state);
    state.minuteOfDay = DAY_START_MINUTE;
    const safeSpawn = this.catalog.requireDefaultSpawn("cottage");
    state.player.regionId = "cottage";
    state.player.x = safeSpawn.x;
    state.player.y = safeSpawn.y;
    this.pendingDaySettlement = { state, reason, goldLost };
    this.movementDirty = false;
    this.resetFishing();
    this.publishFishing();
    this.persistPendingDay();
  }

  /** Saves the same overnight candidate on retry and publishes the new day only after a successful write. */
  private persistPendingDay(): void {
    const pending = this.pendingDaySettlement;
    if (!pending || this.daySettlement.phase === "saving") return;
    this.daySettlement = {
      phase: "saving", reason: pending.reason, goldLost: pending.goldLost, nextStamina: pending.state.stamina,
    };
    this.publishDaySettlement();
    this.daySavePromise = this.persistSnapshot(pending.state).then(() => {
      if (this.pendingDaySettlement !== pending) return;
      this.state = pending.state;
      this.pendingDaySettlement = null;
      this.daySettlement = { ...IDLE_DAY_SETTLEMENT };
      this.npcMotions.reset(pending.state.minuteOfDay, { day: pending.state.day, weather: pending.state.weather.current });
      this.resetClockBaseline(this.now());
      this.publish();
      this.publishDaySettlement();
      this.pendingFeedback = {
        tone: "success", code: pending.reason,
        message: pending.reason === "passed-out"
          ? `你在家中醒来，体力 ${pending.state.stamina}。${pending.goldLost ? `送回家花费 ${pending.goldLost}g。` : "没有扣钱。"}`
          : `新的一天开始了，体力恢复到 ${pending.state.stamina}。`,
      };
    }, () => {
      if (this.pendingDaySettlement !== pending) return;
      this.daySettlement = { ...this.daySettlement, phase: "failed" };
      this.publishDaySettlement();
      this.pendingFeedback = {
        tone: "error", code: "day-save-failed", message: "日结未能写入存档，日期和金币尚未改变。请重试保存。",
      };
    });
  }

  /** Subscribes one client to transient day-saving status without adding UI state to the save. */
  subscribeDaySettlement(listener: DaySettlementListener): () => void {
    this.daySettlementListeners.add(listener);
    listener({ ...this.daySettlement });
    return () => this.daySettlementListeners.delete(listener);
  }

  /** Publishes defensive day-saving status used to lock input and expose storage retry. */
  private publishDaySettlement(): void {
    for (const listener of this.daySettlementListeners) listener({ ...this.daySettlement });
  }

  /** Resets only wall-clock accumulation without changing the persisted game minute. */
  private resetClockBaseline(now: number): void {
    this.lastClockTickAt = Number.isFinite(now) ? now : null;
    this.clockAccumulatorMs = 0;
  }

  /** Sends isolated snapshots to every renderer and UI projection listener. */
  private publish(): void {
    if (!this.state) return;
    for (const listener of this.listeners) listener(cloneGameState(this.state));
  }

  /** Sends the current transient fishing projection without exposing its mutable runtime. */
  private publishFishing(): void {
    const snapshot = { ...this.fishing.snapshot(), saveStatus: this.fishingSaveStatus };
    const previous = this.lastFishingProjection;
    if (previous && Object.keys(snapshot).every((key) => (
      snapshot[key as keyof FishingSnapshot] === previous[key as keyof FishingSnapshot]
    ))) return;
    this.lastFishingProjection = snapshot;
    for (const listener of this.fishingListeners) listener({ ...snapshot });
  }

  /** Clears only transient fishing presentation and its save status; spent stamina is never refunded. */
  private resetFishing(): void {
    this.fishing.reset();
    this.fishingSaveStatus = "not-needed";
  }

  /** Saves the already-added catch and retries that snapshot without granting another fish or charging stamina. */
  private saveCaughtFish(): void {
    const state = this.requireState();
    if (this.fishingSaveStatus === "saving") return;
    this.fishingSaveStatus = "saving";
    this.movementDirty = false;
    this.lastMovementCheckpointAt = this.now();
    this.publish();
    this.publishFishing();
    void this.persistSnapshot(state).then(() => {
      if (this.state !== state || this.fishing.snapshot().phase !== "caught") return;
      this.fishingSaveStatus = "saved";
      this.publishFishing();
    }, () => {
      if (this.state !== state || this.fishing.snapshot().phase !== "caught") return;
      this.fishingSaveStatus = "failed";
      this.publishFishing();
    });
  }

  /** Returns initialized mutable state or fails fast when play has not begun. */
  private requireState(): GameState {
    if (!this.state) throw new Error("GameSession has not started a game.");
    return this.state;
  }
}

/** Derives one unsigned saved world seed from the opaque slot owner and injected creation clock. */
function worldSeedForNewGame(ownerKey: string, createdAt: number): number {
  const source = `${ownerKey}:${Math.max(0, Math.floor(createdAt))}`;
  let hash = 2166136261;
  for (const character of source) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return hash >>> 0;
}

/** Maps one seasonal forage collection result to fixed local feedback. */
function forageFeedback(result: ForageResult): ActionFeedback | null {
  switch (result) {
    case "collected": return { tone: "success", code: result, message: "收下了一份春季采集物。" };
    case "too-far": return { tone: "error", code: result, message: "再靠近一些才能采集。" };
    case "inventory-full": return { tone: "error", code: result, message: "背包已满。" };
    case "missing-forage": case "inactive": return null;
  }
}

/** Maps one gathering result to fixed local UI feedback. */
function gatheringFeedback(result: GatheringResult): ActionFeedback | null {
  switch (result) {
    case "no-effect": return null;
    case "success": return { tone: "success", code: result, message: "+3 异星木材" };
    case "stump-cleared": return { tone: "success", code: result, message: "清理了树桩，收下 1 份木材。农场外的树会在 7 天后再生。" };
    case "depleted": return { tone: "error", code: result, message: "这棵树已经被采集。" };
    case "too-far": return { tone: "error", code: result, message: "离目标太远。" };
    case "inventory-full": return { tone: "error", code: result, message: "背包已满。" };
    case "missing-target": return { tone: "error", code: result, message: "目标不存在。" };
    case "insufficient-stamina": return { tone: "error", code: result, message: "体力不足，先吃点东西或休息。" };
  }
}

/** Maps one crafting result to fixed local UI feedback. */
function craftingFeedback(result: CraftingResult): ActionFeedback {
  switch (result) {
    case "success": return { tone: "success", code: result, message: "木斧制作完成。" };
    case "requirements-not-met": return { tone: "error", code: result, message: "制作材料不足或背包已满。" };
    case "unknown-recipe": return { tone: "error", code: result, message: "未知配方。" };
  }
}

/** Maps one farming transition to fixed local UI feedback. */
function farmingFeedback(result: FarmingResult): ActionFeedback | null {
  /** Labels a successful farm transition with its domain result code. */
  const success = (message: string): ActionFeedback => ({ tone: "success", code: result, message });
  /** Labels a rejected farm transition without changing game state. */
  const error = (message: string): ActionFeedback => ({ tone: "error", code: result, message });
  switch (result) {
    case "no-effect": return null;
    case "tilled": return success("土地已经开垦。");
    case "planted": return success("种子已经播下。");
    case "watered": return success("土地已浇水，作物睡觉后会成长。");
    case "refilled": return success("水壶已经装满。");
    case "harvested": return success("成熟作物已经收入背包。");
    case "waiting": return error("今天已经浇过水了。");
    case "out-of-season": return error("这种作物不适合当前季节。");
    case "too-far": return error("离农田太远。");
    case "inventory-full": return error("背包已满。");
    case "missing-tile": return error("这里还没有开垦，或不在可耕区域。");
    case "insufficient-stamina": return error("体力不足，先吃点东西或休息。");
    case "empty-watering-can": return error("水壶空了，到水边补满再来。");
  }
}

/** Maps one surface-mining result to fixed local UI feedback. */
function miningFeedback(result: MiningResult): ActionFeedback | null {
  switch (result) {
    case "mined": return { tone: "success", code: result, message: "+1 石料" };
    case "wrong-tool": return { tone: "error", code: result, message: "先选中基础镐再采石。" };
    case "depleted": return { tone: "error", code: result, message: "这块石头已经清理了。" };
    case "too-far": return { tone: "error", code: result, message: "离石头太远。" };
    case "inventory-full": return { tone: "error", code: result, message: "背包已满。" };
    case "missing-target": return { tone: "error", code: result, message: "石块不存在。" };
    case "insufficient-stamina": return { tone: "error", code: result, message: "体力不足，先吃点东西或休息。" };
  }
}

/** Maps one atomic weed-cutting result to a fixed local message without exposing rule ownership to the client. */
function weedCuttingFeedback(result: WeedCuttingResult): ActionFeedback | null {
  switch (result.code) {
    case "cut": return {
      tone: "success",
      code: result.code,
      message: result.fiberCount > 0
        ? `割下 ${result.cutCount} 处杂草，+${result.fiberCount} 植物纤维。`
        : `割下 ${result.cutCount} 处杂草。`,
    };
    case "wrong-tool": return { tone: "error", code: result.code, message: "先选中基础镰刀再除草。" };
    case "wrong-direction": return { tone: "error", code: result.code, message: "面向杂草再挥动镰刀。" };
    case "depleted": return { tone: "error", code: result.code, message: "这处杂草已经清理了。" };
    case "too-far": return { tone: "error", code: result.code, message: "离杂草太远。" };
    case "inventory-full": return { tone: "error", code: result.code, message: "背包放不下本次植物纤维。" };
    case "missing-target": return { tone: "error", code: result.code, message: "杂草不存在。" };
  }
}

/** Maps one edible-item result into fixed stamina feedback. */
function eatingFeedback(result: EatResult, itemId: ItemId): ActionFeedback {
  const name = getItemDefinition(itemId)?.name ?? "物品";
  switch (result) {
    case "ate": return { tone: "success", code: result, message: `吃下了${name}，恢复了一些体力。` };
    case "not-edible": return { tone: "error", code: result, message: `${name}不能直接食用。` };
    case "missing-item": return { tone: "error", code: result, message: `背包里没有${name}。` };
    case "stamina-full": return { tone: "error", code: result, message: "现在体力充足，不需要进食。" };
  }
}

/** Maps one resident gift result without exposing preference point values to the client. */
function giftFeedback(result: GiftResult, itemId: ItemId): ActionFeedback {
  const name = getItemDefinition(itemId)?.name ?? "物品";
  if (result.kind === "given") {
    const message = result.preference === "liked"
      ? `对方很喜欢你送的${name}。`
      : result.preference === "disliked"
        ? `对方收下了${name}，但看起来并不喜欢。`
        : `对方收下了${name}。`;
    return { tone: "success", code: `gift-${result.preference}`, message };
  }
  switch (result.kind) {
    case "not-giftable": return { tone: "error", code: result.kind, message: "这件物品不适合作为礼物。" };
    case "missing-item": return { tone: "error", code: result.kind, message: "背包里已经没有这件礼物。" };
    case "missing-npc": return { tone: "error", code: result.kind, message: "对方现在不在这里。" };
    case "too-far": return { tone: "error", code: result.kind, message: "再靠近一些才能送礼。" };
    case "daily-limit": return { tone: "error", code: result.kind, message: "今天已经给这位居民送过礼物了。" };
    case "weekly-limit": return { tone: "error", code: result.kind, message: "这周已经给这位居民送过两份礼物了。" };
  }
}

/** Maps one fishing-start result into fixed local feedback. */
function startFishingFeedback(result: StartFishingResult): ActionFeedback | null {
  switch (result) {
    case "started": return null;
    case "not-ready": return { tone: "error", code: result, message: "Day 7 起可以向祥子学钓鱼，02:00 前记得收竿。" };
    case "already-fishing": return { tone: "error", code: result, message: "先收好这一竿。" };
    case "missing-rod": return { tone: "error", code: result, message: "需要带上竹制鱼竿。" };
    case "missing-zone": return { tone: "error", code: result, message: "这里不能抛竿。" };
    case "too-far": return { tone: "error", code: result, message: "走到码头边再抛竿。" };
    case "insufficient-stamina": return { tone: "error", code: result, message: "体力不足，无法继续钓鱼。" };
  }
}

/** Maps one terminal fishing tick into a compact result toast. */
function fishingTickFeedback(result: FishingTickResult): ActionFeedback {
  if (result?.kind === "caught") {
    return {
      tone: "success",
      code: result.kind,
      message: `钓到了${getItemDefinition(result.itemId)?.name ?? "一条鱼"}。`,
    };
  }
  if (result?.kind === "inventory-full") {
    return { tone: "error", code: result.kind, message: "背包已满，这条鱼只能放回湖里。" };
  }
  return { tone: "error", code: "escaped", message: "鱼挣脱了钓线。" };
}

/** Maps irreversible adoption outcomes without exposing pet mutation rules to Vue. */
function petAdoptionFeedback(result: PetAdoptionResult, petName: string): ActionFeedback {
  switch (result) {
    case "adopted": return { tone: "success", code: "pet-adopted", message: `${petName}来到家里了。` };
    case "not-ready": return { tone: "error", code: result, message: "等到 Day 2，再来迎接家园伙伴。" };
    case "already-adopted": return { tone: "error", code: result, message: "这个家已经有一位伙伴了。" };
    case "invalid-species": return { tone: "error", code: result, message: "只能在猫和狗之间选择。" };
    case "invalid-name": return { tone: "error", code: result, message: "名字需为 1～12 个字符，且不能含控制字符。" };
  }
}

/** Maps the once-per-day home interaction to one warm visible result while bond stays hidden. */
function petInteractionFeedback(result: PetInteractionResult, petName: string): ActionFeedback {
  switch (result) {
    case "petted": return { tone: "success", code: "pet-petted", message: `轻轻摸了摸${petName}，它开心地蹭了蹭你。` };
    case "already-petted": return { tone: "success", code: result, message: `${petName}今天已经被好好摸过了。` };
    case "missing-pet": return { tone: "error", code: result, message: "家里还没有可以抚摸的伙伴。" };
    case "pet-not-present": return { tone: "error", code: result, message: `${petName}这会儿不在这里。` };
  }
}

/** Maps one atomic sleep result to fixed local UI feedback. */
function sleepFeedback(result: SleepResult): ActionFeedback {
  switch (result) {
    case "day-saving": return { tone: "success", code: result, message: "正在保存这一天。" };
    case "missing-bed": return { tone: "error", code: result, message: "这里只能在自己的床上睡觉。" };
    case "too-far": return { tone: "error", code: result, message: "需要再靠近床一些。" };
    case "already-saving": return { tone: "error", code: result, message: "这一天正在结算，请稍候。" };
    case "day-limit": return { tone: "error", code: result, message: "日期已经达到存档上限。" };
  }
}

/** Maps one daily-request submission into a reward toast while non-target/missing states stay in dialogue. */
function requestSubmissionFeedback(submission: DailyRequestSubmission): ActionFeedback | null {
  if (submission.result !== "request-completed" || !submission.request) return null;
  return {
    tone: "success",
    code: submission.result,
    message: `完成了今日委托：+${submission.request.goldReward}g，关系更近了一步。`,
  };
}

/** Maps the fixed watering-can upgrade result without exposing prices or materials to the UI reducer. */
function wateringCanUpgradeFeedback(result: WateringCanUpgradeResult): ActionFeedback {
  switch (result) {
    case "upgraded-watering-can": return { tone: "success", code: result, message: "水壶已升级到 Lv2，一次最多浇三格。" };
    case "watering-upgrade-locked": return { tone: "error", code: result, message: "昊天会在 Day 3 介绍这项升级。" };
    case "watering-already-upgraded": return { tone: "error", code: result, message: "水壶已经是 Lv2。" };
    case "watering-upgrade-unavailable": return { tone: "error", code: result, message: "需要到昊天身边升级水壶。" };
    case "watering-upgrade-insufficient-gold": return { tone: "error", code: result, message: "升级需要 900g。" };
    case "watering-upgrade-insufficient-wood": return { tone: "error", code: result, message: "升级还需要 15 份木材。" };
  }
}

/** Maps the fixed backpack upgrade result without duplicating capacity mutation in Vue. */
function backpackUpgradeFeedback(result: BackpackUpgradeResult): ActionFeedback {
  switch (result) {
    case "upgraded-backpack": return { tone: "success", code: result, message: "背包已经扩充到 32 格。" };
    case "backpack-upgrade-locked": return { tone: "error", code: result, message: "华强会在 Day 5 带来扩容背包。" };
    case "backpack-already-upgraded": return { tone: "error", code: result, message: "背包已经扩充到 32 格。" };
    case "backpack-upgrade-unavailable": return { tone: "error", code: result, message: "需要到华强身边购买背包扩容。" };
    case "backpack-upgrade-insufficient-gold": return { tone: "error", code: result, message: "背包扩容需要 1500g。" };
  }
}

/** Maps one narrow first-week presentation acknowledgement to fixed local feedback. */
function firstWeekMilestoneFeedback(
  result: FirstWeekMilestoneResult,
  eventId: Parameters<typeof getFirstWeekMilestone>[0],
): ActionFeedback {
  switch (result) {
    case "milestone-acknowledged": return {
      tone: "success",
      code: result,
      message: getFirstWeekMilestone(eventId)?.message ?? "今天有了新的变化。",
    };
    case "milestone-already-seen": return { tone: "error", code: result, message: "这条今日提示已经看过了。" };
    case "milestone-not-yet-available": return { tone: "error", code: result, message: "这件事还没有发生。" };
    case "milestone-unsupported": return { tone: "error", code: result, message: "这不是首周提示事件。" };
  }
}

/** Maps one fixed seed purchase result to local UI feedback without exposing pricing logic to Vue. */
function buyFeedback(result: BuyResult, itemId: string): ActionFeedback {
  const itemName = getItemDefinition(itemId)?.name ?? "种子";
  switch (result) {
    case "bought": return { tone: "success", code: result, message: `购买了 1 份${itemName}。` };
    case "not-at-shop": return { tone: "error", code: result, message: "需要在种子店老板旁交易。" };
    case "unavailable-item": return { tone: "error", code: result, message: "当前季节不出售这个物品。" };
    case "insufficient-gold": return { tone: "error", code: result, message: "金币不足。" };
    case "inventory-full": return { tone: "error", code: result, message: "背包已满。" };
  }
}

/** Maps one fixed turnip sale result to local UI feedback without exposing pricing logic to Vue. */
function sellFeedback(result: SellResult, itemId: string): ActionFeedback {
  const itemName = getItemDefinition(itemId)?.name ?? "物品";
  switch (result) {
    case "sold": return { tone: "success", code: result, message: `出售了 1 个${itemName}。` };
    case "not-at-shop": return { tone: "error", code: result, message: "需要在种子店老板旁交易。" };
    case "unavailable-item": return { tone: "error", code: result, message: "这个物品不能在这里出售。" };
    case "missing-item": return { tone: "error", code: result, message: `背包里没有${itemName}。` };
    case "gold-limit": return { tone: "error", code: result, message: "金币已经达到存档上限。" };
  }
}
