<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { PlayerAppearance } from "../../../../domain/player/appearance.ts";
import { FRAME_HEIGHT, FRAME_WIDTH, paintCharacterFrame } from "../../game/presentation/character-art.ts";

const props = defineProps<{ appearance: PlayerAppearance }>();
const canvas = ref<HTMLCanvasElement | null>(null);
const facing = ref<"down" | "left" | "right" | "up">("down");
const walking = ref(false);
const step = ref(1);
const directions = [
  { value: "down", label: "正面" }, { value: "left", label: "左侧" },
  { value: "up", label: "背面" }, { value: "right", label: "右侧" },
] as const;
let walkTimer: ReturnType<typeof setInterval> | undefined;
const WALK_STEPS = [0, 1, 2, 1] as const;
let walkPhase = 1;

/** Paints the appearance draft with the world's frame painter; the canvas retains native pixel resolution. */
function paint(): void {
  const context = canvas.value?.getContext("2d");
  if (context) paintCharacterFrame(context, props.appearance, facing.value, step.value);
}

/** Toggles the same six-fps stride/neutral/stride/neutral cycle as the world, without changing appearance or storage. */
function toggleWalk(): void {
  walking.value = !walking.value;
  if (walkTimer) clearInterval(walkTimer);
  walkTimer = undefined;
  walkPhase = 1;
  step.value = 1;
  if (walking.value) walkTimer = setInterval(() => {
    walkPhase = (walkPhase + 1) % WALK_STEPS.length;
    step.value = WALK_STEPS[walkPhase]!;
  }, 1000 / 6);
}

watch([() => props.appearance, facing, step], paint, { deep: true });
onMounted(paint);
onBeforeUnmount(() => { if (walkTimer) clearInterval(walkTimer); });
</script>

<template>
  <section class="outfit-preview" aria-label="角色外观预览">
    <div class="outfit-preview__scene">
      <span class="outfit-preview__tag">你的岛民</span>
      <div class="outfit-preview__actor">
        <div class="outfit-preview__ground" aria-hidden="true" />
        <canvas ref="canvas" :width="FRAME_WIDTH" :height="FRAME_HEIGHT" role="img" :aria-label="`${directions.find((direction) => direction.value === facing)?.label}角色预览${walking ? '，行走中' : ''}`" />
      </div>
    </div>
    <div class="outfit-preview__controls">
      <div class="outfit-preview__directions" role="group" aria-label="预览朝向">
        <button v-for="direction in directions" :key="direction.value" type="button" :aria-pressed="facing === direction.value" @click="facing = direction.value">{{ direction.label }}</button>
      </div>
      <button class="outfit-preview__walk" type="button" :aria-pressed="walking" @click="toggleWalk">{{ walking ? '暂停行走' : '看看走路' }}</button>
      <p>头部、上装、下装独立搭配<br>换一个角度，看看你的新模样。</p>
    </div>
  </section>
</template>

<style scoped>
.outfit-preview { display: flex; flex-direction: column; overflow: hidden; min-width: 0; border: 1px solid #bfd1b4; border-radius: 10px; background: #f1f6e8; }
.outfit-preview__scene { position: relative; display: grid; place-items: center; flex: 1; min-height: 260px; padding: 45px 20px 28px; background: linear-gradient(#e4f5ed 60%, #d7ebba 60%); }
.outfit-preview__tag { position: absolute; top: 18px; left: 18px; color: #5b7e67; font-size: 12px; letter-spacing: .12em; }
.outfit-preview__actor { position: relative; width: 144px; height: 192px; }
.outfit-preview__ground { position: absolute; bottom: 6px; left: calc(50% - 36px); width: 72px; height: 12px; border-radius: 50%; background: #94b78870; }
canvas { position: relative; width: 144px; height: 192px; image-rendering: pixelated; }
.outfit-preview__controls { padding: 16px; text-align: center; }
.outfit-preview__directions { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; }
button { min-height: 40px; padding: 6px; border: 1px solid #b5c9a6; border-radius: 5px; color: #45664b; background: #fffdf5; font: inherit; font-size: 12px; cursor: pointer; }
button[aria-pressed="true"] { border-color: #5b8661; color: #fffdf5; background: #5b8661; }
button:focus-visible { outline: 3px solid #bd754c; outline-offset: 2px; }
.outfit-preview__walk { width: 100%; margin-top: 8px; background: #f8e5c9; }
p { margin: 12px 0 0; color: #6a7d67; font-size: 11px; line-height: 1.8; }
@media (max-width: 600px) {
  .outfit-preview { flex-direction: row; }
  .outfit-preview__scene { min-height: 192px; padding: 34px 10px 18px; min-width: 122px; }
  .outfit-preview__tag { top: 12px; left: 12px; font-size: 10px; }
  canvas { width: 96px; height: 128px; }
  .outfit-preview__actor { width: 96px; height: 128px; }
  .outfit-preview__ground { width: 48px; height: 8px; left: calc(50% - 24px); bottom: 4px; }
  .outfit-preview__controls { flex: 1; min-width: 0; padding: 12px; align-self: center; }
  .outfit-preview__directions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  p { display: none; }
}
</style>
