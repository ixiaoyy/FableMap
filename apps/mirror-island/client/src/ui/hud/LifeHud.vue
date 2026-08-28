<script setup lang="ts">
import { computed } from "vue";
import { formatGameMinute } from "../../../../domain/time/game-time.ts";
import { gameUiState } from "../../stores/game-store.ts";

const clockLabel = computed(() => formatGameMinute(gameUiState.minuteOfDay));
</script>

<template>
  <aside class="life-hud" aria-label="生活状态">
    <span>Day {{ gameUiState.day }}</span>
    <span>{{ clockLabel }}</span>
    <strong>{{ gameUiState.gold }}g</strong>
  </aside>
</template>
