import { reactive, readonly } from "vue";
import type { WorldState } from "../../../shared/schemas/world-state.ts";

export type ConnectionPhase = "idle" | "connecting" | "connected" | "reconnecting" | "offline" | "error";

export interface PlayerProjection {
  readonly sessionId: string;
  readonly x: number;
  readonly y: number;
}

export interface WorldProjection {
  readonly selfSessionId: string;
  readonly players: readonly PlayerProjection[];
}

const mutableState = reactive({
  connectionPhase: "idle" as ConnectionPhase,
  selfSessionId: "",
  players: [] as PlayerProjection[],
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
  mutableState.selfSessionId = selfSessionId;
  mutableState.players = players;
  const projection: WorldProjection = { selfSessionId, players };
  for (const listener of listeners) listener(projection);
}

/** Clears online entities after a final leave while retaining only non-sensitive UI status. */
export function clearWorldState(): void {
  mutableState.selfSessionId = "";
  mutableState.players = [];
  const projection: WorldProjection = { selfSessionId: "", players: [] };
  for (const listener of listeners) listener(projection);
}

/** Subscribes Phaser rendering to the typed world projection and returns an explicit disposer. */
export function subscribeWorldProjection(listener: (projection: WorldProjection) => void): () => void {
  listeners.add(listener);
  listener({
    selfSessionId: mutableState.selfSessionId,
    players: [...mutableState.players],
  });
  return () => listeners.delete(listener);
}
