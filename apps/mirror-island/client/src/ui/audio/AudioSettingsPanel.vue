<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { AUDIO_CUE } from "../../audio/audio-catalog.ts";
import { emitAudioCue } from "../../audio/audio-events.ts";
import type { AudioVolumeChannel } from "../../audio/audio-settings.ts";
import {
  closeAudioSettings,
  gameUiState,
  openAudioSettings,
  setAudioVolume,
} from "../../stores/game-store.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";

const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const unavailable = computed(() => (
  gameUiState.worldActionBusy
  || gameUiState.shopOpen
  || gameUiState.dialogue !== null
  || gameUiState.sleepConfirmationOpen
  || gameUiState.socialOpen
  || gameUiState.calendarOpen
));

const channels = [
  { id: "master", label: "Master Volume", helper: "控制全部声音" },
  { id: "music", label: "Music Volume", helper: "已保存，本阶段暂无配乐" },
  { id: "sfx", label: "SFX Volume", helper: "脚步、交互与环境声" },
] as const;

/** Opens the parchment-styled audio settings surface and moves focus into it. */
function openPanel(): void {
  if (!openAudioSettings()) return;
  void nextTick(() => panel.value?.focus());
}

/** Closes audio settings and restores gameplay keyboard focus. */
function closePanel(): void {
  closeAudioSettings();
  void nextTick(() => {
    if (trigger.value) trigger.value.focus();
    else restoreWorldFocus();
  });
}

/** Persists one range input as a normalized zero-to-one audio channel value. */
function updateChannel(channel: AudioVolumeChannel, event: Event): void {
  const input = event.currentTarget;
  if (!(input instanceof HTMLInputElement)) return;
  setAudioVolume(channel, Number(input.value) / 100);
}

/** Plays one real pickup cue so a direct gesture can verify or unlock browser audio. */
function testSound(): void {
  emitAudioCue(AUDIO_CUE.pickup);
}

watch(() => gameUiState.audioSettingsOpen, (open) => {
  if (open) void nextTick(() => panel.value?.focus());
});
</script>

<template>
  <button
    ref="trigger"
    class="audio-settings-trigger"
    type="button"
    aria-haspopup="dialog"
    :aria-expanded="gameUiState.audioSettingsOpen"
    :disabled="unavailable"
    @click="openPanel"
  >
    <span aria-hidden="true">♫</span>
    声音
  </button>

  <div
    v-if="gameUiState.audioSettingsOpen"
    class="audio-settings-backdrop"
    @click.self="closePanel"
  >
    <section
      ref="panel"
      class="audio-settings-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-settings-title"
      tabindex="-1"
      @keydown.esc.stop.prevent="closePanel"
    >
      <header>
        <div>
          <p>镜像岛 · 听觉札记</p>
          <h2 id="audio-settings-title">声音设置</h2>
        </div>
        <button type="button" @click="closePanel">收起</button>
      </header>

      <div class="audio-settings-panel__channels">
        <label v-for="channel in channels" :key="channel.id">
          <span>
            <strong>{{ channel.label }}</strong>
            <small>{{ channel.helper }}</small>
          </span>
          <input
            :aria-label="channel.label"
            type="range"
            min="0"
            max="100"
            step="1"
            :value="Math.round(gameUiState.audioSettings[channel.id] * 100)"
            @input="updateChannel(channel.id, $event)"
          >
          <output>{{ Math.round(gameUiState.audioSettings[channel.id] * 100) }}%</output>
        </label>
      </div>

      <footer>
        <p>音量偏好只保存在这台浏览器，不进入农场存档。</p>
        <button type="button" @click="testSound">测试声音</button>
      </footer>
    </section>
  </div>
</template>
