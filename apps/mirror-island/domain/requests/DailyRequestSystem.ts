import { InventorySystem } from "../inventory/InventorySystem.ts";
import { FriendshipSystem } from "../social/FriendshipSystem.ts";
import type { GameState } from "../state/game-state.ts";
import {
  createDailyRequestState,
  getDailyRequest,
  type DailyRequest,
} from "./definitions.ts";

export type DailyRequestSubmissionResult =
  | "request-completed"
  | "request-missing-items"
  | "request-not-target"
  | "request-already-completed"
  | "request-unavailable";

export interface DailyRequestSubmission {
  readonly result: DailyRequestSubmissionResult;
  readonly request: DailyRequest | null;
}

export class DailyRequestSystem {
  /** Creates deterministic single-day requests over existing inventory and friendship owners. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly friendship: FriendshipSystem,
  ) {}

  /** Replaces the expired request with the deterministic request owned by the supplied current day. */
  settleDay(state: GameState): void {
    state.dailyRequest = createDailyRequestState(state.day);
  }

  /** Atomically submits the current request when its matching NPC is contacted with sufficient items. */
  submitForNpc(state: GameState, npcId: string): DailyRequestSubmission {
    const requestState = state.dailyRequest;
    if (!requestState) return { result: "request-unavailable", request: null };
    const request = getDailyRequest(requestState.requestId);
    if (!request || requestState.day !== state.day) throw new Error("Daily request state is inconsistent.");
    if (request.npcId !== npcId) return { result: "request-not-target", request };
    if (requestState.completed) return { result: "request-already-completed", request };
    if (this.inventory.quantity(state.inventory, request.itemId) < request.quantity) {
      return { result: "request-missing-items", request };
    }
    if (!Number.isSafeInteger(state.gold + request.goldReward)) {
      throw new Error("Daily request gold reward exceeds the safe integer limit.");
    }
    const currentFriendship = state.friendships[npcId];
    if (!currentFriendship) throw new Error("Daily request target friendship is missing.");
    const inventoryBefore = state.inventory.map((slot) => ({ ...slot }));
    const goldBefore = state.gold;
    const friendshipBefore = { ...currentFriendship };
    if (!this.inventory.consume(state.inventory, request.itemId, request.quantity)) {
      throw new Error("Validated daily request could not consume inventory atomically.");
    }
    state.gold += request.goldReward;
    if (this.friendship.reward(state, npcId, request.friendshipReward) !== "rewarded") {
      this.inventory.restore(state.inventory, inventoryBefore);
      state.gold = goldBefore;
      state.friendships[npcId] = friendshipBefore;
      throw new Error("Validated daily request could not reward friendship atomically.");
    }
    requestState.completed = true;
    return { result: "request-completed", request };
  }
}
