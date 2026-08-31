<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import type { PlayerAppearanceId } from "../../../../domain/player/appearance.ts";
import {
  PLAYER_APPEARANCE_OPTIONS,
  type PlayerAppearanceOption,
} from "../../game/assets/visual-profile.ts";

defineProps<{ readonly overwriting: boolean }>();

const emit = defineEmits<{
  confirm: [appearanceId: PlayerAppearanceId];
  cancel: [];
}>();

const selectedId = ref<PlayerAppearanceId>(PLAYER_APPEARANCE_OPTIONS[0]!.id);
const cardButtons = ref<HTMLButtonElement[]>([]);
const selectedOption = computed(() => (
  PLAYER_APPEARANCE_OPTIONS.find((option) => option.id === selectedId.value)
  ?? PLAYER_APPEARANCE_OPTIONS[0]!
));

/** Produces pixel-exact CSS crop variables for one approved source-sheet frame. */
function spriteStyle(option: PlayerAppearanceOption, scale: number): Record<string, string> {
  const preview = option.preview;
  return {
    "--sprite-image": `url("${preview.url}")`,
    "--sprite-sheet-width": `${preview.sheetWidth * scale}px`,
    "--sprite-sheet-height": `${preview.sheetHeight * scale}px`,
    "--sprite-frame-width": `${preview.width * scale}px`,
    "--sprite-frame-height": `${preview.height * scale}px`,
    "--sprite-x": `${-preview.x * scale}px`,
    "--sprite-y": `${-preview.y * scale}px`,
  };
}

/** Selects one appearance and moves keyboard focus to its card when requested. */
function selectAppearance(index: number, focus: boolean): void {
  const count = PLAYER_APPEARANCE_OPTIONS.length;
  const normalizedIndex = (index + count) % count;
  selectedId.value = PLAYER_APPEARANCE_OPTIONS[normalizedIndex]!.id;
  if (focus) void nextTick(() => cardButtons.value[normalizedIndex]?.focus());
}

/** Handles directional selection plus Enter/Escape without trapping ordinary Tab navigation. */
function handleKeyboard(event: KeyboardEvent): void {
  const currentIndex = PLAYER_APPEARANCE_OPTIONS.findIndex((option) => option.id === selectedId.value);
  if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    selectAppearance(currentIndex - 1, true);
  } else if (["ArrowRight", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    selectAppearance(currentIndex + 1, true);
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    selectAppearance(event.key === "Home" ? 0 : PLAYER_APPEARANCE_OPTIONS.length - 1, true);
  } else if (event.key === "Enter") {
    event.preventDefault();
    emit("confirm", selectedId.value);
  } else if (event.key === "Escape") {
    event.preventDefault();
    emit("cancel");
  }
}

/** Registers one rendered card button without creating a second appearance-order source. */
function registerCardButton(element: unknown): void {
  if (element instanceof HTMLButtonElement && !cardButtons.value.includes(element)) {
    cardButtons.value.push(element);
  }
}

onMounted(() => cardButtons.value[0]?.focus());
</script>

<template>
  <div class="character-creator" @keydown="handleKeyboard">
    <div class="character-creator__intro">
      <p class="start-panel__kicker">NEW LOCAL LIFE / 01</p>
      <h2>选择登岛模样</h2>
      <p>先定下第一天的样子。之后进入农场、房屋和小镇时，都会使用同一个角色。</p>
    </div>

    <div class="character-creator__stage">
      <section class="character-preview" aria-live="polite">
        <div class="character-preview__sky" aria-hidden="true">
          <span class="character-preview__sun" />
          <span class="character-preview__hill character-preview__hill--far" />
          <span class="character-preview__hill character-preview__hill--near" />
        </div>
        <div class="character-preview__sprite-bed" aria-hidden="true">
          <span
            class="character-sprite character-sprite--animated"
            :style="spriteStyle(selectedOption, 4)"
          />
        </div>
        <div class="character-preview__caption">
          <span>当前造型</span>
          <strong>{{ selectedOption.label }}</strong>
          <small>{{ selectedOption.note }}</small>
        </div>
      </section>

      <section class="character-picker" aria-labelledby="character-picker-title">
        <div class="character-picker__heading">
          <div>
            <span>01 / APPEARANCE</span>
            <h3 id="character-picker-title">九种岛民造型</h3>
          </div>
          <small>方向键切换 · Enter 确认</small>
        </div>
        <div class="character-grid" role="listbox" aria-label="角色造型">
          <button
            v-for="(option, index) in PLAYER_APPEARANCE_OPTIONS"
            :key="option.id"
            :ref="registerCardButton"
            type="button"
            class="character-card"
            :class="{ 'character-card--selected': selectedId === option.id }"
            role="option"
            :aria-selected="selectedId === option.id"
            @click="selectAppearance(index, false)"
            @focus="selectedId = option.id"
          >
            <span class="character-card__number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="character-card__portrait" aria-hidden="true">
              <span class="character-sprite" :style="spriteStyle(option, 1.5)" />
            </span>
            <span class="character-card__copy">
              <strong>{{ option.label }}</strong>
              <small>{{ option.note }}</small>
            </span>
            <span class="character-card__check" aria-hidden="true">◆</span>
          </button>
        </div>
      </section>
    </div>

    <p v-if="overwriting" class="character-creator__warning">
      确认开始后，当前浏览器里的旧农场会被新角色覆盖。
    </p>

    <div class="character-creator__actions">
      <button type="button" class="secondary-action" @click="emit('cancel')">返回</button>
      <button type="button" class="primary-action" @click="emit('confirm', selectedId)">
        开始新生活
      </button>
    </div>
  </div>
</template>
