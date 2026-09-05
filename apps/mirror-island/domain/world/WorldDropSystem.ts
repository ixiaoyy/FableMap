import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState, InventorySlot } from "../state/game-state.ts";
import { allocateWorldEntityId, type WorldDropState } from "./world-object-state.ts";

export type WorldDropResult = "collected" | "missing-drop" | "too-far" | "inventory-full";

export class WorldDropSystem {
  /** Uses the shared inventory owner so a drop disappears only after its complete stack can be received. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Creates persistent stack drops at the destroyed chest origin; callers remove the chest in the same candidate. */
  create(state: GameState, regionId: string, originX: number, originY: number, slots: readonly InventorySlot[]): readonly WorldDropState[] {
    const stacks = slots.filter((slot) => slot.itemId !== "" && slot.quantity > 0);
    if (state.nextWorldEntitySequence + stacks.length >= Number.MAX_SAFE_INTEGER) throw new Error("World entity sequence is exhausted.");
    const drops = stacks.map((stack): WorldDropState => ({ id: allocateWorldEntityId(state), regionId, originX, originY, stack: { ...stack } }));
    state.worldDrops.push(...drops);
    return drops;
  }

  /** Collects a nearby drop atomically; full inventory and repeated stale intents leave durable drops intact. */
  collect(state: GameState, id: string): WorldDropResult {
    const index = state.worldDrops.findIndex((drop) => drop.id === id);
    const drop = state.worldDrops[index];
    if (!drop || drop.regionId !== state.player.regionId || !drop.stack.itemId) return "missing-drop";
    if (Math.hypot(state.player.x - drop.originX, state.player.y - drop.originY) > 48) return "too-far";
    if (!this.inventory.add(state.inventory, drop.stack.itemId, drop.stack.quantity)) return "inventory-full";
    state.worldDrops.splice(index, 1);
    return "collected";
  }
}
