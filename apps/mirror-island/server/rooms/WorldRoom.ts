import { type Client, Room } from "@colyseus/core";
import {
  PLAYER_SPEED_PIXELS_PER_SECOND,
  RECONNECTION_WINDOW_SECONDS,
  SIMULATION_TICK_MS,
  WORLD_HEIGHT_PIXELS,
  WORLD_WIDTH_PIXELS,
} from "../../shared/constants/simulation.ts";
import { CLIENT_MESSAGE, decodeMoveIntent, type MoveIntent } from "../../shared/messages/intents.ts";
import { PlayerState, WorldState } from "../../shared/schemas/world-state.ts";
import { createKeycloakAccessTokenVerifier } from "../auth/keycloak.ts";
import { gamePersistence } from "../persistence/game-persistence.ts";

interface WorldAuth {
  readonly accountId: string;
}

interface WorldClientOptions {
  readonly accessToken?: unknown;
}

interface RuntimeInput extends MoveIntent {}

type WorldClient = Client<{ auth: WorldAuth }>;

export class WorldRoom extends Room<{ state: WorldState; client: WorldClient }> {
  private readonly verifyAccessToken = createKeycloakAccessTokenVerifier();
  private readonly inputBySession = new Map<string, RuntimeInput>();

  /** Initializes the persistent room, bounded message rate and 20 Hz authoritative simulation loop. */
  override onCreate(): void {
    this.autoDispose = false;
    this.maxClients = 64;
    this.maxMessagesPerSecond = 30;
    this.state = new WorldState();
    this.onMessage(CLIENT_MESSAGE.move, (client, payload: unknown) => {
      const intent = decodeMoveIntent(payload);
      if (!intent) return;
      const previous = this.inputBySession.get(client.sessionId);
      if (!previous || intent.sequence > previous.sequence) {
        this.inputBySession.set(client.sessionId, intent);
      }
    });
    this.setSimulationInterval((deltaMs) => this.simulateMovement(deltaMs), SIMULATION_TICK_MS);
  }

  /** Verifies the memory-only Keycloak access token and exposes only its stable subject to Room hooks. */
  override async onAuth(_client: Client, options: WorldClientOptions): Promise<WorldAuth> {
    const token = options.accessToken;
    if (typeof token !== "string" || token.length === 0 || token.length > 8192) {
      throw new Error("Authentication failed.");
    }
    try {
      return { accountId: await this.verifyAccessToken(token) };
    } catch {
      throw new Error("Authentication failed.");
    }
  }

  /** Restores one authenticated player from process-local persistence and publishes the online entity. */
  override async onJoin(client: WorldClient): Promise<void> {
    await this.attachPlayer(client);
  }

  /** Removes the online entity immediately, checkpoints it, and opens the bounded automatic reconnect window. */
  override onDrop(client: WorldClient): void {
    this.detachPlayer(client);
    this.allowReconnection(client, RECONNECTION_WINDOW_SECONDS);
  }

  /** Reattaches the same authenticated client after Colyseus validates its reconnection token. */
  override async onReconnect(client: WorldClient): Promise<void> {
    await this.attachPlayer(client);
  }

  /** Finalizes a consented leave or expired reconnect window without duplicating checkpoint writes. */
  override onLeave(client: WorldClient): void {
    this.detachPlayer(client);
  }

  /** Loads one private checkpoint and creates a fresh online Schema entity keyed by ephemeral session ID. */
  private async attachPlayer(client: WorldClient): Promise<void> {
    const accountId = accountIdFrom(client);
    const checkpoint = await gamePersistence.loadPlayer(accountId);
    const player = new PlayerState();
    if (checkpoint) {
      player.x = checkpoint.x;
      player.y = checkpoint.y;
    }
    this.state.players.set(client.sessionId, player);
    this.inputBySession.set(client.sessionId, { sequence: 0, xAxis: 0, yAxis: 0 });
  }

  /** Removes one online Schema entity synchronously and writes its private checkpoint without blocking the Room. */
  private detachPlayer(client: WorldClient): void {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      void gamePersistence.savePlayer({
        accountId: accountIdFrom(client),
        x: player.x,
        y: player.y,
      });
      this.state.players.delete(client.sessionId);
    }
    this.inputBySession.delete(client.sessionId);
  }

  /** Advances every online player from its latest validated input while clamping to current world bounds. */
  private simulateMovement(deltaMs: number): void {
    const distance = PLAYER_SPEED_PIXELS_PER_SECOND * (deltaMs / 1000);
    for (const [sessionId, input] of this.inputBySession) {
      const player = this.state.players.get(sessionId);
      if (!player) continue;
      const magnitude = Math.hypot(input.xAxis, input.yAxis) || 1;
      player.x = clamp(player.x + (input.xAxis / magnitude) * distance, 0, WORLD_WIDTH_PIXELS);
      player.y = clamp(player.y + (input.yAxis / magnitude) * distance, 0, WORLD_HEIGHT_PIXELS);
    }
  }
}

/** Reads the verified Room auth projection and rejects missing or malformed internal state. */
function accountIdFrom(client: WorldClient): string {
  const accountId = client.auth?.accountId;
  if (typeof accountId !== "string" || accountId.length === 0) {
    throw new Error("Authenticated account is unavailable.");
  }
  return accountId;
}

/** Clamps one finite numeric value to the inclusive authoritative world interval. */
function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}
