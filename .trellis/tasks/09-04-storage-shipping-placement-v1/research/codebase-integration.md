# Current code integration evidence

核对日期：2026-09-04。只读检查，没有修改生产文件。

- `domain/inventory/InventorySystem.ts`：已有 item 汇总型 `quantity/canAdd/add/consume/restore`；缺指定 source/destination slot 与 quantity 的容器转移。
- `domain/crafting/CraftingSystem.ts`、`domain/recipes/definitions.ts`：已有原子 craft owner 与 typed command，catalog 只有 wooden-axe；client 没有 Crafting UI/caller。
- `domain/farming/crops.ts::sellPriceForItem()`：当前售价唯一 owner。`ShopSystem.sellItem()` 绑定华强距离和即时加 Gold，不能直接承担 shipping。
- `GameSession.beginDaySettlement()`：clone candidate 后执行全部日结；`persistPendingDay()` 保存成功才替换 live state，失败重试同一 candidate。Shipping 必须在 candidate 内一次完成。
- `day-settlement.ts` / `DaySettlementPanel.vue`：目前只投影 saving/failed、Gold loss 和 next stamina，成功后立即 idle；没有 profit summary/acknowledge phase。
- `domain/session/commands.ts` 与 `client/src/session/local-game-session.ts`：所有容器转移、投递、撤回、摆放、移动与回收必须走 typed command/result/audio/flush 链。
- `BackpackPanel.vue` / `ShopPanel.vue` / `game-store.ts`：可复用 modal、焦点、Escape、Tab trap、world/time lock；新面板必须加入 applyDaySettlement 强制关闭与 clearGameState 清理。
- `tiled-region-decoder.ts`：当前没有 Placeable/Buildable tile layer；`Tillable` 不能替代。`WorldCatalog.isBlocked()` 只读静态 Collision + NPC feet。
- `NpcMotionRuntime`：动态避让只注入玩家/NPC，placeable footprint 尚未进入；Farm 又没有普通 NPC，必须用 Town 或专门 fixture 验证路径冲突。
- `WorldScene` / `WorldEntities.EntityFactory`：已有 stable-ID view map、投影、销毁模式，可承载玩家摆放实体；不能把箱子写回 Tiled 固定 interaction。
- 已登记 VectoRaith Buildings 图集有 32×32 木质带盖箱 frame（适合出货箱）与 16×16 X 纹木箱候选（适合普通箱）；ignored HelloRumin chest sheet 未获采用，不能直接进入生产。
- 当前没有建筑服务；`TOWN_ROADMAP.md` 的墨子木匠功能尚未实现。用户已确认由墨子映射 Robin 的木匠服务和完整日程。
- `npc-schedules.ts` 当前只支持全体共用的 09:00/17:00 phase，墨子为周日休息且雨天回家；它不能表达非雨周五 16:00 离柜、周二普通雨重新营业、施工日关闭或特殊日短暂过柜。实现需要 `星期/天气/施工/特殊日 + 精确分钟` 的 domain override，同时让 schedule、activity 与 service availability 共用同一 resolver。
- 建筑服务必须拥有独立的 typed availability/result；不能把墨子改为通用 `shop`，因为客户端当前会把任何 `shopAvailable` 打开为种子店。服务入口还需绑定正式木匠服务点，不能只复用 `任意区域靠近 NPC` 谓词。

## 2026-09-06 regeneration integration addendum

本次只读核查确认 `GatheringSystem.settleDay`、`MiningSystem.settleDay`、`WeedCuttingSystem.settleDay` 与 `ForageSystem.activeSpawns` 还没有 world-object footprint 排除。仓储接入时必须同时消费箱体/建筑占用，避免下一日树、石、杂草或 forage 与玩家物件重叠。现有数量、七天普通树回长、固定 hash、每日幂等 marker 与 Farm 永久清理规则保持不变；具体延期语义、上游证据及特殊大树桩例外见 [resource-regeneration-occupancy.md](resource-regeneration-occupancy.md)。
