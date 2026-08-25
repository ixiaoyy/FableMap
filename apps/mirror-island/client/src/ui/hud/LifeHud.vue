<script setup lang="ts">
import { gameUiState } from "../../stores/game-store.ts";
</script>

<template>
  <aside class="life-hud" aria-label="生活状态">
    <span>Day {{ gameUiState.day }}</span>
    <strong>{{ gameUiState.gold }}g</strong>
  </aside>
</template>
