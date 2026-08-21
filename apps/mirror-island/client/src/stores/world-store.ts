import { reactive, readonly } from "vue";
import type { ActionFeedback } from "../../../shared/messages/intents.ts";
import type { WorldState } from "../../../shared/schemas/world-state.ts";

export type ConnectionPhase = "idle" | "connecting" | "connected" | "reconnecting" | "offline" | "error";

export interface PlayerProjection {
  readonly sessionId: string;
  readonly x: number;
  readonly y: number;
}

export interface InventorySlotProjection {
  readonly index: number;
  readonly itemId: string;
  readonly quantity: number;
}

export interface ResourceProjection {
  readonly id: string;
  readonly kind: string;
  readonly x: number;
  readonly y: number;
  readonly available: boolean;
  readonly revision: number;
}

export interface FarmTileProjection {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly phase: string;
  readonly cropId: string;
  readonly growthStage: number;
  readonly watered: boolean;
}

export interface WorldProjection {
  readonly selfSessionId: string;
  readonly players: readonly PlayerProjection[];
  readonly resources: readonly ResourceProjection[];
  readonly farmTiles: readonly FarmTileProjection[];
}

const mutableState = reactive({
  connectionPhase: "idle" as ConnectionPhase,
  selfSessionId: "",
  players: [] as PlayerProjection[],
  inventory: [] as InventorySlotProjection[],
  resources: [] as ResourceProjection[],
  farmTiles: [] as FarmTileProjection[],
  feedback: null as ActionFeedback | null,
});
const listeners = new Set<(projection: WorldProjection) => void>();

export const worldUiState = readonly(mutableState);

/** Updates the visible connection phase without exposing transport or authentication objects to Vue. */
export function setConnectionPhase(phase: ConnectionPhase): void {
  mutableState.connectionPhase = phase;
}

/** Projects one authoritative Schema snapshot into serializable Vue and Phaser read models. */
export function applyWorldState(state: WorldState, selfSessionId: string): void {
  const players: PlayerProjection[] = [];
  state.players.forEach((player, sessionId) => {
    players.push({ sessionId, x: player.x, y: player.y });
  });
  const inventory: InventorySlotProjection[] = [];
  state.players.get(selfSessionId)?.inventory.forEach((slot, index) => {
    inventory.push({ index, itemId: slot.itemId, quantity: slot.quantity });
  });
  const resources: ResourceProjection[] = [];
  state.resources.forEach((resource, id) => {
    resources.push({
      id,
      kind: resource.kind,
      x: resource.x,
      y: resource.y,
      available: resource.available,
      revision: resource.revision,
    });
  });
  const farmTiles: FarmTileProjection[] = [];
  state.farmTiles.forEach((tile, id) => {
    farmTiles.push({
      id,
      x: tile.x,
      y: tile.y,
      phase: tile.phase,
      cropId: tile.cropId,
      growthStage: tile.growthStage,
      watered: tile.watered,
    });
  });
  mutableState.selfSessionId = selfSessionId;
  mutableState.players = players;
  mutableState.inventory = inventory;
  mutableState.resources = resources;
  mutableState.farmTiles = farmTiles;
  const projection: WorldProjection = { selfSessionId, players, resources, farmTiles };
  for (const listener of listeners) listener(projection);
}

/** Displays one fixed server-generated action result without retaining message history. */
export function setActionFeedback(feedback: ActionFeedback): void {
  mutableState.feedback = feedback;
}

/** Clears online entities after a final leave while retaining only non-sensitive UI status. */
export function clearWorldState(): void {
  mutableState.selfSessionId = "";
  mutableState.players = [];
  mutableState.inventory = [];
  mutableState.resources = [];
  mutableState.farmTiles = [];
  mutableState.feedback = null;
  const projection: WorldProjection = {
    selfSessionId: "",
    players: [],
    resources: [],
    farmTiles: [],
  };
  for (const listener of listeners) listener(projection);
}

/** Subscribes Phaser rendering to the typed world projection and returns an explicit disposer. */
export function subscribeWorldProjection(listener: (projection: WorldProjection) => void): () => void {
  listeners.add(listener);
  listener({
    selfSessionId: mutableState.selfSessionId,
    players: [...mutableState.players],
    resources: [...mutableState.resources],
    farmTiles: [...mutableState.farmTiles],
  });
  return () => listeners.delete(listener);
}
