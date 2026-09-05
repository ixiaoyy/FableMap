<script setup lang="ts">
import { computed } from "vue";
import { formatGameMinute } from "../../../../domain/time/game-time.ts";
import { gameUiState } from "../../stores/game-store.ts";
import { openCalendar } from "../../stores/game-store.ts";
import { playableCalendarAt } from "../../../../domain/calendar/game-calendar.ts";

const clockLabel = computed(() => formatGameMinute(gameUiState.minuteOfDay));
const date = computed(() => playableCalendarAt(Math.max(1, gameUiState.day)));
const weekdayLabels = { monday: "周一", tuesday: "周二", wednesday: "周三", thursday: "周四", friday: "周五", saturday: "周六", sunday: "周日" } as const;
const weatherLabels = { sunny: "晴", rain: "雨", wind: "风" } as const;
const staminaPercent = computed(() => Math.round(gameUiState.stamina / gameUiState.maxStamina * 100));
</script>

<template>
  <aside class="life-hud" aria-label="生活状态">
    <div class="life-hud__heading">
      <button type="button" class="life-hud__date" title="查看日历" @click="openCalendar">
        第 {{ date.absoluteDay }} 天 <span>{{ weekdayLabels[date.weekday] }}</span>
      </button>
      <span class="life-hud__weather" :title="`明日：${weatherLabels[gameUiState.nextWeather]}`">{{ weatherLabels[gameUiState.weather] }}</span>
    </div>
    <div class="life-hud__numbers">
      <time>{{ clockLabel }}</time>
      <strong aria-label="金币"><small>金币</small>{{ gameUiState.gold }}<small>g</small></strong>
    </div>
    <div class="life-hud__stamina" aria-label="体力">
      <span>体力</span>
      <i role="progressbar" aria-label="体力" :aria-valuenow="gameUiState.stamina" :aria-valuemin="0" :aria-valuemax="gameUiState.maxStamina"><b :style="{ width: `${staminaPercent}%` }" /></i>
      <small>{{ gameUiState.stamina }}/{{ gameUiState.maxStamina }}</small>
    </div>
    <small class="life-hud__forecast">明日天气 · {{ weatherLabels[gameUiState.nextWeather] }}</small>
  </aside>
</template>
