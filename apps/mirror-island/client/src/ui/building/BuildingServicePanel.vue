<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { SHIPPING_BIN_BUILD_GOLD, SHIPPING_BIN_BUILD_WOOD } from "../../../../domain/building/BuildingServiceSystem.ts";
import { dispatchLocalGameCommand, getLocalGameSession } from "../../session/local-game-session.ts";
import { beginWorldPlacement, closeBuildingService, gameUiState, isStorageMutationLocked } from "../../stores/game-store.ts";
import StorageDialog from "../storage/StorageDialog.vue";

const demolishId = ref<string | null>(null);
const busy = computed(() => isStorageMutationLocked());
const bins = computed(() => gameUiState.worldObjects.filter((object) => object.kind === "shipping-bin"));
const wood = computed(() => gameUiState.inventory.reduce((total, slot) => total + (slot.itemId === "wood" ? slot.quantity : 0), 0));
const available = computed(() => {
  void gameUiState.minuteOfDay; void gameUiState.playerX; void gameUiState.playerY;
  return gameUiState.buildingServiceId !== null && getLocalGameSession().buildingServiceAvailable(gameUiState.buildingServiceId);
});
const locked = computed(() => busy.value || !available.value);

/** Opens the Farm camera preview for one paid building without spending resources before confirmation. */
function build(): void {
  if (locked.value || !gameUiState.buildingServiceId) return;
  beginWorldPlacement({ kind: "build-shipping-bin", interactionId: gameUiState.buildingServiceId });
}

/** Opens the Farm camera preview for the chosen stable building identity. */
function move(objectId: string): void {
  if (locked.value || !gameUiState.buildingServiceId) return;
  beginWorldPlacement({ kind: "move-farm-building", objectId, interactionId: gameUiState.buildingServiceId });
}

/** Confirms demolition only after the player has reviewed the selected building's inline prompt. */
function demolish(): void {
  if (locked.value || !demolishId.value || !gameUiState.buildingServiceId || bins.value.length < 2) return;
  dispatchLocalGameCommand({ type: "demolish-farm-building", interactionId: gameUiState.buildingServiceId, objectId: demolishId.value });
  demolishId.value = null;
}

watch(() => gameUiState.buildingServiceId, () => { demolishId.value = null; });
</script>

<template>
  <StorageDialog :open="gameUiState.buildingServiceId !== null" title="墨子的木匠铺" title-id="building-service-title"
    subtitle="安排农场空间" @close="closeBuildingService">
    <p v-if="!available" class="storage-error" role="status">墨子现在不在柜台服务，请营业时再来。</p>
    <article class="building-offer">
      <div><h3>加建普通出货箱</h3><p>占地 2 × 1 格，即时建成；与其他出货箱共用当天出货。</p>
        <p>{{ SHIPPING_BIN_BUILD_GOLD }}g + {{ SHIPPING_BIN_BUILD_WOOD }} 木材</p>
        <small>现有 {{ gameUiState.gold }}g · 木材 {{ wood }}</small></div>
      <button type="button" class="storage-primary" :disabled="locked || gameUiState.gold < SHIPPING_BIN_BUILD_GOLD || wood < SHIPPING_BIN_BUILD_WOOD" @click="build">选择建造位置</button>
    </article>
    <h3>农场现有出货箱</h3>
    <ul class="building-list">
      <li v-for="(bin, index) in bins" :key="bin.id">
        <div><strong>出货箱 {{ index + 1 }}</strong><small>第 {{ bin.column + 1 }} 列 · 第 {{ bin.row + 1 }} 行</small></div>
        <button type="button" :disabled="locked" @click="move(bin.id)">免费移动</button>
        <button type="button" :disabled="locked || bins.length < 2" @click="demolishId = bin.id">拆除</button>
        <div v-if="demolishId === bin.id" class="building-demolish" role="group" aria-label="确认拆除">
          <p>拆除这个出货箱，材料不退还。当天已投入的物品仍会正常结算。</p>
          <button type="button" :disabled="locked" @click="demolishId = null">保留</button>
          <button type="button" :disabled="locked || bins.length < 2" @click="demolish">确认拆除</button>
        </div>
      </li>
    </ul>
    <p class="storage-help">农场必须至少保留一个普通出货箱。</p>
  </StorageDialog>
</template>
