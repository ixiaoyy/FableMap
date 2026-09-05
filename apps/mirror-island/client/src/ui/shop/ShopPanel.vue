<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ITEM_DEFINITIONS, ITEM_ID, type ItemId } from "../../../../domain/items/definitions.ts";
import { playableCalendarAt } from "../../../../domain/calendar/game-calendar.ts";
import { CROP_DEFINITIONS, cropsForSeason, sellPriceForItem } from "../../../../domain/farming/crops.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { closeShop, gameUiState } from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";

const panel = ref<HTMLElement | null>(null);
const seedGoods = computed(() => cropsForSeason(playableCalendarAt(gameUiState.day).season));
const sellGoods = computed(() => [
  ...CROP_DEFINITIONS.map(({ cropId }) => cropId),
  ITEM_ID.springWildflower,
  ITEM_ID.bambooShoot,
  ITEM_ID.stone,
  ITEM_ID.fiber,
  ...Object.values(ITEM_DEFINITIONS).filter((item) => item.category === "fish").map((item) => item.id),
]);

/** Returns one inventory projection total without owning domain inventory rules. */
function itemQuantity(itemId: string): number {
  return gameUiState.inventory
    .filter((slot) => slot.itemId === itemId)
    .reduce((total, slot) => total + slot.quantity, 0);
}

/** Requests one fixed-price turnip seed purchase from GameSession. */
function buyItem(itemId: ItemId): void {
  dispatchLocalGameCommand({ type: "buy-item", itemId, quantity: 1 });
}

/** Requests one fixed-price harvested turnip sale from GameSession. */
function sellItem(itemId: ItemId): void {
  dispatchLocalGameCommand({ type: "sell-item", itemId, quantity: 1 });
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
        <article v-for="crop in seedGoods" :key="crop.seedId">
          <div>
            <h3>{{ ITEM_DEFINITIONS[crop.seedId].name }}</h3>
            <p>持有 {{ itemQuantity(crop.seedId) }} · 成长 {{ crop.growthDays }} 天<span v-if="crop.regrowDays"> · 每 {{ crop.regrowDays }} 天再收</span><span v-if="crop.yieldKind"> · 可能多产</span></p>
          </div>
          <button
            type="button"
            :disabled="gameUiState.gold < crop.seedPrice"
            @click="buyItem(crop.seedId)"
          >
            {{ gameUiState.gold >= crop.seedPrice ? `购买 ${crop.seedPrice}g` : "金币不足" }}
          </button>
        </article>
        <article v-for="itemId in sellGoods" :key="itemId">
          <div>
            <h3>{{ ITEM_DEFINITIONS[itemId].name }}</h3>
            <p>持有 {{ itemQuantity(itemId) }} · 每次出售 1 个</p>
          </div>
          <button
            type="button"
            :disabled="itemQuantity(itemId) < 1"
            @click="sellItem(itemId)"
          >
            {{ itemQuantity(itemId) > 0 ? `出售 ${sellPriceForItem(itemId)}g` : "无可出售" }}
          </button>
        </article>
      </div>

      <button type="button" class="shop-panel__close" @click="leaveShop">离开商店</button>
    </section>
  </div>
</template>
