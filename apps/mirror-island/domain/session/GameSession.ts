import { CraftingSystem, type CraftingResult } from "../crafting/CraftingSystem.ts";
import { FarmingSystem, type FarmingResult } from "../farming/FarmingSystem.ts";
import { GatheringSystem, type GatheringResult } from "../gathering/GatheringSystem.ts";
import { ForageSystem, type ForageResult } from "../gathering/ForageSystem.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import { getItemDefinition } from "../items/definitions.ts";
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
import type {
  ActionFeedback,
  GameCommand,
  GameCommandResult,
  NpcInteractionResult,
} from "./commands.ts";

const MOVEMENT_CHECKPOINT_INTERVAL_MS = 500;
const SLEEP_INTERACTION_DISTANCE_PIXELS = 42;
const NPC_INTERACTION_DISTANCE_PIXELS = 42;

type SleepResult = "slept" | "missing-bed" | "too-far" | "already-saving" | "day-limit";
type NpcInteractionCommand = Extract<GameCommand, { readonly type: "talk-to-npc" }>;
type NonNpcGameCommand = Exclude<GameCommand, NpcInteractionCommand>;

export type GameStateListener = (state: GameState) => void;

export class GameSession {
  private readonly inventory = new InventorySystem();
  private readonly gathering: GatheringSystem;
  private readonly forage: ForageSystem;
  private readonly crafting = new CraftingSystem(this.inventory);
  private readonly farming: FarmingSystem;
  private readonly shop: ShopSystem;
  private readonly friendship = new FriendshipSystem();
  private readonly requests = new DailyRequestSystem(this.inventory, this.friendship);
  private readonly dialogue = new NpcDialogueSystem();
  private readonly firstWeekMilestones = new FirstWeekMilestoneSystem();
  private readonly upgrades = new UpgradeSystem(this.inventory);
  private readonly npcMotions: NpcMotionRuntime;
  private readonly listeners = new Set<GameStateListener>();
  private state: GameState | null = null;
  private movementDirty = false;
  private lastMovementCheckpointAt = 0;
  private saveQueue: Promise<void> = Promise.resolve();
  private lastSaveError: unknown = null;
  private sleepPending = false;
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
    this.gathering = new GatheringSystem(this.inventory, catalog);
    this.forage = new ForageSystem(this.inventory, catalog);
    this.farming = new FarmingSystem(this.inventory, catalog);
    this.shop = new ShopSystem(this.inventory);
    this.npcMotions = new NpcMotionRuntime(catalog);
  }

  /** Reports whether this authenticated browser profile has a valid local save record. */
  async hasSave(): Promise<boolean> {
    return this.repository.has(this.ownerKey, this.slotId);
  }

  /** Replaces the current slot with one chosen appearance and persists it before play begins. */
  async newGame(
    appearanceId: PlayerAppearanceId = DEFAULT_PLAYER_APPEARANCE_ID,
  ): Promise<GameState> {
    await this.flush();
    const state = createInitialGameState(this.catalog, appearanceId);
    await this.repository.save(this.ownerKey, this.slotId, createStoredGame(state, this.now()));
    this.state = state;
    this.npcMotions.reset(state.minuteOfDay);
    this.lastSaveError = null;
    this.sleepPending = false;
    this.movementDirty = false;
    const currentNow = this.now();
    this.lastMovementCheckpointAt = currentNow;
    this.resetClockBaseline(currentNow);
    this.publish();
    return cloneGameState(state);
  }

  /** Loads, validates and reconciles the current slot without advancing day-owned crop progress. */
  async continueGame(): Promise<GameState> {
    await this.flush();
    const stored = await this.repository.load(this.ownerKey, this.slotId);
    if (!stored) throw new Error("No local save exists for this account.");
    this.state = stored.state;
    reconcileGameStateWithCatalog(this.state, this.catalog);
    this.npcMotions.reset(this.state.minuteOfDay);
    this.lastSaveError = null;
    this.sleepPending = false;
    this.movementDirty = false;
    const currentNow = this.now();
    this.lastMovementCheckpointAt = currentNow;
    this.resetClockBaseline(currentNow);
    this.queueSave();
    this.publish();
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
      case "craft": {
        const result = this.crafting.craft(state, command.recipeId);
        if (result === "success") this.commitCriticalChange();
        return craftingFeedback(result);
      }
      case "sleep": {
        const result = this.sleep(state, command.bedId);
        if (result === "slept") {
          this.sleepPending = true;
          void this.commitCriticalChange().finally(() => { this.sleepPending = false; });
        }
        return sleepFeedback(result);
      }
      case "talk-to-npc": {
        const result = this.talkToNpc(state, command.npcId);
        if (result) this.commitCriticalChange();
        return result;
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
        this.commitCriticalChange();
        return null;
      }
    }
  }

  /** Advances bounded movement saves and the pause-aware ten-minute local game clock. */
  tick(now = this.now(), paused = false): void {
    const state = this.requireState();
    if (!Number.isFinite(now)) return;
    let shouldSave = false;
    if (this.movementDirty && now - this.lastMovementCheckpointAt >= MOVEMENT_CHECKPOINT_INTERVAL_MS) {
      this.movementDirty = false;
      this.lastMovementCheckpointAt = now;
      shouldSave = true;
    }
    const previousClockTick = this.lastClockTickAt;
    this.lastClockTickAt = now;
    if (!paused && previousClockTick !== null) {
      const elapsed = Math.max(0, Math.min(now - previousClockTick, MAX_CLOCK_TICK_DELTA_MS));
      this.npcMotions.advance(elapsed, state.player);
      if (state.minuteOfDay < DAY_END_MINUTE) {
        this.clockAccumulatorMs += elapsed;
        if (this.clockAccumulatorMs >= REAL_MILLISECONDS_PER_TIME_STEP) {
          this.clockAccumulatorMs -= REAL_MILLISECONDS_PER_TIME_STEP;
          const previousPhase = schedulePhaseAt(state.minuteOfDay);
          state.minuteOfDay = advanceGameMinute(state.minuteOfDay);
          if (schedulePhaseAt(state.minuteOfDay) !== previousPhase) {
            this.npcMotions.transitionTo(state.minuteOfDay);
          }
          this.publish();
          shouldSave = true;
        }
      }
    }
    if (shouldSave) this.queueSave();
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
    if (resource && resource.kind !== "tree" && resource.kind !== "stone") {
      if (itemId !== "") return null;
      const result = this.forage.collect(state, targetId);
      if (result === "collected") this.commitCriticalChange();
      return forageFeedback(result);
    }
    if (resource?.kind === "tree") {
      const result = this.gathering.use(state, targetId, itemId);
      if (result === "success") this.commitCriticalChange();
      return gatheringFeedback(result);
    }
    const interaction = this.catalog.interaction(targetId);
    if (interaction?.kind === "farm-plot") {
      const result = this.farming.use(state, targetId, itemId, facing);
      if (["tilled", "planted", "watered", "harvested"].includes(result)) {
        this.commitCriticalChange();
      }
      return farmingFeedback(result);
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
    if (this.state && this.movementDirty) {
      this.queueSave();
      this.movementDirty = false;
      this.lastMovementCheckpointAt = this.now();
    }
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
    const stored = createStoredGame(this.state, this.now());
    this.saveQueue = this.saveQueue.then(
      () => this.repository.save(this.ownerKey, this.slotId, stored),
      () => this.repository.save(this.ownerKey, this.slotId, stored),
    ).then(
      () => { this.lastSaveError = null; },
      (error: unknown) => { this.lastSaveError = error; },
    );
    return this.saveQueue;
  }

  /** Atomically settles one reviewed sleep request and moves the player to the Cottage safe spawn. */
  private sleep(state: GameState, bedId: string): SleepResult {
    if (this.sleepPending) return "already-saving";
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
    const safeSpawn = this.catalog.requireDefaultSpawn("cottage");
    this.friendship.settleDay(state);
    this.farming.settleDay(state);
    state.day += 1;
    state.dailyForage = { day: state.day, collectedIds: [] };
    this.requests.settleDay(state);
    state.minuteOfDay = DAY_START_MINUTE;
    state.player.regionId = "cottage";
    state.player.x = safeSpawn.x;
    state.player.y = safeSpawn.y;
    this.npcMotions.reset(state.minuteOfDay);
    this.resetClockBaseline(this.now());
    return "slept";
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

  /** Returns initialized mutable state or fails fast when play has not begun. */
  private requireState(): GameState {
    if (!this.state) throw new Error("GameSession has not started a game.");
    return this.state;
  }
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
    case "depleted": return { tone: "error", code: result, message: "这棵树已经被采集。" };
    case "too-far": return { tone: "error", code: result, message: "离目标太远。" };
    case "inventory-full": return { tone: "error", code: result, message: "背包已满。" };
    case "missing-target": return { tone: "error", code: result, message: "目标不存在。" };
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
  const success = (message: string): ActionFeedback => ({ tone: "success", code: result, message });
  const error = (message: string): ActionFeedback => ({ tone: "error", code: result, message });
  switch (result) {
    case "no-effect": return null;
    case "tilled": return success("土地已经开垦。");
    case "planted": return success("种子已经播下。");
    case "watered": return success("作物已浇水，睡觉后会成长。");
    case "harvested": return success("收获了一份成熟作物。");
    case "waiting": return error("今天已经浇过水了。");
    case "out-of-season": return error("这种作物不适合当前季节。");
    case "too-far": return error("离农田太远。");
    case "inventory-full": return error("背包已满。");
    case "missing-tile": return error("农田不存在。");
  }
}

/** Maps one atomic sleep result to fixed local UI feedback. */
function sleepFeedback(result: SleepResult): ActionFeedback {
  switch (result) {
    case "slept": return { tone: "success", code: result, message: "新的一天开始了。" };
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
