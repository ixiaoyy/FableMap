import {
  decodeStoredGame,
  type SaveRepository,
  type StoredGame,
} from "../../../domain/persistence/SaveRepository.ts";

const DATABASE_NAME = "mirror-island-local";
const DATABASE_VERSION = 1;
const SAVE_STORE_NAME = "game-saves";
const RETIRED_BACKUP_SUFFIXES = [":backup:v2", ":backup:v9"] as const;

interface IndexedDbGameRecord {
  readonly key: string;
  readonly game: unknown;
}

export class IndexedDbSaveRepository implements SaveRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;

  /** Opens the reviewed database lazily so local startup can fail before gameplay storage is touched. */
  private openDatabase(): Promise<IDBDatabase> {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(SAVE_STORE_NAME)) {
          database.createObjectStore(SAVE_STORE_NAME, { keyPath: "key" });
        }
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error ?? new Error("IndexedDB could not be opened."));
      request.onblocked = () => reject(new Error("IndexedDB upgrade is blocked by another page."));
    });
    return this.databasePromise;
  }

  /** Reports whether one account slot contains a complete, decodable local save. */
  async has(ownerKey: string, slotId: string): Promise<boolean> {
    return (await this.load(ownerKey, slotId)) !== null;
  }

  /** Loads and validates one account-scoped save without returning IndexedDB-owned objects. */
  async load(ownerKey: string, slotId: string): Promise<StoredGame | null> {
    const database = await this.openDatabase();
    const transaction = database.transaction(SAVE_STORE_NAME, "readonly");
    const completion = transactionCompletion(transaction);
    const request = transaction.objectStore(SAVE_STORE_NAME).get(saveKey(ownerKey, slotId));
    await completion;
    const rawRecord = request.result as IndexedDbGameRecord | undefined;
    if (!rawRecord) return null;
    return decodeStoredGame(rawRecord.game);
  }

  /** Atomically replaces one main slot with a validated current development save. */
  async save(ownerKey: string, slotId: string, game: StoredGame): Promise<void> {
    const validatedGame = decodeStoredGame(game);
    const mainKey = saveKey(ownerKey, slotId);
    const database = await this.openDatabase();
    const transaction = database.transaction(SAVE_STORE_NAME, "readwrite");
    const completion = transactionCompletion(transaction);
    transaction.objectStore(SAVE_STORE_NAME).put({ key: mainKey, game: validatedGame });
    await completion;
  }

  /** Deletes the requested slot plus known retired backups without enumerating other local records. */
  async delete(ownerKey: string, slotId: string): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(SAVE_STORE_NAME, "readwrite");
    const completion = transactionCompletion(transaction);
    const store = transaction.objectStore(SAVE_STORE_NAME);
    for (const key of indexedDbOwnedKeys(saveKey(ownerKey, slotId))) store.delete(key);
    await completion;
  }

  /** Closes the cached browser database handle when the application shell is disposed. */
  close(): void {
    void this.databasePromise?.then(
      (database) => database.close(),
      () => undefined,
    );
    this.databasePromise = null;
  }
}

/** Removes only the four explicitly retired single-player localStorage save keys. */
export function removeRetiredLocalStorageSaves(storage: Storage = window.localStorage): void {
  for (const version of [1, 2, 3, 4]) storage.removeItem(`farm-game.save.v${version}`);
}

/** Builds a stable private key from an already opaque account hash and reviewed slot identifier. */
function saveKey(ownerKey: string, slotId: string): string {
  if (!ownerKey.trim() || !slotId.trim()) throw new Error("Local save key is invalid.");
  return `${ownerKey}:${slotId}`;
}

/** Returns the exact main and retired backup keys owned by one explicit local slot deletion. */
function indexedDbOwnedKeys(mainKey: string): readonly string[] {
  return [mainKey, ...RETIRED_BACKUP_SUFFIXES.map((suffix) => `${mainKey}${suffix}`)];
}

/** Resolves only after an IndexedDB transaction commits and rejects aborts or storage errors. */
function transactionCompletion(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
  });
}
