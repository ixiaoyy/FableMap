<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import type { SlotTransferAmount } from "../../../../domain/session/commands.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import {
  beginWorldPlacement, closeBackpack, gameUiState, isStorageMutationLocked, isWorldInputLocked,
  openBackpack, openCrafting, selectInventorySlot,
} from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";
import StorageDialog from "../storage/StorageDialog.vue";
import TransferControls from "../storage/TransferControls.vue";
import SlotGrid from "./SlotGrid.vue";
import ItemIcon from "../items/ItemIcon.vue";

const selectedIndex = ref<number | null>(null);
const amount = ref<SlotTransferAmount>("stack");
const busy = computed(() => isStorageMutationLocked());
const selected = computed(() => selectedIndex.value === null ? null : gameUiState.inventory[selectedIndex.value]);
const selectedItem = computed(() => getItemDefinition(selected.value?.itemId));
const occupiedSlots = computed(() => gameUiState.inventory.filter((slot) => slot.itemId !== "").length);
const tools = computed(() => gameUiState.inventory.map((slot) => getItemDefinition(slot.itemId))
  .filter((item) => item?.category === "tool").slice(0, 5));
const categoryNames = { resource: "采集材料", tool: "农场工具", seed: "作物种子", crop: "农场收获", fish: "新鲜渔获", placeable: "农场物件" } as const;
const selectedDescription = computed(() => {
  const item = selectedItem.value;
  if (!item) return "选择一件物品，查看用途与操作。";
  const descriptions: Readonly<Record<string, string>> = {
    axe: "砍伐树木，清除树桩，收集建造所需的木材。", hoe: "整理土地，为新一季作物留出位置。",
    pickaxe: "敲开地表石块，收集石料。", scythe: "清理杂草，收集植物纤维。",
    "watering-can": "照料已播种的土地；水用完后到水边补充。", "fishing-rod": "在可以垂钓的水域抛竿，等待鱼儿上钩。",
    chest: "摆在合适的空地，收纳暂时用不到的物资。",
  };
  return descriptions[item.id] ?? (item.category === "seed" ? "种在整理好的土地里，浇水等待收获。"
    : item.category === "resource" ? "留作制作与建设的材料，也可以存进箱子。"
      : "来自岛上生活的新收获。可以保留，也可以投入出货箱。");
});

/** Selects a source or dispatches one exact destination move; failed commands retain the source selection. */
function pick(payload: { index: number; amount?: SlotTransferAmount }): void {
  if (busy.value) return;
  if (payload.amount) amount.value = payload.amount;
  if (selectedIndex.value === null) {
    if (getItemDefinition(gameUiState.inventory[payload.index]?.itemId)) selectedIndex.value = payload.index;
    return;
  }
  if (selectedIndex.value === payload.index) { selectedIndex.value = null; return; }
  move(selectedIndex.value, payload.index, amount.value);
}

/** Issues a domain slot transfer for taps or a completed pointer drag without changing the read model. */
function move(sourceIndex: number, targetIndex: number, transferAmount: SlotTransferAmount): void {
  if (busy.value) return;
  const result = dispatchLocalGameCommand({ type: "move-inventory", sourceIndex, targetIndex, amount: transferAmount });
  if (result?.tone === "success") selectedIndex.value = null;
}

/** Accepts only drops back onto this backpack, ignoring outside or unrelated panel targets. */
function drop(payload: { sourceIndex: number; targetIndex: number; targetGrid: string; amount: SlotTransferAmount }): void {
  if (payload.targetGrid === "backpack") move(payload.sourceIndex, payload.targetIndex, payload.amount);
}

/** Requests item-owned sorting while preserving the exact slots of tools. */
function sort(): void {
  if (busy.value) return;
  dispatchLocalGameCommand({ type: "sort-inventory" });
  selectedIndex.value = null;
}

/** Selects an item only from the currently active twelve-slot row for world use. */
function hold(): void {
  if (busy.value || selectedIndex.value === null || selectedIndex.value >= 12) return;
  const index = selectedIndex.value;
  closeBackpack();
  selectInventorySlot(index);
  void nextTick(restoreWorldFocus);
}

/** Starts the read-only chest placement preview for the chosen inventory slot. */
function place(): void {
  if (busy.value || selectedIndex.value === null || selectedIndex.value >= 12 || selectedItem.value?.placement?.kind !== "chest") return;
  beginWorldPlacement({ kind: "chest", inventoryIndex: selectedIndex.value });
}

/** Cancels a pending two-stage selection first, then closes the panel on a second Escape. */
function escapeSelection(event: KeyboardEvent): void {
  if (event.key !== "Escape" || selectedIndex.value === null) return;
  event.stopPropagation(); event.preventDefault(); selectedIndex.value = null;
}

watch(() => gameUiState.backpackOpen, () => { selectedIndex.value = null; amount.value = "stack"; });
</script>

<template>
  <button class="backpack-trigger" type="button" aria-haspopup="dialog" :aria-expanded="gameUiState.backpackOpen"
    :disabled="isWorldInputLocked()" @click="openBackpack"><span aria-hidden="true">▣</span>背包 {{ gameUiState.inventoryCapacity }}</button>
  <StorageDialog :open="gameUiState.backpackOpen" title="随身背包" title-id="backpack-title"
    subtitle="把今天的收获带在身边" @close="closeBackpack">
    <template #navigation>
      <nav class="storage-tabs" aria-label="背包与制作">
        <button type="button" class="is-active" aria-current="page">背包<span>{{ gameUiState.inventoryCapacity }}</span></button>
        <button type="button" :disabled="busy" @click="openCrafting">制作</button>
        <span class="storage-wallet"><span>金币</span><strong>{{ gameUiState.gold }}</strong><small>g</small></span>
      </nav>
    </template>
    <div class="inventory-layout" @keydown="escapeSelection">
      <div class="inventory-main">
        <div class="inventory-actions">
          <TransferControls :amount="amount" :selected="selectedIndex !== null" :disabled="busy"
            @amount="amount = $event" @cancel="selectedIndex = null" />
          <button type="button" class="storage-sort-button" :disabled="busy" @click="sort">整理</button>
        </div>
        <div class="inventory-section-heading"><h3>随身物品</h3><span>{{ occupiedSlots }} / {{ gameUiState.inventoryCapacity }} 格</span></div>
        <SlotGrid grid-id="backpack" label="背包" :slots="gameUiState.inventory" :capacity="gameUiState.inventoryCapacity"
          :selected-index="selectedIndex" :amount="amount" :disabled="busy" hotbar @pick="pick" @drop="drop" />
        <div class="inventory-grid-caption"><span class="inventory-row-key" />前 12 格为当前快捷栏</div>
        <p class="storage-selection" aria-live="polite">{{ selectedItem ? `已选 ${selectedItem.name}，点选目标格放入。` : '点选物品，再选目标格；也可以拖动整理。' }}</p>
        <div class="inventory-shortcuts"><span><kbd>方向键</kbd> 选择格子</span><span><kbd>Enter</kbd> 拿起 / 放下</span></div>
      </div>
      <aside class="inventory-detail" aria-label="物品详情">
        <template v-if="selectedItem">
          <div class="inventory-detail__art"><ItemIcon :item-id="selectedItem.id" :scale="4" /></div>
          <span class="inventory-detail__category">{{ categoryNames[selectedItem.category] }}</span>
          <h3>{{ selectedItem.name }}</h3>
          <p>{{ selectedDescription }}</p>
          <dl class="inventory-detail__facts"><div><dt>数量</dt><dd>{{ selected?.quantity }}</dd></div>
            <div v-if="selectedItem.id === 'watering-can'"><dt>水量</dt><dd>{{ gameUiState.wateringCanWater }} / {{ gameUiState.wateringCanCapacity }}</dd></div>
            <div v-if="selectedItem.staminaRestore"><dt>食用恢复</dt><dd>+{{ selectedItem.staminaRestore }} 体力</dd></div>
          </dl>
          <div class="inventory-detail__actions">
            <button v-if="selectedIndex !== null && selectedIndex < 12" type="button" class="storage-primary" :disabled="busy" @click="hold">拿在手上</button>
            <button v-if="selectedItem.placement && selectedIndex !== null && selectedIndex < 12" type="button" :disabled="busy" @click="place">摆放普通箱</button>
          </div>
          <p v-if="selectedIndex !== null && selectedIndex >= 12" class="storage-help">移到快捷栏，或合上背包后轮换行，即可使用。</p>
        </template>
        <template v-else>
          <div class="inventory-detail__art inventory-detail__art--empty"><ItemIcon :item-id="tools[0]?.id ?? 'watering-can'" :scale="4" /></div>
          <span class="inventory-detail__category">农场日常</span>
          <h3>准备好今天的行囊</h3>
          <p>选中物品，查看用途与操作。</p>
          <div class="inventory-toolkit" aria-label="随身工具">
            <ItemIcon v-for="tool in tools" :key="tool!.id" :item-id="tool!.id" />
          </div>
          <span class="inventory-detail__footnote">{{ tools.length }} 件工具 · 随时出发</span>
        </template>
      </aside>
    </div>
  </StorageDialog>
</template>
