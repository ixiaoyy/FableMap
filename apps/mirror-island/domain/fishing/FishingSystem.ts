import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import { STAMINA_COST } from "../stamina/definitions.ts";
import { StaminaSystem } from "../stamina/StaminaSystem.ts";
import { stableHash } from "../weather/WeatherSystem.ts";
import type { WorldCatalog } from "../world/regions.ts";
import {
  eligibleFish,
  FISHING_SAFE_TENSION,
  IDLE_FISHING_SNAPSHOT,
  type FishDefinition,
  type FishingPhase,
  type FishingSnapshot,
} from "./definitions.ts";

const FISHING_INTERACTION_DISTANCE_PIXELS = 52;
const MAX_TICK_MS = 1_000;
const BITE_WINDOW_MS = 900;

interface FishingRuntime {
  phase: Exclude<FishingPhase, "idle">;
  zoneId: string;
  held: boolean;
  elapsedMs: number;
  biteAtMs: number;
  castPower: number;
  tension: number;
  progress: number;
  fish: FishDefinition | null;
  attempt: number;
  failureReason: FishingSnapshot["failureReason"];
}

export type StartFishingResult = "started" | "already-fishing" | "not-ready" | "missing-rod" | "missing-zone" | "too-far" | "insufficient-stamina";
export type FishingTickResult =
  | { readonly kind: "caught"; readonly itemId: ItemId }
  | { readonly kind: "escaped" | "inventory-full" }
  | null;

export class FishingSystem {
  private runtime: FishingRuntime | null = null;

  /** Creates one transient fishing owner without adding an in-progress run to GameState. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly stamina: StaminaSystem,
    private readonly catalog: WorldCatalog,
  ) {}

  /** Starts charging a cast at one nearby Tiled-owned fishing zone and immediately pays stamina. */
  start(state: GameState, zoneId: string): StartFishingResult {
    if (this.runtime) return "already-fishing";
    if (state.day < 7 || state.minuteOfDay >= 26 * 60) return "not-ready";
    if (state.fishingCastCount >= Number.MAX_SAFE_INTEGER) throw new Error("Fishing cast count reached its limit.");
    if (this.inventory.quantity(state.inventory, ITEM_ID.fishingRod) < 1) return "missing-rod";
    const zone = this.catalog.fishingZone(zoneId);
    if (!zone || zone.regionId !== state.player.regionId) return "missing-zone";
    const targetX = zone.x + zone.width / 2;
    const targetY = zone.y + zone.height / 2;
    if (Math.hypot(state.player.x - targetX, state.player.y - targetY) > FISHING_INTERACTION_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (!this.stamina.spend(state, STAMINA_COST.fishingCast)) return "insufficient-stamina";
    state.fishingCastCount += 1;
    this.runtime = {
      phase: "casting",
      zoneId,
      held: false,
      elapsedMs: 0,
      biteAtMs: 0,
      castPower: 0,
      tension: 50,
      progress: 0,
      fish: null,
      attempt: state.fishingCastCount,
      failureReason: null,
    };
    return "started";
  }

  /** Applies one press/release transition to the current one-button fishing state machine. */
  setHeld(state: GameState, held: boolean): void {
    const runtime = this.runtime;
    if (!runtime || isTerminal(runtime.phase)) return;
    const wasHeld = runtime.held;
    runtime.held = held;
    if (runtime.phase === "casting" && wasHeld && !held && runtime.castPower > 0) {
      this.commitCast(state, runtime);
      return;
    }
    if (runtime.phase === "waiting" && !wasHeld && held && this.snapshot().bite) {
      runtime.phase = "reeling";
      runtime.elapsedMs = 0;
      runtime.held = true;
    }
  }

  /** Advances the transient cast/reel simulation and atomically commits a caught fish once. */
  tick(state: GameState, deltaMs: number): FishingTickResult {
    const runtime = this.runtime;
    if (!runtime || isTerminal(runtime.phase) || !Number.isFinite(deltaMs) || deltaMs <= 0) return null;
    let remaining = Math.min(MAX_TICK_MS, deltaMs);
    while (remaining > 0 && !isTerminal(runtime.phase)) {
      const step = Math.min(50, remaining);
      remaining -= step;
      const result = this.advance(state, runtime, step);
      if (result) return result;
    }
    return null;
  }

  /** Advances one bounded fishing step so the same input is stable across rendering frame rates. */
  private advance(state: GameState, runtime: FishingRuntime, elapsed: number): FishingTickResult {
    runtime.elapsedMs += elapsed;
    if (runtime.phase === "casting") {
      if (runtime.held) runtime.castPower = Math.min(100, runtime.castPower + elapsed / 12);
      if (runtime.castPower >= 100) this.commitCast(state, runtime);
      return null;
    }
    if (runtime.phase === "waiting") {
      if (runtime.elapsedMs > runtime.biteAtMs + BITE_WINDOW_MS) {
        runtime.phase = "escaped";
        runtime.failureReason = "missed-bite";
        return { kind: "escaped" };
      }
      return null;
    }
    if (runtime.phase !== "reeling" || !runtime.fish) return null;
    const seconds = elapsed / 1_000;
    const pulse = ((Math.floor(runtime.elapsedMs / 450) + runtime.fish.pull) % 3) - 1;
    runtime.tension += (runtime.held ? 28 : -22) * seconds + pulse * runtime.fish.pull * seconds;
    const safe = runtime.tension >= FISHING_SAFE_TENSION.min && runtime.tension <= FISHING_SAFE_TENSION.max;
    runtime.progress = Math.max(0, Math.min(100, runtime.progress + (safe ? 30 : -12) * seconds));
    if (runtime.tension <= 0 || runtime.tension >= 100) {
      runtime.phase = "escaped";
      runtime.failureReason = runtime.tension >= 100 ? "line-broke" : "slack-line";
      return { kind: "escaped" };
    }
    if (runtime.progress < 100) return null;
    if (!this.inventory.add(state.inventory, runtime.fish.itemId, 1)) {
      runtime.phase = "inventory-full";
      return { kind: "inventory-full" };
    }
    runtime.phase = "caught";
    return { kind: "caught", itemId: runtime.fish.itemId };
  }

  /** Returns one defensive runtime projection for Vue and Phaser. */
  snapshot(): FishingSnapshot {
    const runtime = this.runtime;
    if (!runtime) return { ...IDLE_FISHING_SNAPSHOT };
    return {
      phase: runtime.phase,
      zoneId: runtime.zoneId,
      castPower: Math.round(runtime.castPower),
      tension: Math.round(Math.max(0, Math.min(100, runtime.tension))),
      progress: Math.round(runtime.progress),
      bite: runtime.phase === "waiting"
        && runtime.elapsedMs >= runtime.biteAtMs
        && runtime.elapsedMs <= runtime.biteAtMs + BITE_WINDOW_MS,
      resultItemId: runtime.phase === "caught" || runtime.phase === "inventory-full"
        ? runtime.fish?.itemId ?? null : null,
      failureReason: runtime.failureReason,
      saveStatus: "not-needed",
    };
  }

  /** Cancels any active or terminal fishing presentation without changing durable inventory. */
  reset(): void {
    this.runtime = null;
  }

  /** Converts a charged cast into one deterministic wait and fish selection. */
  private commitCast(state: GameState, runtime: FishingRuntime): void {
    runtime.castPower = Math.max(5, Math.round(runtime.castPower));
    const candidates = eligibleFish(state.minuteOfDay, state.weather.current, runtime.castPower);
    const pool = candidates.length > 0 ? candidates : eligibleFish(state.minuteOfDay, state.weather.current, 0);
    runtime.fish = pool[
      stableHash(
        state.worldSeed,
        state.day,
        `${runtime.zoneId}:${state.minuteOfDay}:${runtime.attempt}:${runtime.castPower}`,
      ) % pool.length
    ] ?? null;
    runtime.phase = "waiting";
    runtime.held = false;
    runtime.elapsedMs = 0;
    runtime.biteAtMs = 1_800 + stableHash(state.worldSeed, state.day, `${runtime.zoneId}:bite:${runtime.attempt}`) % 2_200;
  }
}

/** Reports whether one fishing runtime phase has finished and only awaits dismissal. */
function isTerminal(phase: FishingPhase): phase is "caught" | "escaped" | "inventory-full" {
  return phase === "caught" || phase === "escaped" || phase === "inventory-full";
}
