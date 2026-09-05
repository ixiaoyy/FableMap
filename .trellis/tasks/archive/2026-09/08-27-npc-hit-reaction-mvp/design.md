# 技术设计

## Input separation

```text
Mouse NPC click ──→ existing Shop / Dialogue projection
Mouse bed click ──→ Vue sleep confirmation ──Yes──→ existing atomic sleep transition
Space           ──→ empty-hand punch ActionTimeline
Mouse world     ──→ selected Hotbar item on Tree / FarmPlot
```

- `isWorldInputLocked()` remains the single modal/action guard and includes the transient sleep confirmation.
- NPC click and attack do not dispatch a gameplay mutation command in this MVP; click opens existing transient UI, punch/reaction is Phaser-only.

## Click interaction

- `EntityFactory.createNpc` accepts one presentation callback; `NpcEntity` makes the reviewed character sprite interactive with a hand cursor.
- WorldScene receives the exact stable NpcEntity, then verifies latest player region/distance ≤42px and dispatches by decoded `interactionType`.
- Shop reuses `openShop` plus the existing dialogue welcome line; dialogue reuses `setDialogue` and `getDialogueDefinition`.
- BedEntity receives an exact click callback; WorldScene verifies Cottage/42px and asks the Vue store to open one transient sleep confirmation instead of dispatching sleep immediately.
- The confirmation projects only `sleepConfirmationOpen`; “否” closes it, while “是” closes it and invokes one callback owned by WorldScene that calls the existing `beginSleep` path. It does not duplicate the sleep command or settlement logic in Vue.
- The old E key registration, nearest-bed/NPC lookup and “附近没有可交谈的人” feedback are removed.

## Punch targeting

Create one pure client helper:

```typescript
type Facing = "down" | "up" | "left" | "right";

function selectNpcHitTarget(
  player: WorldPoint,
  facing: Facing,
  candidates: readonly NpcHitCandidate[],
): NpcHitCandidate | null;
```

- Facing maps to a unit vector.
- Candidate vector is decomposed into forward and lateral distance.
- Valid hit: forward distance `0..28px`, absolute lateral distance `<=10px`.
- If multiple candidates qualify, choose lowest Euclidean distance, then stable `entityId` for deterministic tie-break.
- Only active-region `npcViews` are candidates; no catalog-wide remote hit.

## Player attack animation

- Space key is captured by Phaser and checked only when `selectedItemId === ""`, transition idle, modal unlocked and ActionTimeline idle.
- Reuse ActionTimeline: windup 120ms, impact 90ms, recovery 180ms.
- Windup faces current direction and compresses/moves the existing farmer sprite slightly toward the facing vector.
- Impact selects target once and calls its presentation reaction; no GameSession command or save.
- Recovery restores exact player sprite position/scale and clears worldActionBusy.

## NPC reaction

- `NpcEntity.playHitReaction(direction)` owns an ephemeral reaction lock.
- On hit: stop prior idle visual state, tint/flash white, move approximately 6px along attack direction, hold briefly, then tween to original local position `(0,0)` and clear tint.
- A reacting NPC ignores another hit until recovery; it does not move its Tiled spawn or collision feet.
- `destroy()` kills owned tweens, resets sprite tint/local position, then destroys the container.

## Failure and teardown

| Condition | Result |
|---|---|
| Space while holding item | no animation, no hit |
| Space with no NPC in front | punch animation only |
| NPC behind / lateral / too far | no reaction |
| NPC already reacting | punch completes, no stacked reaction |
| Modal/action/transition active | input ignored |
| Sleep confirmation already open | repeated bed click ignored; one modal remains |
| Sleep confirmation “否” | modal closes; no command/save/day change |
| Sleep confirmation “是” | one existing sleep transition and atomic settlement |
| Region change/Scene shutdown | punch cancelled; NPC coordinates/tint restored |

## Persistence boundary

- No NPC HP, hit count, position, aggression or relationship field.
- No GameState, StoredGame, SaveRepository, IndexedDB or migration changes.
- Future combat must introduce its own reviewed domain state; this ephemeral slice is not a hidden combat framework.
