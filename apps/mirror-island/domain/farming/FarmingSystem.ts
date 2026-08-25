import { ITEM_ID } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { FarmTileState, GameState } from "../state/game-state.ts";
import type { WorldCatalog } from "../world/regions.ts";

const FARM_INTERACTION_DISTANCE_PIXELS = 42;

export type FarmingResult =
  | "tilled"
  | "planted"
  | "watered"
  | "harvested"
  | "too-far"
  | "missing-tool"
  | "missing-seed"
  | "inventory-full"
  | "waiting"
  | "missing-tile";

export class FarmingSystem {
  /** Creates a pure farming state machine backed only by the supplied inventory operations. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly catalog: WorldCatalog,
  ) {}

  /** Applies the next legal primary action for one nearby tile from its current local phase. */
  primary(state: GameState, tileId: string): FarmingResult {
    const interaction = this.catalog.interaction(tileId);
    const tile = state.farmTiles[tileId];
    if (!interaction || interaction.kind !== "farm-plot" || !tile) return "missing-tile";
    if (state.player.regionId !== interaction.regionId) return "missing-tile";
    const targetX = interaction.x + interaction.width / 2;
    const targetY = interaction.y + interaction.height / 2;
    if (Math.hypot(state.player.x - targetX, state.player.y - targetY) > FARM_INTERACTION_DISTANCE_PIXELS) {
      return "too-far";
    }
    switch (tile.phase) {
      case "untilled": return this.till(state, tile);
      case "tilled": return this.plant(state, tile);
      case "growing": return this.water(state, tile);
      case "mature": return this.harvest(state, tile);
    }
  }

  /** Advances each watered crop by at most one stage and clears every daily watering marker. */
  settleDay(state: GameState): number {
    let advanced = 0;
    for (const tile of Object.values(state.farmTiles)) {
      if (tile.phase === "growing" && tile.watered) {
        tile.growthStage = (tile.growthStage + 1) as 1 | 2 | 3;
        if (tile.growthStage === 3) tile.phase = "mature";
        advanced += 1;
      }
      tile.watered = false;
    }
    return advanced;
  }

  /** Requires the starter hoe and transitions untouched ground into prepared soil. */
  private till(state: GameState, tile: FarmTileState): FarmingResult {
    if (this.inventory.quantity(state.inventory, ITEM_ID.hoe) < 1) return "missing-tool";
    tile.phase = "tilled";
    return "tilled";
  }

  /** Consumes one starter seed and begins the first local crop cycle. */
  private plant(state: GameState, tile: FarmTileState): FarmingResult {
    if (!this.inventory.consume(state.inventory, ITEM_ID.turnipSeed, 1)) return "missing-seed";
    tile.phase = "growing";
    tile.cropId = ITEM_ID.turnip;
    tile.growthStage = 0;
    tile.watered = false;
    return "planted";
  }

  /** Requires the starter watering can and marks this crop for the next sleep settlement once. */
  private water(state: GameState, tile: FarmTileState): FarmingResult {
    if (tile.watered) return "waiting";
    if (this.inventory.quantity(state.inventory, ITEM_ID.wateringCan) < 1) return "missing-tool";
    tile.watered = true;
    return "watered";
  }

  /** Adds one mature crop before resetting the tile to prepared soil. */
  private harvest(state: GameState, tile: FarmTileState): FarmingResult {
    if (!this.inventory.add(state.inventory, ITEM_ID.turnip, 1)) return "inventory-full";
    tile.phase = "tilled";
    tile.cropId = "";
    tile.growthStage = 0;
    tile.watered = false;
    return "harvested";
  }
}
