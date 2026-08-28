import { GameSession } from "../../../domain/session/GameSession.ts";
import type { ActionFeedback, GameCommand } from "../../../domain/session/commands.ts";
import type { WorldCatalog } from "../../../domain/world/regions.ts";
import { IndexedDbSaveRepository } from "../persistence/IndexedDbSaveRepository.ts";
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

/** Dispatches one local gameplay command and projects its fixed feedback into Vue. */
export function dispatchLocalGameCommand(command: GameCommand): ActionFeedback | null {
  const activeSession = getLocalGameSession();
  const feedback = activeSession.dispatch(command);
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
  return feedback;
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
  session = null;
  if (activeSession) await activeSession.flush();
  stopStoreProjection?.();
  stopStoreProjection = null;
  repository?.close();
  repository = null;
  clearGameState();
}
