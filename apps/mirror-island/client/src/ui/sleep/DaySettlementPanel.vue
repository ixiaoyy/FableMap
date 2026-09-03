<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { gameUiState } from "../../stores/game-store.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";

const panel = ref<HTMLElement | null>(null);

/** Retries the same saved overnight candidate without charging Gold or growing crops a second time. */
function retry(): void { dispatchLocalGameCommand({ type: "retry-day-settlement" }); }

watch(() => gameUiState.daySettlement.phase, (phase) => {
  if (phase !== "idle") void nextTick(() => (panel.value?.querySelector<HTMLButtonElement>("button") ?? panel.value)?.focus());
});
</script>

<template>
  <div v-if="gameUiState.daySettlement.phase !== 'idle'" class="spring-dialog-backdrop day-settlement-backdrop">
    <section ref="panel" class="spring-dialog day-settlement" role="dialog" aria-modal="true"
      aria-labelledby="day-settlement-title" tabindex="-1" @keydown="trapDialogTab($event, panel)">
      <template v-if="gameUiState.daySettlement.phase === 'failed'">
        <h2 id="day-settlement-title">这一天还没有保存好</h2>
        <p role="alert">日期、金币和农田还停留在日结前。请重试保存；重试不会重复扣钱或重复成长。</p>
        <button type="button" class="is-primary" @click="retry">重试保存</button>
      </template>
      <template v-else>
        <h2 id="day-settlement-title">{{ gameUiState.daySettlement.reason === 'passed-out' ? '夜深了，先回家休息' : '把这一天收好' }}</h2>
        <p role="status">正在写入本地存档，请稍候…</p>
      </template>
    </section>
  </div>
</template>
