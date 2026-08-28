# 技术设计

## Ownership and data flow

```text
Hotbar click / numeric key
        ↓
client selectedHotbarIndex: number | null
        ↓ derives selected item from latest inventory projection
Phaser held-item projection
        ↓ target click
GameCommand { type: "use-item-on-target", itemId, targetId }
        ↓
GameSession → GatheringSystem / FarmingSystem
        ↓ immutable snapshot + optional success feedback
        ↓
target impact only on success
```

- Selection is transient client state. GameState/StoredGame v3 and IndexedDB do not gain a field.
- `itemId` is an untrusted command input. GameSession/domain verifies the inventory still owns it at impact time.
- World target behavior is selected-item-driven; the client never decides whether mutation is valid.

## Command contract

```typescript
type HeldItemId = ItemId | "";

type GameCommand =
  | { readonly type: "use-item-on-target"; readonly itemId: HeldItemId; readonly targetId: string }
  | ExistingNonToolCommands;
```

The previous active `gather` and `farm-primary` commands are removed rather than aliased.

### Target routing

- Catalog resource `tree` → GatheringSystem validates `itemId === axe`, availability, region, distance and capacity.
- Catalog interaction `farm-plot` → FarmingSystem validates the exact pair:
  - hoe + untilled → tilled;
  - turnip-seed + tilled → growing;
  - watering-can + growing/unwatered → watered;
  - empty hand + mature → harvested.
- Unknown target, wrong item/phase, missing inventory item → `no-effect` with no state mutation and no text feedback.
- Distance, inventory-full and waiting remain explicit domain outcomes; target impact still occurs only for success.

## Client selection state

```typescript
interface ToolSelectionProjection {
  readonly selectedHotbarIndex: number | null;
  readonly selectedItemId: ItemId | "";
}
```

- Initial/reset value: `null` / empty hand.
- Click/key on a different occupied slot selects it.
- Click/key on the currently selected slot deselects it.
- Empty slot selection clears to `null`.
- `applyGameState` clears selection if the selected slot becomes empty or changes item ID; it never silently selects the replacement item.
- Shop/Dialogue locks selection input but does not clear the prior selection.

## Held and action visuals

- WorldScene reads the transient selection projection and shows one client-only held sprite while idle.
- Tool Art Gate A candidate frames remain presentation-only; no image key enters commands or saves.
- On target click, the selected item determines player animation even if the domain later returns `no-effect`.
- Target `playImpact()` is called only when GameSession reports success.
- Empty-hand harvest uses the current farmer sprite: face target, move toward target about 2px, compress Y slightly, dispatch once at impact, restore at recovery.
- Region transition, sleep, Scene shutdown and deselection clear held/action sprites deterministically.

## Starter inventory

- New game slots: 0 hoe, 1 watering can, 2 axe, remaining empty.
- No selection is created by newGame/continueGame.
- Hotbar wooden-axe craft button is removed. Generic CraftingSystem may remain frozen and unreachable; this task does not build or redesign crafting.

## Compatibility

- No starter-tool backfill, old command alias or save migration.
- Acceptance uses a new game. Existing local saves may be overwritten during development.
- Existing v1/v2 decoders and v2 backup remain untouched because deleting the entire persistence compatibility chain is a separate concern.

## Error behavior matrix

| Condition | Player animation | Target impact | Mutation / feedback |
|---|---|---|---|
| Correct item + valid target | selected action | yes | success + save |
| Wrong item/phase | selected action | no | no mutation, no text |
| Empty hand + mature crop | harvest bend | yes on success | crop added/reset |
| Empty hand + other target | no-tool attempt | no | no mutation, no text |
| Selected item disappeared before impact | selected action | no | no mutation, selection clears on projection |
| Too far | selected action | no | existing distance feedback allowed |
| Inventory full on harvest | harvest bend | no | crop remains, existing capacity feedback allowed |
| ActionTimeline busy/modal open | none | none | input ignored |

## Rollback

- Client selection/store and command routing are isolated from save format and Tiled maps.
- Rollback restores old commands and removes the selected-state projection; no persistent data migration must be reversed.
