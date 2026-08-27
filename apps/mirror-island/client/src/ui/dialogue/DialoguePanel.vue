<script setup lang="ts">
import { computed } from "vue";
import { advanceDialogue, gameUiState } from "../../stores/game-store.ts";

const currentLine = computed(() => {
  const dialogue = gameUiState.dialogue;
  return dialogue?.lines[dialogue.lineIndex] ?? "";
});
const advanceLabel = computed(() => {
  const dialogue = gameUiState.dialogue;
  if (!dialogue) return "继续";
  return dialogue.lineIndex + 1 < dialogue.lines.length ? "下一句" : "关闭";
});
</script>

<template>
  <aside
    v-if="gameUiState.dialogue"
    class="dialogue-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialogue-speaker"
  >
    <span id="dialogue-speaker" class="dialogue-panel__speaker">{{ gameUiState.dialogue.speaker }}</span>
    <p>{{ currentLine }}</p>
    <button type="button" @click="advanceDialogue">{{ advanceLabel }} · E</button>
  </aside>
</template>
