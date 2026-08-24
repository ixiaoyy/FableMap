<script setup lang="ts">
import { clearDialogue, gameUiState } from "../../stores/game-store.ts";

/** Closes the current ephemeral dialogue without mutating GameSession state. */
function closeDialogue(): void {
  clearDialogue();
}
</script>

<template>
  <aside v-if="gameUiState.dialogue" class="dialogue-panel" aria-live="polite">
    <span class="dialogue-panel__speaker">{{ gameUiState.dialogue.speaker }}</span>
    <p>{{ gameUiState.dialogue.text }}</p>
    <button type="button" @click="closeDialogue">继续</button>
  </aside>
</template>
