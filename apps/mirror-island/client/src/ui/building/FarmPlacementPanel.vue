<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { dispatchLocalGameCommand, getLocalGameSession } from "../../session/local-game-session.ts";
import { closeWorldPlacement, gameUiState, isStorageMutationLocked, setPlacementPreview } from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";

const panel = ref<HTMLElement | null>(null);
const placement = computed(() => gameUiState.worldPlacement);
const busy = computed(() => isStorageMutationLocked());
const title = computed(() => placement.value?.request.kind === "chest" ? "摆放普通箱"
  : placement.value?.request.kind === "move-farm-building" ? "移动出货箱" : "建造出货箱");

/** Commits the current domain-reviewed tile through exactly one command, then removes only the visual preview. */
function confirm(): void {
  const current = placement.value;
  if (!current?.valid || busy.value) return;
  const { request, column, row } = current;
  const result = request.kind === "chest" && request.inventoryIndex !== undefined
    ? dispatchLocalGameCommand({ type: "place-world-object", inventoryIndex: request.inventoryIndex, column, row })
    : request.kind === "build-shipping-bin" && request.interactionId
      ? dispatchLocalGameCommand({ type: "build-shipping-bin", interactionId: request.interactionId, column, row })
      : request.kind === "move-farm-building" && request.interactionId && request.objectId
        ? dispatchLocalGameCommand({ type: "move-farm-building", interactionId: request.interactionId, objectId: request.objectId, column, row })
        : null;
  if (result?.tone === "success") cancel();
}

/** Cancels the map preview without spending or moving anything; world focus returns after the overlay is removed. */
function cancel(): void { closeWorldPlacement(); void nextTick(restoreWorldFocus); }

/** Nudges the preview by one tile for touch or focused-panel keys and displays the domain's fresh verdict. */
function nudge(xAxis: -1 | 0 | 1, yAxis: -1 | 0 | 1): void {
  const current = placement.value;
  if (!current || busy.value) return;
  const column = Math.max(0, current.column + xAxis);
  const row = Math.max(0, current.row + yAxis);
  const result = getLocalGameSession().placementPreview(current.request.kind === "chest" ? "chest" : "shipping-bin",
    column, row, current.request.kind === "move-farm-building" ? current.request.objectId : undefined);
  setPlacementPreview(column, row, result.valid, result.message);
}

/** Keeps Tab on compact controls and handles arrow keys when the panel, rather than the world, owns focus. */
function keydown(event: KeyboardEvent): void {
  if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); return; }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    event.preventDefault(); event.stopPropagation();
    nudge(event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0,
      event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0);
    return;
  }
  trapDialogTab(event, panel.value);
}

watch(() => placement.value?.request, (request) => { if (request) void nextTick(restoreWorldFocus); });
</script>

<template>
  <section v-if="placement" ref="panel" class="farm-placement-panel" role="region" aria-labelledby="farm-placement-title"
    tabindex="-1" @keydown="keydown">
    <div><h2 id="farm-placement-title">{{ title }}</h2><p>点选地图空地，或用方向键调整。</p></div>
    <p class="farm-placement-verdict" :data-valid="placement.valid" aria-live="polite">
      第 {{ placement.column + 1 }} 列 · 第 {{ placement.row + 1 }} 行 — {{ placement.message }}
    </p>
    <div class="storage-toolbar farm-placement-actions">
      <div class="placement-direction-buttons" role="group" aria-label="逐格调整位置">
        <button type="button" :disabled="busy" aria-label="向左一格" @click="nudge(-1, 0)">←</button>
        <button type="button" :disabled="busy" aria-label="向上一格" @click="nudge(0, -1)">↑</button>
        <button type="button" :disabled="busy" aria-label="向下一格" @click="nudge(0, 1)">↓</button>
        <button type="button" :disabled="busy" aria-label="向右一格" @click="nudge(1, 0)">→</button>
      </div>
      <button type="button" :disabled="busy" @click="cancel">取消</button>
      <button type="button" class="storage-primary" :disabled="busy || !placement.valid" @click="confirm">确认位置</button>
    </div>
  </section>
</template>
