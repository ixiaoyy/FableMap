<script setup lang="ts">
import { computed } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  getItemDefinition,
  type ItemId,
} from "../../../../domain/items/definitions.ts";
import ItemIcon from "../items/ItemIcon.vue";
import { isToolArtPreviewEnabled } from "../../game/assets/tool-art-candidate.ts";
import {
  gameUiState,
  selectHotbarSlot,
  isWorldInputLocked,
  beginWorldPlacement,
} from "../../stores/game-store.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";

const slots = computed(() => Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => {
  const slot = gameUiState.inventory[index];
  const definition = getItemDefinition(slot?.itemId);
  return {
    index,
    definition,
    quantity: slot?.quantity ?? 0,
    selected: gameUiState.selectedInventoryIndex === index,
    water: definition?.id === "watering-can"
      ? `${gameUiState.wateringCanWater}/${gameUiState.wateringCanCapacity}`
      : null,
  };
}));

const heldItem = computed(() => getItemDefinition(gameUiState.selectedItemId));
const locked = computed(() => isWorldInputLocked());
const keyLabels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
const artPreview = isToolArtPreviewEnabled();

/** Eats one selected edible stack through the GameSession stamina owner. */
function eat(itemId: ItemId): void {
  dispatchLocalGameCommand({ type: "eat-item", itemId });
}

/** Rotates a complete persisted hotbar row using the same command as desktop Tab shortcuts. */
function rotate(direction: 1 | -1): void {
  if (locked.value || gameUiState.inventoryCapacity <= 12) return;
  dispatchLocalGameCommand({ type: "rotate-hotbar-row", direction });
}

/** Starts placement for the selected chest slot without consuming it during preview. */
function placeChest(): void {
  if (locked.value || gameUiState.selectedInventoryIndex === null) return;
  beginWorldPlacement({ kind: "chest", inventoryIndex: gameUiState.selectedInventoryIndex });
}

</script>

<template>
  <section class="hotbar-panel" aria-label="快捷背包">
    <div class="hotbar-caption">
      <span><small class="hotbar-caption__label">{{ artPreview ? 'A · 美术预览' : heldItem ? '手持' : '随身' }}</small>{{ heldItem?.name ?? '快捷背包' }}</span>
      <small class="hotbar-caption__keyboard">数字键 / 滚轮切换</small>
      <small class="hotbar-caption__touch">左右滑动 · 点选工具</small>
    </div>
    <ol class="hotbar-slots">
      <li
        v-for="slot in slots"
        :key="slot.index"
        class="hotbar-slot"
        :data-selected="slot.selected"
        :data-empty="!slot.definition"
      >
        <button
          type="button"
          class="hotbar-slot__button"
          :aria-label="`${slot.index + 1}：${slot.definition?.name ?? '空槽'}`"
          :title="`${keyLabels[slot.index]} · ${slot.definition?.name ?? '空槽'}`"
          :aria-pressed="slot.selected"
          :disabled="locked"
          @click="selectHotbarSlot(slot.index)"
        >
          <span class="hotbar-slot__index">{{ keyLabels[slot.index] }}</span>
          <ItemIcon v-if="slot.definition" :item-id="slot.definition.id" :scale="3" class="hotbar-slot__image" />
          <span v-if="slot.quantity > 1" class="hotbar-slot__quantity">{{ slot.quantity }}</span>
          <span v-if="slot.water" class="hotbar-slot__water">{{ slot.water }}</span>
        </button>
      </li>
    </ol>
    <div v-if="gameUiState.inventoryCapacity > 12" class="hotbar-row-controls" role="group" aria-label="轮换快捷行">
      <button type="button" :disabled="locked" @click="rotate(-1)">← 上一行</button>
      <span>12 格快捷行 · 共 {{ gameUiState.inventoryCapacity / 12 }} 行</span>
      <button type="button" :disabled="locked" @click="rotate(1)">下一行 →</button>
    </div>
    <div v-if="heldItem?.staminaRestore || heldItem?.id === 'watering-can' || heldItem?.placement?.kind === 'chest'" class="hotbar-held-item">
      <span v-if="heldItem.staminaRestore">恢复体力</span>
      <span v-else-if="heldItem.id === 'watering-can'">靠近水边可以装满</span>
      <span v-else>在农场选择位置</span>
      <button
        v-if="heldItem.staminaRestore"
        type="button"
        :disabled="locked || gameUiState.stamina >= gameUiState.maxStamina"
        @click="eat(heldItem.id)"
      >食用 · +{{ heldItem.staminaRestore }} 体力</button>
      <span v-else-if="heldItem.id === 'watering-can'">水 {{ gameUiState.wateringCanWater }}/{{ gameUiState.wateringCanCapacity }}</span>
      <button v-else-if="heldItem.placement?.kind === 'chest'" type="button" :disabled="locked" @click="placeChest">摆放</button>
    </div>
  </section>
</template>
