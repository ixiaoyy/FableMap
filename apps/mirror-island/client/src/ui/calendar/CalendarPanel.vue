<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { DAYS_PER_SEASON } from "../../../../domain/calendar/game-calendar.ts";
import { closeCalendar, gameUiState } from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";

const panel = ref<HTMLElement | null>(null);
const pageStart = computed(() => Math.floor((gameUiState.day - 1) / DAYS_PER_SEASON) * DAYS_PER_SEASON + 1);
const days = computed(() => Array.from(
  { length: DAYS_PER_SEASON },
  (_, index) => pageStart.value + index,
));
const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

/** Closes the calendar and restores keyboard control to the world canvas. */
function leaveCalendar(): void { closeCalendar(); restoreWorldFocus(); }

watch(() => gameUiState.calendarOpen, (open) => { if (open) void nextTick(() => panel.value?.focus()); });
</script>

<template>
  <div v-if="gameUiState.calendarOpen" class="calendar-backdrop">
    <section ref="panel" class="calendar-panel" role="dialog" aria-modal="true" aria-labelledby="calendar-title" tabindex="-1" @keydown.esc.stop.prevent="leaveCalendar">
      <header><div><span>CURRENT DAY {{ gameUiState.day }}</span><h2 id="calendar-title">岛上日历</h2></div><button type="button" @click="leaveCalendar">关闭</button></header>
      <div class="calendar-panel__weekdays"><span v-for="label in weekdayLabels" :key="label">周{{ label }}</span></div>
      <div class="calendar-panel__days">
        <div v-for="day in days" :key="day" :class="{ 'is-current': day === gameUiState.day, 'is-past': day < gameUiState.day }">
          <strong>Day {{ day }}</strong><small v-if="day === gameUiState.day">今天</small>
        </div>
      </div>
    </section>
  </div>
</template>
