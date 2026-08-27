<script setup lang="ts">
import { computed } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  ITEM_ID,
  getItemDefinition,
} from "../../../../domain/items/definitions.ts";
import { RECIPE_ID } from "../../../../domain/recipes/definitions.ts";
import {
  candidateIconForItem,
  isToolArtCandidateEnabled,
  type CandidateIconDefinition,
} from "../../game/assets/tool-art-candidate.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { gameUiState } from "../../stores/game-store.ts";

const toolArtCandidateEnabled = isToolArtCandidateEnabled();

const slots = computed(() => Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => {
  const slot = gameUiState.inventory[index];
  const definition = getItemDefinition(slot?.itemId);
  return {
    index,
    definition,
    icon: toolArtCandidateEnabled && definition ? candidateIconForItem(definition.id) : null,
    quantity: slot?.quantity ?? 0,
  };
}));

const woodQuantity = computed(() => gameUiState.inventory
  .filter((slot) => slot.itemId === ITEM_ID.wood)
  .reduce((total, slot) => total + slot.quantity, 0));

/** Requests the reviewed wooden-axe recipe without calculating inventory changes in Vue. */
function craftWoodenAxe(): void {
  dispatchLocalGameCommand({ type: "craft", recipeId: RECIPE_ID.woodenAxe });
}

/** Converts one source-sheet frame into an integer 2× CSS sprite without generating a derivative image. */
function iconStyle(icon: CandidateIconDefinition): Record<string, string> {
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
      <li v-for="slot in slots" :key="slot.index" class="hotbar-slot">
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
