import { ITEM_ID } from "../../shared/items/definitions.ts";
import type { FarmTileState, PlayerState, WorldState } from "../../shared/schemas/world-state.ts";
import { InventorySystem } from "./InventorySystem.ts";

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
  constructor(
    private readonly world: WorldState,
    private readonly inventory: InventorySystem,
  ) {}

  /** Applies the next legal primary action for one nearby farm tile from its authoritative phase. */
  primary(player: PlayerState, tileId: string, now: number): FarmingResult {
    const tile = this.world.farmTiles.get(tileId);
    if (!tile) return "missing-tile";
    if (Math.hypot(player.x - tile.x, player.y - tile.y) > FARM_INTERACTION_DISTANCE_PIXELS) {
      return "too-far";
    }
    switch (tile.phase) {
      case "untilled":
        return this.till(player, tile);
      case "tilled":
        return this.plant(player, tile);
      case "growing":
        return this.water(player, tile, now);
      case "mature":
        return this.harvest(player, tile);
    }
  }

  /** Advances watered crops whose server-owned ready time has elapsed. */
  tick(now: number): void {
    this.world.farmTiles.forEach((tile) => {
      if (tile.phase === "growing" && tile.watered && tile.readyAt > 0 && now >= tile.readyAt) {
        tile.phase = "mature";
        tile.growthStage = 1;
        tile.readyAt = 0;
      }
    });
  }

  /** Requires the reviewed hoe and transitions untouched ground into prepared soil. */
  private till(player: PlayerState, tile: FarmTileState): FarmingResult {
    if (this.inventory.quantity(player, ITEM_ID.hoe) < 1) return "missing-tool";
    tile.phase = "tilled";
    return "tilled";
  }

  /** Consumes one reviewed seed and starts the only first-slice crop. */
  private plant(player: PlayerState, tile: FarmTileState): FarmingResult {
    if (!this.inventory.consume(player, ITEM_ID.alienSeed, 1)) return "missing-seed";
    tile.phase = "growing";
    tile.cropId = ITEM_ID.alienCrop;
    tile.growthStage = 0;
    tile.watered = false;
    tile.readyAt = 0;
    return "planted";
  }

  /** Requires the reviewed watering can and schedules growth using server time exactly once. */
  private water(player: PlayerState, tile: FarmTileState, now: number): FarmingResult {
    if (tile.watered) return "waiting";
    if (this.inventory.quantity(player, ITEM_ID.wateringCan) < 1) return "missing-tool";
    tile.watered = true;
    tile.readyAt = now + CROP_GROWTH_DURATION_MS;
    return "watered";
  }

  /** Adds one mature crop before resetting the tile to prepared soil. */
  private harvest(player: PlayerState, tile: FarmTileState): FarmingResult {
    if (!this.inventory.add(player, ITEM_ID.alienCrop, 1)) return "inventory-full";
    tile.phase = "tilled";
    tile.cropId = "";
    tile.growthStage = 0;
    tile.watered = false;
    tile.readyAt = 0;
    return "harvested";
  }
}
