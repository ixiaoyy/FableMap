import { getItemDefinition, type ItemId } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";
import { MAX_STAMINA, staminaAfterSleep } from "./definitions.ts";

export type EatResult = "ate" | "not-edible" | "missing-item" | "stamina-full";

export class StaminaSystem {
  /** Creates the Spring-v1 stamina owner over the shared atomic inventory service. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Reports whether the player can pay one positive integer action cost. */
  canSpend(state: GameState, cost: number): boolean {
    return Number.isSafeInteger(cost) && cost > 0 && state.stamina >= cost;
  }

  /** Deducts one prevalidated action cost and returns false without mutation when unaffordable. */
  spend(state: GameState, cost: number): boolean {
    if (!this.canSpend(state, cost)) return false;
    state.stamina -= cost;
    return true;
  }

  /** Consumes one edible inventory item and restores its reviewed stamina value atomically. */
  eat(state: GameState, itemId: ItemId): EatResult {
    const definition = getItemDefinition(itemId);
    if (!definition?.staminaRestore) return "not-edible";
    if (state.stamina >= MAX_STAMINA) return "stamina-full";
    if (this.inventory.quantity(state.inventory, itemId) < 1) return "missing-item";
    if (!this.inventory.consume(state.inventory, itemId, 1)) {
      throw new Error("Validated food could not be consumed atomically.");
    }
    state.stamina = Math.min(MAX_STAMINA, state.stamina + definition.staminaRestore);
    return "ate";
  }

  /** Replaces current stamina with the deterministic next-morning value for one bedtime. */
  settleSleep(state: GameState, minuteOfDay: number): void {
    state.stamina = staminaAfterSleep(minuteOfDay);
  }
}
