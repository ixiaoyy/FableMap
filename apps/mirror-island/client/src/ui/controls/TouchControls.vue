<script setup lang="ts">
import {
  useHeldMovement,
  type MovementDirection,
} from "./use-held-movement.ts";

const { activeDirection, activateFromKeyboard, startMoving, stopMoving } = useHeldMovement();
</script>

<template>
  <nav class="touch-controls" aria-label="移动控制">
    <button
      v-for="direction in (['up', 'left', 'down', 'right'] as MovementDirection[])"
      :key="direction"
      type="button"
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
</template>
