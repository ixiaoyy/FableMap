<script setup lang="ts">
import { computed } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  getItemDefinition,
  type ItemId,
} from "../../../../domain/items/definitions.ts";
import {
  itemIconForItem,
  itemIconStyle,
} from "../../game/assets/item-icons.ts";
import {
  gameUiState,
  selectHotbarSlot,
  isWorldInputLocked,
} from "../../stores/game-store.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";

const slots = computed(() => Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => {
  const slot = gameUiState.inventory[index];
  const definition = getItemDefinition(slot?.itemId);
  return {
    index,
    definition,
    icon: definition ? itemIconForItem(definition.id) : null,
    quantity: slot?.quantity ?? 0,
    selected: gameUiState.selectedInventoryIndex === index,
    water: definition?.id === "watering-can"
      ? `${gameUiState.wateringCanWater}/${gameUiState.wateringCanCapacity}`
      : null,
  };
}));

const heldItem = computed(() => getItemDefinition(gameUiState.selectedItemId));
const locked = computed(() => isWorldInputLocked());

/** Eats one selected edible stack through the GameSession stamina owner. */
function eat(itemId: ItemId): void {
  dispatchLocalGameCommand({ type: "eat-item", itemId });
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
        :data-empty="!slot.definition"
      >
        <button
          type="button"
          class="hotbar-slot__button"
          :aria-label="`${slot.index + 1}：${slot.definition?.name ?? '空槽'}`"
          :aria-pressed="slot.selected"
          :disabled="locked"
          @click="selectHotbarSlot(slot.index)"
        >
          <span class="hotbar-slot__index">{{ slot.index + 1 }}</span>
          <span
            v-if="slot.icon"
            class="hotbar-slot__image"
            :style="itemIconStyle(slot.icon)"
            aria-hidden="true"
          />
          <span v-else-if="slot.definition" class="hotbar-slot__mark">{{ slot.definition.hotbarMark }}</span>
          <span v-if="slot.quantity > 1" class="hotbar-slot__quantity">{{ slot.quantity }}</span>
          <span v-if="slot.water" class="hotbar-slot__quantity">{{ slot.water }}</span>
          <span v-if="slot.definition" class="hotbar-slot__name">{{ slot.definition.name }}</span>
        </button>
      </li>
    </ol>
    <div v-if="heldItem" class="hotbar-held-item">
      <span>手持 · <strong>{{ heldItem.name }}</strong></span>
      <button
        v-if="heldItem.staminaRestore"
        type="button"
        :disabled="locked || gameUiState.stamina >= gameUiState.maxStamina"
        @click="eat(heldItem.id)"
      >食用 · +{{ heldItem.staminaRestore }} 体力</button>
      <span v-else-if="heldItem.id === 'watering-can'">水 {{ gameUiState.wateringCanWater }}/{{ gameUiState.wateringCanCapacity }}</span>
    </div>
  </section>
</template>
