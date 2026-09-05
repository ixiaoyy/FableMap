<script setup lang="ts">
import type { SlotTransferAmount } from "../../../../domain/session/commands.ts";
withDefaults(defineProps<{ amount: SlotTransferAmount; selected: boolean; disabled?: boolean }>(), { disabled: false });
const emit = defineEmits<{ amount: [value: SlotTransferAmount]; cancel: [] }>();
const options = [{ id: "stack", label: "整组" }, { id: "one", label: "一个" }, { id: "half", label: "半组" }] as const;
</script>

<template>
  <div class="storage-transfer-controls" role="group" aria-label="取出数量">
    <span class="storage-control-label">数量</span>
    <div class="storage-segmented">
      <button v-for="option in options" :key="option.id" type="button" :aria-pressed="amount === option.id"
        :disabled="disabled" @click="emit('amount', option.id)">{{ option.label }}</button>
    </div>
    <button v-if="selected" type="button" class="storage-text-button" :disabled="disabled" @click="emit('cancel')">取消</button>
  </div>
</template>
