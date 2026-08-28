<script setup lang="ts">
import { computed } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  getItemDefinition,
} from "../../../../domain/items/definitions.ts";
import {
  itemIconForItem,
  type ItemIconDefinition,
} from "../../game/assets/item-icons.ts";
import {
  gameUiState,
  selectHotbarSlot,
} from "../../stores/game-store.ts";

const slots = computed(() => Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => {
  const slot = gameUiState.inventory[index];
  const definition = getItemDefinition(slot?.itemId);
  return {
    index,
    definition,
    icon: definition ? itemIconForItem(definition.id) : null,
    quantity: slot?.quantity ?? 0,
    selected: gameUiState.selectedHotbarIndex === index,
  };
}));

/** Converts one source-sheet frame into an integer 2× CSS sprite without generating a derivative image. */
function iconStyle(icon: ItemIconDefinition): Record<string, string> {
  return {
    backgroundImage: `url("${icon.url}")`,
    backgroundPosition: `${-icon.x * 2}px ${-icon.y * 2}px`,
    backgroundSize: `${icon.sourceWidth * 2}px ${icon.sourceHeight * 2}px`,
  };
}
</script>

<template>
  <section class="hotbar-panel" aria-label="快捷背包">
    <ol class="hotbar-slots">
      <li
        v-for="slot in slots"
        :key="slot.index"
        class="hotbar-slot"
        :data-selected="slot.selected"
      >
        <button
          type="button"
          class="hotbar-slot__button"
          :aria-label="`${slot.index + 1}：${slot.definition?.name ?? '空槽'}`"
          :aria-pressed="slot.selected"
          @click="selectHotbarSlot(slot.index)"
        >
          <span class="hotbar-slot__index">{{ slot.index + 1 }}</span>
          <span
            v-if="slot.icon"
            class="hotbar-slot__image"
            :style="iconStyle(slot.icon)"
            aria-hidden="true"
          />
          <span v-else-if="slot.definition" class="hotbar-slot__mark">{{ slot.definition.hotbarMark }}</span>
          <span v-if="slot.quantity > 1" class="hotbar-slot__quantity">{{ slot.quantity }}</span>
          <span class="hotbar-slot__name">{{ slot.definition?.name ?? '空' }}</span>
        </button>
      </li>
    </ol>
  </section>
</template>
