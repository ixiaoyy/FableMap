import { playableCalendarAt } from "../calendar/game-calendar.ts";
import { cropForSeed, sellPriceForItem } from "../farming/crops.ts";
import { type ItemId } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";
import type { NpcSpawnDefinition } from "../world/regions.ts";

const SEED_KEEPER_NPC_ID = "seed-keeper";
const SHOP_INTERACTION_DISTANCE_PIXELS = 42;

export type BuyResult = "bought" | "not-at-shop" | "unavailable-item" | "insufficient-gold" | "inventory-full";
export type SellResult = "sold" | "not-at-shop" | "unavailable-item" | "missing-item" | "gold-limit";

export class ShopSystem {
  /** Creates the seasonal seed shop over the existing atomic inventory owner. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Atomically buys one in-season seed when the player is beside the active Seed Keeper. */
  buySeed(state: GameState, activeNpcs: readonly NpcSpawnDefinition[], itemId: ItemId): BuyResult {
    if (!this.isPlayerAtSeedKeeper(state, activeNpcs)) return "not-at-shop";
    const crop = cropForSeed(itemId);
    if (!crop || !crop.seasons.includes(playableCalendarAt(state.day).season)) return "unavailable-item";
    if (state.gold < crop.seedPrice) return "insufficient-gold";
    if (!this.inventory.canAdd(state.inventory, itemId, 1)) return "inventory-full";
    const inventoryBefore = state.inventory.map((slot) => ({ ...slot }));
    const goldBefore = state.gold;
    state.gold -= crop.seedPrice;
    if (!this.inventory.add(state.inventory, itemId, 1)) {
      state.gold = goldBefore;
      this.inventory.restore(state.inventory, inventoryBefore);
      throw new Error("Validated seed purchase could not commit atomically.");
    }
    return "bought";
  }

  /** Atomically sells one registered crop or forage item beside the active Seed Keeper. */
  sellItem(state: GameState, activeNpcs: readonly NpcSpawnDefinition[], itemId: ItemId): SellResult {
    if (!this.isPlayerAtSeedKeeper(state, activeNpcs)) return "not-at-shop";
    const price = sellPriceForItem(itemId);
    if (price === null) return "unavailable-item";
    if (this.inventory.quantity(state.inventory, itemId) < 1) return "missing-item";
    if (!Number.isSafeInteger(state.gold + price)) return "gold-limit";
    if (!this.inventory.consume(state.inventory, itemId, 1)) throw new Error("Validated item sale could not commit atomically.");
    state.gold += price;
    return "sold";
  }

  /** Reports whether the player is in the Seed Keeper's region and within the reviewed range. */
  private isPlayerAtSeedKeeper(state: GameState, activeNpcs: readonly NpcSpawnDefinition[]): boolean {
    const keeper = activeNpcs.find((npc) => npc.npcId === SEED_KEEPER_NPC_ID) ?? null;
    return Boolean(keeper && keeper.interactionType === "shop" && state.player.regionId === keeper.regionId
      && Math.hypot(state.player.x - keeper.x, state.player.y - keeper.y) <= SHOP_INTERACTION_DISTANCE_PIXELS);
  }
}
