<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { AUDIO_CUE } from "../../audio/audio-catalog.ts";
import { emitAudioCue } from "../../audio/audio-events.ts";
import { ITEM_ID } from "../../../../domain/items/definitions.ts";
import {
  WATERING_CAN_UPGRADE_DAY,
  WATERING_CAN_UPGRADE_GOLD,
  WATERING_CAN_UPGRADE_WOOD,
} from "../../../../domain/progression/definitions.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
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
const woodQuantity = computed(() => gameUiState.inventory.reduce((total, slot) => (
  total + (slot.itemId === ITEM_ID.wood ? slot.quantity : 0)
), 0));
const wateringServiceVisible = computed(() => (
  gameUiState.day >= WATERING_CAN_UPGRADE_DAY
  && gameUiState.dialogue?.npcId === "town-blacksmith"
  && !gameUiState.dialogue.dialogueId?.startsWith("event:")
));
const wateringUpgradeReady = computed(() => (
  gameUiState.wateringCanLevel === 1
  && gameUiState.gold >= WATERING_CAN_UPGRADE_GOLD
  && woodQuantity.value >= WATERING_CAN_UPGRADE_WOOD
));

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

/** Requests the fixed blacksmith watering-can upgrade without mutating projected inventory or Gold. */
function upgradeWateringCan(): void {
  dispatchLocalGameCommand({ type: "upgrade-watering-can" });
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
    <aside v-if="wateringServiceVisible" class="dialogue-panel__service">
      <div>
        <strong>水壶 Lv2 · 一次最多浇三格</strong>
        <span>{{ WATERING_CAN_UPGRADE_GOLD }}g · 木材 {{ woodQuantity }} / {{ WATERING_CAN_UPGRADE_WOOD }}</span>
      </div>
      <button
        type="button"
        :disabled="gameUiState.wateringCanLevel === 2 || !wateringUpgradeReady"
        @click="upgradeWateringCan"
      >
        {{ gameUiState.wateringCanLevel === 2 ? '已升级' : wateringUpgradeReady ? '交给昊天升级' : '材料不足' }}
      </button>
    </aside>
    <button type="button" @click="advanceConversation">{{ advanceLabel }}</button>
  </aside>
</template>
