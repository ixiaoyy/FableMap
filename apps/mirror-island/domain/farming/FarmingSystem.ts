import { playableCalendarAt } from "../calendar/game-calendar.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import { wateringCanCapacity } from "../progression/definitions.ts";
import {
  createTilledFarmTile,
  farmTileId,
  type FarmTileState,
  type GameState,
} from "../state/game-state.ts";
import { STAMINA_COST } from "../stamina/definitions.ts";
import { StaminaSystem } from "../stamina/StaminaSystem.ts";
import { stableHash } from "../weather/WeatherSystem.ts";
import { facingVector, type Facing } from "../world/facing.ts";
import type { WorldCatalog } from "../world/regions.ts";
import { cropDefinition, cropForSeed } from "./crops.ts";

const FARM_INTERACTION_DISTANCE_PIXELS = 42;

export type FarmingResult =
  | "tilled"
  | "planted"
  | "watered"
  | "refilled"
  | "harvested"
  | "no-effect"
  | "too-far"
  | "inventory-full"
  | "waiting"
  | "out-of-season"
  | "insufficient-stamina"
  | "empty-watering-can"
  | "missing-tile";

export class FarmingSystem {
  /** Creates the coordinate-based farming owner over inventory, stamina and the authored world catalog. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly stamina: StaminaSystem,
    private readonly catalog: WorldCatalog,
  ) {}

  /** Applies one selected item or empty hand to a nearby Farm tile after catalog validation. */
  use(
    state: GameState,
    column: number,
    row: number,
    itemId: ItemId | "",
    facing?: Facing,
  ): FarmingResult {
    if (state.player.regionId !== "farm" || !this.playerNearTile(state, column, row)) return "too-far";
    if (itemId !== "" && this.inventory.quantity(state.inventory, itemId) < 1) return "no-effect";
    const id = farmTileId(column, row);
    const tile = state.farmTiles[id];
    if (itemId === ITEM_ID.hoe && !tile) return this.till(state, column, row);
    if (!tile) return "missing-tile";
    if (itemId !== "" && cropForSeed(itemId) && tile.phase === "tilled") {
      return this.plant(state, tile, itemId);
    }
    if (itemId === ITEM_ID.wateringCan && (tile.phase === "growing" || tile.phase === "tilled")) {
      return this.water(state, tile, facing);
    }
    if (itemId === "" && tile.phase === "mature") return this.harvest(state, tile);
    return "no-effect";
  }

  /** Refills the owned watering can beside one authored water tile without spending stamina. */
  refill(state: GameState, column: number, row: number): FarmingResult {
    if (
      this.inventory.quantity(state.inventory, ITEM_ID.wateringCan) < 1
      || !this.catalog.isWaterSource(state.player.regionId, column, row)
    ) return "no-effect";
    if (!this.playerNearTile(state, column, row)) return "too-far";
    const capacity = wateringCanCapacity(state.wateringCanLevel);
    if (state.wateringCanWater >= capacity) return "no-effect";
    state.wateringCanWater = capacity;
    return "refilled";
  }

  /** Marks prepared outdoor soil watered for the current rain-owned day, including future same-day planting. */
  applyRain(state: GameState): number {
    let watered = 0;
    for (const tile of Object.values(state.farmTiles)) {
      if (tile.watered) continue;
      tile.watered = true;
      watered += 1;
    }
    return watered;
  }

  /** Advances each watered crop by at most one day and clears every daily watering marker. */
  settleDay(state: GameState): number {
    let advanced = 0;
    for (const tile of Object.values(state.farmTiles)) {
      if (tile.phase === "growing" && tile.watered) {
        const crop = cropDefinition(tile.cropId);
        if (!crop) throw new Error(`Crop definition is missing: ${tile.cropId}.`);
        tile.growthDays += 1;
        if (tile.growthDays >= crop.growthDays) tile.phase = "mature";
        advanced += 1;
      }
      tile.watered = false;
    }
    return advanced;
  }

  /** Creates one sparse tilled tile after mask, obstruction and stamina validation. */
  private till(state: GameState, column: number, row: number): FarmingResult {
    if (!this.catalog.isTillable("farm", column, row) || this.hasStandingResource(state, column, row)) {
      return "missing-tile";
    }
    if (!this.stamina.spend(state, STAMINA_COST.hoe)) return "insufficient-stamina";
    const tile = createTilledFarmTile(column, row);
    tile.watered = state.weather.current === "rain";
    state.farmTiles[tile.id] = tile;
    return "tilled";
  }

  /** Consumes one seed and begins its reviewed Spring crop cycle on prepared soil. */
  private plant(state: GameState, tile: FarmTileState, seedId: ItemId): FarmingResult {
    const crop = cropForSeed(seedId);
    if (!crop) return "no-effect";
    if (!crop.seasons.includes(playableCalendarAt(state.day).season)) return "out-of-season";
    if (!this.inventory.consume(state.inventory, seedId, 1)) return "no-effect";
    tile.phase = "growing";
    tile.cropId = crop.cropId;
    tile.growthDays = 0;
    tile.watered = tile.watered || state.weather.current === "rain";
    tile.plantedDay = state.day;
    tile.harvestCount = 0;
    return "planted";
  }

  /** Waters one Lv1 tile or up to three contiguous Lv2 tiles using actual water and stamina. */
  private water(state: GameState, tile: FarmTileState, facing?: Facing): FarmingResult {
    const targets = state.wateringCanLevel === 2 && facing
      ? this.contiguousWateringTargets(state, tile, facing)
      : [tile];
    const eligible = targets.filter((candidate) => candidate.phase !== "mature" && !candidate.watered);
    if (eligible.length === 0) return "waiting";
    const affordable = Math.min(
      eligible.length, state.wateringCanWater, Math.floor(state.stamina / STAMINA_COST.wateringPerTile),
    );
    if (affordable <= 0) {
      return state.wateringCanWater <= 0 ? "empty-watering-can" : "insufficient-stamina";
    }
    for (const candidate of eligible.slice(0, affordable)) candidate.watered = true;
    state.wateringCanWater -= affordable;
    if (!this.stamina.spend(state, STAMINA_COST.wateringPerTile * affordable)) {
      throw new Error("Validated watering stamina could not be spent.");
    }
    return "watered";
  }

  /** Resolves current and forward sparse crop tiles without synthesizing unowned farm state. */
  private contiguousWateringTargets(
    state: GameState,
    tile: FarmTileState,
    facing: Facing,
  ): FarmTileState[] {
    const direction = facingVector(facing);
    const result: FarmTileState[] = [];
    for (let offset = 0; offset < 3; offset += 1) {
      const column = tile.column + direction.x * offset;
      const row = tile.row + direction.y * offset;
      if (!this.catalog.isTillable("farm", column, row)) break;
      const id = farmTileId(column, row);
      const candidate = state.farmTiles[id];
      if (!candidate) break;
      result.push(candidate);
    }
    return result;
  }

  /** Adds one deterministic harvest and either resets soil or starts a regrowth cycle. */
  private harvest(state: GameState, tile: FarmTileState): FarmingResult {
    const crop = cropDefinition(tile.cropId);
    if (!crop) return "no-effect";
    const quantity = crop.yieldKind === "spring-potato"
      ? springPotatoYield(state, tile)
      : 1;
    if (!this.inventory.add(state.inventory, crop.cropId, quantity)) return "inventory-full";
    tile.harvestCount += 1;
    if (crop.regrowDays) {
      tile.phase = "growing";
      tile.growthDays = Math.max(0, crop.growthDays - crop.regrowDays);
      tile.watered = tile.watered || state.weather.current === "rain";
      return "harvested";
    }
    tile.phase = "tilled";
    tile.cropId = "";
    tile.growthDays = 0;
    tile.watered = tile.watered || state.weather.current === "rain";
    tile.plantedDay = 0;
    tile.harvestCount = 0;
    return "harvested";
  }

  /** Reports whether one Farm tile remains occupied by a standing tree, stump or stone. */
  private hasStandingResource(state: GameState, column: number, row: number): boolean {
    return this.catalog.requireRegion("farm").resources.some((spawn) => {
      if (Math.floor(spawn.x / 16) !== column || Math.floor(spawn.y / 16) !== row) return false;
      if (spawn.kind !== "tree" && spawn.kind !== "stone") return false;
      return state.resources[spawn.entityId]?.phase !== "cleared";
    });
  }

  /** Reports whether the player's feet remain inside the reviewed interaction radius of one tile center. */
  private playerNearTile(state: GameState, column: number, row: number): boolean {
    if (!Number.isSafeInteger(column) || !Number.isSafeInteger(row) || column < 0 || row < 0) return false;
    if (Math.abs(Math.floor(state.player.x / 16) - column) > 1
      || Math.abs(Math.floor(state.player.y / 16) - row) > 1) return false;
    return Math.hypot(state.player.x - (column * 16 + 8), state.player.y - (row * 16 + 8))
      <= FARM_INTERACTION_DISTANCE_PIXELS;
  }
}

/** Returns one deterministic 1–3 Spring-potato yield without allowing refresh rerolls. */
function springPotatoYield(state: GameState, tile: FarmTileState): number {
  const roll = stableHash(
    state.worldSeed,
    tile.plantedDay,
    `${tile.id}:${tile.plantedDay}:${tile.harvestCount}:spring-potato`,
  ) % 100;
  return 1 + (roll < 55 ? 1 : 0) + (roll < 15 ? 1 : 0);
}
