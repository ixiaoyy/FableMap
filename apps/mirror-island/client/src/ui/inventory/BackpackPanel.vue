<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import { itemIconForItem, itemIconStyle } from "../../game/assets/item-icons.ts";
import {
  closeBackpack,
  gameUiState,
  isWorldInputLocked,
  openBackpack,
} from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";

const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const unavailable = computed(() => isWorldInputLocked());
const slots = computed(() => Array.from({ length: gameUiState.inventoryCapacity }, (_, index) => {
  const slot = gameUiState.inventory[index];
  const definition = getItemDefinition(slot?.itemId);
  return {
    index,
    definition,
    icon: definition ? itemIconForItem(definition.id) : null,
    quantity: slot?.quantity ?? 0,
    hotbar: index < 8,
  };
}));

/** Opens the complete inventory projection and moves focus into its titled surface. */
function openPanel(): void {
  if (!openBackpack()) return;
  void nextTick(() => panel.value?.focus());
}

/** Closes the read-only inventory projection and restores world focus. */
function closePanel(): void {
  closeBackpack();
  void nextTick(() => {
    if (trigger.value) trigger.value.focus();
    else restoreWorldFocus();
  });
}

watch(() => gameUiState.backpackOpen, (open) => {
  if (open) void nextTick(() => panel.value?.focus());
});
</script>

<template>
  <button
    ref="trigger"
    class="backpack-trigger"
    type="button"
    aria-haspopup="dialog"
    :aria-expanded="gameUiState.backpackOpen"
    :disabled="unavailable"
    @click="openPanel"
  >
    <span aria-hidden="true">▣</span>
    背包 {{ gameUiState.inventoryCapacity }}
  </button>

  <div v-if="gameUiState.backpackOpen" class="backpack-backdrop" @click.self="closePanel">
    <section
      ref="panel"
      class="backpack-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backpack-title"
      tabindex="-1"
      @keydown.esc.stop.prevent="closePanel"
    >
      <header>
        <div>
          <p>随身物品 · 前八格为快捷栏</p>
          <h2 id="backpack-title">背包 {{ gameUiState.inventoryCapacity }} 格</h2>
        </div>
        <button type="button" @click="closePanel">合上</button>
      </header>

      <ol class="backpack-panel__slots">
        <li
          v-for="slot in slots"
          :key="slot.index"
          :data-hotbar="slot.hotbar"
          :data-empty="!slot.definition"
          :aria-label="`${slot.index + 1}：${slot.definition?.name ?? '空槽'}`"
        >
          <span class="backpack-panel__index">{{ slot.index + 1 }}</span>
          <span
            v-if="slot.icon"
            class="backpack-panel__icon"
            :style="itemIconStyle(slot.icon)"
            aria-hidden="true"
          />
          <strong v-else-if="slot.definition">{{ slot.definition.hotbarMark }}</strong>
          <small v-if="slot.quantity > 1">{{ slot.quantity }}</small>
          <em v-if="slot.hotbar">快捷</em>
        </li>
      </ol>
    </section>
  </div>
</template>
