import { Client, type Room } from "@colyseus/sdk";
import {
  CLIENT_MESSAGE,
  SERVER_MESSAGE,
  type ActionFeedback,
} from "../../../shared/messages/intents.ts";
import { WorldState } from "../../../shared/schemas/world-state.ts";
import {
  applyWorldState,
  clearWorldState,
  setActionFeedback,
  setConnectionPhase,
} from "../stores/world-store.ts";

let room: Room<unknown, WorldState> | null = null;
let moveSequence = 0;

/** Resolves an explicit endpoint or the reviewed local/production `/parties` Colyseus route. */
export function resolveColyseusEndpoint(
  env: ImportMetaEnv = import.meta.env,
  location: Location = window.location,
): string {
  const configured = String(env.VITE_COLYSEUS_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (env.DEV) return "ws://localhost:3001";
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/parties`;
}

/** Authenticates one SDK join through Colyseus and wires authoritative Schema patches into client projections. */
export async function connectWorld(accessToken: string): Promise<void> {
  if (room) return;
  setConnectionPhase("connecting");
  const client = new Client(resolveColyseusEndpoint());
  try {
    const joinedRoom = await client.joinOrCreate<WorldState>("world", { accessToken }, WorldState);
    room = joinedRoom;
    joinedRoom.onStateChange((state) => applyWorldState(state, joinedRoom.sessionId));
    joinedRoom.onMessage<ActionFeedback>(SERVER_MESSAGE.feedback, (feedback) => setActionFeedback(feedback));
    applyWorldState(joinedRoom.state, joinedRoom.sessionId);
    joinedRoom.onDrop(() => setConnectionPhase("reconnecting"));
    joinedRoom.onReconnect(() => setConnectionPhase("connected"));
    joinedRoom.onLeave(() => {
      room = null;
      clearWorldState();
      setConnectionPhase("offline");
    });
    joinedRoom.onError(() => setConnectionPhase("error"));
    setConnectionPhase("connected");
  } catch {
    setConnectionPhase("error");
    throw new Error("Unable to join the shared world.");
  }
}

/** Sends bounded digital movement intent; the server remains the only owner of final position. */
export function sendMoveIntent(xAxis: -1 | 0 | 1, yAxis: -1 | 0 | 1): void {
  if (!room) return;
  moveSequence += 1;
  room.send(CLIENT_MESSAGE.move, { sequence: moveSequence, xAxis, yAxis });
}

/** Sends a target interaction intent without predicting depletion or inventory rewards. */
export function sendInteractIntent(targetId: string): void {
  room?.send(CLIENT_MESSAGE.interact, { targetId });
}

/** Sends a recipe choice only; ingredient costs and output remain server-owned. */
export function sendCraftIntent(recipeId: string): void {
  room?.send(CLIENT_MESSAGE.craft, { recipeId });
}

/** Sends the single primary farm intent while the server resolves the legal phase transition. */
export function sendFarmPrimaryIntent(tileId: string): void {
  room?.send(CLIENT_MESSAGE.farm, { tileId, action: "primary" });
}

/** Leaves the current room consensually and clears only transport-owned client state. */
export async function disconnectWorld(): Promise<void> {
  const activeRoom = room;
  room = null;
  if (activeRoom) await activeRoom.leave(true);
  clearWorldState();
  setConnectionPhase("offline");
}
