<script setup lang="ts">
import { computed, watch } from "vue";
import { latestFirstWeekMilestoneAt } from "../../../../domain/retention/FirstWeekMilestoneSystem.ts";
import { nextBackpackUpgrade, type InventoryCapacity } from "../../../../domain/progression/definitions.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { gameUiState } from "../../stores/game-store.ts";

const hint = computed(() => todayHintAt(
  gameUiState.day,
  Math.max(0, ...Object.values(gameUiState.friendships).map(({ points }) => points)),
  gameUiState.wateringCanLevel,
  gameUiState.inventoryCapacity,
));

watch(
  () => [gameUiState.phase, gameUiState.day, gameUiState.seenEventIds.join("|")] as const,
  ([phase, day]) => {
    if (phase !== "playing" || day < 1) return;
    const milestone = latestFirstWeekMilestoneAt(day);
    if (!milestone || gameUiState.seenEventIds.includes(milestone.eventId)) return;
    dispatchLocalGameCommand({ type: "acknowledge-retention-event", eventId: milestone.eventId });
  },
  { immediate: true },
);

/** Derives one compact content-backed objective from absolute day and actual progression. */
function todayHintAt(
  day: number,
  highestFriendship: number,
  wateringCanLevel: 1 | 2,
  inventoryCapacity: InventoryCapacity,
): string {
  const backpackOffer = nextBackpackUpgrade(inventoryCapacity);
  switch (day) {
    case 1: return "打理农田，去小镇认识居民，再到华强的店里看看种子。";
    case 2: return "粉树广场的委托板开放了：把今日物品交给指定居民。";
    case 3: return wateringCanLevel === 2
      ? "Lv2 水壶已能朝面向方向一次浇三格。"
      : "攒下 900g 和 15 份木材，去找昊天升级水壶。";
    case 4: return highestFriendship >= 250
      ? "有人已经把你当成熟悉的邻居；再交谈会听见新的话。"
      : "完成委托并坚持交谈，居民会逐渐从陌生变得熟悉。";
    case 5: return backpackOffer
      ? `种子店柜台旁的背包陈列可花 ${backpackOffer.gold}g 扩到 ${backpackOffer.capacity} 格；合上菜单后可轮换 12 格快捷行。`
      : "36 格背包已到手，合上菜单后可轮换三行 12 格快捷栏。";
    case 6: return "今日是高投入委托：准备 15 份木材，可获得 320g 与更多关系进展。";
    case 7: return "先向祥子领取竹制鱼竿，再去湖岸旧码头试钓。雨天可以去东岸民宅找他。";
    default: return "继续经营农场、完成每日委托，并为下一次升级储蓄。";
  }
}
</script>

<template>
  <details class="today-hint" aria-label="今日目标">
    <summary><span>今日目标</span><small>第 {{ gameUiState.day }} 天</small></summary>
    <p>{{ hint }}</p>
  </details>
</template>
