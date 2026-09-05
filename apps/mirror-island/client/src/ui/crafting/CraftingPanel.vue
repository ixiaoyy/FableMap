<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RECIPE_DEFINITIONS, type RecipeId } from "../../../../domain/recipes/definitions.ts";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import type { CraftingQuantity } from "../../../../domain/crafting/CraftingSystem.ts";
import { dispatchLocalGameCommand, getLocalGameSession } from "../../session/local-game-session.ts";
import { closeCrafting, gameUiState, isStorageMutationLocked, isWorldInputLocked, openCrafting, openBackpack } from "../../stores/game-store.ts";
import SlotGrid from "../inventory/SlotGrid.vue";
import ItemIcon from "../items/ItemIcon.vue";
import StorageDialog from "../storage/StorageDialog.vue";

const quantity = ref<CraftingQuantity>(1);
const page = ref(0);
const selectedRecipe = ref<RecipeId | null>(null);
const cursor = ref<{ x: number; y: number } | null>(null);
const PAGE_SIZE = 8;
const recipes = Object.values(RECIPE_DEFINITIONS);
const pageCount = Math.max(1, Math.ceil(recipes.length / PAGE_SIZE));
const busy = computed(() => isStorageMutationLocked());
const previews = computed(() => {
  void gameUiState.inventory;
  if (!gameUiState.craftingOpen) return [];
  return recipes.slice(page.value * PAGE_SIZE, (page.value + 1) * PAGE_SIZE).map((recipe) => ({
    recipe, preview: getLocalGameSession().craftingPreview(recipe.id, quantity.value),
  }));
});
const heldPreview = computed(() => {
  void gameUiState.inventory;
  return gameUiState.craftingOpen && selectedRecipe.value
    ? getLocalGameSession().craftingPreview(selectedRecipe.value, quantity.value)
    : null;
});

/** Chooses a read-only recipe output preview; materials are consumed only after an exact slot is confirmed. */
function selectRecipe(recipeId: RecipeId): void {
  if (busy.value) return;
  const preview = getLocalGameSession().craftingPreview(recipeId, quantity.value);
  if (preview?.known && preview.canCraft) selectedRecipe.value = recipeId;
}

/** Completes crafting into the selected target slot through one atomic session command. */
function craftInto(payload: { index: number }): void {
  if (busy.value || !selectedRecipe.value || !heldPreview.value?.canCraft) return;
  const result = dispatchLocalGameCommand({ type: "craft-item", recipeId: selectedRecipe.value, quantity: quantity.value, targetIndex: payload.index });
  if (result?.tone === "success") selectedRecipe.value = null;
}

/** Changes the explicit touch/keyboard batch size and clears any old-size preview. */
function setQuantity(value: CraftingQuantity): void { quantity.value = value; selectedRecipe.value = null; }

/** Returns to the backpack tab without creating a second modal or an uncommitted item. */
function backpack(): void { closeCrafting(); openBackpack(); }

/** Escape cancels the attached recipe preview before closing the crafting page. */
function escapePreview(event: KeyboardEvent): void {
  if (event.key === "Escape" && selectedRecipe.value) {
    event.preventDefault(); event.stopPropagation(); selectedRecipe.value = null;
  }
}

/** Shows the read-only crafted-output ghost at mouse/pen position; touch retains the explicit held-output row. */
function trackCursor(event: PointerEvent): void {
  cursor.value = event.pointerType === "touch" ? null : { x: event.clientX, y: event.clientY };
}

watch(() => gameUiState.craftingOpen, () => { selectedRecipe.value = null; cursor.value = null; page.value = 0; quantity.value = 1; });
</script>

<template>
  <button class="crafting-trigger" type="button" aria-haspopup="dialog" :aria-expanded="gameUiState.craftingOpen"
    :disabled="isWorldInputLocked()" @click="openCrafting">制作</button>
  <StorageDialog :open="gameUiState.craftingOpen" title="手边制作" title-id="crafting-title"
    subtitle="用手边材料，做些实用的小东西" @close="closeCrafting">
    <template #navigation>
      <nav class="storage-tabs" aria-label="背包与制作">
        <button type="button" :disabled="busy" @click="backpack">背包<span>{{ gameUiState.inventoryCapacity }}</span></button>
        <button type="button" class="is-active" aria-current="page">制作</button>
        <span class="storage-wallet"><span>金币</span><strong>{{ gameUiState.gold }}</strong><small>g</small></span>
      </nav>
    </template>
    <div @keydown="escapePreview" @pointermove="trackCursor" @pointerleave="cursor = null">
      <div class="inventory-actions crafting-actions">
        <div class="inventory-section-heading"><h3>基础配方</h3><span>{{ recipes.length }} 种</span></div>
        <div class="storage-transfer-controls" role="group" aria-label="制作数量">
          <span class="storage-control-label">数量</span>
          <div class="storage-segmented"><button v-for="value in ([1, 5, 25] as const)" :key="value" type="button" :aria-pressed="quantity === value"
            :disabled="busy" @click="setQuantity(value)">{{ value }}</button></div>
        </div>
      </div>
      <div class="crafting-workspace">
        <ul class="crafting-recipes" aria-label="配方">
          <li v-for="entry in previews" :key="entry.recipe.id" :data-unavailable="!entry.preview?.canCraft" :data-selected="selectedRecipe === entry.recipe.id">
            <button type="button" :disabled="busy || !entry.preview?.known || !entry.preview.canCraft"
              :aria-pressed="selectedRecipe === entry.recipe.id" @click="selectRecipe(entry.recipe.id)">
              <span class="crafting-recipe-art"><ItemIcon :item-id="entry.recipe.output.itemId" :scale="3" /></span>
              <span class="crafting-recipe-heading"><strong>{{ getItemDefinition(entry.recipe.output.itemId)?.name ?? entry.recipe.name }}</strong>
                <span>制作 {{ entry.preview?.output.quantity ?? quantity }} 个</span></span>
              <small class="crafting-recipe-status" :data-ready="entry.preview?.canCraft">{{ !entry.preview?.known ? '未掌握' : entry.preview.canCraft ? '可制作' : '缺少材料' }}</small>
            </button>
            <ul class="crafting-ingredients">
              <li v-for="ingredient in entry.preview?.ingredients" :key="ingredient.itemId" :data-missing="ingredient.missing > 0">
                <ItemIcon :item-id="ingredient.itemId" :scale="1" /><span>{{ getItemDefinition(ingredient.itemId)?.name }}</span>
                <span class="crafting-ingredient-count">{{ ingredient.available }} / {{ ingredient.quantity }}</span>
                <strong v-if="ingredient.missing > 0">缺 {{ ingredient.missing }}</strong>
              </li>
            </ul>
          </li>
        </ul>
        <aside class="crafting-held" aria-live="polite">
          <span class="inventory-detail__category">制作预览</span>
          <div class="crafting-held__art"><ItemIcon :item-id="heldPreview?.output.itemId ?? 'chest'" :scale="3" /></div>
          <template v-if="heldPreview">
            <strong>{{ getItemDefinition(heldPreview.output.itemId)?.name }} × {{ heldPreview.output.quantity }}</strong>
            <p>点选下方背包格，完成制作。</p>
            <button type="button" class="storage-text-button" :disabled="busy" @click="selectedRecipe = null">取消制作</button>
          </template>
          <template v-else><strong>挑一件想做的物品</strong><p>选好配方，再放入背包。</p></template>
        </aside>
      </div>
      <nav v-if="pageCount > 1" class="storage-toolbar" aria-label="配方分页">
        <button type="button" :disabled="page === 0 || busy" @click="page--">上一页</button>
        <span>{{ page + 1 }} / {{ pageCount }}</span>
        <button type="button" :disabled="page + 1 >= pageCount || busy" @click="page++">下一页</button>
      </nav>
      <div class="inventory-section-heading crafting-inventory-heading"><h3>放入背包</h3><span>{{ gameUiState.inventoryCapacity }} 格</span></div>
      <p v-if="heldPreview && getItemDefinition(heldPreview.output.itemId)?.category === 'tool' && heldPreview.output.quantity > 1" class="storage-help">每件工具各占一格；空间不足时不消耗材料。</p>
      <SlotGrid grid-id="crafting-backpack" label="制作产物目标" :slots="gameUiState.inventory" :capacity="gameUiState.inventoryCapacity"
        :disabled="busy || !heldPreview?.canCraft" hotbar @pick="craftInto" />
      <p class="crafting-footer-note">材料只从随身背包取用 · 放入前可以随时取消</p>
    </div>
  </StorageDialog>
  <Teleport to="body">
    <div v-if="gameUiState.craftingOpen && heldPreview && cursor && !busy" class="storage-drag-ghost"
      :style="{ left: `${cursor.x + 12}px`, top: `${cursor.y + 12}px` }" aria-hidden="true">
      <ItemIcon :item-id="heldPreview.output.itemId" /><span>× {{ heldPreview.output.quantity }}</span>
    </div>
  </Teleport>
</template>
