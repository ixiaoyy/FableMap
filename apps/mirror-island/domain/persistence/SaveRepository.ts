import {
  cloneGameState,
  decodeGameState,
  migrateGameStateV3,
  migrateGameStateV2,
  migrateLegacyGameStateV1,
  type GameState,
} from "../state/game-state.ts";

export const SAVE_FORMAT_VERSION = 4 as const;
export const MAIN_SAVE_SLOT = "main";

export interface StoredGame {
  readonly version: typeof SAVE_FORMAT_VERSION;
  readonly updatedAt: number;
  readonly state: GameState;
}

export interface SaveRepository {
  /** Reports whether one opaque owner and slot has a valid save. */
  has(ownerKey: string, slotId: string): Promise<boolean>;
  /** Loads one validated save or null when the requested slot has never been written. */
  load(ownerKey: string, slotId: string): Promise<StoredGame | null>;
  /** Atomically replaces one opaque owner and slot with the supplied snapshot. */
  save(ownerKey: string, slotId: string, game: StoredGame): Promise<void>;
  /** Deletes only one opaque owner and slot. */
  delete(ownerKey: string, slotId: string): Promise<void>;
}

/** Creates one defensive, versioned save envelope from the current domain state. */
export function createStoredGame(state: GameState, updatedAt: number): StoredGame {
  if (!Number.isFinite(updatedAt) || updatedAt < 0) throw new Error("Save timestamp is invalid.");
  return {
    version: SAVE_FORMAT_VERSION,
    updatedAt,
    state: cloneGameState(state),
  };
}

/** Validates an unknown persistence payload and rejects corrupt or future save formats. */
export function decodeStoredGame(value: unknown): StoredGame {
  const game = recordFrom(value);
  if (typeof game.updatedAt !== "number" || !Number.isFinite(game.updatedAt) || game.updatedAt < 0) {
    throw new Error("Save timestamp is invalid.");
  }
  if (game.version === 1) {
    return {
      version: SAVE_FORMAT_VERSION,
      updatedAt: game.updatedAt,
      state: migrateLegacyGameStateV1(game.state),
    };
  }
  if (game.version === 2) {
    return {
      version: SAVE_FORMAT_VERSION,
      updatedAt: game.updatedAt,
      state: migrateGameStateV2(game.state),
    };
  }
  if (game.version === 3) {
    return {
      version: SAVE_FORMAT_VERSION,
      updatedAt: game.updatedAt,
      state: migrateGameStateV3(game.state),
    };
  }
  if (game.version !== SAVE_FORMAT_VERSION) throw new Error("Save format is unsupported.");
  return {
    version: SAVE_FORMAT_VERSION,
    updatedAt: game.updatedAt,
    state: decodeGameState(game.state),
  };
}

/** Requires one non-array persistence object before decoding its fields. */
function recordFrom(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Save payload is invalid.");
  }
  return value as Record<string, unknown>;
}
