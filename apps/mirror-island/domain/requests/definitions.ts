import { ITEM_ID, type ItemId } from "../items/definitions.ts";

export interface DailyRequest {
  readonly requestId: string;
  readonly npcId: string;
  readonly itemId: ItemId;
  readonly quantity: number;
  readonly goldReward: number;
  readonly friendshipReward: number;
}

export interface DailyRequestState {
  day: number;
  requestId: string;
  completed: boolean;
}

export const DAILY_REQUESTS: readonly DailyRequest[] = [
  request("seed-rack-repair", "seed-keeper", ITEM_ID.wood, 6, 100, 170),
  request("shore-color-study", "town-resident-alan", ITEM_ID.springWildflower, 2, 110, 70),
  request("west-street-repair", "town-resident-mozi", ITEM_ID.wood, 9, 160, 80),
  request("pink-tree-lunch", "town-resident-01", ITEM_ID.turnip, 2, 150, 80),
  request("forge-handle-stock", "town-blacksmith", ITEM_ID.wood, 15, 320, 100),
  request("dock-supper", "town-resident-xiangzi", ITEM_ID.bambooShoot, 2, 180, 80),
  request("dye-swatch", "town-resident-haomeili", ITEM_ID.springWildflower, 2, 120, 80),
  request("trail-marker-repair", "town-resident-haonan", ITEM_ID.wood, 12, 220, 90),
  request("fresh-catch-supper", "town-resident-xiangzi", ITEM_ID.lakeCarp, 2, 160, 70),
  request("spring-pea-basket", "seed-keeper", ITEM_ID.greenPea, 2, 170, 70),
  request("potato-work-lunch", "town-blacksmith", ITEM_ID.springPotato, 2, 200, 80),
  request("golden-flower-vase", "town-resident-alan", ITEM_ID.rapeseedFlower, 2, 190, 80),
];

/** Returns the deterministic request for one absolute day, or null before the Day-2 board opening. */
export function dailyRequestForDay(day: number): DailyRequest | null {
  if (!Number.isSafeInteger(day) || day < 1) throw new Error("Daily-request day is invalid.");
  if (day === 1) return null;
  if (day <= 9) return DAILY_REQUESTS[(day - 2) % 8]!;
  return DAILY_REQUESTS[(day - 2) % DAILY_REQUESTS.length]!;
}

/** Accepts the current schedule or a preserved released-v9 request for the same saved day. */
export function dailyRequestMatchesDay(requestId: unknown, day: number): boolean {
  const current = dailyRequestForDay(day);
  if (!current) return requestId === null;
  return requestId === current.requestId || requestId === DAILY_REQUESTS[(day - 2) % 8]?.requestId;
}

/** Creates the persisted deterministic request state for one absolute day. */
export function createDailyRequestState(day: number): DailyRequestState | null {
  const definition = dailyRequestForDay(day);
  return definition ? { day, requestId: definition.requestId, completed: false } : null;
}

/** Resolves one registered request ID or returns null for unknown save/content input. */
export function getDailyRequest(requestId: unknown): DailyRequest | null {
  if (typeof requestId !== "string") return null;
  return DAILY_REQUESTS.find((definition) => definition.requestId === requestId) ?? null;
}

/** Builds one reviewed immutable request definition with positive rewards and quantities. */
function request(
  requestId: string,
  npcId: string,
  itemId: ItemId,
  quantity: number,
  goldReward: number,
  friendshipReward: number,
): DailyRequest {
  return { requestId, npcId, itemId, quantity, goldReward, friendshipReward };
}
