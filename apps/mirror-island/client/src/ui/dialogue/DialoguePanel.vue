<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { AUDIO_CUE } from "../../audio/audio-catalog.ts";
import { emitAudioCue } from "../../audio/audio-events.ts";
import {
  advanceDialogue,
  closeDialogue,
  gameUiState,
} from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";

const panel = ref<HTMLElement | null>(null);
const currentLine = computed(() => {
  const dialogue = gameUiState.dialogue;
  return dialogue?.lines[dialogue.lineIndex] ?? "";
});
const advanceLabel = computed(() => {
  const dialogue = gameUiState.dialogue;
  if (!dialogue) return "继续";
  return dialogue.lineIndex + 1 < dialogue.lines.length ? "下一句" : "关闭";
});
const lineProgress = computed(() => {
  const dialogue = gameUiState.dialogue;
  return dialogue ? `${dialogue.lineIndex + 1} / ${dialogue.lines.length}` : "";
});

/** Advances one line and returns focus to the world after the final line. */
function advanceConversation(): void {
  const dialogue = gameUiState.dialogue;
  const closing = dialogue !== null && dialogue.lineIndex + 1 >= dialogue.lines.length;
  if (!closing) emitAudioCue(AUDIO_CUE.dialoguePage);
  advanceDialogue();
  if (closing) restoreWorldFocus();
}

/** Closes the current conversation immediately and restores world focus. */
function closeConversation(): void {
  closeDialogue();
  restoreWorldFocus();
}

watch(() => gameUiState.dialogue, (dialogue, previous) => {
  if (dialogue && !previous) void nextTick(() => panel.value?.focus());
});
</script>

<template>
  <aside
    ref="panel"
    v-if="gameUiState.dialogue"
    class="dialogue-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialogue-speaker"
    tabindex="-1"
    @keydown.esc.stop.prevent="closeConversation"
  >
    <span id="dialogue-speaker" class="dialogue-panel__speaker">{{ gameUiState.dialogue.speaker }}</span>
    <span class="dialogue-panel__progress" :aria-label="`当前对话 ${lineProgress}`">{{ lineProgress }}</span>
    <p>{{ currentLine }}</p>
    <button type="button" @click="advanceConversation">{{ advanceLabel }}</button>
  </aside>
</template>
