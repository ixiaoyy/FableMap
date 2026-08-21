import { type Client, Room } from "@colyseus/core";
import {
  CLIENT_MESSAGE,
  SERVER_MESSAGE,
  decodeCraftIntent,
  decodeFarmIntent,
  decodeInteractIntent,
  decodeMoveIntent,
  type ActionFeedback,
  type MoveIntent,
} from "../../shared/messages/intents.ts";
import {
  FarmTileState,
  PlayerState,
  ResourceNodeState,
  WorldState,
} from "../../shared/schemas/world-state.ts";
import {
  PLAYER_SPEED_PIXELS_PER_SECOND,
  RECONNECTION_WINDOW_SECONDS,
  SIMULATION_TICK_MS,
  WORLD_HEIGHT_PIXELS,
  WORLD_WIDTH_PIXELS,
} from "../../shared/constants/simulation.ts";
import { createKeycloakAccessTokenVerifier } from "../auth/keycloak.ts";
import { gamePersistence } from "../persistence/game-persistence.ts";
import { CraftingSystem, type CraftingResult } from "../systems/CraftingSystem.ts";
import { FarmingSystem, type FarmingResult } from "../systems/FarmingSystem.ts";
import { GatheringSystem, type GatheringResult } from "../systems/GatheringSystem.ts";
import { InventorySystem } from "../systems/InventorySystem.ts";

const TREE_ID = "tree-01";
const FARM_TILE_ID = "farm-01";

interface WorldAuth {
  readonly accountId: string;
}

interface WorldClientOptions {
  readonly accessToken?: unknown;
}

type RuntimeInput = MoveIntent;

type WorldClient = Client<{ auth: WorldAuth }>;

export class WorldRoom extends Room<{ state: WorldState; client: WorldClient }> {
  private readonly verifyAccessToken = createKeycloakAccessTokenVerifier();
  private readonly inputBySession = new Map<string, RuntimeInput>();
  private inventorySystem!: InventorySystem;
  private gatheringSystem!: GatheringSystem;
  private craftingSystem!: CraftingSystem;
  private farmingSystem!: FarmingSystem;

  /** Initializes the persistent room, bounded message rate and 20 Hz authoritative simulation loop. */
  override onCreate(): void {
    this.autoDispose = false;
    this.maxClients = 64;
    this.maxMessagesPerSecond = 30;
    this.state = new WorldState();
    this.createInitialWorldState();
    this.inventorySystem = new InventorySystem();
    this.gatheringSystem = new GatheringSystem(this.state, this.inventorySystem);
    this.craftingSystem = new CraftingSystem(this.inventorySystem);
    this.farmingSystem = new FarmingSystem(this.state, this.inventorySystem);
    this.registerMessageHandlers();
    this.setSimulationInterval((deltaMs) => this.simulate(deltaMs), SIMULATION_TICK_MS);
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
    this.inventorySystem.initialize(player, checkpoint?.inventory);
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
        inventory: this.inventorySystem.snapshot(player),
      });
      this.state.players.delete(client.sessionId);
    }
    this.inputBySession.delete(client.sessionId);
  }

  /** Creates the only first-slice tree and farm tile using server-owned positions and IDs. */
  private createInitialWorldState(): void {
    const tree = new ResourceNodeState();
    tree.x = 320;
    tree.y = 256;
    this.state.resources.set(TREE_ID, tree);

    const farmTile = new FarmTileState();
    farmTile.x = 192;
    farmTile.y = 256;
    this.state.farmTiles.set(FARM_TILE_ID, farmTile);
  }

  /** Registers all typed intent boundaries so no gameplay system reads raw network payloads. */
  private registerMessageHandlers(): void {
    this.onMessage(CLIENT_MESSAGE.move, (client, payload: unknown) => {
      const intent = decodeMoveIntent(payload);
      if (!intent) return;
      const previous = this.inputBySession.get(client.sessionId);
      if (!previous || intent.sequence > previous.sequence) {
        this.inputBySession.set(client.sessionId, intent);
      }
    });
    this.onMessage(CLIENT_MESSAGE.interact, (client, payload: unknown) => {
      const intent = decodeInteractIntent(payload);
      const player = this.playerFor(client);
      if (!intent || !player) return;
      this.sendFeedback(client, gatheringFeedback(this.gatheringSystem.gather(player, intent.targetId)));
    });
    this.onMessage(CLIENT_MESSAGE.craft, (client, payload: unknown) => {
      const intent = decodeCraftIntent(payload);
      const player = this.playerFor(client);
      if (!intent || !player) return;
      this.sendFeedback(client, craftingFeedback(this.craftingSystem.craft(player, intent.recipeId)));
    });
    this.onMessage(CLIENT_MESSAGE.farm, (client, payload: unknown) => {
      const intent = decodeFarmIntent(payload);
      const player = this.playerFor(client);
      if (!intent || !player) return;
      this.sendFeedback(client, farmingFeedback(this.farmingSystem.primary(player, intent.tileId, Date.now())));
    });
  }

  /** Returns the online player for one authenticated client without creating fallback state. */
  private playerFor(client: WorldClient): PlayerState | null {
    return this.state.players.get(client.sessionId) ?? null;
  }

  /** Sends one fixed non-sensitive action result only to the client that issued the intent. */
  private sendFeedback(client: WorldClient, feedback: ActionFeedback): void {
    client.send(SERVER_MESSAGE.feedback, feedback);
  }

  /** Advances authoritative movement and time-based crop growth from the single Room simulation loop. */
  private simulate(deltaMs: number): void {
    const distance = PLAYER_SPEED_PIXELS_PER_SECOND * (deltaMs / 1000);
    for (const [sessionId, input] of this.inputBySession) {
      const player = this.state.players.get(sessionId);
      if (!player) continue;
      const magnitude = Math.hypot(input.xAxis, input.yAxis) || 1;
      player.x = clamp(player.x + (input.xAxis / magnitude) * distance, 0, WORLD_WIDTH_PIXELS);
      player.y = clamp(player.y + (input.yAxis / magnitude) * distance, 0, WORLD_HEIGHT_PIXELS);
    }
    this.farmingSystem.tick(Date.now());
  }
}

/** Maps one gathering result to fixed user feedback without exposing server state or identifiers. */
function gatheringFeedback(result: GatheringResult): ActionFeedback {
  switch (result) {
    case "success": return { tone: "success", code: result, message: "+3 异星木材" };
    case "depleted": return { tone: "error", code: result, message: "这棵树已经被采集。" };
    case "too-far": return { tone: "error", code: result, message: "离目标太远。" };
    case "inventory-full": return { tone: "error", code: result, message: "背包已满。" };
    case "missing-target": return { tone: "error", code: result, message: "目标不存在。" };
  }
}

/** Maps one crafting result to fixed user feedback and never echoes an untrusted recipe ID. */
function craftingFeedback(result: CraftingResult): ActionFeedback {
  switch (result) {
    case "success": return { tone: "success", code: result, message: "木斧制作完成。" };
    case "requirements-not-met": return { tone: "error", code: result, message: "制作材料不足或背包已满。" };
    case "unknown-recipe": return { tone: "error", code: result, message: "未知配方。" };
  }
}

/** Maps one farm transition to fixed user feedback for the primary tile interaction. */
function farmingFeedback(result: FarmingResult): ActionFeedback {
  const success = (message: string): ActionFeedback => ({ tone: "success", code: result, message });
  const error = (message: string): ActionFeedback => ({ tone: "error", code: result, message });
  switch (result) {
    case "tilled": return success("土地已经开垦。");
    case "planted": return success("荧光种子已经播下。");
    case "watered": return success("作物已经浇水，正在生长。");
    case "harvested": return success("收获了一个荧光果。");
    case "waiting": return error("作物还在生长。");
    case "too-far": return error("离农田太远。");
    case "missing-tool": return error("缺少所需工具。");
    case "missing-seed": return error("没有可用种子。");
    case "inventory-full": return error("背包已满。");
    case "missing-tile": return error("农田不存在。");
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
