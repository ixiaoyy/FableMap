import type { StoredGame } from "../../../domain/persistence/SaveRepository.ts";

const V2_BACKUP_SUFFIX = ":backup:v2";
const V9_BACKUP_SUFFIX = ":backup:v9";

export interface IndexedDbGameRecord {
  readonly key: string;
  readonly game: unknown;
}

export interface IndexedDbSaveWritePlan {
  readonly main: IndexedDbGameRecord;
  readonly backup: IndexedDbGameRecord | null;
}

/** Returns the owner/slot-scoped key that preserves the first pre-migration v2 payload. */
export function v2BackupKey(mainKey: string): string {
  if (!mainKey.trim()) throw new Error("IndexedDB main save key is invalid.");
  return `${mainKey}${V2_BACKUP_SUFFIX}`;
}

/** Returns the owner/slot-scoped key that preserves the raw pre-Spring v9 payload. */
export function v9BackupKey(mainKey: string): string {
  if (!mainKey.trim()) throw new Error("IndexedDB main save key is invalid.");
  return `${mainKey}${V9_BACKUP_SUFFIX}`;
}

/** Plans a current main write and an exact one-time backup of the requested released version. */
export function planIndexedDbSave(
  mainKey: string,
  existingMain: IndexedDbGameRecord | undefined,
  existingBackup: IndexedDbGameRecord | undefined,
  validatedGame: StoredGame,
  preservedVersion: 2 | 9 = 2,
): IndexedDbSaveWritePlan {
  const main = { key: mainKey, game: validatedGame };
  if (!isVersionPayload(existingMain?.game, preservedVersion) || existingBackup) {
    return { main, backup: null };
  }
  return {
    main,
    backup: { key: preservedVersion === 2 ? v2BackupKey(mainKey) : v9BackupKey(mainKey), game: existingMain.game },
  };
}

/** Returns all three records owned by an explicit slot deletion in deterministic order. */
export function indexedDbSlotKeys(mainKey: string): readonly [string, string, string] {
  return [mainKey, v2BackupKey(mainKey), v9BackupKey(mainKey)];
}

/** Detects only a released envelope version for an exact conditional raw backup. */
function isVersionPayload(value: unknown, version: 2 | 9): value is { readonly version: 2 | 9 } {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && (value as { readonly version?: unknown }).version === version;
}
