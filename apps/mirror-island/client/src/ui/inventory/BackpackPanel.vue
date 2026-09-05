<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import ItemIcon from "../items/ItemIcon.vue";
import {
  closeBackpack,
  gameUiState,
  isWorldInputLocked,
  openBackpack,
  selectInventorySlot,
} from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";

const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const unavailable = computed(() => isWorldInputLocked());
const slots = computed(() => Array.from({ length: gameUiState.inventoryCapacity }, (_, index) => {
  const slot = gameUiState.inventory[index];
  const definition = getItemDefinition(slot?.itemId);
  return {
    index,
    definition,
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

/** Selects a backpack stack for world use without moving any saved slots, then restores world focus. */
function holdSlot(index: number): void {
  closeBackpack();
  selectInventorySlot(index);
  void nextTick(restoreWorldFocus);
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
      @keydown="trapDialogTab($event, panel)"
    >
      <header>
        <div>
          <p>点击物品拿在手上 · 前八格可用数字键选择</p>
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
          <button
            type="button"
            class="backpack-slot__button"
            :disabled="!slot.definition"
            :aria-label="`拿起${slot.definition?.name ?? '空槽'}`"
            @click="holdSlot(slot.index)"
          >
          <span class="backpack-panel__index">{{ slot.index + 1 }}</span>
          <ItemIcon v-if="slot.definition" :item-id="slot.definition.id" class="backpack-panel__icon" />
          <small v-if="slot.quantity > 1">{{ slot.quantity }}</small>
          <em v-if="slot.hotbar">快捷</em>
          <span class="backpack-slot__name">{{ slot.definition?.name ?? '空' }}</span>
          </button>
        </li>
      </ol>
    </section>
  </div>
</template>
