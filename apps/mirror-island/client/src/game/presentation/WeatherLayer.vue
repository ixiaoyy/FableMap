<script setup lang="ts">
import { computed } from "vue";
import { gameUiState } from "../../stores/game-store.ts";
import { isOutdoorRegion } from "../world/region-environment.ts";

const visible = computed(() => isOutdoorRegion(gameUiState.regionId) && gameUiState.weather !== "sunny");
const particles = Array.from({ length: 28 }, (_, index) => ({
  left: ((index * 37) % 103) + "%",
  delay: -(index % 11) / 3 + "s",
  duration: (0.6 + (index % 5) * 0.13) + "s",
  top: ((index * 17) % 97) + "%",
}));
</script>

<template>
  <div v-if="visible" class="weather-layer" :data-weather="gameUiState.weather" aria-hidden="true">
    <i v-for="(particle, index) in particles" :key="index"
      :style="{ left: particle.left, top: particle.top, '--particle-delay': particle.delay, '--particle-duration': particle.duration }" />
  </div>
</template>
