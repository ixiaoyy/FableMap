<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import type { SlotTransferAmount } from "../../../../domain/session/commands.ts";
import { CHEST_COLOR_IDS, CHEST_SLOT_COUNT, type ChestColorId } from "../../../../domain/world/world-object-state.ts";
import { dispatchLocalGameCommand, getLocalGameSession } from "../../session/local-game-session.ts";
import { closeContainer, gameUiState, isStorageMutationLocked } from "../../stores/game-store.ts";
import SlotGrid from "../inventory/SlotGrid.vue";
import StorageDialog from "./StorageDialog.vue";
import TransferControls from "./TransferControls.vue";
import { CHEST_COLOR_PRESENTATION } from "./chest-colors.ts";

type Side = "chest" | "inventory";
const source = ref<{ side: Side; index: number } | null>(null);
const amount = ref<SlotTransferAmount>("stack");
const chest = computed(() => gameUiState.worldObjects.find((object) => object.id === gameUiState.containerId && object.kind === "chest"));
const chestSlots = computed(() => chest.value?.kind === "chest" ? chest.value.slots : []);
const color = computed(() => chest.value?.kind === "chest" ? chest.value.colorId : "default");
const busy = computed(() => isStorageMutationLocked());
const reachable = computed(() => {
  void gameUiState.playerX; void gameUiState.playerY; void gameUiState.worldObjects;
  return gameUiState.containerId !== null && getLocalGameSession().canInteractWorldObject(gameUiState.containerId);
});
const locked = computed(() => busy.value || !reachable.value);
const selectedName = computed(() => {
  if (!source.value) return "";
  const slots = source.value.side === "chest" ? chestSlots.value : gameUiState.inventory;
  return getItemDefinition(slots[source.value.index]?.itemId)?.name ?? "";
});

/** Selects a source on either surface, then sends a same-side or cross-container destination intent. */
function pick(side: Side, payload: { index: number; amount?: SlotTransferAmount }): void {
  if (locked.value) return;
  if (payload.amount) amount.value = payload.amount;
  if (!source.value) {
    const slots = side === "chest" ? chestSlots.value : gameUiState.inventory;
    if (getItemDefinition(slots[payload.index]?.itemId)) source.value = { side, index: payload.index };
    return;
  }
  if (source.value.side === side && source.value.index === payload.index) { source.value = null; return; }
  transfer(source.value.side, source.value.index, side, payload.index, amount.value);
}

/** Routes all transfer modes to typed commands; both arrays remain immutable UI projections. */
function transfer(from: Side, sourceIndex: number, to: Side, targetIndex: number, transferAmount: SlotTransferAmount): void {
  const objectId = gameUiState.containerId;
  if (!objectId || locked.value) return;
  const result = from === to
    ? from === "inventory"
      ? dispatchLocalGameCommand({ type: "move-inventory", sourceIndex, targetIndex, amount: transferAmount })
      : dispatchLocalGameCommand({ type: "move-container-item", objectId, sourceIndex, targetIndex, amount: transferAmount })
    : dispatchLocalGameCommand({ type: "transfer-container-item", objectId, direction: from === "inventory" ? "to-chest" : "from-chest", sourceIndex, targetIndex, amount: transferAmount });
  if (result?.tone === "success") source.value = null;
}

/** Resolves drag targets only within the two grids owned by this open container. */
function drop(from: Side, payload: { sourceIndex: number; targetIndex: number; targetGrid: string; amount: SlotTransferAmount }): void {
  if (payload.targetGrid !== "chest" && payload.targetGrid !== "container-backpack") return;
  transfer(from, payload.sourceIndex, payload.targetGrid === "chest" ? "chest" : "inventory", payload.targetIndex, payload.amount);
}

/** Applies a single reviewed bulk operation, leaving slot ordering to its domain owner. */
function bulk(type: "add-to-existing-stacks" | "sort-container" | "sort-inventory"): void {
  if (locked.value || !gameUiState.containerId) return;
  if (type === "sort-inventory") dispatchLocalGameCommand({ type });
  else dispatchLocalGameCommand({ type, objectId: gameUiState.containerId });
  source.value = null;
}

/** Saves a free closed-palette color change on the existing stable chest identity. */
function setColor(colorId: ChestColorId): void {
  if (locked.value || !gameUiState.containerId) return;
  dispatchLocalGameCommand({ type: "set-chest-color", objectId: gameUiState.containerId, colorId });
}

/** Cancels the transient transfer selection before Escape is allowed to close the container. */
function escapeSelection(event: KeyboardEvent): void {
  if (event.key === "Escape" && source.value) { event.preventDefault(); event.stopPropagation(); source.value = null; }
}

watch(() => gameUiState.containerId, () => { source.value = null; amount.value = "stack"; });
</script>

<template>
  <StorageDialog :open="gameUiState.containerId !== null" title="普通箱" title-id="container-title"
    subtitle="36 格 · 整理一天的收获" @close="closeContainer">
    <div @keydown="escapeSelection">
      <p v-if="!reachable" class="storage-error" role="status">箱子已不在可操作的距离内，请合上后重新靠近。</p>
      <details class="chest-color-picker">
        <summary tabindex="0">箱子颜色：{{ CHEST_COLOR_PRESENTATION[color].name }} · 免费更换</summary>
        <div class="chest-color-swatches" role="group" aria-label="箱子颜色">
          <button v-for="colorId in CHEST_COLOR_IDS" :key="colorId" type="button" :disabled="locked"
            :aria-label="CHEST_COLOR_PRESENTATION[colorId].name" :aria-pressed="color === colorId"
            :title="CHEST_COLOR_PRESENTATION[colorId].name" :style="{ '--chest-color': CHEST_COLOR_PRESENTATION[colorId].hex }"
            @click="setColor(colorId)"><span aria-hidden="true">{{ color === colorId ? '✓' : '' }}</span></button>
        </div>
      </details>
      <TransferControls :amount="amount" :selected="source !== null" :disabled="locked" @amount="amount = $event" @cancel="source = null" />
      <p class="storage-selection" aria-live="polite">{{ selectedName ? `已选 ${selectedName}，请选择箱内或背包目标格。` : '先选物品，再选目标格；支持拖动、单件和半组。' }}</p>
      <div class="storage-toolbar"><h3>箱内物品</h3>
        <button type="button" :disabled="locked" @click="bulk('add-to-existing-stacks')">放入已有堆叠</button>
        <button type="button" :disabled="locked" @click="bulk('sort-container')">整理箱子</button>
      </div>
      <SlotGrid grid-id="chest" label="箱子" :slots="chestSlots" :capacity="CHEST_SLOT_COUNT" :disabled="locked"
        :selected-index="source?.side === 'chest' ? source.index : null" :amount="amount"
        @pick="pick('chest', $event)" @drop="drop('chest', $event)" />
      <div class="storage-toolbar"><h3>随身背包 · {{ gameUiState.inventoryCapacity }} 格</h3>
        <button type="button" :disabled="locked" @click="bulk('sort-inventory')">整理背包</button>
      </div>
      <SlotGrid grid-id="container-backpack" label="背包" :slots="gameUiState.inventory" :capacity="gameUiState.inventoryCapacity"
        :selected-index="source?.side === 'inventory' ? source.index : null" :amount="amount" :disabled="locked" hotbar
        @pick="pick('inventory', $event)" @drop="drop('inventory', $event)" />
      <p class="storage-help">空箱可以回收；装有物品的箱子可以用斧、镐或锄连续敲击移动。</p>
    </div>
  </StorageDialog>
</template>
