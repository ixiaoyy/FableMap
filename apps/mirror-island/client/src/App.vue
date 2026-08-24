<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  deriveLocalSaveOwnerKey,
  initializeKeycloakSession,
  type AuthenticatedSession,
} from "./auth/keycloak.ts";
import PhaserGame from "./PhaserGame.vue";
import {
  removeRetiredLocalStorageSaves,
} from "./persistence/IndexedDbSaveRepository.ts";
import {
  flushLocalGameSession,
  getLocalGameSession,
  initializeLocalGameSession,
  shutdownLocalGameSession,
} from "./session/local-game-session.ts";
import {
  gameUiState,
  setGamePhase,
  setSaveAvailable,
} from "./stores/game-store.ts";
import DebugControls from "./ui/debug/DebugControls.vue";
import Hotbar from "./ui/hotbar/Hotbar.vue";

const failureMessage = ref("");
const localSessionReady = ref(false);
let authenticatedSession: AuthenticatedSession | null = null;

const phaseLabel = computed(() => ({
  authenticating: "正在确认身份",
  menu: "本地世界待命",
  loading: "正在读取存档",
  playing: "本地存档已启用",
  error: "暂时无法开始",
}[gameUiState.phase]));

/** Starts a fresh local slot after protecting an existing save from an accidental overwrite. */
async function startNewGame(): Promise<void> {
  if (gameUiState.saveAvailable && !window.confirm("新游戏会覆盖当前本地存档，确定继续吗？")) return;
  await enterGame(() => getLocalGameSession().newGame());
}

/** Loads the authenticated profile's validated IndexedDB slot. */
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

/** Reloads the current origin after an authentication or local persistence failure. */
function reloadPage(): void {
  window.location.reload();
}

/** Requests a final movement checkpoint when the browser page is being hidden. */
function checkpointOnPageHide(): void {
  void flushLocalGameSession().catch(() => undefined);
}

onMounted(async () => {
  try {
    removeRetiredLocalStorageSaves();
    authenticatedSession = await initializeKeycloakSession();
    initializeLocalGameSession(await deriveLocalSaveOwnerKey(authenticatedSession.subject));
    localSessionReady.value = true;
    window.addEventListener("pagehide", checkpointOnPageHide);
  } catch {
    failureMessage.value = "登录或本地存储暂时不可用，请刷新后重试。";
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
  authenticatedSession?.dispose();
  void shutdownLocalGameSession().catch(() => undefined);
});
</script>

<template>
  <main class="island-shell">
    <header class="field-header">
      <div>
        <p class="eyebrow">MIRROR ISLAND / LOCAL FIELD 01</p>
        <h1>镜像岛</h1>
      </div>
      <div class="signal" :data-phase="gameUiState.phase">
        <span class="signal__lamp" aria-hidden="true" />
        <span>{{ phaseLabel }}</span>
      </div>
    </header>

    <section v-if="gameUiState.phase === 'playing'" class="world-frame">
      <PhaserGame />
      <aside class="telemetry">
        <span>运行模式</span>
        <strong>LOCAL</strong>
      </aside>
      <p
        v-if="gameUiState.feedback"
        class="action-feedback"
        :data-tone="gameUiState.feedback.tone"
        aria-live="polite"
      >
        {{ gameUiState.feedback.message }}
      </p>
    </section>

    <section v-else class="start-panel" aria-live="polite">
      <div v-if="gameUiState.phase === 'authenticating' || gameUiState.phase === 'loading'">
        <p class="start-panel__kicker">PERSONAL WORLD</p>
        <h2>{{ gameUiState.phase === 'authenticating' ? '正在确认你的身份' : '正在打开本地世界' }}</h2>
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
        <small>{{ gameUiState.saveAvailable ? '检测到当前账号的本地存档' : '当前账号还没有本地存档' }}</small>
      </div>

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

    <div v-if="gameUiState.phase === 'playing'" class="debug-dock">
      <DebugControls />
      <Hotbar />
    </div>

    <footer class="field-footer">
      <span>{{ gameUiState.phase === 'playing' ? '移动靠近目标 · 点击树木或农田' : '单人世界 · 本地存档' }}</span>
      <span>Stardew Core / Batch 01</span>
    </footer>
  </main>
</template>
