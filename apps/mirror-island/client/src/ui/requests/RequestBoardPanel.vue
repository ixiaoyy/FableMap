<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ITEM_DEFINITIONS } from "../../../../domain/items/definitions.ts";
import { getNpcDialogueProfile } from "../../../../domain/dialogue/definitions.ts";
import { getDailyRequest } from "../../../../domain/requests/definitions.ts";
import { getDialogueDefinition } from "../../game/dialogue/definitions.ts";
import {
  closeRequestBoard,
  gameUiState,
} from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";

const panel = ref<HTMLElement | null>(null);
const request = computed(() => getDailyRequest(gameUiState.dailyRequest?.requestId));
const itemName = computed(() => request.value ? ITEM_DEFINITIONS[request.value.itemId].name : "");
const owned = computed(() => request.value ? gameUiState.inventory.reduce((total, slot) => (
  total + (slot.itemId === request.value?.itemId ? slot.quantity : 0)
), 0) : 0);
const residentName = computed(() => {
  const profile = request.value ? getNpcDialogueProfile(request.value.npcId) : null;
  return profile ? getDialogueDefinition(profile.baseDialogueId)?.speaker ?? "居民" : "居民";
});

/** Closes the read-only request projection and returns keyboard control to the world. */
function closePanel(): void {
  closeRequestBoard();
  void nextTick(() => restoreWorldFocus());
}

watch(() => gameUiState.requestBoardOpen, (open) => {
  if (open) void nextTick(() => panel.value?.focus());
});
</script>

<template>
  <div v-if="gameUiState.requestBoardOpen" class="request-board-backdrop" @click.self="closePanel">
    <section
      ref="panel"
      class="request-board-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-board-title"
      tabindex="-1"
      @keydown.esc.stop.prevent="closePanel"
    >
      <header>
        <div>
          <p>TOWN REQUEST / DAY {{ gameUiState.day }}</p>
          <h2 id="request-board-title">今日委托</h2>
        </div>
        <button type="button" @click="closePanel">离开</button>
      </header>

      <div v-if="gameUiState.day < 2 || !request" class="request-board-panel__closed">
        <strong>木板还在整理</strong>
        <p>居民委托会从 Day 2 开始张贴。</p>
      </div>

      <article v-else :data-complete="gameUiState.dailyRequest?.completed">
        <span class="request-board-panel__pin" aria-hidden="true" />
        <p class="request-board-panel__resident">{{ residentName }} 留言</p>
        <h3>需要 {{ request.quantity }} 份{{ itemName }}</h3>
        <p>请直接带给{{ residentName }}。交付时会自动结算，不需要回来领取。</p>
        <dl>
          <div><dt>持有</dt><dd>{{ owned }} / {{ request.quantity }}</dd></div>
          <div><dt>金币</dt><dd>+{{ request.goldReward }}g</dd></div>
          <div><dt>关系</dt><dd>+{{ request.friendshipReward }}</dd></div>
        </dl>
        <strong class="request-board-panel__status">
          {{ gameUiState.dailyRequest?.completed ? '今日已完成' : owned >= request.quantity ? '材料已齐，去找居民' : '继续收集材料' }}
        </strong>
      </article>
    </section>
  </div>
</template>
