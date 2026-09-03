<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { staminaAfterSleep } from "../../../../domain/stamina/definitions.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";
import {
  cancelSleepConfirmation,
  confirmSleep,
  gameUiState,
} from "../../stores/game-store.ts";
const panel = ref<HTMLElement | null>(null);
const recovery = computed(() => staminaAfterSleep(gameUiState.minuteOfDay));

/** Cancels a bedtime confirmation without changing the day and restores keyboard control. */
function cancel(): void { cancelSleepConfirmation(); restoreWorldFocus(); }

watch(() => gameUiState.sleepConfirmationOpen, (open) => {
  if (open) void nextTick(() => panel.value?.querySelector<HTMLButtonElement>("button")?.focus());
});
</script>

<template>
  <div v-if="gameUiState.sleepConfirmationOpen" class="sleep-confirmation-backdrop">
    <section
      ref="panel"
      class="sleep-confirmation-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sleep-confirmation-title"
      tabindex="-1"
      @keydown.esc.stop.prevent="cancel"
      @keydown="trapDialogTab($event, panel)"
    >
      <h2 id="sleep-confirmation-title">是否休息？</h2>
      <p>睡醒后进入次日 06:00，体力恢复到 {{ recovery }}。</p>
      <div class="sleep-confirmation-panel__actions">
        <button type="button" @click="confirmSleep">休息并保存</button>
        <button type="button" @click="cancel">再待一会儿</button>
      </div>
    </section>
  </div>
</template>
