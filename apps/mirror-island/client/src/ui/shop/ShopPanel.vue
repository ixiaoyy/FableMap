<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ITEM_ID } from "../../../../domain/items/definitions.ts";
import {
  TURNIP_SEED_BUY_PRICE,
  TURNIP_SELL_PRICE,
} from "../../../../domain/shop/ShopSystem.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { closeShop, gameUiState } from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";

const panel = ref<HTMLElement | null>(null);
const turnipSeedQuantity = computed(() => itemQuantity(ITEM_ID.turnipSeed));
const turnipQuantity = computed(() => itemQuantity(ITEM_ID.turnip));
const canBuyTurnipSeed = computed(() => gameUiState.gold >= TURNIP_SEED_BUY_PRICE);
const canSellTurnip = computed(() => turnipQuantity.value > 0);

/** Returns one inventory projection total without owning domain inventory rules. */
function itemQuantity(itemId: string): number {
  return gameUiState.inventory
    .filter((slot) => slot.itemId === itemId)
    .reduce((total, slot) => total + slot.quantity, 0);
}

/** Requests one fixed-price turnip seed purchase from GameSession. */
function buyTurnipSeed(): void {
  dispatchLocalGameCommand({ type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 });
}

/** Requests one fixed-price harvested turnip sale from GameSession. */
function sellTurnip(): void {
  dispatchLocalGameCommand({ type: "sell-item", itemId: ITEM_ID.turnip, quantity: 1 });
}

/** Leaves the shop and restores keyboard control to the world canvas. */
function leaveShop(): void {
  closeShop();
  restoreWorldFocus();
}

watch(() => gameUiState.shopOpen, (open) => {
  if (open) void nextTick(() => panel.value?.focus());
});
</script>

<template>
  <div v-if="gameUiState.shopOpen" class="shop-backdrop">
    <section
      ref="panel"
      class="shop-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-title"
      tabindex="-1"
      @keydown.esc.stop.prevent="leaveShop"
    >
      <header class="shop-panel__header">
        <div>
          <span>华强 · SEED KEEPER</span>
          <h2 id="shop-title">种子店</h2>
        </div>
        <strong>{{ gameUiState.gold }}g</strong>
      </header>

      <p class="shop-panel__welcome">{{ gameUiState.shopWelcome }}</p>

      <div class="shop-panel__goods">
        <article>
          <div>
            <h3>萝卜种子</h3>
            <p>持有 {{ turnipSeedQuantity }} · 每次购买 1 粒</p>
          </div>
          <button
            type="button"
            :disabled="!canBuyTurnipSeed"
            @click="buyTurnipSeed"
          >
            {{ canBuyTurnipSeed ? `购买 ${TURNIP_SEED_BUY_PRICE}g` : "金币不足" }}
          </button>
        </article>
        <article>
          <div>
            <h3>萝卜</h3>
            <p>持有 {{ turnipQuantity }} · 每次出售 1 个</p>
          </div>
          <button
            type="button"
            :disabled="!canSellTurnip"
            @click="sellTurnip"
          >
            {{ canSellTurnip ? `出售 ${TURNIP_SELL_PRICE}g` : "无可出售" }}
          </button>
        </article>
      </div>

      <button type="button" class="shop-panel__close" @click="leaveShop">离开商店</button>
    </section>
  </div>
</template>
