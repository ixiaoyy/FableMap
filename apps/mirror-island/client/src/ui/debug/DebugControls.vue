<script setup lang="ts">
import { computed } from "vue";
import { gameUiState } from "../../stores/game-store.ts";
import {
  useHeldMovement,
  type MovementDirection,
} from "../controls/use-held-movement.ts";

const { activeDirection, activateFromKeyboard, startMoving, stopMoving } = useHeldMovement();
const positionLabel = computed(() => (
  `${gameUiState.regionId || "未加载"} · ${Math.round(gameUiState.playerX)}, ${Math.round(gameUiState.playerY)}`
));
</script>

<template>
  <section class="debug-controls" aria-label="调试移动控制">
    <div class="debug-controls__copy">
      <span>DEBUG MOVE</span>
      <small>按住方向移动，靠近后点击目标</small>
      <small>{{ positionLabel }}</small>
    </div>
    <div class="debug-dpad">
      <button
        v-for="direction in (['up', 'left', 'down', 'right'] as MovementDirection[])"
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
        @click="activateFromKeyboard(direction, $event)"
      >
        {{ { up: '↑', down: '↓', left: '←', right: '→' }[direction] }}
      </button>
    </div>
  </section>
</template>
