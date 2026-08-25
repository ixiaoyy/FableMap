<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { isWorldInputLocked } from "../../stores/game-store.ts";

type DebugDirection = "up" | "down" | "left" | "right";

const DIRECTION_AXIS: Readonly<Record<DebugDirection, readonly [-1 | 0 | 1, -1 | 0 | 1]>> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const activeDirection = ref<DebugDirection | null>(null);
let movementTimer: number | null = null;

/** Dispatches one bounded movement step through the existing GameSession command boundary. */
function nudge(direction: DebugDirection): void {
  if (isWorldInputLocked()) return;
  const [xAxis, yAxis] = DIRECTION_AXIS[direction];
  dispatchLocalGameCommand({ type: "move", xAxis, yAxis, deltaMs: 100 });
}

/** Starts repeat movement while a pointer remains held over one debug direction button. */
function startMoving(direction: DebugDirection): void {
  stopMoving();
  if (isWorldInputLocked()) return;
  activeDirection.value = direction;
  nudge(direction);
  movementTimer = window.setInterval(() => nudge(direction), 80);
}

/** Stops the current repeat movement without mutating any gameplay state directly. */
function stopMoving(): void {
  if (movementTimer !== null) window.clearInterval(movementTimer);
  movementTimer = null;
  activeDirection.value = null;
}

onUnmounted(stopMoving);
</script>

<template>
  <section class="debug-controls" aria-label="调试移动控制">
    <div class="debug-controls__copy">
      <span>DEBUG MOVE</span>
      <small>按住方向移动，靠近后点击目标</small>
    </div>
    <div class="debug-dpad">
      <button
        v-for="direction in (['up', 'left', 'down', 'right'] as DebugDirection[])"
        :key="direction"
        type="button"
        class="debug-dpad__key"
        :class="`debug-dpad__key--${direction}`"
        :data-active="activeDirection === direction"
        :aria-label="`向${{ up: '上', down: '下', left: '左', right: '右' }[direction]}移动`"
        @pointerdown.prevent="startMoving(direction)"
        @pointerup="stopMoving"
        @pointercancel="stopMoving"
        @pointerleave="stopMoving"
        @click="nudge(direction)"
      >
        {{ { up: '↑', down: '↓', left: '←', right: '→' }[direction] }}
      </button>
    </div>
  </section>
</template>
