<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { PlayerAppearanceId } from "../../domain/player/appearance.ts";
import PhaserGame from "./PhaserGame.vue";
import { HOME_HERO_URL } from "./game/assets/media-catalog.ts";
import { isToolArtPreviewEnabled } from "./game/assets/tool-art-candidate.ts";
import { daylightVisualAt } from "./game/presentation/daylight.ts";
import { loadWorldCatalog } from "./game/world/world-catalog.ts";
import {
  removeRetiredLocalStorageSaves,
} from "./persistence/IndexedDbSaveRepository.ts";
import {
  flushLocalGameSession,
  getLocalGameSession,
  initializeLocalGameSession,
  initializeLocalPlaytestGameSession,
  shutdownLocalGameSession,
} from "./session/local-game-session.ts";
import {
  gameUiState,
  setGamePhase,
  setSaveAvailable,
} from "./stores/game-store.ts";
import DebugControls from "./ui/debug/DebugControls.vue";
import DialoguePanel from "./ui/dialogue/DialoguePanel.vue";
import LifeHud from "./ui/hud/LifeHud.vue";
import Hotbar from "./ui/hotbar/Hotbar.vue";
import ShopPanel from "./ui/shop/ShopPanel.vue";
import SleepConfirmationPanel from "./ui/sleep/SleepConfirmationPanel.vue";
import SocialPanel from "./ui/social/SocialPanel.vue";
import TouchControls from "./ui/controls/TouchControls.vue";
import CalendarPanel from "./ui/calendar/CalendarPanel.vue";
import CharacterCreator from "./ui/character/CharacterCreator.vue";
import AudioSettingsPanel from "./ui/audio/AudioSettingsPanel.vue";
import BackpackPanel from "./ui/inventory/BackpackPanel.vue";
import RequestBoardPanel from "./ui/requests/RequestBoardPanel.vue";

const failureMessage = ref("");
const localSessionReady = ref(false);
const characterCreationReturnPhase = ref<"menu" | "error">("menu");
const debugMode = computed(() => new URLSearchParams(window.location.search).get("debug") === "1");
const toolArtPreviewMode = isToolArtPreviewEnabled();
const daylight = computed(() => daylightVisualAt(gameUiState.minuteOfDay, gameUiState.regionId));
const daylightStyle = computed(() => ({
  "--daylight-color": daylight.value.color,
  "--daylight-opacity": daylight.value.opacity.toFixed(3),
}));
const homeHeroStyle = {
  "--home-hero-image": `url("${HOME_HERO_URL}")`,
};

const phaseLabel = computed(() => ({
  initializing: "正在准备本地世界",
  menu: "本地世界待命",
  "character-creation": "正在选择登岛模样",
  loading: "正在读取存档",
  playing: "本地存档已启用",
  error: "暂时无法开始",
}[gameUiState.phase]));

/** Opens character creation after protecting an existing save from an accidental overwrite. */
async function startNewGame(): Promise<void> {
  if (gameUiState.saveAvailable && !window.confirm("新游戏会覆盖当前本地存档，确定继续吗？")) return;
  characterCreationReturnPhase.value = gameUiState.phase === "error" ? "error" : "menu";
  setGamePhase("character-creation");
}

/** Creates and enters a fresh local world using the appearance confirmed on the creation page. */
async function confirmCharacterCreation(appearanceId: PlayerAppearanceId): Promise<void> {
  await enterGame(() => getLocalGameSession().newGame(appearanceId));
}

/** Leaves character creation without writing or deleting the current browser save. */
function cancelCharacterCreation(): void {
  setGamePhase(characterCreationReturnPhase.value);
}

/** Loads the validated anonymous playtest slot from this browser. */
async function continueGame(): Promise<void> {
  if (!gameUiState.saveAvailable) return;
  await enterGame(() => getLocalGameSession().continueGame());
}

/** Runs one menu transition and exposes a recoverable error without mounting Phaser early. */
async function enterGame(start: () => Promise<unknown>): Promise<void> {
  failureMessage.value = "";
  setGamePhase("loading");
  try {
    await start();
    setSaveAvailable(true);
    setGamePhase("playing");
  } catch {
    failureMessage.value = "本地存档无法读取或写入，请刷新后重试。";
    setGamePhase("error");
  }
}

/** Reloads the current origin after a local startup or persistence failure. */
function reloadPage(): void {
  window.location.reload();
}

/** Requests a final movement checkpoint when the browser page is being hidden. */
function checkpointOnPageHide(): void {
  void flushLocalGameSession().catch(() => undefined);
}

onMounted(async () => {
  if (toolArtPreviewMode) {
    try {
      removeRetiredLocalStorageSaves();
      const catalog = await loadWorldCatalog();
      initializeLocalGameSession("tool-art-preview", catalog);
      localSessionReady.value = true;
      window.addEventListener("pagehide", checkpointOnPageHide);
      await getLocalGameSession().newGame();
      setSaveAvailable(true);
      setGamePhase("playing");
    } catch {
      failureMessage.value = "工具美术本地预览无法启动，请确认候选原图和 IndexedDB 可用。";
      setGamePhase("error");
    }
    return;
  }
  try {
    removeRetiredLocalStorageSaves();
    const catalog = await loadWorldCatalog();
    initializeLocalPlaytestGameSession(catalog);
    localSessionReady.value = true;
    window.addEventListener("pagehide", checkpointOnPageHide);
  } catch {
    failureMessage.value = "本地世界或存储暂时不可用，请刷新后重试。";
    setGamePhase("error");
    return;
  }
  try {
    setSaveAvailable(await getLocalGameSession().hasSave());
    setGamePhase("menu");
  } catch {
    failureMessage.value = "检测到无法读取的本地存档。你可以覆盖为新游戏，旧内容不会被静默恢复。";
    setGamePhase("error");
  }
});

onUnmounted(() => {
  window.removeEventListener("pagehide", checkpointOnPageHide);
  void shutdownLocalGameSession().catch(() => undefined);
});
</script>

<template>
  <main
    class="island-shell"
    :class="{
      'island-shell--game': gameUiState.phase === 'playing' && !debugMode,
      'island-shell--home': gameUiState.phase !== 'playing',
    }"
  >
    <header v-if="gameUiState.phase === 'playing' && debugMode" class="field-header">
      <div>
        <p class="eyebrow">MIRROR ISLAND / LOCAL FIELD 01</p>
        <h1>镜像岛</h1>
      </div>
      <div class="signal" :data-phase="gameUiState.phase">
        <span class="signal__lamp" aria-hidden="true" />
        <span>{{ phaseLabel }}</span>
      </div>
    </header>

    <section
      v-if="gameUiState.phase === 'playing'"
      class="world-frame"
      :class="{ 'world-frame--game': !debugMode }"
      :data-daylight="daylight.phase"
      :data-environment="daylight.environment"
      :style="daylightStyle"
    >
      <PhaserGame />
      <aside v-if="debugMode" class="telemetry">
        <span>运行模式</span>
        <strong>LOCAL</strong>
      </aside>
      <p
        v-if="gameUiState.feedback"
        class="action-feedback"
        :data-tone="gameUiState.feedback.tone"
        :data-modal-open="gameUiState.shopOpen || gameUiState.dialogue !== null || gameUiState.sleepConfirmationOpen || gameUiState.socialOpen || gameUiState.calendarOpen || gameUiState.audioSettingsOpen || gameUiState.backpackOpen || gameUiState.requestBoardOpen"
        aria-live="polite"
      >
        {{ gameUiState.feedback.message }}
      </p>
      <LifeHud />
      <SocialPanel />
      <AudioSettingsPanel />
      <BackpackPanel />
      <RequestBoardPanel />
      <CalendarPanel />
      <TouchControls v-if="!debugMode" />
      <DialoguePanel />
      <ShopPanel />
      <SleepConfirmationPanel />
      <div v-if="!debugMode" class="game-hud">
        <Hotbar />
      </div>
    </section>

    <section
      v-else
      class="start-panel"
      :class="{
        'start-panel--character': gameUiState.phase === 'character-creation',
        'start-panel--welcome': gameUiState.phase !== 'character-creation',
      }"
      :style="gameUiState.phase === 'character-creation' ? undefined : homeHeroStyle"
      aria-live="polite"
    >
      <CharacterCreator
        v-if="gameUiState.phase === 'character-creation'"
        :overwriting="gameUiState.saveAvailable"
        @confirm="confirmCharacterCreation"
        @cancel="cancelCharacterCreation"
      />

      <template v-else>
        <div class="home-mist" aria-hidden="true" />
        <aside class="home-save-status" :data-phase="gameUiState.phase" role="status">
          <span class="home-save-status__mark" aria-hidden="true">⌂</span>
          <span>{{ phaseLabel }}</span>
        </aside>

        <article class="home-scroll" :data-phase="gameUiState.phase">
          <div class="home-scroll__hanger" aria-hidden="true" />
          <div class="home-scroll__paper">
            <header class="home-brand">
              <span class="home-brand__sprig" aria-hidden="true">⌇</span>
              <h1>镜像岛</h1>
              <span class="home-brand__seal" aria-hidden="true">归园</span>
              <p>MIRROR ISLAND</p>
              <div class="home-brand__rule" aria-hidden="true">
                <span />
                <i>东方田园 · 单人本地世界</i>
                <span />
              </div>
            </header>

            <div
              v-if="gameUiState.phase === 'initializing' || gameUiState.phase === 'loading'"
              class="home-scroll__content home-scroll__content--status"
            >
              <p class="start-panel__kicker">归园途中</p>
              <h2>{{ gameUiState.phase === 'initializing' ? '正在备好小院' : '正在推开院门' }}</h2>
              <p>世界状态正在从这台浏览器的本地存档中读取，请稍候片刻。</p>
              <span class="home-loading" aria-hidden="true"><i /><i /><i /></span>
            </div>

            <div v-else-if="gameUiState.phase === 'menu'" class="home-scroll__content">
              <p class="start-panel__kicker">从一方小院开始</p>
              <h2>归园启程</h2>
              <p>播种、收获，自由采集。慢慢经营属于自己的岛上生活。</p>
              <div class="start-actions">
                <button type="button" class="primary-action" @click="startNewGame">
                  <span>开始新旅</span>
                  <i aria-hidden="true">❧</i>
                </button>
                <button
                  type="button"
                  class="secondary-action"
                  :disabled="!gameUiState.saveAvailable"
                  @click="continueGame"
                >
                  继续上次
                </button>
              </div>
              <small>
                {{ gameUiState.saveAvailable ? '已找到这台浏览器里的小院。' : '这台浏览器还没有本地存档。' }}
                清除站点数据会丢失进度，存档不会同步到其他设备。
              </small>
            </div>

            <div v-else class="home-scroll__content home-scroll__content--error" role="alert">
              <p class="start-panel__kicker">归途暂阻</p>
              <h2>暂时无法进入</h2>
              <p>{{ failureMessage }}</p>
              <div class="start-actions">
                <button
                  v-if="localSessionReady"
                  type="button"
                  class="primary-action"
                  @click="startNewGame"
                >
                  覆盖为新游戏
                </button>
                <button type="button" class="secondary-action" @click="reloadPage">刷新重试</button>
              </div>
            </div>
          </div>
          <div class="home-scroll__foot" aria-hidden="true" />
        </article>

        <footer class="home-ribbon">
          <span><i aria-hidden="true">❧</i> 轻松种田 · 自由采集 · 本地保存</span>
          <a href="/THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener noreferrer">素材鸣谢</a>
          <span>镜像岛开发中 <i aria-hidden="true">印</i></span>
        </footer>
      </template>
    </section>

    <div v-if="gameUiState.phase === 'playing' && debugMode" class="debug-dock">
      <DebugControls />
      <Hotbar />
    </div>

    <footer v-if="gameUiState.phase === 'playing' && debugMode" class="field-footer">
      <span>移动靠近目标 · 点击树木或农田</span>
      <a href="/THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener noreferrer">素材鸣谢</a>
    </footer>
  </main>
</template>
