import { ITEM_ID } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { FarmTileState, GameState } from "../state/game-state.ts";
import type { WorldCatalog } from "../world/regions.ts";

const FARM_INTERACTION_DISTANCE_PIXELS = 42;
const CROP_GROWTH_DURATION_MS = 5_000;

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
  primary(state: GameState, tileId: string, now: number): FarmingResult {
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
      case "growing": return this.water(state, tile, now);
      case "mature": return this.harvest(state, tile);
    }
  }

  /** Advances watered crops whose local ready time elapsed and reports whether state changed. */
  tick(state: GameState, now: number): boolean {
    let changed = false;
    for (const tile of Object.values(state.farmTiles)) {
      if (tile.phase === "growing" && tile.watered && tile.readyAt > 0 && now >= tile.readyAt) {
        tile.phase = "mature";
        tile.growthStage = 1;
        tile.readyAt = 0;
        changed = true;
      }
    }
    return changed;
  }

  /** Requires the starter hoe and transitions untouched ground into prepared soil. */
  private till(state: GameState, tile: FarmTileState): FarmingResult {
    if (this.inventory.quantity(state.inventory, ITEM_ID.hoe) < 1) return "missing-tool";
    tile.phase = "tilled";
    return "tilled";
  }

  /** Consumes one starter seed and begins the first local crop cycle. */
  private plant(state: GameState, tile: FarmTileState): FarmingResult {
    if (!this.inventory.consume(state.inventory, ITEM_ID.alienSeed, 1)) return "missing-seed";
    tile.phase = "growing";
    tile.cropId = ITEM_ID.alienCrop;
    tile.growthStage = 0;
    tile.watered = false;
    tile.readyAt = 0;
    return "planted";
  }

  /** Requires the starter watering can and schedules growth exactly once. */
  private water(state: GameState, tile: FarmTileState, now: number): FarmingResult {
    if (tile.watered) return "waiting";
    if (this.inventory.quantity(state.inventory, ITEM_ID.wateringCan) < 1) return "missing-tool";
    tile.watered = true;
    tile.readyAt = now + CROP_GROWTH_DURATION_MS;
    return "watered";
  }

  /** Adds one mature crop before resetting the tile to prepared soil. */
  private harvest(state: GameState, tile: FarmTileState): FarmingResult {
    if (!this.inventory.add(state.inventory, ITEM_ID.alienCrop, 1)) return "inventory-full";
    tile.phase = "tilled";
    tile.cropId = "";
    tile.growthStage = 0;
    tile.watered = false;
    tile.readyAt = 0;
    return "harvested";
  }
}
