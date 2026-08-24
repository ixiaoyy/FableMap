import { GameSession } from "../../../domain/session/GameSession.ts";
import type { GameCommand } from "../../../domain/session/commands.ts";
import { IndexedDbSaveRepository } from "../persistence/IndexedDbSaveRepository.ts";
import {
  applyGameState,
  clearGameState,
  setActionFeedback,
} from "../stores/game-store.ts";

let session: GameSession | null = null;
let repository: IndexedDbSaveRepository | null = null;
let stopStoreProjection: (() => void) | null = null;

/** Initializes one browser-local GameSession after identity has produced an opaque owner key. */
export function initializeLocalGameSession(ownerKey: string): GameSession {
  if (session) throw new Error("Local GameSession is already initialized.");
  repository = new IndexedDbSaveRepository();
  session = new GameSession(repository, ownerKey);
  stopStoreProjection = session.subscribe((state) => applyGameState(state));
  return session;
}

/** Returns the initialized local session or fails fast before authentication and menu setup finish. */
export function getLocalGameSession(): GameSession {
  if (!session) throw new Error("Local GameSession is unavailable.");
  return session;
}

/** Dispatches one local gameplay command and projects its fixed feedback into Vue. */
export function dispatchLocalGameCommand(command: GameCommand): void {
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
}

/** Advances local time-based rules using an explicit wall-clock timestamp. */
export function tickLocalGameSession(now: number): void {
  getLocalGameSession().tick(now);
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
