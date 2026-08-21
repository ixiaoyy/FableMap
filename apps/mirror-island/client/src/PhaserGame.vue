<script setup lang="ts">
import type Phaser from "phaser";
import { onMounted, onUnmounted, ref } from "vue";
import { startGame } from "./game/main.ts";

const gameContainer = ref<HTMLElement>();
let game: Phaser.Game | null = null;

onMounted(() => {
  if (!gameContainer.value) throw new Error("Phaser container is unavailable.");
  game = startGame(gameContainer.value);
});

onUnmounted(() => {
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div ref="gameContainer" class="game-canvas" aria-label="镜像岛共享世界画布" />
</template>
