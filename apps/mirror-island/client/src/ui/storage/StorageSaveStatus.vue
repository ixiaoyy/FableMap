<script setup lang="ts">
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { gameUiState } from "../../stores/game-store.ts";
import StorageDialog from "./StorageDialog.vue";

/** Retries the retained transaction; it neither repeats input commands nor recalculates their result. */
function retry(): void { dispatchLocalGameCommand({ type: "retry-storage-save" }); }
</script>

<template>
  <p v-if="gameUiState.storageSave.phase === 'saving'" class="storage-saving" role="status">正在保存…</p>
  <StorageDialog :open="gameUiState.storageSave.phase === 'failed'" title="这次操作还没有保存好"
    title-id="storage-save-error-title" :closable="false" narrow blocking>
    <p role="alert">{{ gameUiState.storageSave.feedback?.message || '本地存档写入失败。物品仍保留在原来的状态，请重试保存这次操作。' }}</p>
    <p class="storage-help">重试不会重复扣材料、金币或物品。</p>
    <button class="storage-primary" type="button" @click="retry">重试保存</button>
  </StorageDialog>
</template>
