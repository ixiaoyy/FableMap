import { InventorySystem } from "../inventory/InventorySystem.ts";
import { getItemDefinition, ITEM_ID, type ItemId } from "../items/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import type { NpcSpawnDefinition } from "../world/regions.ts";
import { FRIENDSHIP_MAX_POINTS, giftWeekIndex } from "./definitions.ts";

const GIFT_INTERACTION_DISTANCE_PIXELS = 42;
const GIFTS_PER_DAY = 1;
const GIFTS_PER_WEEK = 2;

export type GiftPreference = "liked" | "neutral" | "disliked";
export type GiftResult =
  | { readonly kind: "given"; readonly preference: GiftPreference }
  | { readonly kind: "not-giftable" | "missing-item" | "missing-npc" | "too-far" | "daily-limit" | "weekly-limit" };

const LIKED_GIFTS: Readonly<Record<string, ReadonlySet<ItemId>>> = {
  "seed-keeper": new Set([ITEM_ID.cauliflower, ITEM_ID.greenPea, ITEM_ID.rapeseedFlower]),
  "town-blacksmith": new Set([ITEM_ID.springPotato, ITEM_ID.bambooShoot]),
  "town-resident-01": new Set([ITEM_ID.turnip, ITEM_ID.rapeseedFlower]),
  "town-resident-mozi": new Set([ITEM_ID.wood, ITEM_ID.springPotato]),
  "town-resident-haonan": new Set([ITEM_ID.bambooShoot, ITEM_ID.windDace]),
  "town-resident-alan": new Set([ITEM_ID.springWildflower, ITEM_ID.rapeseedFlower]),
  "town-resident-haomeili": new Set([ITEM_ID.springWildflower, ITEM_ID.rapeseedFlower]),
  "town-resident-xiangzi": new Set([ITEM_ID.lakeCarp, ITEM_ID.duskPerch, ITEM_ID.jadeBream]),
};

const DISLIKED_GIFTS: Readonly<Record<string, ReadonlySet<ItemId>>> = {
  "seed-keeper": new Set([ITEM_ID.rainLoach]),
  "town-blacksmith": new Set([ITEM_ID.springWildflower]),
  "town-resident-01": new Set([ITEM_ID.wood]),
  "town-resident-mozi": new Set([ITEM_ID.silverMinnow]),
  "town-resident-haonan": new Set([ITEM_ID.cauliflower]),
  "town-resident-alan": new Set([ITEM_ID.wood]),
  "town-resident-haomeili": new Set([ITEM_ID.rainLoach]),
  "town-resident-xiangzi": new Set([ITEM_ID.wood]),
};

const GIFT_POINTS: Readonly<Record<GiftPreference, number>> = {
  liked: 45,
  neutral: 20,
  disliked: -20,
};

export class GiftSystem {
  /** Creates the per-resident daily and weekly gift owner over the shared inventory service. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Gives one held item to a nearby active resident and commits inventory and friendship atomically. */
  give(
    state: GameState,
    activeNpcs: readonly NpcSpawnDefinition[],
    npcId: string,
    itemId: ItemId,
  ): GiftResult {
    const item = getItemDefinition(itemId);
    if (!item || item.category === "tool" || item.category === "seed") return { kind: "not-giftable" };
    if (this.inventory.quantity(state.inventory, itemId) < 1) return { kind: "missing-item" };
    const npc = activeNpcs.find((candidate) => candidate.npcId === npcId);
    const friendship = state.friendships[npcId];
    if (!npc || !friendship || npc.regionId !== state.player.regionId) return { kind: "missing-npc" };
    if (Math.hypot(state.player.x - npc.x, state.player.y - npc.y) > GIFT_INTERACTION_DISTANCE_PIXELS) {
      return { kind: "too-far" };
    }
    const weekIndex = giftWeekIndex(state.day);
    const weeklyCount = friendship.giftWeekIndex === weekIndex ? friendship.giftsThisWeek : 0;
    if (friendship.lastGiftDay === state.day && GIFTS_PER_DAY === 1) return { kind: "daily-limit" };
    if (weeklyCount >= GIFTS_PER_WEEK) return { kind: "weekly-limit" };
    const preference = giftPreference(npcId, itemId);
    if (!this.inventory.consume(state.inventory, itemId, 1)) {
      throw new Error("Validated gift could not be consumed atomically.");
    }
    friendship.points = Math.max(
      0,
      Math.min(FRIENDSHIP_MAX_POINTS, friendship.points + GIFT_POINTS[preference]),
    );
    friendship.lastGiftDay = state.day;
    friendship.giftWeekIndex = weekIndex;
    friendship.giftsThisWeek = weeklyCount + 1;
    return { kind: "given", preference };
  }
}

/** Resolves one resident/item pair through the closed liked, neutral and disliked preference tables. */
export function giftPreference(npcId: string, itemId: ItemId): GiftPreference {
  if (LIKED_GIFTS[npcId]?.has(itemId)) return "liked";
  if (DISLIKED_GIFTS[npcId]?.has(itemId)) return "disliked";
  return "neutral";
}
