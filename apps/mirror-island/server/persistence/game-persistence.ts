export interface PlayerCheckpoint {
  readonly accountId: string;
  readonly x: number;
  readonly y: number;
}

export interface GamePersistence {
  loadPlayer(accountId: string): Promise<PlayerCheckpoint | null>;
  savePlayer(checkpoint: PlayerCheckpoint): Promise<void>;
}

export class InMemoryGamePersistence implements GamePersistence {
  private readonly players = new Map<string, PlayerCheckpoint>();

  /** Loads a defensive copy of one process-local player checkpoint by stable account ID. */
  async loadPlayer(accountId: string): Promise<PlayerCheckpoint | null> {
    const checkpoint = this.players.get(accountId);
    return checkpoint ? { ...checkpoint } : null;
  }

  /** Replaces one process-local player checkpoint without retaining caller-owned objects. */
  async savePlayer(checkpoint: PlayerCheckpoint): Promise<void> {
    this.players.set(checkpoint.accountId, { ...checkpoint });
  }
}

export const gamePersistence: GamePersistence = new InMemoryGamePersistence();
