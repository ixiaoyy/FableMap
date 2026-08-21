<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { initializeKeycloakSession, type AuthenticatedSession } from "./auth/keycloak.ts";
import { connectWorld, disconnectWorld } from "./network/world-connection.ts";
import PhaserGame from "./PhaserGame.vue";
import { worldUiState } from "./stores/world-store.ts";
import Hotbar from "./ui/hotbar/Hotbar.vue";

const failureMessage = ref("");
let session: AuthenticatedSession | null = null;

const connectionLabel = computed(() => ({
  idle: "待命",
  connecting: "正在校准信标",
  connected: "共享世界已连接",
  reconnecting: "信号中断，正在重连",
  offline: "已离线",
  error: "连接失败",
}[worldUiState.connectionPhase]));

/** Reloads the current origin after a visible authentication or world-link failure. */
function reloadPage(): void {
  window.location.reload();
}

onMounted(async () => {
  try {
    session = await initializeKeycloakSession();
    await connectWorld(await session.getAccessToken());
  } catch {
    failureMessage.value = "登录或世界信标暂时不可用，请刷新后重试。";
  }
});

onUnmounted(() => {
  session?.dispose();
  void disconnectWorld();
});
</script>

<template>
  <main class="island-shell">
    <header class="field-header">
      <div>
        <p class="eyebrow">MIRROR ISLAND / FIELD LINK 01</p>
        <h1>镜像岛</h1>
      </div>
      <div class="signal" :data-phase="worldUiState.connectionPhase">
        <span class="signal__lamp" aria-hidden="true" />
        <span>{{ connectionLabel }}</span>
      </div>
    </header>

    <section class="world-frame">
      <PhaserGame />
      <aside class="telemetry" aria-live="polite">
        <span>在线信号</span>
        <strong>{{ worldUiState.players.length.toString().padStart(2, '0') }}</strong>
      </aside>
      <p
        v-if="worldUiState.feedback"
        class="action-feedback"
        :data-tone="worldUiState.feedback.tone"
      >
        {{ worldUiState.feedback.message }}
      </p>
    </section>

    <Hotbar />

    <footer class="field-footer">
      <span>移动靠近目标 · 点击树木或农田</span>
      <span>服务端权威原型</span>
    </footer>

    <section v-if="failureMessage" class="failure" role="alert">
      <strong>无法进入共享世界</strong>
      <p>{{ failureMessage }}</p>
      <button type="button" @click="reloadPage">重新校准</button>
    </section>
  </main>
</template>
