<!--
THESIS: One readable fishing instrument; the world stays visible behind it.
OWN-WORLD: Existing paper, bamboo-green controls and harvest-gold measuring marks.
STORY: Hold to cast, notice the bite, balance tension, keep or release the catch.
FIRST VIEWPORT: Bottom-center folio, stage title above one dominant input.
FORM: Narrow extension of the current game HUD; no new visual-world selection.
-->
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { FISHING_SAFE_TENSION } from "../../../../domain/fishing/definitions.ts";
import { STAMINA_COST } from "../../../../domain/stamina/definitions.ts";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { gameUiState } from "../../stores/game-store.ts";
import { trapDialogTab } from "../focus/dialog-focus.ts";
import { restoreWorldFocus } from "../focus/world-focus.ts";
import ItemIcon from "../items/ItemIcon.vue";

const panel = ref<HTMLElement | null>(null);
const control = ref<HTMLButtonElement | null>(null);
const held = ref(false);
const active = computed(() => gameUiState.fishing.phase !== "idle");
const terminal = computed(() => ["caught", "escaped", "inventory-full"].includes(gameUiState.fishing.phase));
const saveBlocked = computed(() => gameUiState.fishing.phase === "caught" && gameUiState.fishing.saveStatus !== "saved");
const saveFailed = computed(() => gameUiState.fishing.saveStatus === "failed");
const fish = computed(() => getItemDefinition(gameUiState.fishing.resultItemId));
const title = computed(() => {
  switch (gameUiState.fishing.phase) {
    case "casting": return "把鱼线送向水面";
    case "waiting": return gameUiState.fishing.bite ? "浮漂沉了，提竿！" : "静待咬钩";
    case "reeling": return "稳住这条鱼";
    case "caught": return saveFailed.value ? "鱼获还没有保存好" : "收获 · " + (fish.value?.name ?? "鱼");
    case "escaped": return "这次让它游走了";
    case "inventory-full": return "背包装不下了";
    case "idle": return "湖岸钓鱼";
  }
});
const instruction = computed(() => {
  const fishing = gameUiState.fishing;
  if (fishing.phase === "casting") return "按住蓄力，松开抛竿。远一些可能遇到不同的鱼。";
  if (fishing.phase === "waiting") return fishing.bite ? "现在点一下！" : "看着浮漂，等它沉下再提竿。等待时岛上照常计时。";
  if (fishing.phase === "reeling") return "按住收线会拉紧，松开会泄力。把指针留在中间的安全区。";
  if (fishing.phase === "inventory-full") return "这条鱼尚未收入背包。收竿会把它放回湖里，原有物品不受影响。";
  if (fishing.phase === "caught") {
    if (saveFailed.value) return "鱼仍留在当前背包，但尚未写入本地存档。请重试保存，暂时不要刷新或关闭页面。";
    if (saveBlocked.value) return "正在把这条鱼和当前背包写入本地存档，请稍候…";
    return "鱼已经收入背包并保存，可以出售、送礼或交付委托。";
  }
  if (fishing.failureReason === "missed-bite") return "错过了咬钩时机。下次看见浮漂下沉就提竿。";
  if (fishing.failureReason === "line-broke") return "鱼线拉得太紧。张力高时及时松开。";
  return "鱼线太松，鱼脱钩了。张力低时按住收线。";
});

/** Sends one held/released intent; local held only paints the control and never decides a catch. */
function setHeld(value: boolean): void {
  held.value = value;
  if (!active.value || terminal.value) return;
  dispatchLocalGameCommand({ type: "set-fishing-input", held: value });
}

/** Captures one pointer so releasing outside the button still releases the fishing line. */
function press(event: PointerEvent): void {
  if (!event.isPrimary || event.button !== 0) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  setHeld(true);
}

/** Releases the captured pointer without simulating extra casts or bites. */
function release(): void { setHeld(false); }

/** Maps keyboard press/release to the same single-input domain intent and ignores key repeat. */
function key(event: KeyboardEvent, down: boolean): void {
  if (event.code !== "Space" && event.code !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
  if (down && event.repeat) return;
  setHeld(down);
}

/** Cancels or dismisses one run and returns world focus; already spent cast stamina is not refunded. */
function dismiss(): void {
  if (saveBlocked.value) return;
  held.value = false;
  dispatchLocalGameCommand({ type: "dismiss-fishing" });
  restoreWorldFocus();
}

/** Retries persistence of the existing catch without starting another fishing attempt. */
function retrySave(): void { dispatchLocalGameCommand({ type: "retry-fishing-save" }); }

watch(() => [gameUiState.fishing.phase, gameUiState.fishing.saveStatus] as const, ([phase], [previous]) => {
  if (phase === "idle") return;
  if (previous === "idle" || terminal.value) {
    void nextTick(() => (terminal.value
      ? panel.value?.querySelector<HTMLButtonElement>("[data-dismiss]:not([disabled])") ?? panel.value
      : control.value)?.focus({ preventScroll: true }));
  }
  if (phase === "waiting") held.value = false;
});
onMounted(() => window.addEventListener("blur", release));
onUnmounted(() => window.removeEventListener("blur", release));
</script>

<template>
  <section v-if="active" ref="panel" class="fishing-panel" role="dialog" aria-modal="true"
    aria-labelledby="fishing-title" tabindex="-1" @keydown.esc.stop.prevent="dismiss"
    @keydown="trapDialogTab($event, panel)">
    <header class="fishing-panel__header">
      <div><span>湖岸 · 竹竿</span><h2 id="fishing-title" aria-live="polite">{{ title }}</h2></div>
      <button type="button" class="fishing-panel__close" aria-label="收竿离开钓鱼" :disabled="saveBlocked" @click="dismiss">收竿</button>
    </header>
    <p class="fishing-panel__instruction" :role="saveFailed ? 'alert' : undefined">{{ instruction }}</p>

    <div v-if="gameUiState.fishing.phase === 'casting'" class="fishing-panel__meter">
      <span>抛竿距离 <strong>{{ gameUiState.fishing.castPower }}%</strong></span>
      <div class="fishing-meter" role="progressbar" aria-label="抛竿距离" :aria-valuenow="gameUiState.fishing.castPower" :aria-valuemin="0" :aria-valuemax="100">
        <b :style="{ width: gameUiState.fishing.castPower + '%' }" />
      </div>
    </div>
    <div v-else-if="gameUiState.fishing.phase === 'waiting'" class="fishing-panel__float" :data-bite="gameUiState.fishing.bite" aria-hidden="true">
      <span class="fishing-float"><i /><b /></span>
      <strong>{{ gameUiState.fishing.bite ? '咬钩！' : '等候水纹' }}</strong>
    </div>
    <template v-else-if="gameUiState.fishing.phase === 'reeling'">
      <div class="fishing-panel__meter">
        <span>鱼线张力 <strong>{{ gameUiState.fishing.tension }}</strong></span>
        <div class="fishing-tension" role="meter" aria-label="鱼线张力，保持在安全区" :aria-valuenow="gameUiState.fishing.tension" :aria-valuemin="0" :aria-valuemax="100">
          <span class="fishing-tension__safe" :style="{ left: FISHING_SAFE_TENSION.min + '%', width: (FISHING_SAFE_TENSION.max - FISHING_SAFE_TENSION.min) + '%' }">安全区</span>
          <i :style="{ left: gameUiState.fishing.tension + '%' }" />
        </div>
        <div class="fishing-panel__ends"><span>太松会脱钩</span><span>太紧会断线</span></div>
      </div>
      <div class="fishing-panel__meter">
        <span>收线进度 <strong>{{ gameUiState.fishing.progress }}%</strong></span>
        <div class="fishing-meter" role="progressbar" aria-label="收线进度" :aria-valuenow="gameUiState.fishing.progress" :aria-valuemin="0" :aria-valuemax="100">
          <b :style="{ width: gameUiState.fishing.progress + '%' }" />
        </div>
      </div>
    </template>
    <div v-else-if="fish" class="fishing-panel__result"><ItemIcon :item-id="fish.id" :scale="3" /><strong>{{ fish.name }}</strong><small>{{ gameUiState.fishing.phase === 'caught' ? (saveBlocked ? '尚未保存' : '已收入背包 × 1') : '等待放生' }}</small></div>

    <button v-if="!terminal" ref="control" type="button" class="fishing-panel__control"
      :data-held="held" @pointerdown.prevent="press" @pointerup.prevent="release"
      @pointercancel="release" @lostpointercapture="release" @blur="release" @keydown="key($event, true)" @keyup="key($event, false)">
      {{ gameUiState.fishing.phase === 'casting' ? '按住蓄力 · 松开抛竿' : gameUiState.fishing.phase === 'waiting' ? '提竿' : '按住收线 · 松开泄力' }}
    </button>
    <button v-else type="button" class="fishing-panel__control" data-dismiss
      :disabled="saveBlocked && !saveFailed" @click="saveFailed ? retrySave() : dismiss()">
      {{ saveFailed ? '重试保存鱼获' : saveBlocked ? '正在保存…' : gameUiState.fishing.phase === 'inventory-full' ? '放回湖里' : '收好鱼竿' }}
    </button>
    <footer>每次准备一竿消耗 {{ STAMINA_COST.fishingCast }} 体力 · Space / Enter 或触摸操作</footer>
  </section>
</template>
