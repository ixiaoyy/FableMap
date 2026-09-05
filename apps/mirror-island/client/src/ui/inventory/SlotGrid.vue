<script setup lang="ts">
import { computed, ref } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import type { SlotTransferAmount } from "../../../../domain/session/commands.ts";
import ItemIcon from "../items/ItemIcon.vue";

const props = withDefaults(defineProps<{
  gridId: string;
  label: string;
  slots: readonly { readonly itemId: string; readonly quantity: number }[];
  capacity: number;
  selectedIndex?: number | null;
  amount?: SlotTransferAmount;
  disabled?: boolean;
  hotbar?: boolean;
}>(), { selectedIndex: null, amount: "stack", disabled: false, hotbar: false });
const emit = defineEmits<{
  pick: [payload: { index: number; amount?: SlotTransferAmount }];
  drop: [payload: { sourceIndex: number; targetIndex: number; targetGrid: string; amount: SlotTransferAmount }];
}>();
const grid = ref<HTMLElement | null>(null);
const drag = ref<{ index: number; pointerId: number; startX: number; startY: number; x: number; y: number; moved: boolean } | null>(null);
let suppressClick = false;
const cells = computed(() => Array.from({ length: props.capacity }, (_, index) => ({
  index, item: getItemDefinition(props.slots[index]?.itemId), quantity: props.slots[index]?.quantity ?? 0,
})));
const dragItem = computed(() => drag.value ? getItemDefinition(props.slots[drag.value.index]?.itemId) : null);

/** Emits a tap/keyboard slot intent; this component never changes a source or destination array. */
function pick(index: number, amount?: SlotTransferAmount): void {
  if (props.disabled || suppressClick) return;
  emit("pick", { index, amount });
}

/** Starts a pointer-only preview for a populated slot; touch scrolling may cancel it without a mutation. */
function beginDrag(event: PointerEvent, index: number): void {
  if (props.disabled || event.button !== 0 || !getItemDefinition(props.slots[index]?.itemId)) return;
  drag.value = { index, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false };
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.setPointerCapture(event.pointerId);
}

/** Moves the temporary ghost once a pointer exceeds tap slop, without reserving gameplay items. */
function moveDrag(event: PointerEvent): void {
  if (!drag.value || drag.value.pointerId !== event.pointerId) return;
  drag.value.x = event.clientX;
  drag.value.y = event.clientY;
  if (Math.hypot(event.clientX - drag.value.startX, event.clientY - drag.value.startY) > 7) drag.value.moved = true;
}

/** Emits a single drop command intent for a visible target; an outside drop only cancels the preview. */
function finishDrag(event: PointerEvent): void {
  const current = drag.value;
  drag.value = null;
  if (!current || current.pointerId !== event.pointerId || !current.moved) return;
  suppressClick = true;
  window.setTimeout(() => { suppressClick = false; }, 0);
  if (props.disabled) return;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-storage-grid][data-storage-index]");
  if (!target || target.matches(":disabled")) return;
  const targetIndex = Number(target.dataset.storageIndex);
  const targetGrid = target.dataset.storageGrid;
  if (!targetGrid || !Number.isInteger(targetIndex)) return;
  emit("drop", { sourceIndex: current.index, targetIndex, targetGrid, amount: props.amount });
}

/** Cancels only the temporary drag after touch scrolling or pointer interruption. */
function cancelDrag(): void { drag.value = null; }

/** Maps right-click and Shift-right-click to the same one/half intents offered by explicit buttons. */
function contextPick(event: MouseEvent, index: number): void {
  event.preventDefault();
  pick(index, event.shiftKey ? "half" : "one");
}

/** Moves focus through the actual responsive column count; Space/Enter retain native button activation. */
function moveFocus(event: KeyboardEvent, index: number): void {
  if (!grid.value || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  const columns = getComputedStyle(grid.value).gridTemplateColumns.split(" ").length;
  const offset = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -columns : columns;
  const next = event.key === "Home" ? 0 : event.key === "End" ? props.capacity - 1 : Math.min(props.capacity - 1, Math.max(0, index + offset));
  grid.value.querySelector<HTMLButtonElement>(`[data-storage-index="${next}"]`)?.focus();
}
</script>

<template>
  <ol ref="grid" class="storage-slots" :aria-label="label">
    <li v-for="cell in cells" :key="cell.index">
      <button type="button" class="storage-slot" :data-storage-grid="gridId" :data-storage-index="cell.index"
        :data-selected="selectedIndex === cell.index" :data-empty="!cell.item" :data-hotbar="hotbar && cell.index < 12"
        :aria-pressed="selectedIndex === cell.index" :aria-label="`${label}第 ${cell.index + 1} 格：${cell.item?.name ?? '空格'}${cell.item ? `，${cell.quantity} 个` : ''}`"
        :disabled="disabled" @click="pick(cell.index)" @contextmenu="contextPick($event, cell.index)"
        @keydown="moveFocus($event, cell.index)" @pointerdown="beginDrag($event, cell.index)"
        @pointermove="moveDrag" @pointerup="finishDrag" @pointercancel="cancelDrag" @lostpointercapture="cancelDrag">
        <span class="storage-slot__index">{{ cell.index + 1 }}</span>
        <ItemIcon v-if="cell.item" :item-id="cell.item.id" />
        <span v-else class="storage-slot__empty" aria-hidden="true" />
        <strong v-if="cell.quantity > 1" class="storage-slot__quantity">{{ cell.quantity }}</strong>
        <span class="storage-slot__name" :title="cell.item?.name">{{ cell.item?.name ?? '' }}</span>
      </button>
    </li>
  </ol>
  <Teleport to="body">
    <div v-if="drag?.moved && dragItem" class="storage-drag-ghost" :style="{ left: `${drag.x + 12}px`, top: `${drag.y + 12}px` }" aria-hidden="true">
      <ItemIcon :item-id="dragItem.id" /><span>{{ dragItem.name }}</span>
    </div>
  </Teleport>
</template>
