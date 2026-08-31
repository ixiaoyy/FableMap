import { ITEM_ID } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";
import type { NpcSpawnDefinition } from "../world/regions.ts";

const SEED_KEEPER_NPC_ID = "seed-keeper";
export const TURNIP_SEED_BUY_PRICE = 20;
export const TURNIP_SELL_PRICE = 35;
const SHOP_INTERACTION_DISTANCE_PIXELS = 42;

export type BuyResult =
  | "bought"
  | "not-at-shop"
  | "insufficient-gold"
  | "inventory-full";

export type SellResult =
  | "sold"
  | "not-at-shop"
  | "missing-item"
  | "gold-limit";

export class ShopSystem {
  /** Creates the fixed one-item seed shop over the existing inventory owner. */
  constructor(
    private readonly inventory: InventorySystem,
  ) {}

  /** Atomically buys one turnip seed for 20g when the player is beside the Seed Keeper. */
  buyTurnipSeed(state: GameState, activeNpcs: readonly NpcSpawnDefinition[]): BuyResult {
    if (!this.isPlayerAtSeedKeeper(state, activeNpcs)) return "not-at-shop";
    if (state.gold < TURNIP_SEED_BUY_PRICE) return "insufficient-gold";
    if (!this.inventory.canAdd(state.inventory, ITEM_ID.turnipSeed, 1)) return "inventory-full";
    const inventoryBefore = state.inventory.map((slot) => ({ ...slot }));
    const goldBefore = state.gold;
    state.gold -= TURNIP_SEED_BUY_PRICE;
    if (!this.inventory.add(state.inventory, ITEM_ID.turnipSeed, 1)) {
      state.gold = goldBefore;
      this.inventory.restore(state.inventory, inventoryBefore);
      throw new Error("Validated seed purchase could not commit atomically.");
    }
    return "bought";
  }

  /** Atomically sells one harvested turnip for 35g when the player is beside the Seed Keeper. */
  sellTurnip(state: GameState, activeNpcs: readonly NpcSpawnDefinition[]): SellResult {
    if (!this.isPlayerAtSeedKeeper(state, activeNpcs)) return "not-at-shop";
    if (this.inventory.quantity(state.inventory, ITEM_ID.turnip) < 1) return "missing-item";
    if (!Number.isSafeInteger(state.gold + TURNIP_SELL_PRICE)) return "gold-limit";
    if (!this.inventory.consume(state.inventory, ITEM_ID.turnip, 1)) {
      throw new Error("Validated turnip sale could not commit atomically.");
    }
    state.gold += TURNIP_SELL_PRICE;
    return "sold";
  }

  /** Reports whether the player is in the Seed Keeper's region and within the reviewed range. */
  private isPlayerAtSeedKeeper(
    state: GameState,
    activeNpcs: readonly NpcSpawnDefinition[],
  ): boolean {
    const keeper = activeNpcs.find((npc) => npc.npcId === SEED_KEEPER_NPC_ID) ?? null;
    return Boolean(
      keeper
      && keeper.interactionType === "shop"
      && state.player.regionId === keeper.regionId
      && Math.hypot(state.player.x - keeper.x, state.player.y - keeper.y)
        <= SHOP_INTERACTION_DISTANCE_PIXELS,
    );
  }
}
