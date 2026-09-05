# 首周留存 Domain v8：技术设计

## State contract

`GameState`/`StoredGame` 一次升级为 v8，新增最小字段：

```typescript
type InventoryCapacity = 24 | 32;
type WateringCanLevel = 1 | 2;
type RelationshipStage = "stranger" | "familiar" | "friendly";

interface DailyRequestState {
  day: number;
  requestId: string;
  completed: boolean;
}

interface DialogueMemoryEntry {
  dialogueId: string;
  day: number;
}

interface NpcDialogueState {
  recent: DialogueMemoryEntry[];
  acknowledgedStage: RelationshipStage;
}

interface GameState {
  // existing fields...
  inventoryCapacity: InventoryCapacity;
  wateringCanLevel: WateringCanLevel;
  dailyRequest: DailyRequestState | null;
  npcDialogue: Record<string, NpcDialogueState>;
  seenEventIds: string[];
}
```

- v7 migration supplies 24/Lv1, deterministic Day≥2 request, catalog-reconciled NPC dialogue defaults and empty event IDs.
- Inventory decoder requires `inventory.length === inventoryCapacity`; older versions still require their released 24-slot shape before migration.
- Dialogue history retains only entries whose day is within the last three absolute days and rejects future/unknown IDs.
- Event IDs use a closed catalog containing first-week introductions and two short heart-event IDs; no generic event payload or graph.

## Domain owners

- `domain/progression/UpgradeSystem.ts`: prices, unlock day, atomic watering-can/backpack purchase.
- `domain/requests/definitions.ts`: eight immutable `DailyRequest` templates and deterministic day selector.
- `domain/requests/DailyRequestSystem.ts`: daily initialization, submission, item/Gold/Friendship atomicity.
- `domain/social/relationship-stage.ts`: 250/500 stage projection.
- `domain/dialogue/*`: stable variant catalog metadata, deterministic candidate selection, three-day exclusion, stage acknowledgement and event IDs.
- Existing dialogue strings may move from client to domain without changing visible baseline; environment inspect definitions use the same catalog lookup.
- `GameSession` remains the only orchestrator and returns typed NPC interaction results; Vue/Phaser do not mutate request/history/event state.

## Commands and results

```typescript
type Facing = "up" | "down" | "left" | "right";

type GameCommand =
  | { type: "use-item-on-target"; itemId: ItemId | ""; targetId: string; facing?: Facing }
  | { type: "upgrade-watering-can" }
  | { type: "upgrade-backpack" }
  | /* existing commands */;
```

- `facing` is required only for watering-can use; missing facing preserves Lv1 single-tile behavior for migrated callers/tests.
- Purchase result codes are closed and map to fixed feedback; UI will only display snapshot/cost definitions and dispatch commands.
- `talk-to-npc` completes an eligible request before dialogue selection, then returns a stable dialogue ID/definition plus optional action feedback. If changing `dispatch` return shape would cause broad churn, a typed `interactWithNpc` GameSession method may own this command path, but Phaser still calls one typed adapter rather than mutating state.

## Lv2 watering

- Player must be within existing 42px of clicked target.
- Target centers at offset 0/16/32 along facing are matched against same-region catalog farm interactions.
- Only `growing && !watered` tiles change. Invalid/missing/non-growing tiles are skipped; at least one changed tile returns success and all changes save together.
- No energy, charge time, water capacity, diagonal spread or generic tool-level tree.

## Daily requests

Day 1 has `null`; Day 2 onward uses `(day - 2) % 8` and saves the resulting ID. Templates:

| Day/rotation | NPC | Item | Qty | Gold | Friendship |
|---|---|---|---:|---:|---:|
| 2 | seed-keeper | wood | 6 | 100 | 170 |
| 3 | town-resident-alan | spring-wildflower | 2 | 110 | 70 |
| 4 | town-resident-mozi | wood | 9 | 160 | 80 |
| 5 | town-resident-01 | turnip | 2 | 150 | 80 |
| 6 | town-blacksmith | wood | 15 | 320 | 100 |
| 7 | town-resident-xiangzi | bamboo-shoot | 2 | 180 | 80 |
| 8 | town-resident-haomeili | spring-wildflower | 2 | 120 | 80 |
| 9 | town-resident-haonan | wood | 12 | 220 | 90 |

- Missing items: no mutation, request-aware dialogue result.
- Success: snapshot inventory/Gold/friendship/request, validate all bounds, consume/add/mark once, restore snapshot on impossible postcondition.
- Sleep replaces prior request with next-day deterministic request; no penalty or history log.

## Dialogue baseline

- First move current visible dialogue strings into domain definitions with stable IDs per variant; client lookup imports the domain catalog.
- Candidate metadata separates `activity`, `request`, `relationship`, `place-time`, `personality`, `event` without creating content DSL.
- This child establishes selection/history and a baseline personality capacity; the relationship content child adds final eight-NPC authored pools and two-heart copy.

## Calendar continuity

- `day` remains absolute and unbounded to `Number.MAX_SAFE_INTEGER`.
- `playableCalendarAt(day)` returns a temporary `Day N`/weekday projection and current spring-content season for all days.
- Farming/shop/forage use the temporary playable season rather than the future four-season projection.
- Existing `calendarAt` may remain as a future calendar utility only if no current gameplay/UI consumer uses it to enter Summer.
- Sleep no longer returns `season-content-limit`; Day28→29 runs friendship/farm/forage/request settlement exactly once.

## Compatibility

- IndexedDB database/store/key and v2 backup mechanism unchanged.
- No v7 backup is added; corrupt/future v8 fails before overwrite.
- No database/server/API/identity work.
