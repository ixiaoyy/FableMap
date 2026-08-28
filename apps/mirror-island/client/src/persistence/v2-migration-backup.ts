import type { StoredGame } from "../../../domain/persistence/SaveRepository.ts";

const V2_BACKUP_SUFFIX = ":backup:v2";

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

/** Plans one validated current main write and an optional exact v2 backup without mutating either input. */
export function planIndexedDbSave(
  mainKey: string,
  existingMain: IndexedDbGameRecord | undefined,
  existingBackup: IndexedDbGameRecord | undefined,
  validatedGame: StoredGame,
): IndexedDbSaveWritePlan {
  const main = { key: mainKey, game: validatedGame };
  if (!isVersionTwoPayload(existingMain?.game) || existingBackup) {
    return { main, backup: null };
  }
  return {
    main,
    backup: { key: v2BackupKey(mainKey), game: existingMain.game },
  };
}

/** Returns both records owned by an explicit slot deletion in deterministic order. */
export function indexedDbSlotKeys(mainKey: string): readonly [string, string] {
  return [mainKey, v2BackupKey(mainKey)];
}

/** Detects only the released v2 envelope shape needed for conditional backup creation. */
function isVersionTwoPayload(value: unknown): value is { readonly version: 2 } {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && (value as { readonly version?: unknown }).version === 2;
}
