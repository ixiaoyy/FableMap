# 实施计划

## 1. Input and click interaction

1. Add Space key capture alongside current movement/Hotbar keys and remove E registration.
2. Make NpcEntity sprite clickable and pass the exact entity to WorldScene.
3. Move existing shop/dialogue branching into `interactWithNpc(entity)` with 42px validation.
4. Make BedEntity clickable and route a 42px-valid click into one transient Vue “是否休息？” confirmation; “是” invokes the existing sleep transition exactly once and “否” only closes it.
5. Include the sleep confirmation in the existing world-input lock and reject duplicate bed clicks/modal stacking; delete the complete E nearest-target path.

## 2. Deterministic hit target

1. Add a pure facing-vector helper and `selectNpcHitTarget` client module.
2. Implement 28px forward / 10px lateral filter and stable nearest tie-break.
3. Add deterministic tests for front, behind, lateral, range, multiple NPCs and tie-break.

## 3. Punch and NPC reaction

1. Start punch only for empty hand and unlocked idle world.
2. Animate current player sprite through windup/impact/recovery using ActionTimeline.
3. Add NpcEntity flash/6px knockback/hard-stop/return without changing spawn/collision.
4. Reject stacked reaction and guarantee tint/position cleanup on destroy/transition.

## 4. Regression checks

1. Verify NPC click opens existing Shop/Dialogue and repeated click cannot stack modal.
2. Verify NPC and bed clicks work within 42px, bed “是/否” paths restore input correctly, duplicate clicks cannot stack, and E triggers nothing.
3. Verify Tool Interaction mouse/number keys and wrong-tool behavior remain unchanged.
4. Run Tool Interaction/Life Loop/Town Population contracts, typecheck and client build.
5. Audit diff for zero GameState/save/TMJ/media/migration changes.

## 5. Manual feel gate

1. New local playtest: approach each of 华强、昊天、阿禾 and click to interact.
2. Empty hand Space in front/behind/side/too far; verify target selection.
3. Repeat Space rapidly; verify one punch/reaction at a time.
4. Hold a tool and press Space; verify no attack.
5. Hit then immediately change region/open dialogue; verify no residual tint or offset.

## Verification handoff — 2026-09-01

- 用户明确决定真实手感、挥拳方向、快速连按、切图残留与手机体验由真人验收；上述 Manual feel gate 保持待验，不再阻塞任务归档。
- 静态基线：`test:town-population` 中命中走廊/最近目标合同通过，完整套件 6/6；`test:life-loop` 11/11；`typecheck` 与 `build:client` 通过。
- 当前提交基线未发现 GameState/save/TMJ/媒体/经济/好感扩展；真人若判断生活游戏不应保留挥拳，再单独提交删除入口的窄方案。
