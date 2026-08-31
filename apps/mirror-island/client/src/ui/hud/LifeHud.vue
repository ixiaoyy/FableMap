<script setup lang="ts">
import { computed } from "vue";
import { formatGameMinute } from "../../../../domain/time/game-time.ts";
import { gameUiState } from "../../stores/game-store.ts";
import { openCalendar } from "../../stores/game-store.ts";
import { calendarAt } from "../../../../domain/calendar/game-calendar.ts";

const clockLabel = computed(() => formatGameMinute(gameUiState.minuteOfDay));
const date = computed(() => calendarAt(gameUiState.day));
const weekdayLabels = { monday: "周一", tuesday: "周二", wednesday: "周三", thursday: "周四", friday: "周五", saturday: "周六", sunday: "周日" } as const;
</script>

<template>
  <aside class="life-hud" aria-label="生活状态">
    <button type="button" class="life-hud__date" @click="openCalendar">
      第{{ date.year }}年 · 春{{ date.dayOfSeason }}日 · {{ weekdayLabels[date.weekday] }}
    </button>
    <span>{{ clockLabel }}</span>
    <strong>{{ gameUiState.gold }}g</strong>
  </aside>
</template>
