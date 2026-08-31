import { onUnmounted, ref, type Ref } from "vue";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { isWorldInputLocked } from "../../stores/game-store.ts";

export type MovementDirection = "up" | "down" | "left" | "right";

const DIRECTION_AXIS: Readonly<Record<MovementDirection, readonly [-1 | 0 | 1, -1 | 0 | 1]>> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** Provides one shared pointer-hold and keyboard movement contract for visible direction pads. */
export function useHeldMovement(): Readonly<{
  activeDirection: Ref<MovementDirection | null>;
  activateFromKeyboard: (direction: MovementDirection, event: MouseEvent) => void;
  startMoving: (direction: MovementDirection) => void;
  stopMoving: () => void;
}> {
  const activeDirection = ref<MovementDirection | null>(null);
  let movementTimer: number | null = null;

  /** Dispatches one bounded movement step through the existing GameSession command boundary. */
  function nudge(direction: MovementDirection): void {
    if (isWorldInputLocked()) return;
    const [xAxis, yAxis] = DIRECTION_AXIS[direction];
    dispatchLocalGameCommand({ type: "move", xAxis, yAxis, deltaMs: 100 });
  }

  /** Starts repeat movement while a pointer remains held on one direction. */
  function startMoving(direction: MovementDirection): void {
    stopMoving();
    if (isWorldInputLocked()) return;
    activeDirection.value = direction;
    nudge(direction);
    movementTimer = window.setInterval(() => nudge(direction), 80);
  }

  /** Stops repeat movement and clears its visible active direction. */
  function stopMoving(): void {
    if (movementTimer !== null) window.clearInterval(movementTimer);
    movementTimer = null;
    activeDirection.value = null;
  }

  /** Preserves keyboard one-step activation without doubling completed pointer taps. */
  function activateFromKeyboard(direction: MovementDirection, event: MouseEvent): void {
    if (event.detail === 0) nudge(direction);
  }

  onUnmounted(stopMoving);
  return { activeDirection, activateFromKeyboard, startMoving, stopMoving };
}
