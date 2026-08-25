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
import { movePlayer } from "../world/movement.ts";
import type { WorldCatalog } from "../world/regions.ts";
import type { ActionFeedback, GameCommand } from "./commands.ts";

const MOVEMENT_CHECKPOINT_INTERVAL_MS = 500;

export type GameStateListener = (state: GameState) => void;

export class GameSession {
  private readonly inventory = new InventorySystem();
  private readonly gathering: GatheringSystem;
  private readonly crafting = new CraftingSystem(this.inventory);
  private readonly farming: FarmingSystem;
  private readonly listeners = new Set<GameStateListener>();
  private state: GameState | null = null;
  private movementDirty = false;
  private lastMovementCheckpointAt = 0;
  private saveQueue: Promise<void> = Promise.resolve();
  private lastSaveError: unknown = null;

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
    this.movementDirty = false;
    this.lastMovementCheckpointAt = this.now();
    this.publish();
    return cloneGameState(state);
  }

  /** Loads and validates the current slot, including crop progress elapsed while the page was closed. */
  async continueGame(): Promise<GameState> {
    await this.flush();
    const stored = await this.repository.load(this.ownerKey, this.slotId);
    if (!stored) throw new Error("No local save exists for this account.");
    this.state = stored.state;
    reconcileGameStateWithCatalog(this.state, this.catalog);
    this.lastSaveError = null;
    this.movementDirty = false;
    this.lastMovementCheckpointAt = this.now();
    this.farming.tick(this.state, this.now());
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
        const result = this.farming.primary(state, command.tileId, this.now());
        if (["tilled", "planted", "watered", "harvested"].includes(result)) {
          this.commitCriticalChange();
        }
        return farmingFeedback(result);
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

  /** Advances time-based rules and periodically checkpoints movement without saving every frame. */
  tick(now = this.now()): void {
    const state = this.requireState();
    if (this.farming.tick(state, now)) this.commitCriticalChange();
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

  /** Publishes a committed gameplay mutation and queues a durable snapshot immediately. */
  private commitCriticalChange(): void {
    this.publish();
    this.queueSave();
  }

  /** Serializes all repository writes so an older asynchronous snapshot cannot overwrite a newer one. */
  private queueSave(): void {
    if (!this.state) return;
    const stored = createStoredGame(this.state, this.now());
    this.saveQueue = this.saveQueue.then(
      () => this.repository.save(this.ownerKey, this.slotId, stored),
      () => this.repository.save(this.ownerKey, this.slotId, stored),
    ).then(
      () => { this.lastSaveError = null; },
      (error: unknown) => { this.lastSaveError = error; },
    );
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
    case "planted": return success("荧光种子已经播下。");
    case "watered": return success("作物已经浇水，正在生长。");
    case "harvested": return success("收获了一个荧光果。");
    case "waiting": return error("作物还在生长。");
    case "too-far": return error("离农田太远。");
    case "missing-tool": return error("缺少所需工具。");
    case "missing-seed": return error("没有可用种子。");
    case "inventory-full": return error("背包已满。");
    case "missing-tile": return error("农田不存在。");
  }
}
