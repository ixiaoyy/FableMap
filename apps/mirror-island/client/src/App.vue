<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { PlayerAppearanceId } from "../../domain/player/appearance.ts";
import PhaserGame from "./PhaserGame.vue";
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
import CharacterCreator from "./ui/character/CharacterCreator.vue";

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
    :class="{ 'island-shell--game': gameUiState.phase === 'playing' && !debugMode }"
  >
    <header v-if="gameUiState.phase !== 'playing' || debugMode" class="field-header">
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
        :data-modal-open="gameUiState.shopOpen || gameUiState.dialogue !== null || gameUiState.sleepConfirmationOpen || gameUiState.socialOpen"
        aria-live="polite"
      >
        {{ gameUiState.feedback.message }}
      </p>
      <LifeHud />
      <SocialPanel />
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
      :class="{ 'start-panel--character': gameUiState.phase === 'character-creation' }"
      aria-live="polite"
    >
      <div v-if="gameUiState.phase === 'initializing' || gameUiState.phase === 'loading'">
        <p class="start-panel__kicker">PERSONAL WORLD</p>
        <h2>{{ gameUiState.phase === 'initializing' ? '正在准备本地世界' : '正在打开本地世界' }}</h2>
        <p>世界状态只在这台浏览器的 IndexedDB 中读取和保存。</p>
      </div>

      <div v-else-if="gameUiState.phase === 'menu'">
        <p class="start-panel__kicker">PERSONAL WORLD</p>
        <h2>从自己的农场开始</h2>
        <p>这一版不连接多人房间。采集、制作、种田与存档都由本地 GameSession 负责。</p>
        <div class="start-actions">
          <button type="button" class="primary-action" @click="startNewGame">新游戏</button>
          <button
            type="button"
            class="secondary-action"
            :disabled="!gameUiState.saveAvailable"
            @click="continueGame"
          >
            继续游戏
          </button>
        </div>
        <small>
          {{ gameUiState.saveAvailable ? '检测到这台浏览器的本地存档。' : '这台浏览器还没有本地存档。' }}
          清除站点数据会丢失进度，存档不会同步到其他设备。
        </small>
      </div>

      <CharacterCreator
        v-else-if="gameUiState.phase === 'character-creation'"
        :overwriting="gameUiState.saveAvailable"
        @confirm="confirmCharacterCreation"
        @cancel="cancelCharacterCreation"
      />

      <div v-else role="alert">
        <p class="start-panel__kicker">LOCAL WORLD ERROR</p>
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
    </section>

    <div v-if="gameUiState.phase === 'playing' && debugMode" class="debug-dock">
      <DebugControls />
      <Hotbar />
    </div>

    <footer v-if="gameUiState.phase !== 'playing' || debugMode" class="field-footer">
      <span>{{ gameUiState.phase === 'playing' ? '移动靠近目标 · 点击树木或农田' : '单人世界 · 本地存档' }}</span>
      <a href="/THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener noreferrer">素材鸣谢</a>
    </footer>
  </main>
</template>
