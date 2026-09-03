<script setup lang="ts">
import { computed } from "vue";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import { itemIconForItem, itemIconStyle, seedBadgeForItem } from "../../game/assets/item-icons.ts";
import { pixelArtRects } from "../../game/assets/pixel-art.ts";

const props = withDefaults(defineProps<{ itemId: string; scale?: number }>(), { scale: 2 });
const scale = computed(() => Math.max(1, Math.round(props.scale)));
const icon = computed(() => itemIconForItem(props.itemId));
const pixels = computed(() => icon.value?.kind === "pixels" ? pixelArtRects(icon.value.art) : []);
const badge = computed(() => seedBadgeForItem(props.itemId));
const badgeScale = computed(() => Math.max(1, Math.floor(scale.value / 2)));
const fallback = computed(() => getItemDefinition(props.itemId)?.hotbarMark ?? "?");
</script>

<template>
  <span class="item-icon" :data-item-icon="itemId" aria-hidden="true"
    :style="{ width: `${16 * scale}px`, height: `${16 * scale}px` }">
    <span v-if="icon?.kind === 'atlas'" class="item-icon__atlas" :style="itemIconStyle(icon, scale)" />
    <svg v-else-if="icon?.kind === 'pixels'" viewBox="0 0 16 16" focusable="false" shape-rendering="crispEdges">
      <rect v-for="(pixel, index) in pixels" :key="index" :x="pixel.x" :y="pixel.y"
        :width="pixel.width" height="1" :fill="pixel.color" />
    </svg>
    <span v-else class="item-icon__fallback">{{ fallback }}</span>
    <span v-if="badge?.kind === 'atlas'" class="item-icon__seed-badge"
      :style="{ ...itemIconStyle(badge, badgeScale), width: `${16 * badgeScale}px`, height: `${16 * badgeScale}px` }" />
  </span>
</template>

<style scoped>
.item-icon { position: relative; display: inline-block; flex: 0 0 auto; vertical-align: middle; image-rendering: pixelated; }
.item-icon__atlas, .item-icon > svg { display: block; width: 100%; height: 100%; background-repeat: no-repeat; }
.item-icon__seed-badge { position: absolute; right: -1px; bottom: 0; background-repeat: no-repeat; filter: drop-shadow(1px 1px #e9d9b0) drop-shadow(-1px -1px #e9d9b0); }
.item-icon__fallback { display: grid; place-items: center; width: 100%; height: 100%; }
</style>
