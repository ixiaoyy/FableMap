<script setup lang="ts">
import {
  cancelSleepConfirmation,
  confirmSleep,
  gameUiState,
} from "../../stores/game-store.ts";
</script>

<template>
  <div v-if="gameUiState.sleepConfirmationOpen" class="sleep-confirmation-backdrop">
    <section
      class="sleep-confirmation-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sleep-confirmation-title"
    >
      <h2 id="sleep-confirmation-title">是否休息？</h2>
      <div class="sleep-confirmation-panel__actions">
        <button type="button" @click="confirmSleep">是</button>
        <button type="button" @click="cancelSleepConfirmation">否</button>
      </div>
    </section>
  </div>
</template>
