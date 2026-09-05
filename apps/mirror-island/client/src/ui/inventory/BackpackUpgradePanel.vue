<script setup lang="ts">
import { computed, watch } from "vue";
import { nextBackpackUpgrade } from "../../../../domain/progression/definitions.ts";
import { dispatchLocalGameCommand, getLocalGameSession } from "../../session/local-game-session.ts";
import { closeBackpackUpgrade, gameUiState, isStorageMutationLocked } from "../../stores/game-store.ts";
import StorageDialog from "../storage/StorageDialog.vue";

const offer = computed(() => nextBackpackUpgrade(gameUiState.inventoryCapacity));
const busy = computed(() => isStorageMutationLocked());
const available = computed(() => {
  void gameUiState.inventoryCapacity; void gameUiState.playerX; void gameUiState.playerY;
  return gameUiState.backpackUpgradeId !== null && getLocalGameSession().backpackServiceAvailable(gameUiState.backpackUpgradeId);
});

/** Purchases only the currently unlocked display offer through the domain's sequential upgrade rule. */
function buy(): void {
  if (busy.value || !available.value || !gameUiState.backpackUpgradeId || !offer.value) return;
  dispatchLocalGameCommand({ type: "buy-backpack-upgrade", interactionId: gameUiState.backpackUpgradeId });
}

watch(() => gameUiState.inventoryCapacity, (capacity) => { if (capacity === 36) closeBackpackUpgrade(); });
</script>

<template>
  <StorageDialog :open="gameUiState.backpackUpgradeId !== null" title="柜台边的新背包" title-id="backpack-upgrade-title"
    subtitle="华强种子店 · 背包陈列" narrow @close="closeBackpackUpgrade">
    <template v-if="offer">
      <div class="backpack-upgrade-size">{{ gameUiState.inventoryCapacity }} <span>→</span> {{ offer.capacity }} 格</div>
      <p>多一行空间，带走更多收获。已有物品保持原位；合上背包后可轮换 12 格快捷行。</p>
      <p>售价 <strong>{{ offer.gold }}g</strong> · 现有 {{ gameUiState.gold }}g</p>
      <p v-if="!available" class="storage-error" role="status">请在背包陈列点购买。</p>
      <button type="button" class="storage-primary" :disabled="busy || !available || gameUiState.gold < offer.gold" @click="buy">
        {{ gameUiState.gold >= offer.gold ? `购买 ${offer.gold}g` : `还差 ${offer.gold - gameUiState.gold}g` }}
      </button>
    </template>
  </StorageDialog>
</template>
