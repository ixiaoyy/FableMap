<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { closeGiftConfirmation, gameUiState } from "../../stores/game-store.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";
import ItemIcon from "../items/ItemIcon.vue";

const panel = ref<HTMLElement | null>(null);
const item = computed(() => getItemDefinition(gameUiState.giftConfirmation?.itemId));

/** Cancels the proposed gift without touching inventory and restores world keyboard focus. */
function cancel(): void { closeGiftConfirmation(); restoreWorldFocus(); }

/** Sends exactly one confirmed item/NPC intent; domain owns caps, preferences and atomic consumption. */
function confirm(): void {
  const gift = gameUiState.giftConfirmation;
  if (!gift) return;
  dispatchLocalGameCommand({ type: "gift-item-to-npc", npcId: gift.npcId, itemId: gift.itemId });
  cancel();
}

watch(() => gameUiState.giftConfirmation, (gift) => {
  if (gift) void nextTick(() => panel.value?.querySelector<HTMLButtonElement>("[data-cancel]")?.focus());
});
</script>

<template>
  <div v-if="gameUiState.giftConfirmation" class="spring-dialog-backdrop" @click.self="cancel">
    <section ref="panel" class="spring-dialog gift-confirmation" role="dialog" aria-modal="true"
      aria-labelledby="gift-title" tabindex="-1" @keydown.esc.stop.prevent="cancel"
      @keydown="trapDialogTab($event, panel)">
      <h2 id="gift-title">送给{{ gameUiState.giftConfirmation.npcName }}？</h2>
      <p class="gift-confirmation__item"><ItemIcon v-if="item" :item-id="item.id" />{{ item?.name }} × 1</p>
      <p>确认后会从背包取出一份。每位居民每天最多收一份，每周两份。</p>
      <div class="spring-dialog__actions">
        <button type="button" data-cancel @click="cancel">先收着</button>
        <button type="button" class="is-primary" @click="confirm">送出礼物</button>
      </div>
    </section>
  </div>
</template>
