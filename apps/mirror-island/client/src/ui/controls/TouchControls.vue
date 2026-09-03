<script setup lang="ts">
import { computed } from "vue";
import { isWorldInputLocked } from "../../stores/game-store.ts";
import { requestWorldAction } from "../../game/world/world-input.ts";
import {
  useHeldMovement,
  type MovementDirection,
} from "./use-held-movement.ts";

const { activeDirection, activateFromKeyboard, startMoving, stopMoving } = useHeldMovement();
const locked = computed(() => isWorldInputLocked());
</script>

<template>
  <nav class="touch-controls" aria-label="移动控制">
    <button
      v-for="direction in (['up', 'left', 'down', 'right'] as MovementDirection[])"
      :key="direction"
      type="button"
      :disabled="locked"
      class="touch-controls__key"
      :class="`touch-controls__key--${direction}`"
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
  </nav>
  <button type="button" class="world-action-trigger" :disabled="locked" @click="requestWorldAction">
    使用 / 交互 <small>C</small>
  </button>
</template>
