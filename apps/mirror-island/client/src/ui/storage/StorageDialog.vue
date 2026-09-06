<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { restoreWorldFocus } from "../focus/world-focus.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";
import { gameUiState } from "../../stores/game-store.ts";

const props = withDefaults(defineProps<{
  open: boolean;
  title: string;
  titleId: string;
  subtitle?: string;
  closable?: boolean;
  narrow?: boolean;
  blocking?: boolean;
}>(), { closable: true, narrow: false, blocking: false, subtitle: "" });
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);
let returnTarget: HTMLElement | null = null;
let saveFocus: HTMLElement | null = null;

/** Restores the opening control when still usable, falling back to the world canvas after external closure. */
function restoreFocus(): void {
  const target = returnTarget;
  returnTarget = null;
  void nextTick(() => {
    const activeDialog = Array.from(document.querySelectorAll<HTMLElement>('.storage-backdrop [role="dialog"]')).at(-1);
    if (target?.isConnected && !target.matches(":disabled") && (!activeDialog || activeDialog.contains(target))) target.focus();
    else if (activeDialog) activeDialog.focus();
    else restoreWorldFocus();
  });
}

/** Requests closure only when the parent allows canceling this modal state. */
function close(): void { if (props.closable) emit("close"); }

/** Keeps modal focus contained and routes Escape to its single close action. */
function onKey(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  trapDialogTab(event, panel.value);
}

watch(() => props.open, (open) => {
  if (open) {
    returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    void nextTick(() => panel.value?.focus());
  } else if (returnTarget) restoreFocus();
}, { immediate: true });
watch(() => gameUiState.storageSave.phase, (phase) => {
  if (!props.open || props.blocking) return;
  if (phase === "saving" && document.activeElement instanceof HTMLElement && panel.value?.contains(document.activeElement)) {
    saveFocus = document.activeElement;
  } else if (phase === "idle") {
    const target = saveFocus;
    saveFocus = null;
    void nextTick(() => {
      if (props.open && target?.isConnected && !target.matches(":disabled")
        && (document.activeElement === document.body || panel.value?.contains(document.activeElement))) target.focus();
    });
  }
});
onBeforeUnmount(() => { if (props.open) restoreFocus(); });
</script>

<template>
  <div v-if="open" class="storage-backdrop" :class="{ 'storage-backdrop--blocking': blocking }" @click.self="close">
    <section ref="panel" class="storage-dialog" :class="{ 'storage-dialog--narrow': narrow }"
      role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1" @keydown="onKey">
      <div class="storage-dialog__topbar">
        <header class="storage-dialog__header">
          <div><h2 :id="titleId">{{ title }}</h2><p v-if="subtitle" class="storage-eyebrow">{{ subtitle }}</p></div>
          <button v-if="closable" type="button" class="storage-close" @click="close">返回<span class="storage-close__key" aria-hidden="true">Esc</span></button>
        </header>
        <slot name="navigation" />
      </div>
      <div class="storage-dialog__body"><slot /></div>
      <div v-if="$slots.footer" class="storage-dialog__footer"><slot name="footer" /></div>
    </section>
  </div>
</template>
