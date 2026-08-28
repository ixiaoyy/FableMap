# 实施计划

## 1. Domain command and initial state

1. Add axe to new-game slot 3 while keeping hoe/watering slots 1–2.
2. Replace active `gather`/`farm-primary` commands with `use-item-on-target` carrying selected item and stable target ID.
3. Route target ownership through WorldCatalog in GameSession; unknown target returns quiet no-effect.
4. Update GatheringSystem and FarmingSystem to validate exact item/target/phase pairs atomically.
5. Preserve current sleep, buy/sell, transition and save contracts; add no migration/backfill.

## 2. Selection projection

1. Add selected index/item to the transient Vue game store, default null/empty.
2. Add click and numeric-key selection APIs with toggle-off and empty-slot clearing.
3. Reconcile selection after each inventory projection; last seed sale/use clears selection.
4. Reset selection only on full client session shutdown/new page lifecycle, not modal close or region transition.

## 3. Hotbar and input

1. Make each slot a keyboard-accessible selection control with selected styling and ARIA state.
2. Remove the wooden-axe craft button and its Vue imports/computed state.
3. Bind WorldScene keys 1–8 only while world input is unlocked and no action is busy.
4. Prevent modal-open selection and world-use events.

## 4. Held/action rendering

1. Project selected hoe/watering/axe/seed continuously on the player in local candidate mode; empty hand hides held media.
2. Choose player action from selected item, not target phase.
3. Dispatch `use-item-on-target` at ActionTimeline impact exactly once.
4. Call Tree/FarmPlot impact only on success; wrong item still completes player animation quietly.
5. Implement empty-hand harvest bend with current farmer frame and guaranteed recovery cleanup.

## 5. Contract checks

1. Update Life Loop tests to select exact items for till/plant/water and empty hand for harvest.
2. Add deterministic wrong-tool cases for tree and every farm phase; assert state equality and no target success.
3. Add transient selection checks: initial empty, click/key toggle, empty slot, consumed last item, modal lock.
4. Keep IndexedDB v2 backup and Town Population tests passing.

## 6. Visual/manual acceptance

1. Use a new isolated no-auth preview game; do not continue an old save.
2. Verify default empty hand, persistent held item, click/key selection and deselection.
3. Verify wrong-tool animation without target impact or message.
4. Verify axe/tree, hoe/soil, seed/tilled, watering/growing and empty-hand/mature interactions.
5. Confirm no held sprite residue after action, modal, region transition or sleep.

## 7. Quality gate

1. `test:life-loop`, `test:town-population`, typecheck and client build.
2. Git diff contains no PNG/GIF/ZIP/TMJ/migration/manifest changes.
3. Full diff review confirms selection remains out of GameState/save and media remains out of domain.
