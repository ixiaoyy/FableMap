import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID } from "../items/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import type { NpcSpawnDefinition, WorldCatalog } from "../world/regions.ts";
import { WorldOccupancySystem } from "../world/WorldOccupancySystem.ts";
import { allocateWorldEntityId } from "../world/world-object-state.ts";
import { CARPENTER_COUNTER_ID, CARPENTER_NPC_ID, CARPENTER_REGION_ID, carpenterCounterContains } from "./carpenter-schedule.ts";

export const SHIPPING_BIN_BUILD_GOLD = 250;
export const SHIPPING_BIN_BUILD_WOOD = 150;
export type BuildingServiceResult = "built" | "moved" | "demolished" | "service-unavailable" | "missing-building"
  | "insufficient-gold" | "insufficient-wood" | "blocked" | "last-shipping-bin" | "unchanged";

export class BuildingServiceSystem {
  private readonly occupancy: WorldOccupancySystem;

  /** Creates the carpenter's narrow building orchestration over the shared inventory and occupancy owners. */
  constructor(private readonly inventory: InventorySystem, private readonly catalog: WorldCatalog) {
    this.occupancy = new WorldOccupancySystem(catalog);
  }

  /** Allows the formal desk only when its actual NPC, resolver and nearby player all agree on the same current service. */
  serviceAvailable(state: GameState, activeNpcs: readonly NpcSpawnDefinition[], interactionId = CARPENTER_COUNTER_ID): boolean {
    if (interactionId !== CARPENTER_COUNTER_ID) return false;
    const counter = this.catalog.interaction(interactionId);
    const npc = activeNpcs.find((candidate) => candidate.npcId === CARPENTER_NPC_ID);
    return Boolean(counter && counter.kind === "building-service" && counter.regionId === CARPENTER_REGION_ID
      && state.player.regionId === counter.regionId && npc?.interactionType === "building-service"
      && carpenterCounterContains(this.catalog, npc, true)
      && Math.hypot(state.player.x - (counter.x + counter.width / 2),
        state.player.y - (counter.y + counter.height / 2)) <= 42);
  }

  /** Adds one paid farm shipping bin only after cost, ID capacity and complete footprint preflight succeed on the caller's candidate. */
  build(state: GameState, activeNpcs: readonly NpcSpawnDefinition[], interactionId: string, column: number, row: number): BuildingServiceResult {
    if (!this.serviceAvailable(state, activeNpcs, interactionId)) return "service-unavailable";
    if (state.gold < SHIPPING_BIN_BUILD_GOLD) return "insufficient-gold";
    if (this.inventory.quantity(state.inventory, ITEM_ID.wood) < SHIPPING_BIN_BUILD_WOOD) return "insufficient-wood";
    const placement = this.occupancy.placement(state, "shipping-bin", "farm", column, row, undefined, activeNpcs);
    if (!placement.allowed || state.nextWorldEntitySequence >= Number.MAX_SAFE_INTEGER) return "blocked";
    if (!this.occupancy.applyPlacement(state, placement)) return "blocked";
    this.inventory.consume(state.inventory, ITEM_ID.wood, SHIPPING_BIN_BUILD_WOOD);
    state.gold -= SHIPPING_BIN_BUILD_GOLD;
    state.worldObjects.push({ id: allocateWorldEntityId(state), kind: "shipping-bin", regionId: "farm", column, row });
    return "built";
  }

  /** Freely moves the same building identity after excluding only its old footprint from shared placement preflight. */
  move(state: GameState, activeNpcs: readonly NpcSpawnDefinition[], interactionId: string, objectId: string, column: number, row: number): BuildingServiceResult {
    if (!this.serviceAvailable(state, activeNpcs, interactionId)) return "service-unavailable";
    const building = state.worldObjects.find((object) => object.id === objectId && object.kind === "shipping-bin");
    if (!building) return "missing-building";
    if (building.column === column && building.row === row) return "unchanged";
    const placement = this.occupancy.placement(state, "shipping-bin", "farm", column, row, objectId, activeNpcs);
    if (!placement.allowed || !this.occupancy.applyPlacement(state, placement)) return "blocked";
    building.column = column;
    building.row = row;
    return "moved";
  }

  /** Removes one ordinary shipping building only when a second ordinary bin remains; the shared queue is never touched. */
  demolish(state: GameState, activeNpcs: readonly NpcSpawnDefinition[], interactionId: string, objectId: string): BuildingServiceResult {
    if (!this.serviceAvailable(state, activeNpcs, interactionId)) return "service-unavailable";
    const index = state.worldObjects.findIndex((object) => object.id === objectId && object.kind === "shipping-bin");
    if (index < 0) return "missing-building";
    if (state.worldObjects.filter((object) => object.kind === "shipping-bin").length < 2) return "last-shipping-bin";
    state.worldObjects.splice(index, 1);
    return "demolished";
  }
}
