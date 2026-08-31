<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  FRIENDSHIP_MAX_POINTS,
  FRIENDSHIP_POINTS_PER_HEART,
} from "../../../../domain/social/definitions.ts";
import { getDialogueDefinition } from "../../game/dialogue/definitions.ts";
import { getWorldCatalog } from "../../game/world/world-catalog.ts";
import {
  closeSocial,
  gameUiState,
  openSocial,
} from "../../stores/game-store.ts";

interface SocialEntry {
  readonly npcId: string;
  readonly name: string;
  readonly hearts: number;
  readonly heartLabel: string;
  readonly relationship: string;
  readonly talkedToday: boolean;
  readonly progressPercent: number;
}

const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const catalogNpcs = uniqueCatalogNpcs();

const unavailable = computed(() => (
  gameUiState.worldActionBusy
  || gameUiState.shopOpen
  || gameUiState.dialogue !== null
  || gameUiState.sleepConfirmationOpen
));

const residents = computed<readonly SocialEntry[]>(() => catalogNpcs.map((npc) => {
  const friendship = gameUiState.friendships[npc.npcId] ?? {
    npcId: npc.npcId,
    points: 0,
    lastTalkedDay: 0,
  };
  const heartValue = friendship.points / FRIENDSHIP_POINTS_PER_HEART;
  return {
    npcId: npc.npcId,
    name: getDialogueDefinition(npc.dialogueId)?.speaker ?? "未登记居民",
    hearts: Math.floor(heartValue),
    heartLabel: `${heartValue.toFixed(1)} / 10 心`,
    relationship: relationshipLabel(heartValue),
    talkedToday: friendship.lastTalkedDay === gameUiState.day,
    progressPercent: friendship.points / FRIENDSHIP_MAX_POINTS * 100,
  };
}));

/** Returns unique base NPC identities in the validated catalog's deterministic region order. */
function uniqueCatalogNpcs(): readonly { readonly npcId: string; readonly dialogueId: string }[] {
  const result: { npcId: string; dialogueId: string }[] = [];
  const seen = new Set<string>();
  for (const region of getWorldCatalog().allRegions()) {
    for (const npc of region.npcs) {
      if (seen.has(npc.npcId)) continue;
      seen.add(npc.npcId);
      result.push({ npcId: npc.npcId, dialogueId: npc.dialogueId });
    }
  }
  return result;
}

/** Maps a zero-to-ten heart value to one restrained relationship label. */
function relationshipLabel(hearts: number): string {
  if (hearts >= 10) return "挚友";
  if (hearts >= 8) return "知心";
  if (hearts >= 6) return "信赖";
  if (hearts >= 4) return "亲近";
  if (hearts >= 2) return "熟面";
  return "初识";
}

/** Requests the world-locking Social ledger and focuses its titled surface. */
function openLedger(): void {
  if (!openSocial()) return;
  void nextTick(() => panel.value?.focus());
}

/** Closes the Social ledger and returns keyboard focus to its trigger. */
function closeLedger(): void {
  closeSocial();
  void nextTick(() => trigger.value?.focus());
}

watch(() => gameUiState.socialOpen, (open) => {
  if (open) void nextTick(() => panel.value?.focus());
});
</script>

<template>
  <button
    ref="trigger"
    class="social-ledger-trigger"
    type="button"
    aria-haspopup="dialog"
    :aria-expanded="gameUiState.socialOpen"
    :disabled="unavailable"
    @click="openLedger"
  >
    <span aria-hidden="true">♥</span>
    人际
  </button>

  <div
    v-if="gameUiState.socialOpen"
    class="social-ledger-backdrop"
    @click.self="closeLedger"
  >
    <section
      ref="panel"
      class="social-ledger"
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-ledger-title"
      tabindex="-1"
      @keydown.esc.stop="closeLedger"
    >
      <header class="social-ledger__header">
        <div>
          <p>镜像岛 · 乡里往来</p>
          <h2 id="social-ledger-title">人际名册</h2>
        </div>
        <button type="button" @click="closeLedger">合上名册</button>
      </header>

      <ol class="social-ledger__list">
        <li v-for="entry in residents" :key="entry.npcId" class="social-ledger__row">
          <div class="social-ledger__identity">
            <strong>{{ entry.name }}</strong>
            <span>{{ entry.relationship }}</span>
          </div>
          <div class="social-ledger__hearts" :aria-label="`${entry.name}，${entry.heartLabel}`">
            <span
              v-for="index in 10"
              :key="index"
              aria-hidden="true"
              :data-filled="index <= entry.hearts"
            >♥</span>
          </div>
          <div class="social-ledger__progress" aria-hidden="true">
            <span :style="{ width: `${entry.progressPercent}%` }" />
          </div>
          <span class="social-ledger__heart-label">{{ entry.heartLabel }}</span>
          <span class="social-ledger__daily" :data-complete="entry.talkedToday">
            {{ entry.talkedToday ? "今日已聊" : "今日未聊" }}
          </span>
        </li>
      </ol>
    </section>
  </div>
</template>
