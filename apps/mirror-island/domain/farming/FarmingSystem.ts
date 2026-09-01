import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import { playableCalendarAt } from "../calendar/game-calendar.ts";
import { cropDefinition, cropForSeed } from "./crops.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { FarmTileState, GameState } from "../state/game-state.ts";
import type { InteractionDefinition, WorldCatalog } from "../world/regions.ts";
import { facingVector, type Facing } from "../world/facing.ts";

const FARM_INTERACTION_DISTANCE_PIXELS = 42;

export type FarmingResult =
  | "tilled"
  | "planted"
  | "watered"
  | "harvested"
  | "no-effect"
  | "too-far"
  | "inventory-full"
  | "waiting"
  | "out-of-season"
  | "missing-tile";

export class FarmingSystem {
  /** Creates a pure farming state machine backed only by the supplied inventory operations. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly catalog: WorldCatalog,
  ) {}

  /** Applies one selected item or empty hand to a nearby tile without inferring the intended action. */
  use(state: GameState, tileId: string, itemId: ItemId | "", facing?: Facing): FarmingResult {
    const interaction = this.catalog.interaction(tileId);
    const tile = state.farmTiles[tileId];
    if (!interaction || interaction.kind !== "farm-plot" || !tile) return "missing-tile";
    if (state.player.regionId !== interaction.regionId) return "missing-tile";
    const targetX = interaction.x + interaction.width / 2;
    const targetY = interaction.y + interaction.height / 2;
    if (Math.hypot(state.player.x - targetX, state.player.y - targetY) > FARM_INTERACTION_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (itemId !== "" && this.inventory.quantity(state.inventory, itemId) < 1) return "no-effect";
    if (itemId === ITEM_ID.hoe && tile.phase === "untilled") return this.till(tile);
    if (itemId !== "" && cropForSeed(itemId) && tile.phase === "tilled") return this.plant(state, tile, itemId);
    if (itemId === ITEM_ID.wateringCan && tile.phase === "growing") {
      return this.water(state, tile, interaction, facing);
    }
    if (itemId === "" && tile.phase === "mature") return this.harvest(state, tile);
    return "no-effect";
  }

  /** Advances each watered crop by at most one stage and clears every daily watering marker. */
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

  /** Transitions one validated untouched plot into prepared soil. */
  private till(tile: FarmTileState): FarmingResult {
    tile.phase = "tilled";
    return "tilled";
  }

  /** Consumes one starter seed and begins the first local crop cycle. */
  private plant(state: GameState, tile: FarmTileState, seedId: ItemId): FarmingResult {
    const crop = cropForSeed(seedId);
    if (!crop) return "no-effect";
    if (!crop.seasons.includes(playableCalendarAt(state.day).season)) return "out-of-season";
    if (!this.inventory.consume(state.inventory, seedId, 1)) return "no-effect";
    tile.phase = "growing";
    tile.cropId = crop.cropId;
    tile.growthDays = 0;
    tile.watered = false;
    return "planted";
  }

  /** Waters one Lv1 tile or up to three contiguous Lv2 tiles along the supplied facing. */
  private water(
    state: GameState,
    tile: FarmTileState,
    interaction: InteractionDefinition,
    facing?: Facing,
  ): FarmingResult {
    if (this.inventory.quantity(state.inventory, ITEM_ID.wateringCan) < 1) return "no-effect";
    const targets = state.wateringCanLevel === 2 && facing
      ? this.contiguousWateringTargets(state, interaction, facing)
      : [tile];
    const eligible = targets.filter((candidate) => candidate.phase === "growing" && !candidate.watered);
    for (const candidate of eligible) candidate.watered = true;
    if (eligible.length > 0) return "watered";
    return targets.some((candidate) => candidate.phase === "growing" && candidate.watered)
      ? "waiting"
      : "no-effect";
  }

  /** Resolves the clicked plot and the next two registered same-region plots without synthesizing grid IDs. */
  private contiguousWateringTargets(
    state: GameState,
    interaction: InteractionDefinition,
    facing: Facing,
  ): FarmTileState[] {
    if (interaction.kind !== "farm-plot") return [];
    const direction = facingVector(facing);
    const centerX = interaction.x + interaction.width / 2;
    const centerY = interaction.y + interaction.height / 2;
    const plots = this.catalog.requireRegion(interaction.regionId).interactions.filter((candidate) => (
      candidate.kind === "farm-plot"
    ));
    const result: FarmTileState[] = [];
    for (let offset = 0; offset < 3; offset += 1) {
      const expectedX = centerX + direction.x * interaction.width * offset;
      const expectedY = centerY + direction.y * interaction.height * offset;
      const adjacent = plots.find((candidate) => (
        candidate.x + candidate.width / 2 === expectedX
        && candidate.y + candidate.height / 2 === expectedY
      ));
      if (!adjacent) break;
      const adjacentState = state.farmTiles[adjacent.entityId];
      if (!adjacentState) throw new Error(`Farm state is missing for contiguous plot ${adjacent.entityId}.`);
      result.push(adjacentState);
    }
    return result;
  }

  /** Adds one mature crop before resetting the tile to prepared soil. */
  private harvest(state: GameState, tile: FarmTileState): FarmingResult {
    const crop = cropDefinition(tile.cropId);
    if (!crop) return "no-effect";
    if (!this.inventory.add(state.inventory, crop.cropId, 1)) return "inventory-full";
    tile.phase = "tilled";
    tile.cropId = "";
    tile.growthDays = 0;
    tile.watered = false;
    return "harvested";
  }
}
