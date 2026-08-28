# Town 时间与 NPC 日程 v1：技术设计

## Ownership

```text
wall clock now + paused
  → GameSession.tick
  → GameState v4 minuteOfDay
  → schedulePhaseAt
  → resolve active NPC anchors from WorldCatalog SpawnPoints
  ├─ WorldScene render/click/hit target
  ├─ movement collision
  └─ ShopSystem keeper position/type
```

- `domain/time/game-time.ts` 拥有时间范围、步长、时段与格式化纯函数。
- `domain/world/npc-schedules.ts` 拥有 npcId → 四段 anchor 合同和活跃投影。
- TMJ SpawnPoints 拥有像素坐标；NpcSpawns 拥有身份与默认文本。
- GameSession 拥有 mutable time、tick accumulator、publish/save。

## State and persistence

```typescript
interface GameStateV4 {
  readonly version: 4;
  day: number;
  minuteOfDay: number; // 360..1440, 10-minute granularity
  // existing fields unchanged
}
```

- `SAVE_FORMAT_VERSION=4` 与 `GAME_STATE_VERSION=4`。
- v3 decoder 完整验证旧字段后补 `minuteOfDay=360`；v1/v2 迁移直接生成 v4。
- v4 decode 要求 minute 是 `360..1440` 且能被 10 整除。
- 既有 v2 backup key/transaction 不变；v3→v4 不创建第二种 backup。

## Clock advancement

- `GameSession.tick(now, paused)` 继续处理移动 checkpoint，并新增时钟累积。
- 首次 tick 只记录基线；pause tick 重置基线且不累积。
- 单帧 elapsed clamp 到 1000ms，累计达到 8000ms 时推进 10 分钟；一次 tick 最多推进一次，避免后台恢复跳时。
- 每次推进 publish + queueSave；达到 1440 后冻结。
- sleep 在同一原子 mutation 中完成 crop settlement、day+1、minute=360 和 Cottage 安全位置。

## Schedule model

```typescript
type NpcSchedulePhase = "morning" | "day" | "evening" | "night";
interface NpcScheduleAnchor {
  readonly regionId: string;
  readonly spawnId: string;
  readonly interactionType?: "shop" | "dialogue";
}
```

Resolver 遍历 catalog 的唯一 base NpcSpawns，为已登记 npcId 选择当前 anchor，返回保留 entityId/npcId/dialogueId 但替换 region/x/y/interactionType 的投影。未知 NPC 沿用 base spawn。

`WorldCatalog.isBlocked` 接受可选 active NPC 列表；旧调用继续默认 region.npcs。movement 与 reconcile 显式传当前时段列表。WorldScene 在 anchor 改变时销毁并重建同 entityId 的 NpcEntity，确保显示和点击位置一致。

## Schedule overview

- 华强：晨/夜在种子店后区，白天柜台营业，傍晚整理货架。
- 昊天：晨/夜铁匠巷家中，白天工坊外，傍晚工坊内。
- 阿禾：晨/夜河畔家中，白天粉花树，傍晚湖岸。
- 墨子：晨/夜西街家中，白天西街修缮点，傍晚镇中心。
- 浩南：晨/夜北街家中，白天山麓，傍晚北街。
- 阿澜：晨/夜河畔家中，白天湖岸，傍晚河桥。
- 昊美丽：晨/夜铁匠巷家中，白天工坊内，傍晚工坊外。
- 祥子：晨/夜东岸家中，白天码头，傍晚湖岸休憩处。

## Failure boundaries

- 缺少 schedule spawn、重复 npcId 基础身份或同一时段 anchor 冲突 → catalog/schedule validation 启动失败。
- 当前 active NPC 不在 Seed Shop/day counter → ShopSystem `not-at-shop`。
- minute future/非法 → save decode 失败，不覆盖原记录。
