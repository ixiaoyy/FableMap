# Day 1-7 留存纵向切片：技术设计

## 1. Delivery topology

父任务只拥有完整需求、跨子任务合同和最终集成门禁，不直接实现。现有 `08-28-current-slice-precision-gate` 是前置依赖；在它完成真实路线、整理当前工作区并形成 pre-retention checkpoint 前，不开始新功能代码。

```text
现有精细化门禁 + pre-retention checkpoint
                    │
          ┌─────────┴─────────┐
          │                   │
   Audio / settings     GameState v8 domain
          │                   │
          └─────────┬─────────┘
                    ▼
        Upgrade / backpack / request UI
                    │
                    ▼
        Relationship / dialogue / events
                    │
                    ▼
          Day 1-7 reveal + mirror teaser
                    │
                    ▼
         Day 7 + Day 29 manual checkpoint
```

子任务：

1. `08-31-audio-feedback-mvp`
2. `08-31-retention-domain-v8`
3. `08-31-progression-request-ui`
4. `08-31-relationship-dialogue-events`
5. `08-31-first-week-teaser`
6. `08-31-day7-acceptance-checkpoint`

## 2. Boundary map

```text
Tiled/catalog + static definitions
              ↓
Phaser/Vue → typed GameCommand → GameSession → domain systems
              ↑                         ↓
         command result ← immutable GameState snapshot
                                        ↓
                              SaveRepository → IndexedDB

Audio cue source → client AudioDirector → Phaser sound instances
AudioSettingsPanel → AudioSettingsRepository → localStorage preference key
```

- `GameSession` remains the sole gameplay mutation owner.
- Upgrade eligibility/cost, multi-tile watering, inventory capacity, request generation/completion, relationship stages, dialogue selection/history, milestone/event completion and Day settlement are domain rules.
- Phaser owns animation timing and supplies the selected target plus current facing in a typed command; it never loops over farm tiles or directly increments rewards.
- Vue renders snapshot projections and sends commands. It may format labels, but may not recompute prices, request eligibility, relationship thresholds or completion.
- Audio settings are non-gameplay preferences and use a separate versioned local key `mirror-island.audio-settings.v1`; they do not enter `GameState` or gameplay save migration.
- Audio cue routing is client-only. Domain action results expose semantic result codes; one client mapper owns result-code → audio-cue translation.

## 3. StoredGame v8

The release performs one explicit v7 → v8 save-format upgrade. IndexedDB database/store/key topology remains unchanged.

### 3.1 State additions

```typescript
type InventoryCapacity = 24 | 32
type WateringCanLevel = 1 | 2
type RelationshipStage = "stranger" | "familiar" | "friendly"

interface DailyRequestState {
  day: number
  requestId: string
  completed: boolean
}

interface DialogueMemoryEntry {
  dialogueId: string
  day: number
}

interface NpcDialogueState {
  recent: DialogueMemoryEntry[]
  acknowledgedStage: RelationshipStage
}

interface RetentionProgressState {
  inventoryCapacity: InventoryCapacity
  wateringCanLevel: WateringCanLevel
  dailyRequest: DailyRequestState | null
  npcDialogue: Record<string, NpcDialogueState>
  seenEventIds: string[]
}
```

The exact production shape may flatten `RetentionProgressState` into `GameState`, but there is one decoder and one clone/reconcile owner. Constraints:

- v7 migrates to capacity 24, watering can Lv1, deterministic current-day request when Day ≥ 2, empty dialogue history and empty event set.
- Inventory array length must equal the saved capacity. Upgrade appends exactly eight empty slots; existing order, stacks and first eight Hotbar slots remain unchanged.
- Unknown request/dialogue/event IDs fail current-version decode rather than silently accepting orphaned content.
- Dialogue memory is pruned to the minimum needed for three-game-day exclusion; no unbounded log is stored.
- `seenEventIds` contains only catalog-registered stable IDs and is deduplicated.
- All current critical mutations continue to queue immediate saves; movement keeps bounded debounce.

### 3.2 Calendar continuity

- Absolute `day` remains the durable clock.
- Until Summer exists, `calendarAt` no longer projects Day 29 into playable Summer. The public playable date projection is an unbounded spring-development `Day N` contract; seasonal crop and forage rules continue treating all days as the current spring content set.
- Remove `canAdvancePlayableCalendar` as a sleep blocker; only `Number.MAX_SAFE_INTEGER` remains the day ceiling.
- HUD shows `Day N · weekday · 06:00–24:00`; CalendarPanel becomes a compact unbounded-day information surface and does not promise four seasons.
- Day 28 → 29 runs the same daily settlement once: friendship decay, crop growth/reset-water, forage refresh, request refresh, NPC reset and save.

This is a temporary pre-Summer compatibility contract. A future Summer task must introduce a new explicit migration/rollout decision rather than reusing the hidden four-season projection.

## 4. Economy and upgrades

Current evidence: starting gold 100g; eight farm plots; exhaustive first-week forage sell value 1,170g; a simple two-cycle turnip path ends Day 7 with 295g before forage/requests.

Recommended balance:

| Goal | Unlock | Cost | Effect |
|---|---:|---:|---|
| Watering Can Lv2 | Day 3, 昊天 | 900g + 15 wood | One atomic use waters the clicked valid plot plus up to two contiguous valid plots along facing |
| Backpack 32 | Day 5, 华强 shop | 1,500g | Appends eight permanent inventory slots; Hotbar remains first eight |

Rationale:

- With normal crop/forage/request participation, the watering can is reachable around Day 4–7.
- A player saving instead can reach the backpack near the end of the first week.
- Combined price is 2,400g plus wood. After request item opportunity cost, even the exhaustive known Day 1–7 route should not casually buy both before the final day.
- No stone is required because stone is not currently an inventory item. Wood is the only existing non-sale material and makes the tool request concrete without adding a mining system.

### 4.1 Multi-tile watering

- Add a shared four-direction `Facing` type to the typed command boundary.
- Lv1 calls the existing single-tile transition.
- Lv2 resolves target centers at offsets 0, 16 and 32 pixels from the clicked plot along facing, keeps only registered same-region farm plots, and applies one atomic watering operation.
- The operation reports how many plots changed. Already-watered, non-growing, missing and out-of-range plots do not create duplicate effects; no tile outside the catalog can be synthesized.
- The clicked target still must pass current player-distance validation. The continuation tiles are accepted only because they are catalog-contiguous with that valid target.

## 5. Daily request contract

`DailyRequest` remains the minimal static definition requested by the product:

```typescript
interface DailyRequest {
  requestId: string
  npcId: string
  itemId: ItemId
  quantity: number
  goldReward: number
  friendshipReward: number
}
```

- Day 1: board explains that resident requests begin tomorrow; no claim/reward exists.
- Day ≥ 2: one request ID is selected deterministically by absolute day from a fixed ordered catalog and saved in `DailyRequestState`.
- Sleep creates the next day's request exactly once. Continue/reload uses the saved request ID and never rerolls.
- Talking to the matching NPC with sufficient inventory atomically consumes the requested quantity, adds Gold and Friendship, marks complete, records the thank-you dialogue, publishes once and saves once.
- Missing items opens request-aware dialogue but mutates nothing. Completed requests cannot pay again.
- Expired uncompleted requests disappear at the next sleep without penalty.
- No quest graph, objective list, prerequisite DSL, task chain, editor, generic condition evaluator or server state is introduced.

Initial ordered templates:

| Rotation | Resident | Need | Gold | Friendship | Purpose |
|---|---|---:|---:|---:|---|
| Day 2 | 华强 | 6 wood | 100g | 170 | Ensures an engaged Day-1-to-4 player reaches the first familiar stage on Day 4 |
| Day 3 | 阿澜 | 2 spring wildflowers | 110g | 70 | Reuses Town/Foothills/Lakeshore forage |
| Day 4 | 墨子 | 9 wood | 160g | 80 | Gives existing wood a non-crafting use |
| Day 5 | 阿禾 | 2 turnips | 150g | 80 | Pays off the first crop cycle |
| Day 6 | 昊天 | 15 wood | 320g | 100 | Higher commitment/reward without inventing combat risk |
| Day 7 | 祥子 | 2 bamboo shoots | 180g | 80 | Sends the player toward the lakeshore teaser |
| Rotation 7 | 昊美丽 | 2 spring wildflowers | 120g | 80 | Continued deterministic rotation |
| Rotation 8 | 浩南 | 12 wood | 220g | 90 | Continued deterministic rotation |

The exact Chinese copy is content-owned and can be polished without changing reward IDs or formulas.

## 6. Dialogue and relationship design

### 6.1 One content owner

- Move reviewed dialogue definitions from `client/src/game/dialogue/definitions.ts` into a domain-owned dialogue catalog with stable per-variant IDs.
- Environment and NPC dialogue use the same lookup; client code only renders returned speaker/lines.
- `NpcDialogueSystem` builds candidates from current activity/location/phase, request state, relationship stage and personality pool, then excludes entries used for that NPC in the prior three absolute days.
- Context priority is: active request completion/thanks → newly reached relationship stage → current work/home/patrol/lakeshore activity → relationship-stage pool → place/time pool → personality pool.
- If a high-priority group is fully excluded by recent history, the selector falls through to the next group; it never repeats a recent line merely to preserve a lower-value matrix.
- Selection is deterministic from NPC ID + day + candidate IDs, so a failed save/retry does not create random dialogue churn.

### 6.2 Relationship stages

- Internal 0–2,500 point / ten-heart contract remains unchanged.
- External stages: `stranger` below 250, `familiar` at 250, `friendly` at 500+. Social UI emphasizes these stages and only the first two content-backed hearts; it stops presenting ten empty hearts as ten ready content tiers.
- Each of the eight NPCs gets at least three personality candidates plus one familiar-stage candidate group.
- When the derived stage exceeds `acknowledgedStage`, the next valid talk prioritizes a new-stage line once and records acknowledgement.
- Request rewards are added through the existing capped friendship owner; daily talk still counts once per day and decay remains unchanged.

### 6.3 Two-heart events

- `seed-keeper-two-heart` and `blacksmith-two-heart` are short, non-branching 3–4 line interactions using the normal dialogue modal plus a small presentation cue.
- They trigger on the next eligible interaction after 500 points, once per save, in the NPC's relevant workplace context.
- No cutscene graph, branching event engine, camera scripting framework, reward table or generic heart-event scheduler is added.

## 7. Day 1–7 reveal layer

- A compact `TodayHint` projection and one post-sleep notice make each reveal discoverable without becoming a quest journal.
- Unlocks are derived from absolute day; `seenEventIds` only controls one-time presentation, not eligibility.
- Day 2: board activation.
- Day 3: first talk with 昊天 prioritizes the Lv2 watering-can introduction and exposes the service action.
- Day 4: the Day-2 华强 request + daily talks are balanced to reach `familiar`; the stage transition emits a clear relationship cue.
- Day 5: 华强 shop exposes the 32-slot backpack goal.
- Day 6: the high-commitment 昊天 request is selected.
- Day 7: the existing Lakeshore waystone gains a code-drawn, low-cost mirror shimmer and new inspect dialogue. It is a rumor/omen, not a usable portal, final Expedition entrance or new region.

## 8. Audio design

### 8.1 Source and publication

- Use only individually reviewed CC0 assets from official Kenney, OpenGameArt or fixed Freesound sound pages. Candidate sources include Kenney RPG/Impact/Interface Audio, OpenGameArt `100 CC0 SFX #2`, CC0 bird/wind/water recordings, CC0 room tone and one low-volume CC0 walla recording.
- Download archives/masters outside Git, audition every selected file, and publish only the exact adopted subset.
- Shorten/normalize/transcode selected masters to browser-ready OGG where needed; record original source URL/ID, source hash, exact processing, output bytes/MIME/SHA-256 and immutable object key.
- Extend `game-media-manifest.json`, `prepare-media.mjs`, source record and `THIRD_PARTY_NOTICES` as required. Git must not track audio binaries.
- CDN and same-origin `/game-media/v1`回读必须匹配 bytes、MIME、SHA-256 和 immutable cache headers before runtime references are accepted.

### 8.2 Runtime

- One client `AudioDirector` owns preload, unlock/resume, category gain, overlapping one-shots, footstep variation, loop crossfade and cleanup.
- Semantic cue catalog: footsteps (three variants); hoe/water/axe/stone/harvest/pickup; door/buy/sell/dialogue-page/sleep; Farm wind+birds; Town outdoor bed+walla; Lakeshore water; interior room tone.
- Footsteps use a bounded cadence tied to actual player movement, not key repeat. Tool sounds fire at action impact; buy/sell fire only after successful domain result; dialogue page fires on actual page advance; door and ambience follow committed region transition.
- Ambience crossfades by region group and never stacks duplicate loops after refresh/HMR.
- Master, Music and SFX values are clamped 0–1, version-decoded from local settings, applied immediately and restored before the first playable scene. Music gain exists but no music track is loaded this stage.
- Browser autoplay failure leaves gameplay usable and exposes a retry/unmute action rather than failing the game session.

## 9. UI surfaces

- Add one Settings panel with three range inputs, numeric/accessible labels, mute-safe zero values and immediate preview SFX.
- Add one Backpack panel that renders the complete 24/32 slot projection; first eight remain the Hotbar. This makes capacity visible before and after purchase.
- Extend the Seed Shop panel with a Day-5 backpack offer, not a second fake shop framework.
- Add one narrow Blacksmith service action after the relevant dialogue; reuse the dialogue/service modal patterns rather than changing Tiled NPC interaction types.
- Upgrade the existing `town-notice-board` inspect into a request panel with need/owned/reward/status and the target resident's name.
- Social UI changes to three labels and two content-backed heart indicators while retaining internal points.
- Remove the start-menu claim that crafting is a current player-facing feature. Do not delete `CraftingSystem`, recipe catalog or typed command.
- All modal additions join the existing input-lock/focus/Escape model and must work at desktop, 640px, narrow mobile and 200% zoom.

## 10. Compatibility, failure and rollback

- No database, Prisma schema, server API, identity, account or cloud-save changes.
- v7 → v8 is forward-only in the active main slot; existing v2 raw backup behavior remains unchanged and is not repurposed as a v7 backup. Before release, checkpoint evidence preserves the clean v7 baseline for forward-fix.
- Corrupt/unknown v8 fields fail explicitly and do not overwrite the raw record.
- Audio load failure degrades only the missing cue/layer and reports a retryable client status; it must not block new/continue game or mutate gameplay state.
- Request/upgrade operations are atomic: failure leaves inventory, Gold, friendship and completion unchanged.
- If a child batch fails acceptance, revert only that child's exact changes or forward-fix within v8; never restore whole dirty files or delete user work.
## 11. Verification strategy

- Baseline checkpoint: complete the existing precision gate's required real routes before new capability code.
- Audio: manifest/hash/MIME/cache verification plus actual headphone/speaker listening in Farm, Town, Lakeshore and one interior.
- Domain v8: one narrow contract run covering v7 migration, 24→32, Lv2 watering boundaries, request idempotence, dialogue-history pruning, event-once and Day 28→29 settlement.
- UI/content: typecheck + client build once after final related changes, then desktop/mobile/200% zoom/keyboard/touch manual paths.
- Final: fresh new game through Day 7, refresh/continue at representative points, then an accelerated or debug-assisted Day 28→29 continuity check without altering production rules.
