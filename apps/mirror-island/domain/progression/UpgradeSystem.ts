import { ITEM_ID } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";
import type { NpcSpawnDefinition } from "../world/regions.ts";
import { schedulePhaseAt } from "../time/game-time.ts";
import {
  BACKPACK_UPGRADE_DAY,
  BACKPACK_UPGRADE_GOLD,
  BASE_INVENTORY_CAPACITY,
  EXPANDED_INVENTORY_CAPACITY,
  WATERING_CAN_MAX_LEVEL,
  WATERING_CAN_UPGRADE_DAY,
  WATERING_CAN_UPGRADE_GOLD,
  WATERING_CAN_UPGRADE_WOOD,
  wateringCanCapacity,
} from "./definitions.ts";

const UPGRADE_INTERACTION_DISTANCE_PIXELS = 42;

export type WateringCanUpgradeResult =
  | "upgraded-watering-can"
  | "watering-upgrade-locked"
  | "watering-already-upgraded"
  | "watering-upgrade-unavailable"
  | "watering-upgrade-insufficient-gold"
  | "watering-upgrade-insufficient-wood";

export type BackpackUpgradeResult =
  | "upgraded-backpack"
  | "backpack-upgrade-locked"
  | "backpack-already-upgraded"
  | "backpack-upgrade-unavailable"
  | "backpack-upgrade-insufficient-gold";

export class UpgradeSystem {
  /** Creates the two reviewed long-term upgrades over the existing inventory owner. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Atomically upgrades the nearby blacksmith-serviced watering can for 900g and 15 wood. */
  upgradeWateringCan(state: GameState, activeNpcs: readonly NpcSpawnDefinition[]): WateringCanUpgradeResult {
    if (state.day < WATERING_CAN_UPGRADE_DAY) return "watering-upgrade-locked";
    if (state.wateringCanLevel >= WATERING_CAN_MAX_LEVEL) return "watering-already-upgraded";
    if (!this.wateringServiceAvailable(state, activeNpcs)) {
      return "watering-upgrade-unavailable";
    }
    if (state.gold < WATERING_CAN_UPGRADE_GOLD) return "watering-upgrade-insufficient-gold";
    if (this.inventory.quantity(state.inventory, ITEM_ID.wood) < WATERING_CAN_UPGRADE_WOOD) {
      return "watering-upgrade-insufficient-wood";
    }
    const inventoryBefore = state.inventory.map((slot) => ({ ...slot }));
    const goldBefore = state.gold;
    state.gold -= WATERING_CAN_UPGRADE_GOLD;
    if (!this.inventory.consume(state.inventory, ITEM_ID.wood, WATERING_CAN_UPGRADE_WOOD)) {
      state.gold = goldBefore;
      this.inventory.restore(state.inventory, inventoryBefore);
      throw new Error("Validated watering-can upgrade could not consume materials atomically.");
    }
    state.wateringCanLevel = WATERING_CAN_MAX_LEVEL;
    state.wateringCanWater = wateringCanCapacity(state.wateringCanLevel);
    return "upgraded-watering-can";
  }

  /** Reports whether the nearby blacksmith is currently on duty; rain moves service indoors, rest closes it. */
  wateringServiceAvailable(state: GameState, activeNpcs: readonly NpcSpawnDefinition[]): boolean {
    return state.day >= WATERING_CAN_UPGRADE_DAY
      && isPlayerNearNpc(state, activeNpcs, "town-blacksmith", new Set(["town", "blacksmith"]));
  }

  /** Atomically expands the nearby Seed Keeper-serviced backpack from 24 to 32 slots. */
  upgradeBackpack(state: GameState, activeNpcs: readonly NpcSpawnDefinition[]): BackpackUpgradeResult {
    if (state.day < BACKPACK_UPGRADE_DAY) return "backpack-upgrade-locked";
    if (state.inventoryCapacity === EXPANDED_INVENTORY_CAPACITY) return "backpack-already-upgraded";
    if (!isPlayerNearNpc(state, activeNpcs, "seed-keeper", new Set(["seed-shop"]))) {
      return "backpack-upgrade-unavailable";
    }
    if (state.gold < BACKPACK_UPGRADE_GOLD) return "backpack-upgrade-insufficient-gold";
    if (state.inventoryCapacity !== BASE_INVENTORY_CAPACITY || state.inventory.length !== BASE_INVENTORY_CAPACITY) {
      throw new Error("Backpack state is inconsistent before upgrade.");
    }
    state.gold -= BACKPACK_UPGRADE_GOLD;
    state.inventory.push(...Array.from(
      { length: EXPANDED_INVENTORY_CAPACITY - BASE_INVENTORY_CAPACITY },
      () => ({ itemId: "" as const, quantity: 0 }),
    ));
    state.inventoryCapacity = EXPANDED_INVENTORY_CAPACITY;
    return "upgraded-backpack";
  }
}

/** Reports whether the player is within the reviewed service distance of one active NPC identity. */
function isPlayerNearNpc(
  state: GameState,
  activeNpcs: readonly NpcSpawnDefinition[],
  npcId: string,
  allowedRegions: ReadonlySet<string>,
): boolean {
  const npc = activeNpcs.find((candidate) => candidate.npcId === npcId);
  return Boolean(
    npc
    && npc.routine !== "rest"
    && schedulePhaseAt(state.minuteOfDay) === "day"
    && allowedRegions.has(npc.regionId)
    && npc.regionId === state.player.regionId
    && Math.hypot(state.player.x - npc.x, state.player.y - npc.y) <= UPGRADE_INTERACTION_DISTANCE_PIXELS,
  );
}
