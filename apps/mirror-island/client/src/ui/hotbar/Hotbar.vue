<script setup lang="ts">
import { computed } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  ITEM_ID,
  getItemDefinition,
} from "../../../../shared/items/definitions.ts";
import { RECIPE_ID } from "../../../../shared/recipes/definitions.ts";
import { sendCraftIntent } from "../../network/world-connection.ts";
import { worldUiState } from "../../stores/world-store.ts";

const slots = computed(() => Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => {
  const slot = worldUiState.inventory[index];
  const definition = getItemDefinition(slot?.itemId);
  return {
    index,
    definition,
    quantity: slot?.quantity ?? 0,
  };
}));

const woodQuantity = computed(() => worldUiState.inventory
  .filter((slot) => slot.itemId === ITEM_ID.wood)
  .reduce((total, slot) => total + slot.quantity, 0));

/** Requests the reviewed wooden-axe recipe without calculating inventory changes in Vue. */
function craftWoodenAxe(): void {
  sendCraftIntent(RECIPE_ID.woodenAxe);
}
</script>

<template>
  <section class="hotbar-panel" aria-label="快捷背包">
    <ol class="hotbar-slots">
      <li v-for="slot in slots" :key="slot.index" class="hotbar-slot">
        <span class="hotbar-slot__index">{{ slot.index + 1 }}</span>
        <span v-if="slot.definition" class="hotbar-slot__mark">{{ slot.definition.hotbarMark }}</span>
        <span v-if="slot.quantity > 1" class="hotbar-slot__quantity">{{ slot.quantity }}</span>
        <span class="hotbar-slot__name">{{ slot.definition?.name ?? '空' }}</span>
      </li>
    </ol>
    <button
      type="button"
      class="craft-button"
      :disabled="woodQuantity < 3"
      @click="craftWoodenAxe"
    >
      制作木斧 <small>木材 3 / {{ woodQuantity }}</small>
    </button>
  </section>
</template>
