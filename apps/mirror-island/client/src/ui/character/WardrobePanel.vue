<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { DEFAULT_PLAYER_APPEARANCE, type PlayerAppearance } from "../../../../domain/player/appearance.ts";
import { flushLocalGameSession, getLocalGameSession } from "../../session/local-game-session.ts";
import { closeWardrobe, gameUiState, isWorldInputLocked, openWardrobe, setActionFeedback } from "../../stores/game-store.ts";
import StorageDialog from "../storage/StorageDialog.vue";
import CharacterAppearanceEditor from "./CharacterAppearanceEditor.vue";

const draft = ref<PlayerAppearance>({ ...DEFAULT_PLAYER_APPEARANCE });
const savePhase = ref<"idle" | "saving" | "failed">("idle");
const error = ref("");
const busy = computed(() => savePhase.value === "saving");

/** Starts a new draft from the current session snapshot; opening never changes the farmer. */
function open(): void {
  if (!openWardrobe()) return;
  draft.value = { ...gameUiState.playerAppearance };
  savePhase.value = "idle";
  error.value = "";
}

/** Cancels only an unsubmitted draft; a failed durable write must finish before this modal can close. */
function cancel(): void { if (savePhase.value === "idle") closeWardrobe(); }

/** Applies the draft and awaits local persistence; retry requeues the identical frozen draft after a write failure. */
async function save(): Promise<void> {
  if (busy.value) return;
  savePhase.value = "saving";
  error.value = "";
  try {
    const feedback = getLocalGameSession().dispatch({ type: "change-appearance", appearance: { ...draft.value } });
    if (feedback && "tone" in feedback && feedback.tone === "error") {
      error.value = feedback.message;
      savePhase.value = "idle";
      return;
    }
    await flushLocalGameSession();
    savePhase.value = "idle";
    closeWardrobe();
    setActionFeedback({ tone: "success", code: "appearance-saved", message: "新外观已保存。" });
  } catch {
    savePhase.value = "failed";
    error.value = "新外观尚未保存到浏览器，请重试保存。";
  }
}

watch(() => gameUiState.wardrobeOpen, (openState) => {
  if (!openState) { savePhase.value = "idle"; error.value = ""; }
});
</script>

<template>
  <button class="wardrobe-trigger" type="button" aria-haspopup="dialog" :aria-expanded="gameUiState.wardrobeOpen" :disabled="isWorldInputLocked()" @click="open">外观</button>
  <StorageDialog :open="gameUiState.wardrobeOpen" title="今天，换个模样" title-id="wardrobe-title" subtitle="搭配好以后，保存并回到岛上" :closable="savePhase === 'idle'" @close="cancel">
    <div class="wardrobe-content" :aria-busy="busy">
      <CharacterAppearanceEditor v-model="draft" :disabled="savePhase !== 'idle'" />
    </div>
    <template #footer>
      <div class="wardrobe-footer">
        <p v-if="error" class="wardrobe-error" role="alert">{{ error }}</p>
        <p v-else role="status">{{ busy ? '正在保存新外观…' : '保存前的调整只会显示在这里。' }}</p>
        <div class="wardrobe-actions">
          <button type="button" class="wardrobe-cancel" :disabled="savePhase !== 'idle'" @click="cancel">取消</button>
          <button type="button" class="wardrobe-save" :disabled="busy" @click="save">{{ busy ? '保存中…' : savePhase === 'failed' ? '重试保存' : '保存外观' }}</button>
        </div>
      </div>
    </template>
  </StorageDialog>
</template>

<style scoped>
.wardrobe-content { min-width: 0; }
.wardrobe-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.wardrobe-footer p { margin: 0; color: #6a7d67; font-size: 12px; line-height: 1.6; }
.wardrobe-footer .wardrobe-error { color: #9e533c; }
.wardrobe-actions { display: flex; flex-shrink: 0; gap: 8px; }
.wardrobe-actions button { min-height: 42px; padding: 9px 18px; border: 1px solid #b6c9a4; border-radius: 5px; color: #49694d; background: #fffaf0; font: inherit; font-size: 13px; cursor: pointer; }
.wardrobe-actions .wardrobe-save { border-color: #557e55; color: #fffdf4; background: #557e55; }
.wardrobe-actions button:disabled { cursor: wait; opacity: .65; }
.wardrobe-actions button:focus-visible { outline: 3px solid #bd754c; outline-offset: 2px; }
@media (max-width: 600px) { .wardrobe-footer { align-items: stretch; flex-direction: column; gap: 10px; } .wardrobe-actions { justify-content: flex-end; } }
</style>
