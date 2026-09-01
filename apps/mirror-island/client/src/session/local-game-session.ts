import { GameSession } from "../../../domain/session/GameSession.ts";
import type {
  ActionFeedback,
  GameCommand,
  GameCommandResult,
  NpcInteractionResult,
} from "../../../domain/session/commands.ts";
import type { WorldCatalog } from "../../../domain/world/regions.ts";
import { IndexedDbSaveRepository } from "../persistence/IndexedDbSaveRepository.ts";
import {
  audioCueForCommandResult,
  emitAudioCue,
} from "../audio/audio-events.ts";
import {
  applyGameState,
  clearGameState,
  setActionFeedback,
} from "../stores/game-store.ts";

const LOCAL_PLAYTEST_OWNER_KEY = "local-playtest-v1";

let session: GameSession | null = null;
let repository: IndexedDbSaveRepository | null = null;
let stopStoreProjection: (() => void) | null = null;

/** Initializes the single anonymous playtest slot without creating a user or device identity. */
export function initializeLocalPlaytestGameSession(catalog: WorldCatalog): GameSession {
  return initializeLocalGameSession(LOCAL_PLAYTEST_OWNER_KEY, catalog);
}

/** Initializes one browser-local GameSession for an explicit isolated owner key. */
export function initializeLocalGameSession(ownerKey: string, catalog: WorldCatalog): GameSession {
  if (session) throw new Error("Local GameSession is already initialized.");
  repository = new IndexedDbSaveRepository();
  session = new GameSession(repository, ownerKey, catalog);
  stopStoreProjection = session.subscribe((state) => applyGameState(state));
  return session;
}

/** Returns the initialized local session or fails fast before local menu setup finishes. */
export function getLocalGameSession(): GameSession {
  if (!session) throw new Error("Local GameSession is unavailable.");
  return session;
}

type NpcInteractionCommand = Extract<GameCommand, { readonly type: "talk-to-npc" }>;
type NonNpcGameCommand = Exclude<GameCommand, NpcInteractionCommand>;

/** Dispatches one NPC command and returns its saved dialogue selection. */
export function dispatchLocalGameCommand(command: NpcInteractionCommand): NpcInteractionResult | null;
/** Dispatches one non-NPC command and returns fixed action feedback. */
export function dispatchLocalGameCommand(command: NonNpcGameCommand): ActionFeedback | null;
/** Dispatches one caller-held command union and projects any nested action feedback into Vue. */
export function dispatchLocalGameCommand(command: GameCommand): GameCommandResult;
/** Dispatches one local gameplay command, routes feedback/audio and preserves the closed result union. */
export function dispatchLocalGameCommand(command: GameCommand): GameCommandResult {
  const activeSession = getLocalGameSession();
  const result = activeSession.dispatch(command);
  const feedback = result && "kind" in result ? result.feedback : result;
  const audioCue = audioCueForCommandResult(command, feedback);
  if (audioCue) emitAudioCue(audioCue);
  if (feedback) setActionFeedback(feedback);
  if (feedback?.tone === "success") {
    void activeSession.flush().catch(() => {
      setActionFeedback({
        tone: "error",
        code: "save-failed",
        message: "操作已完成，但本地存档写入失败。",
      });
    });
  }
  return result;
}

/** Advances bounded movement/time checkpoints with an explicit transient pause signal. */
export function tickLocalGameSession(now: number, paused: boolean): void {
  getLocalGameSession().tick(now, paused);
}

/** Flushes pending snapshots without disposing the active renderer or UI subscription. */
export async function flushLocalGameSession(): Promise<void> {
  if (session) await session.flush();
}

/** Flushes and releases the current browser-local session and IndexedDB handle. */
export async function shutdownLocalGameSession(): Promise<void> {
  const activeSession = session;
  const activeRepository = repository;
  const activeStopStoreProjection = stopStoreProjection;
  session = null;
  repository = null;
  stopStoreProjection = null;
  try {
    if (activeSession) await activeSession.flush();
  } finally {
    activeStopStoreProjection?.();
    activeRepository?.close();
    if (!session) clearGameState();
  }
}
