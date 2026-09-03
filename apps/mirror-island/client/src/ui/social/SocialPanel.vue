<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  FRIENDSHIP_POINTS_PER_HEART,
  giftWeekIndex,
} from "../../../../domain/social/definitions.ts";
import {
  relationshipStageAt,
  type RelationshipStage,
} from "../../../../domain/social/relationship-stage.ts";
import { getDialogueDefinition } from "../../game/dialogue/definitions.ts";
import { getWorldCatalog } from "../../game/world/world-catalog.ts";
import { npcRestDay } from "../../../../domain/world/npc-schedules.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";
import {
  closeSocial,
  gameUiState,
  openSocial,
  isWorldInputLocked,
} from "../../stores/game-store.ts";

interface SocialEntry {
  readonly npcId: string;
  readonly name: string;
  readonly hearts: number;
  readonly heartLabel: string;
  readonly relationship: string;
  readonly talkedToday: boolean;
  readonly progressPercent: number;
  readonly giftStatus: string;
  readonly restDay: string;
}

const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const catalogNpcs = uniqueCatalogNpcs();

const unavailable = computed(() => isWorldInputLocked());
const weekdayLabels = { monday: "周一", tuesday: "周二", wednesday: "周三", thursday: "周四", friday: "周五", saturday: "周六", sunday: "周日" } as const;

const residents = computed<readonly SocialEntry[]>(() => catalogNpcs.map((npc) => {
  const friendship = gameUiState.friendships[npc.npcId] ?? {
    npcId: npc.npcId,
    points: 0,
    lastTalkedDay: 0,
    lastGiftDay: 0,
    giftWeekIndex: 0,
    giftsThisWeek: 0,
  };
  const stage = relationshipStageAt(friendship.points);
  const hearts = stage === "friendly" ? 2 : stage === "familiar" ? 1 : 0;
  return {
    npcId: npc.npcId,
    name: getDialogueDefinition(npc.dialogueId)?.speaker ?? "未登记居民",
    hearts,
    heartLabel: `${relationshipLabel(stage)} · 已解锁 ${hearts} / 2 颗内容心`,
    relationship: relationshipLabel(stage),
    talkedToday: friendship.lastTalkedDay === gameUiState.day,
    progressPercent: Math.min(100, friendship.points / (FRIENDSHIP_POINTS_PER_HEART * 2) * 100),
    giftStatus: (friendship.lastGiftDay === gameUiState.day ? "今日已送" : "今日未送")
      + ` · 本周 ${friendship.giftWeekIndex === giftWeekIndex(Math.max(1, gameUiState.day)) ? friendship.giftsThisWeek : 0}/2`,
    restDay: weekdayLabels[npcRestDay(npc.npcId) ?? "sunday"],
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

/** Maps one content-backed domain stage to its restrained Social label. */
function relationshipLabel(stage: RelationshipStage): string {
  if (stage === "friendly") return "友好";
  if (stage === "familiar") return "熟悉";
  return "陌生";
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
      @keydown="trapDialogTab($event, panel)"
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
              v-for="index in 2"
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
          <span class="social-ledger__gift-status">{{ entry.giftStatus }} · {{ entry.restDay }}休息</span>
        </li>
      </ol>
    </section>
  </div>
</template>
