import {
  decodeStoredGame,
  type SaveRepository,
  type StoredGame,
} from "../../../domain/persistence/SaveRepository.ts";

const DATABASE_NAME = "mirror-island-local";
const DATABASE_VERSION = 1;
const SAVE_STORE_NAME = "game-saves";

interface IndexedDbSaveRecord {
  readonly key: string;
  readonly game: StoredGame;
}

export class IndexedDbSaveRepository implements SaveRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;

  /** Opens the reviewed database lazily so authentication can finish before local gameplay storage is touched. */
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
    const rawRecord = request.result as IndexedDbSaveRecord | undefined;
    if (!rawRecord) return null;
    return decodeStoredGame(rawRecord.game);
  }

  /** Atomically replaces one account-scoped slot with a validated versioned snapshot. */
  async save(ownerKey: string, slotId: string, game: StoredGame): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(SAVE_STORE_NAME, "readwrite");
    const completion = transactionCompletion(transaction);
    const record: IndexedDbSaveRecord = {
      key: saveKey(ownerKey, slotId),
      game: decodeStoredGame(game),
    };
    transaction.objectStore(SAVE_STORE_NAME).put(record);
    await completion;
  }

  /** Deletes only the requested account slot and leaves every other browser record intact. */
  async delete(ownerKey: string, slotId: string): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(SAVE_STORE_NAME, "readwrite");
    const completion = transactionCompletion(transaction);
    transaction.objectStore(SAVE_STORE_NAME).delete(saveKey(ownerKey, slotId));
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

/** Resolves only after an IndexedDB transaction commits and rejects aborts or storage errors. */
function transactionCompletion(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
  });
}
