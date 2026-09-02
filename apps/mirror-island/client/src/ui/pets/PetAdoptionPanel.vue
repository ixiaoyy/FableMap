<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch,
} from "vue";
import {
  PET_DEFAULT_NAMES,
  PET_NAME_MAX_CODE_POINTS,
  normalizePetName,
  type PetSpecies,
} from "../../../../domain/pets/definitions.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import {
  PET_ADOPTION_OPTIONS,
  type PetAdoptionOption,
} from "../../game/assets/pet-media.ts";
import {
  deferPetAdoption,
  gameUiState,
} from "../../stores/game-store.ts";

const selectedSpecies = ref<PetSpecies>("cat");
const petName = ref(PET_DEFAULT_NAMES.cat);
const confirmationOpen = ref(false);
const validationMessage = ref("");
const cardButtons = ref<HTMLButtonElement[]>([]);
const nameInput = ref<HTMLInputElement | null>(null);
const confirmButton = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

const selectedOption = computed(() => (
  PET_ADOPTION_OPTIONS.find((option) => option.species === selectedSpecies.value)
  ?? PET_ADOPTION_OPTIONS[0]!
));
const trimmedNameLength = computed(() => Array.from(petName.value.trim()).length);

/** Produces exact nearest-neighbor crop variables for one reviewed 32px pet frame. */
function previewStyle(option: PetAdoptionOption, scale: number): Record<string, string> {
  return {
    "--pet-image": `url("${option.preview.url}")`,
    "--pet-sheet-width": `${option.preview.sheetWidth * scale}px`,
    "--pet-sheet-height": `${option.preview.sheetHeight * scale}px`,
    "--pet-frame-size": `${option.preview.width * scale}px`,
    "--pet-x": `${-option.preview.x * scale}px`,
    "--pet-y": `${-option.preview.y * scale}px`,
  };
}

/** Selects one species while replacing only the untouched default name of the previous choice. */
function selectSpecies(species: PetSpecies, focus: boolean): void {
  const previousDefault = PET_DEFAULT_NAMES[selectedSpecies.value];
  if (petName.value.trim() === previousDefault || petName.value.trim() === "") {
    petName.value = PET_DEFAULT_NAMES[species];
  }
  selectedSpecies.value = species;
  confirmationOpen.value = false;
  validationMessage.value = "";
  if (focus) {
    const index = PET_ADOPTION_OPTIONS.findIndex((option) => option.species === species);
    void nextTick(() => cardButtons.value[index]?.focus());
  }
}

/** Validates and normalizes the permanent name before showing the irreversible confirmation seal. */
function reviewAdoption(): void {
  const normalizedName = normalizePetName(petName.value);
  if (!normalizedName) {
    validationMessage.value = `名字需为 1～${PET_NAME_MAX_CODE_POINTS} 个字符，且不能含控制字符。`;
    void nextTick(() => nameInput.value?.focus());
    return;
  }
  petName.value = normalizedName;
  validationMessage.value = "";
  confirmationOpen.value = true;
  void nextTick(() => confirmButton.value?.focus());
}

/** Sends the sole typed adoption command after the user accepts that the choice cannot be changed. */
function confirmAdoption(): void {
  const normalizedName = normalizePetName(petName.value);
  if (!normalizedName) {
    confirmationOpen.value = false;
    reviewAdoption();
    return;
  }
  dispatchLocalGameCommand({
    type: "adopt-pet",
    species: selectedSpecies.value,
    name: normalizedName,
  });
}

/** Returns from the irreversible confirmation to species and name editing without mutation. */
function editChoice(): void {
  confirmationOpen.value = false;
  void nextTick(() => nameInput.value?.focus());
}

/** Defers adoption for this play session while leaving the Day 2+ choice pending in durable rules. */
function deferChoice(): void {
  confirmationOpen.value = false;
  deferPetAdoption();
}

/** Handles Escape plus card-only arrow navigation without hijacking text input or ordinary Tab order. */
function handleKeyboard(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    if (confirmationOpen.value) editChoice();
    else deferChoice();
    return;
  }
  if (event.target instanceof HTMLInputElement || confirmationOpen.value) return;
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  selectSpecies(event.key === "ArrowLeft" ? "cat" : "dog", true);
}

/** Registers each species card once so arrow navigation can move real DOM focus. */
function registerCardButton(element: unknown): void {
  if (element instanceof HTMLButtonElement && !cardButtons.value.includes(element)) {
    cardButtons.value.push(element);
  }
}

/** Restores the element that owned focus before the modal appeared when it remains connected. */
function restorePreviousFocus(): void {
  const target = returnFocus;
  returnFocus = null;
  if (target?.isConnected) void nextTick(() => target.focus());
}

watch(
  () => gameUiState.petAdoptionOpen,
  async (open) => {
    if (!open) {
      restorePreviousFocus();
      return;
    }
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    confirmationOpen.value = false;
    validationMessage.value = "";
    await nextTick();
    cardButtons.value.find((button) => button.dataset.species === selectedSpecies.value)?.focus();
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="gameUiState.petAdoptionOpen"
    class="pet-adoption-backdrop"
    @keydown="handleKeyboard"
  >
    <section
      class="pet-adoption-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pet-adoption-title"
      aria-describedby="pet-adoption-description"
    >
      <header class="pet-adoption-panel__header">
        <div>
          <span>DAY 2 / HOME COMPANION</span>
          <h2 id="pet-adoption-title">小院里，多了一只竹篮</h2>
        </div>
        <strong>仅可选择一次</strong>
      </header>

      <p id="pet-adoption-description" class="pet-adoption-panel__story">
        篮边压着一张短笺：给它一个名字，它就会把这里当作家。白天在院里转转，夜里回屋歇下。
      </p>

      <template v-if="!confirmationOpen">
        <div class="pet-adoption-grid" role="radiogroup" aria-label="选择猫或狗">
          <button
            v-for="option in PET_ADOPTION_OPTIONS"
            :key="option.species"
            :ref="registerCardButton"
            :data-species="option.species"
            type="button"
            class="pet-adoption-card"
            :class="{ 'pet-adoption-card--selected': selectedSpecies === option.species }"
            role="radio"
            :aria-checked="selectedSpecies === option.species"
            @click="selectSpecies(option.species, false)"
          >
            <span class="pet-adoption-card__halo" aria-hidden="true">
              <span class="pet-adoption-sprite" :style="previewStyle(option, 2.5)" />
            </span>
            <span class="pet-adoption-card__copy">
              <small>{{ option.species === 'cat' ? '01 / CAT' : '02 / DOG' }}</small>
              <strong>{{ option.label }}</strong>
              <span>{{ option.note }}</span>
            </span>
            <i aria-hidden="true">{{ selectedSpecies === option.species ? '◆' : '◇' }}</i>
          </button>
        </div>

        <form class="pet-adoption-name" @submit.prevent="reviewAdoption">
          <label for="pet-name-input">
            <span>给它起个名字</span>
            <small>{{ trimmedNameLength }} / {{ PET_NAME_MAX_CODE_POINTS }}</small>
          </label>
          <input
            id="pet-name-input"
            ref="nameInput"
            v-model="petName"
            type="text"
            inputmode="text"
            autocomplete="off"
            maxlength="24"
            :aria-invalid="validationMessage !== ''"
            :aria-describedby="validationMessage ? 'pet-name-error' : undefined"
          >
          <p v-if="validationMessage" id="pet-name-error" role="alert">{{ validationMessage }}</p>
        </form>

        <p class="pet-adoption-panel__warning">
          确认后不能遗弃、更换或重新领养；亲密度会保存，但不会显示成数值。
        </p>

        <footer class="pet-adoption-panel__actions">
          <button type="button" class="pet-adoption-action pet-adoption-action--quiet" @click="deferChoice">
            稍后再说
          </button>
          <button type="button" class="pet-adoption-action pet-adoption-action--primary" @click="reviewAdoption">
            选择这个伙伴
          </button>
        </footer>
      </template>

      <div v-else class="pet-adoption-confirmation">
        <div class="pet-adoption-confirmation__portrait" aria-hidden="true">
          <span class="pet-adoption-sprite" :style="previewStyle(selectedOption, 3)" />
          <i>家</i>
        </div>
        <div>
          <span>FINAL CHOICE / 不可更换</span>
          <h3>让“{{ petName }}”留下来？</h3>
          <p>{{ selectedOption.label }}会从今天起住在 Farm 与 Cottage，每天都可以抚摸一次。</p>
        </div>
        <footer class="pet-adoption-panel__actions">
          <button type="button" class="pet-adoption-action pet-adoption-action--quiet" @click="editChoice">
            回去看看
          </button>
          <button
            ref="confirmButton"
            type="button"
            class="pet-adoption-action pet-adoption-action--primary"
            @click="confirmAdoption"
          >
            确认领养
          </button>
        </footer>
      </div>
    </section>
  </div>
</template>
