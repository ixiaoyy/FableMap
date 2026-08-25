import { CraftingSystem, type CraftingResult } from "../crafting/CraftingSystem.ts";
import { FarmingSystem, type FarmingResult } from "../farming/FarmingSystem.ts";
import { GatheringSystem, type GatheringResult } from "../gathering/GatheringSystem.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
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
import { movePlayer } from "../world/movement.ts";
import type { WorldCatalog } from "../world/regions.ts";
import type { ActionFeedback, GameCommand } from "./commands.ts";

const MOVEMENT_CHECKPOINT_INTERVAL_MS = 500;
const SLEEP_INTERACTION_DISTANCE_PIXELS = 42;

type SleepResult = "slept" | "missing-bed" | "too-far" | "already-saving" | "day-limit";

export type GameStateListener = (state: GameState) => void;

export class GameSession {
  private readonly inventory = new InventorySystem();
  private readonly gathering: GatheringSystem;
  private readonly crafting = new CraftingSystem(this.inventory);
  private readonly farming: FarmingSystem;
  private readonly shop: ShopSystem;
  private readonly listeners = new Set<GameStateListener>();
  private state: GameState | null = null;
  private movementDirty = false;
  private lastMovementCheckpointAt = 0;
  private saveQueue: Promise<void> = Promise.resolve();
  private lastSaveError: unknown = null;
  private sleepPending = false;

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
    this.farming = new FarmingSystem(this.inventory, catalog);
    this.shop = new ShopSystem(this.inventory, catalog);
  }

  /** Reports whether this authenticated browser profile has a valid local save record. */
  async hasSave(): Promise<boolean> {
    return this.repository.has(this.ownerKey, this.slotId);
  }

  /** Replaces the current slot with a deterministic starter world and persists it before play begins. */
  async newGame(): Promise<GameState> {
    await this.flush();
    const state = createInitialGameState(this.catalog);
    await this.repository.save(this.ownerKey, this.slotId, createStoredGame(state, this.now()));
    this.state = state;
    this.lastSaveError = null;
    this.sleepPending = false;
    this.movementDirty = false;
    this.lastMovementCheckpointAt = this.now();
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
    this.lastSaveError = null;
    this.sleepPending = false;
    this.movementDirty = false;
    this.lastMovementCheckpointAt = this.now();
    this.queueSave();
    this.publish();
    return this.snapshot();
  }

  /** Applies one typed local intent and returns fixed feedback for visible player actions. */
  dispatch(command: GameCommand): ActionFeedback | null {
    const state = this.requireState();
    switch (command.type) {
      case "move": {
        if (movePlayer(state, this.catalog, command.xAxis, command.yAxis, command.deltaMs)) {
          this.movementDirty = true;
          this.publish();
        }
        return null;
      }
      case "gather": {
        const result = this.gathering.gather(state, command.targetId);
        if (result === "success") this.commitCriticalChange();
        return gatheringFeedback(result);
      }
      case "craft": {
        const result = this.crafting.craft(state, command.recipeId);
        if (result === "success") this.commitCriticalChange();
        return craftingFeedback(result);
      }
      case "farm-primary": {
        const result = this.farming.primary(state, command.tileId);
        if (["tilled", "planted", "watered", "harvested"].includes(result)) {
          this.commitCriticalChange();
        }
        return farmingFeedback(result);
      }
      case "sleep": {
        const result = this.sleep(state, command.bedId);
        if (result === "slept") {
          this.sleepPending = true;
          void this.commitCriticalChange().finally(() => { this.sleepPending = false; });
        }
        return sleepFeedback(result);
      }
      case "buy-item": {
        const result = this.shop.buyTurnipSeed(state);
        if (result === "bought") this.commitCriticalChange();
        return buyFeedback(result);
      }
      case "sell-item": {
        const result = this.shop.sellTurnip(state);
        if (result === "sold") this.commitCriticalChange();
        return sellFeedback(result);
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

  /** Periodically checkpoints movement without advancing any day-owned gameplay rule. */
  tick(now = this.now()): void {
    this.requireState();
    if (this.movementDirty && now - this.lastMovementCheckpointAt >= MOVEMENT_CHECKPOINT_INTERVAL_MS) {
      this.queueSave();
      this.movementDirty = false;
      this.lastMovementCheckpointAt = now;
    }
  }

  /** Returns a defensive state snapshot and never exposes the session-owned mutable object. */
  snapshot(): GameState {
    return cloneGameState(this.requireState());
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
    this.farming.settleDay(state);
    state.day += 1;
    state.player.regionId = "cottage";
    state.player.x = safeSpawn.x;
    state.player.y = safeSpawn.y;
    return "slept";
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

/** Maps one gathering result to fixed local UI feedback. */
function gatheringFeedback(result: GatheringResult): ActionFeedback {
  switch (result) {
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
function farmingFeedback(result: FarmingResult): ActionFeedback {
  const success = (message: string): ActionFeedback => ({ tone: "success", code: result, message });
  const error = (message: string): ActionFeedback => ({ tone: "error", code: result, message });
  switch (result) {
    case "tilled": return success("土地已经开垦。");
    case "planted": return success("萝卜种子已经播下。");
    case "watered": return success("作物已浇水，睡觉后会成长。");
    case "harvested": return success("收获了一个萝卜。");
    case "waiting": return error("今天已经浇过水了。");
    case "too-far": return error("离农田太远。");
    case "missing-tool": return error("缺少所需工具。");
    case "missing-seed": return error("没有可用种子。");
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

/** Maps one fixed seed purchase result to local UI feedback without exposing pricing logic to Vue. */
function buyFeedback(result: BuyResult): ActionFeedback {
  switch (result) {
    case "bought": return { tone: "success", code: result, message: "购买了 1 粒萝卜种子。" };
    case "not-at-shop": return { tone: "error", code: result, message: "需要在种子店老板旁交易。" };
    case "insufficient-gold": return { tone: "error", code: result, message: "金币不足。" };
    case "inventory-full": return { tone: "error", code: result, message: "背包已满。" };
  }
}

/** Maps one fixed turnip sale result to local UI feedback without exposing pricing logic to Vue. */
function sellFeedback(result: SellResult): ActionFeedback {
  switch (result) {
    case "sold": return { tone: "success", code: result, message: "出售了 1 个萝卜。" };
    case "not-at-shop": return { tone: "error", code: result, message: "需要在种子店老板旁交易。" };
    case "missing-item": return { tone: "error", code: result, message: "背包里没有可出售的萝卜。" };
    case "gold-limit": return { tone: "error", code: result, message: "金币已经达到存档上限。" };
  }
}
