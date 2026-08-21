export interface PlayerCheckpoint {
  readonly accountId: string;
  readonly x: number;
  readonly y: number;
  readonly inventory: readonly {
    readonly itemId: string;
    readonly quantity: number;
  }[];
}

export interface WorldCheckpoint {
  readonly worldId: string;
  readonly resources: readonly {
    readonly id: string;
    readonly available: boolean;
    readonly revision: number;
  }[];
  readonly farmTiles: readonly {
    readonly id: string;
    readonly phase: string;
    readonly cropId: string;
    readonly growthStage: number;
    readonly watered: boolean;
    readonly readyAt: number;
  }[];
}

export interface GamePersistence {
  loadPlayer(accountId: string): Promise<PlayerCheckpoint | null>;
  savePlayer(checkpoint: PlayerCheckpoint): Promise<void>;
  loadWorld(worldId: string): Promise<WorldCheckpoint | null>;
  saveWorld(checkpoint: WorldCheckpoint): Promise<void>;
}

export class InMemoryGamePersistence implements GamePersistence {
  private readonly players = new Map<string, PlayerCheckpoint>();
  private readonly worlds = new Map<string, WorldCheckpoint>();

  /** Loads a defensive copy of one process-local player checkpoint by stable account ID. */
  async loadPlayer(accountId: string): Promise<PlayerCheckpoint | null> {
    const checkpoint = this.players.get(accountId);
    return checkpoint ? clonePlayerCheckpoint(checkpoint) : null;
  }

  /** Replaces one process-local player checkpoint without retaining caller-owned objects. */
  async savePlayer(checkpoint: PlayerCheckpoint): Promise<void> {
    this.players.set(checkpoint.accountId, clonePlayerCheckpoint(checkpoint));
  }

  /** Loads a defensive copy of one process-local shared-world checkpoint by stable world ID. */
  async loadWorld(worldId: string): Promise<WorldCheckpoint | null> {
    const checkpoint = this.worlds.get(worldId);
    return checkpoint ? structuredClone(checkpoint) : null;
  }

  /** Replaces one process-local world checkpoint without retaining caller-owned arrays. */
  async saveWorld(checkpoint: WorldCheckpoint): Promise<void> {
    this.worlds.set(checkpoint.worldId, structuredClone(checkpoint));
  }
}

export const gamePersistence: GamePersistence = new InMemoryGamePersistence();

/** Clones one player checkpoint while preserving readonly inventory semantics at the interface boundary. */
function clonePlayerCheckpoint(checkpoint: PlayerCheckpoint): PlayerCheckpoint {
  return {
    ...checkpoint,
    inventory: checkpoint.inventory.map((slot) => ({ ...slot })),
  };
}
