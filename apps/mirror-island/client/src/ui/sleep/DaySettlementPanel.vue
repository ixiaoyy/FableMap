<script setup lang="ts">
import { computed } from "vue";
import type { ShippingCategory } from "../../../../domain/items/definitions.ts";
import { getItemDefinition } from "../../../../domain/items/definitions.ts";
import { dispatchLocalGameCommand } from "../../session/local-game-session.ts";
import { gameUiState, isStorageMutationLocked } from "../../stores/game-store.ts";
import StorageDialog from "../storage/StorageDialog.vue";

const busy = computed(() => isStorageMutationLocked());
const report = computed(() => gameUiState.shippingReport);
const categoryNames: Readonly<Record<ShippingCategory, string>> = {
  farming: "耕作", foraging: "采集", fishing: "渔获", mining: "采矿", other: "其他",
};
const title = computed(() => gameUiState.daySettlement.phase === "report"
  ? `第 ${report.value?.settledDay ?? Math.max(1, gameUiState.day - 1)} 天 · 出货账单`
  : gameUiState.daySettlement.phase === "failed" ? "这一天还没有保存好"
    : gameUiState.daySettlement.reason === "passed-out" ? "夜深了，先回家休息" : "把这一天收好");

/** Retries the same overnight candidate without repeating crop growth or shipping settlement. */
function retry(): void { dispatchLocalGameCommand({ type: "retry-day-settlement" }); }

/** Acknowledges the durable report once; the world remains locked until this acknowledgement saves. */
function dismiss(): void {
  if (busy.value || gameUiState.daySettlement.phase !== "report") return;
  dispatchLocalGameCommand({ type: "dismiss-day-settlement" });
}
</script>

<template>
  <StorageDialog :open="gameUiState.daySettlement.phase !== 'idle'" :title="title" title-id="day-settlement-title"
    :closable="gameUiState.daySettlement.phase === 'report' && !busy" :narrow="gameUiState.daySettlement.phase !== 'report'"
    @close="dismiss">
    <template v-if="gameUiState.daySettlement.phase === 'failed'">
      <p role="alert">日期、金币和农田仍停留在日结前。请重试保存；重试不会重复结算或重复成长。</p>
      <button type="button" class="storage-primary" @click="retry">重试保存</button>
    </template>
    <template v-else-if="gameUiState.daySettlement.phase === 'report' && report">
      <p class="shipping-report-total">今日出货收入 <strong>{{ report.totalGold }}g</strong></p>
      <p v-if="report.categories.length === 0">今天没有出货，明天再带些收获回来。</p>
      <details v-for="category in report.categories" :key="category.category" class="shipping-report-category">
        <summary tabindex="0"><span>{{ categoryNames[category.category] }}</span><strong>{{ category.totalGold }}g</strong></summary>
        <div class="shipping-report-table-wrap">
          <table class="shipping-report-table">
            <caption>{{ categoryNames[category.category] }}出货明细</caption>
            <thead><tr><th scope="col">物品</th><th scope="col">数量</th><th scope="col">单价</th><th scope="col">小计</th></tr></thead>
            <tbody><tr v-for="entry in category.entries" :key="entry.itemId">
              <th scope="row">{{ getItemDefinition(entry.itemId)?.name }}</th>
              <td>{{ entry.quantity }}</td><td>{{ entry.unitPrice }}g</td><td>{{ entry.totalGold }}g</td>
            </tr></tbody>
          </table>
        </div>
      </details>
      <p v-if="gameUiState.daySettlement.goldLost > 0" class="storage-help">昨晚过度劳累损失 {{ gameUiState.daySettlement.goldLost }}g。</p>
      <p class="storage-help">已入账 · 现有 {{ gameUiState.gold }}g · 新一天体力 {{ gameUiState.stamina }}/{{ gameUiState.maxStamina }}</p>
      <button type="button" class="storage-primary" :disabled="busy" @click="dismiss">开始第 {{ gameUiState.day }} 天</button>
    </template>
    <p v-else role="status">正在写入本地存档，请稍候…</p>
  </StorageDialog>
</template>
