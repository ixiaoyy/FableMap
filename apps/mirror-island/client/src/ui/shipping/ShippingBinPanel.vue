<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import { dispatchLocalGameCommand, getLocalGameSession } from "../../session/local-game-session.ts";
import { closeShippingBin, gameUiState, isStorageMutationLocked } from "../../stores/game-store.ts";
import StorageDialog from "../storage/StorageDialog.vue";
import SlotGrid from "../inventory/SlotGrid.vue";
import ItemIcon from "../items/ItemIcon.vue";

const selectedIndex = ref<number | null>(null);
const busy = computed(() => isStorageMutationLocked());
const reachable = computed(() => {
  void gameUiState.playerX; void gameUiState.playerY; void gameUiState.worldObjects;
  return gameUiState.shippingBinId !== null && getLocalGameSession().canInteractWorldObject(gameUiState.shippingBinId);
});
const locked = computed(() => busy.value || !reachable.value);
const selected = computed(() => selectedIndex.value === null ? null : gameUiState.inventory[selectedIndex.value]);
const item = computed(() => getItemDefinition(selected.value?.itemId));
const lastItem = computed(() => getItemDefinition(gameUiState.lastShipment?.itemId));

/** Selects a backpack source without shipping until one of the explicit quantity actions is confirmed. */
function select(payload: { index: number }): void {
  if (locked.value) return;
  selectedIndex.value = payload.index;
}

/** Sends one or the entire selected stack to the shared queue through the current shipping building. */
function ship(quantity: "one" | "stack"): void {
  if (locked.value || selectedIndex.value === null || !gameUiState.shippingBinId || !item.value?.canShip) return;
  dispatchLocalGameCommand({ type: "ship-item", objectId: gameUiState.shippingBinId, sourceIndex: selectedIndex.value, quantity });
}

/** Withdraws only the last full global shipment; domain capacity checks preserve it on failure. */
function reclaim(): void {
  if (locked.value || !gameUiState.shippingBinId || !gameUiState.lastShipment) return;
  dispatchLocalGameCommand({ type: "reclaim-last-shipment", objectId: gameUiState.shippingBinId });
}

watch(() => gameUiState.shippingBinId, () => { selectedIndex.value = null; });
</script>

<template>
  <StorageDialog :open="gameUiState.shippingBinId !== null" title="农场出货" title-id="shipping-title"
    subtitle="今天投入 · 睡醒到账" @close="closeShippingBin">
    <p class="storage-help">所有出货箱共用当天出货。只能取回最后一次投入，较早的物品会在今晚结算。</p>
    <p v-if="!reachable" class="storage-error" role="status">请重新靠近出货箱后操作。</p>
    <article class="shipping-last">
      <h3>最后一次投入</h3>
      <template v-if="gameUiState.lastShipment && lastItem">
        <ItemIcon :item-id="lastItem.id" /><span>{{ lastItem.name }} × {{ gameUiState.lastShipment.quantity }}</span>
        <button type="button" :disabled="locked" @click="reclaim">整组取回</button>
      </template>
      <span v-else>没有可取回的物品。</span>
    </article>
    <h3>从背包选择</h3>
    <SlotGrid grid-id="shipping-backpack" label="出货背包" :slots="gameUiState.inventory" :capacity="gameUiState.inventoryCapacity"
      :selected-index="selectedIndex" :disabled="locked" hotbar @pick="select" />
    <div class="shipping-actions" aria-live="polite">
      <span v-if="item">{{ item.name }} × {{ selected?.quantity }} <strong v-if="!item.canShip">暂不可出货</strong></span>
      <span v-else>选择要出货的物品。</span>
      <button type="button" :disabled="locked || !item?.canShip" @click="ship('one')">投入一个</button>
      <button type="button" class="storage-primary" :disabled="locked || !item?.canShip" @click="ship('stack')">投入整组</button>
    </div>
  </StorageDialog>
</template>
