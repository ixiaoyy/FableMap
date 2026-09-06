<script setup lang="ts">
import type { PlayerAppearance } from "../../../../domain/player/appearance.ts";
import CharacterPreview from "./CharacterPreview.vue";

const props = withDefaults(defineProps<{ modelValue: PlayerAppearance; disabled?: boolean }>(), { disabled: false });
const emit = defineEmits<{ "update:modelValue": [appearance: PlayerAppearance] }>();
const skinColors = [
  { value: "peach", label: "浅桃", color: "#e8b898" }, { value: "tan", label: "暖棕", color: "#c88e63" }, { value: "umber", label: "深褐", color: "#926344" },
] as const;
const hairColors = [
  { value: "chestnut", label: "栗棕", color: "#82563e" }, { value: "black", label: "墨黑", color: "#3e4145" }, { value: "gold", label: "亚麻金", color: "#cfad68" },
] as const;
const topColors = [
  { value: "mint", label: "薄荷绿", color: "#8ab797" }, { value: "cream", label: "暖白", color: "#eadcba" },
  { value: "coral", label: "珊瑚橙", color: "#e8967d" }, { value: "sky", label: "晴空蓝", color: "#8bbbc8" },
] as const;
const bottomColors = [
  { value: "denim", label: "牛仔蓝", color: "#638296" }, { value: "sand", label: "浅沙色", color: "#c6ab82" }, { value: "forest", label: "森林绿", color: "#637c5f" },
] as const;

/** Replaces one typed draft field and emits a fresh appearance value; gameplay and storage are untouched. */
function change<K extends keyof PlayerAppearance>(field: K, value: PlayerAppearance[K]): void {
  if (!props.disabled) emit("update:modelValue", { ...props.modelValue, [field]: value });
}

/** Reads a fixed native-select option into its matching draft field; the domain validates on confirmation. */
function select(field: "head" | "top" | "bottom", event: Event): void {
  const element = event.target;
  if (element instanceof HTMLSelectElement) change(field, element.value as PlayerAppearance[typeof field]);
}
</script>

<template>
  <div class="appearance-editor">
    <CharacterPreview :appearance="modelValue" />
    <div class="appearance-editor__fields">
      <fieldset :disabled="disabled" class="appearance-section">
        <legend>基本外观</legend>
        <div class="appearance-section__row"><span>性别</span><div class="appearance-choice" role="group" aria-label="性别">
          <button type="button" :aria-pressed="modelValue.gender === 'male'" @click="change('gender', 'male')">男</button>
          <button type="button" :aria-pressed="modelValue.gender === 'female'" @click="change('gender', 'female')">女</button>
        </div></div>
        <div class="appearance-section__row"><span>肤色</span><div class="appearance-swatches" role="group" aria-label="肤色">
          <button v-for="color in skinColors" :key="color.value" type="button" :aria-label="`肤色：${color.label}`" :title="color.label" :aria-pressed="modelValue.skinTone === color.value" :style="{ '--swatch': color.color }" @click="change('skinTone', color.value)"><span aria-hidden="true" /></button>
        </div></div>
      </fieldset>
      <fieldset :disabled="disabled" class="appearance-section">
        <legend><span>上</span> 头部</legend>
        <label class="appearance-section__row"><span>发型</span><select :value="modelValue.head" @change="select('head', $event)"><option value="short">清爽短发</option><option value="bob">柔软短波波</option><option value="ponytail">轻快马尾</option></select></label>
        <div class="appearance-section__row"><span>发色</span><div class="appearance-swatches" role="group" aria-label="发色">
          <button v-for="color in hairColors" :key="color.value" type="button" :aria-label="`发色：${color.label}`" :title="color.label" :aria-pressed="modelValue.hairColor === color.value" :style="{ '--swatch': color.color }" @click="change('hairColor', color.value)"><span aria-hidden="true" /></button>
        </div></div>
      </fieldset>
      <fieldset :disabled="disabled" class="appearance-section">
        <legend><span>中</span> 上装</legend>
        <label class="appearance-section__row"><span>衣服</span><select :value="modelValue.top" @change="select('top', $event)"><option value="shirt">日常衬衫</option><option value="overalls">农场背带装</option><option value="jacket">轻便外套</option></select></label>
        <div class="appearance-section__row"><span>颜色</span><div class="appearance-swatches" role="group" aria-label="上装颜色">
          <button v-for="color in topColors" :key="color.value" type="button" :aria-label="`上装颜色：${color.label}`" :title="color.label" :aria-pressed="modelValue.topColor === color.value" :style="{ '--swatch': color.color }" @click="change('topColor', color.value)"><span aria-hidden="true" /></button>
        </div></div>
      </fieldset>
      <fieldset :disabled="disabled" class="appearance-section">
        <legend><span>下</span> 下装</legend>
        <label class="appearance-section__row"><span>款式</span><select :value="modelValue.bottom" @change="select('bottom', $event)"><option value="trousers">直筒长裤</option><option value="shorts">夏日短裤</option><option value="skirt">田园短裙</option></select></label>
        <div class="appearance-section__row"><span>颜色</span><div class="appearance-swatches" role="group" aria-label="下装颜色">
          <button v-for="color in bottomColors" :key="color.value" type="button" :aria-label="`下装颜色：${color.label}`" :title="color.label" :aria-pressed="modelValue.bottomColor === color.value" :style="{ '--swatch': color.color }" @click="change('bottomColor', color.value)"><span aria-hidden="true" /></button>
        </div></div>
      </fieldset>
      <p class="appearance-editor__note">所有发型与衣服都能自由组合，切换性别会保留搭配。</p>
    </div>
  </div>
</template>

<style scoped>
.appearance-editor { display: grid; grid-template-columns: minmax(220px, .8fr) minmax(310px, 1.2fr); gap: 18px; color: #3b5f44; }
.appearance-editor__fields { display: grid; gap: 10px; }
.appearance-section { display: grid; gap: 4px; min-width: 0; margin: 0; padding: 6px 12px 8px; border: 1px solid #c5d4b5; border-radius: 8px; background: #fffdf5; }
.appearance-section legend { padding: 0 7px; color: #456e4e; font-size: 14px; font-weight: 700; }
.appearance-section legend > span { display: inline-grid; place-items: center; width: 21px; height: 21px; margin-right: 3px; border-radius: 4px; color: #8e603f; background: #f8e5c9; font-size: 11px; }
.appearance-section__row { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin: 0; color: #657a62; font-size: 12px; }
.appearance-section__row > span { flex-shrink: 0; }
select { width: min(220px, 75%); min-height: 36px; padding: 6px 10px; border: 1px solid #bfceb1; border-radius: 5px; color: #3d6246; background: #f3f7ec; font: inherit; font-size: 13px; }
.appearance-choice { display: flex; gap: 6px; }
.appearance-choice button { min-width: 70px; min-height: 36px; padding: 5px 12px; border: 1px solid #c0d0b2; border-radius: 5px; color: #506d50; background: #f3f7ec; font: inherit; cursor: pointer; }
.appearance-choice button[aria-pressed="true"] { color: #3b5f44; border-color: #9cae81; background: #e4efcf; box-shadow: inset 0 0 0 1px #9caf82; }
.appearance-swatches { display: flex; gap: 4px; }
.appearance-swatches button { display: grid; place-items: center; width: 44px; height: 44px; padding: 5px; border: 1px solid transparent; border-radius: 50%; background: transparent; cursor: pointer; }
.appearance-swatches button > span { width: 24px; height: 24px; border: 1px solid #41644240; border-radius: 50%; background: var(--swatch); box-shadow: inset 0 2px 0 #ffffff40; }
.appearance-swatches button[aria-pressed="true"] { border-color: #557d57; box-shadow: 0 0 0 1px #557d57; background: #eef3df; }
button:focus-visible, select:focus-visible { outline: 3px solid #bd754c; outline-offset: 2px; }
fieldset:disabled { opacity: .65; }
.appearance-editor__note { margin: 0; color: #70826a; font-size: 11px; line-height: 1.6; }
@media (max-width: 600px) { .appearance-editor { grid-template-columns: 1fr; gap: 14px; } .appearance-section { padding-inline: 12px; } }
</style>
