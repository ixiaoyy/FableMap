<script setup lang="ts">
import { ref } from "vue";
import { DEFAULT_PLAYER_APPEARANCE, type PlayerAppearance } from "../../../../domain/player/appearance.ts";
import CharacterAppearanceEditor from "./CharacterAppearanceEditor.vue";

defineProps<{ readonly overwriting: boolean }>();
const emit = defineEmits<{ confirm: [appearance: PlayerAppearance]; cancel: [] }>();
const appearance = ref<PlayerAppearance>({ ...DEFAULT_PLAYER_APPEARANCE });
</script>

<template>
  <div class="character-creator" @keydown.esc.stop.prevent="emit('cancel')">
    <div class="character-creator__intro">
      <p class="start-panel__kicker">岛上新生活</p>
      <h2>捏出你的岛民</h2>
      <p>从发型到衣服，自由搭配每一部分。入住后也能随时打开「外观」换装。</p>
    </div>
    <CharacterAppearanceEditor v-model="appearance" />
    <p v-if="overwriting" class="character-creator__warning">确认开始后，当前浏览器里的旧农场会被新角色覆盖。</p>
    <div class="character-creator__actions">
      <button type="button" class="secondary-action" @click="emit('cancel')">返回</button>
      <button type="button" class="primary-action" @click="emit('confirm', { ...appearance })">开始新生活</button>
    </div>
  </div>
</template>
