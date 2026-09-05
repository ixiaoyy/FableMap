# 远征 Domain v9：技术设计

> **已否决（2026-09-04）**：历史只读，不得迁入当前产品主线。

## Owners

- `domain/expedition/definitions.ts`：closed enemy/item/choice/companion IDs 与静态数值。
- `domain/expedition/ExpeditionSystem.ts`：runtime run、loot、damage、capture、choice、discard、extract plan。
- `domain/state/game-state.ts`：v9 durable `expeditionHomeProgress`、clone/decode/reconcile。
- `domain/session/GameSession.ts`：唯一 orchestration owner；保存 home checkpoint、持有 nullable runtime run、原子提交。
- `client/src/persistence/*`：只沿现有 StoredGame decoder/migration 链保存 v9，不知道 run。

## Durable vs Runtime

```typescript
interface ExpeditionHomeProgress {
  readonly companionIds: readonly CompanionId[];
}

interface ExpeditionRunState {
  readonly hp: number;
  readonly cargo: readonly ExpeditionCargoStack[];
  readonly enemies: readonly ExpeditionEnemyState[];
  readonly choiceId: ExpeditionChoiceId | null;
  readonly capturedCompanionId: CompanionId | null;
  readonly outcome: "active" | "extracted" | "failed" | "abandoned";
}
```

`ExpeditionRunState` 不能出现在 StoredGame、SaveRepository payload 或 IndexedDB record。

## Atomic Extraction

1. clone durable GameState；run 保持 active。
2. 预计算 Cargo 合并后的 slot demand 和 closed item validity。
3. 容量不足返回 `cargo-capacity`，不写 clone/run。
4. 在 clone 中一次添加全部 Cargo 与 companion ID，验证 inventory/capacity/ID 唯一性。
5. 替换 durable state、标记 run extracted、publish 并 critical save；任一失败恢复原 durable state，run 可重试。

## Migration

- `GAME_STATE_VERSION`/`SAVE_FORMAT_VERSION` 一次升为 9。
- v8→v9 只增加空 `expeditionHomeProgress`；v1–v7 先走既有链。
- 不创建数据库 migration 文件；这是 IndexedDB value schema decoder 迁移。

## Library Decision

Domain 不引入依赖。Phaser Arcade Physics适合后续简单 top-down bodies；Miniplex/ROT.js 会引入超出两敌人需求的 ECS/roguelike 抽象，因此拒绝。
