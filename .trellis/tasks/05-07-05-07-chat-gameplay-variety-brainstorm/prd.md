# brainstorm: chat gameplay variety

## Goal

Explore ways to make FableMap's tavern chat gameplay less monotonous while preserving the product mainline: real-coordinate taverns, owner-authored spaces, AI NPC interaction, memory/writeback, and revisit feedback.

## What I already know

* User wants to use Trellis brainstorming.
* Current concern: chat gameplay feels too monotonous.
* The output should help identify good feature ideas before implementation.

## Assumptions (temporary)

* The goal is to improve visitor-facing tavern chat/play, not to add platform-generated tavern content.
* Ideas should fit FableMap's constraints: owner sovereignty, SillyTavern-compatible character cards, and no platform-level token/payment system.
* MVP should prefer lightweight layers around existing chat rather than a large RPG/combat system.

## Open Questions

* Which gameplay direction should be prioritized first for MVP?

## Requirements (evolving)

* Provide several concrete gameplay directions with trade-offs.
* Keep ideas compatible with owner-authored NPCs and tavern content.
* Avoid features explicitly excluded by project docs.

## Acceptance Criteria (evolving)

* [ ] Brainstorm includes 2-3 feasible MVP approaches.
* [ ] Recommended approach explains why it fits FableMap now.
* [ ] Out-of-scope items are explicit.
* [ ] Next implementation task(s) can be derived if the user approves a direction.

## Definition of Done (team quality bar)

* Tests added/updated if implementation follows.
* Lint / typecheck / CI green if implementation follows.
* Docs/notes updated if behavior changes.
* Rollout/rollback considered if risky.

## Out of Scope (explicit)

* Platform-generated tavern/NPC/story content without owner confirmation.
* Platform token recharge, settlement, or commission systems.
* Traditional combat/level/equipment/ranking RPG systems.
* Visitor-to-visitor social networks.
* Unanchored free-floating spaces.

## Technical Notes

* Task created for Trellis brainstorm: `.trellis/tasks/05-07-05-07-chat-gameplay-variety-brainstorm/`.
* Need to inspect relevant product/docs/code before asking for preferences.

## Auto-context Findings (2026-05-07)

### Project constraints

* `README.md`, `docs/PRODUCT_BRIEF.md`, `docs/FABLEMAP_TAVERN_PLATFORM.md`, and `docs/ARCHITECTURE.md` all define the mainline as: real coordinate / map discovery -> enter tavern -> AI NPC chat -> memory writeback -> revisit feedback.
* `docs/WORLD_SCHEMA.md` already provides extension points relevant to this brainstorm:
  * `Tavern.layout_style` includes `npc-chat`, `quest-play`, `hybrid-room`.
  * `Tavern.gameplay_definitions` is the owner-confirmed structured gameplay carrier.
  * `VisitorState` and affinity/relationship state already support long-term revisit hooks.
* `docs/WHAT_NOT_TO_BUILD.md` blocks: platform auto-publishing content, platform token/payment economy, free-floating non-coordinate spaces, visitor social network, combat/level/equipment/ranking systems.

### Existing implementation / prior task context

* `frontend/app/product/TavernChatRoom.jsx` already contains a SillyTavern-style chat workbench, NPC stage card, group chat support, memory/context panels, gameplay launcher, and `GameplaySessionPanel`.
* `frontend/app/product/GameplaySessionPanel.jsx` already supports narration, 2-3 choice buttons, free-text submission, completion state, and abandon flow.
* Backend runtime already updates chat history, `VisitorState`, affinity, memory atoms, and state-card candidates during chat in `backend/src/fablemap_api/application/services/runtime.py`.
* Backend gameplay service already supports owner-published gameplays, private visitor sessions, choice advance, completion payload, and abandon flow.
* Prior tasks already covered: owner gameplay template library, short-drama gameplay templates, multi-NPC room, chat workbench, NPC stage card, relationship graph brainstorm, visitor profile/affinity brainstorm, and soft-currency/gifts design.

### External pattern scan

* Replika positions itself as a companion where value comes from relationship, memories, feedback, roleplay, voice/selfie/image interactions, and activities, not task automation. Useful translation for FableMap: make chat feel like a relationship/revisit loop, not a generic assistant. Source: https://help.replika.com/hc/en-us/articles/5040453297293-Can-Replika-be-my-virtual-assistant
* AI Dungeon uses scenarios, story cards, plot essentials, author notes, multiple-choice scenario starts, and a memory system with summarization + retrieval to maintain continuity under context limits. Useful translation: FableMap can expose owner-confirmed "scene cards / memory beats / next visit hooks" rather than relying on raw chat alone. Sources: https://help.aidungeon.com/faq/the-memory-system and https://help.aidungeon.com/faq/what-are-scenarios
* Character.AI's group chat pattern shows that multiple AI characters in the same room creates novelty, but also risks diluted character identity if not tightly governed. Useful translation: FableMap should keep group chat owner-governed, with explicit speaker rules and strong NPC prompt context. Source: https://techcrunch.com/2023/10/11/character-ai-introduces-group-chats-where-people-and-multiple-ais-can-talk-to-each-other/

## Expansion Sweep

### Future evolution

* Chat can evolve from a single text box into a "conversation loop": opening hook -> NPC response -> player action/choice -> memory beat -> revisit callback.
* The same primitives can later support special tavern types: short-drama spaces, detective spaces, cultivation spaces, public-welfare guidance spaces, relationship-graph spaces.

### Related scenarios

* Owner tooling must stay in sync: any visitor-facing gameplay mode needs owner templates / preview / save-confirm-publish boundaries.
* Discovery and revisit surfaces should reflect playable hooks only when the tavern has owner-published content, otherwise avoid empty marketing.

### Failure / edge cases

* Avoid AI-only free-form host hallucinating new canon. New facts should become pending memory/state-card candidates or use existing owner-confirmed WorldInfo/gameplay nodes.
* Avoid turning engagement into RPG economy, paid gacha, rankings, global social, or cross-tavern public relationship drama.
* Keep mobile first-screen chat usable; any added gameplay layer should be compact and dismissible.

## Feasible Approaches

### Approach A — "Conversation Beats" inside the chat composer (Recommended MVP)

**How it works**: Add lightweight, owner-confirmed chat hooks around the existing chat workbench: quick scene prompts, NPC-specific opening moves, "ask / investigate / comfort / challenge" action chips, and a visible "memory beat" after meaningful replies. The visitor still chats normally, but each turn has a suggested intent and occasional structured result.

**Why it fits**: Lowest implementation risk because it reuses current `sendTavernChat`, affinity, memory atoms, state-card candidates, and chat UI. It directly addresses monotony without making users leave chat for a separate mini-game.

**Pros**:
* Fastest path to make ordinary chat feel playable.
* Works for every tavern and every NPC.
* Keeps owner content as source of truth; no schema-heavy game system needed first.

**Cons**:
* Less visually dramatic than short-drama/gameplay cards.
* Needs careful prompt/copy design so chips do not feel like generic chatbot suggestions.

### Approach B — "Playable Episodes" using existing GameplayDefinition

**How it works**: Promote existing gameplay sessions into a more prominent in-chat episode lane: 3-5 step micro-stories, 2-3 big choices, failure/retry/completion, reward text, and optional revisit follow-up. Owner chooses from templates and publishes; visitor sees a playable card in the chat workbench.

**Pros**:
* Stronger game feel and short-video/short-drama packaging.
* Reuses existing `GameplayDefinition` / `GameplaySession` instead of inventing new schema.
* Easy to verify with deterministic script tests.

**Cons**:
* Only works well for taverns where owner has configured gameplay.
* If overemphasized, can distract from the core open-ended NPC chat.

### Approach C — "Relationship + Revisit Rituals"

**How it works**: Make each visit produce a small continuity ritual: NPC recalls the last meaningful memory, offers a daily/weekly topic, reacts to relationship stage, and leaves a next-time hook. Optional owner-authored gifts / soft currency / affinity unlocks can follow later.

**Pros**:
* Best for retention and emotional continuity.
* Leverages existing `VisitorState`, affinity, memories, and future relationship graph work.
* Fits FableMap's "real place you can revisit" positioning.

**Cons**:
* More backend-sensitive because memory/privacy/guest-vs-registered boundaries matter.
* Slower to feel exciting on first visit unless paired with Approach A or B.

## Current Recommendation

Start with **Approach A: Conversation Beats** as the first MVP, then optionally compose it with **Approach B** for taverns that already have published gameplay.

Reason: current pain is "chat feels monotonous". The shortest path is not a large new game system; it is to make each chat turn have intent, visible progress, and memory payoff while preserving the existing SillyTavern-style workbench. Approach A also creates reusable hooks for future short-drama, cultivation, relationship, and gift systems.

## Proposed MVP Scope

* Add 3-5 intent chips near the composer, derived from tavern/NPC/gameplay context.
* Add an optional "本轮可推进" / "可记住的事" mini surface after NPC replies, using existing memory/state-card candidate concepts.
* Add owner-side template/preview later only if needed; initial MVP can use deterministic default intent presets by place type/layout and NPC metadata.
* Keep everything as suggestions: visitor can always type freely.
* No new paid economy, ranking, combat, platform-auto-published content, or visitor social feature.

## Updated Open Question

* Which direction should be used as the first implementation slice: Approach A, B, or C?

## Decision (ADR-lite)

**Context**: The current visitor chat experience feels too monotonous. FableMap already has chat, memory writeback, affinity updates, state-card candidates, group chat, and structured gameplay sessions. The first slice should improve the default chat loop without replacing it with a large game system.

**Decision**: User selected **Approach A — Conversation Beats inside the chat composer**.

**Consequences**:

* First implementation should focus on making each chat turn feel intentional: action chips, optional composed prompt text, and visible post-reply progression.
* Prefer reusing existing chat response payloads: `visitor_state`, `affinity`, `created_memories`, and `state_card_candidates`.
* Avoid making this a new schema-heavy gameplay system in the first slice.
* Owner-configurable beats can be a later enhancement if the MVP proves useful.

## Requirements Update After User Choice

* Visitor chat composer should expose lightweight intent/action chips while preserving free typing.
* The chosen intent should help shape the next message but should not replace the visitor's own words.
* After an NPC reply, the UI should surface a small "conversation progressed" signal when existing backend response data supports it.
* The feature should be compact on mobile and should not bury the text input.
* No platform-auto-published story facts. Any durable facts should continue through existing memory/state-card candidate mechanisms.

## Candidate MVP Slice for Approach A

### A1 — Default intent chips + existing progression signals (recommended)

* Show 4-5 default chips near the composer, e.g. `追问线索`, `安慰一下`, `试探态度`, `请 NPC 建议`, `换个轻松话题`.
* Clicking a chip sets a small intent label and optionally pre-fills/frames the typed message.
* `sendTavernChat` can continue using current request fields. If needed, the frontend can send intent as `extra_context` while `display_message` remains the visitor's visible words.
* After response, show a compact beat summary if response includes `created_memories`, `state_card_candidates`, or `affinity` delta/stage.
* No new owner editor in first slice.

### A2 — Owner-configurable beats in MVP

* Add owner-side configuration for tavern/NPC-specific chips.
* Chips could become part of tavern content and require save/publish/preview rules.
* Stronger owner sovereignty, but larger schema/UI/test surface.

### A3 — Gameplay-aware chips only

* Chips appear only when a published `GameplayDefinition` is active or available.
* Keeps chips highly contextual, but does not improve ordinary open chat enough.

## Next Open Question

* Should the first slice ship default universal chips first, or include owner-configurable chips immediately?

## Decision Update: MVP Slice

User selected **A1 — Default intent chips + existing progression signals**.

### Locked MVP Direction

* First slice will ship deterministic default conversation chips instead of owner-configurable chips.
* Chips should work in ordinary open chat, regardless of whether a tavern has published gameplay.
* The implementation should prefer frontend/light service-layer changes and reuse existing backend chat payloads where possible.
* Owner-configurable chips are deferred until the default pattern proves useful.
* Gameplay-aware chips can be a future extension that reuses the same UI slot.

### MVP Requirements Added

* Show a compact chip row near the tavern chat composer.
* Provide a small default set, currently assumed:
  * `追问线索`
  * `安慰一下`
  * `试探态度`
  * `请 NPC 建议`
  * `换个轻松话题`
* Chips should not force a separate gameplay session.
* Chips should preserve visitor agency: free typing remains the primary path.
* Post-reply progression should be based on existing response data only: created memories, state-card candidates, affinity / relationship stage.

### Deferred

* Owner editor for custom chips.
* New persisted schema for conversation beat definitions.
* Platform-generated story facts or auto-published canon.
* Ranking, combat, currency, or paid boost loops.

## Next Open Question

* What should happen when a visitor clicks a chip?

## Decision Update: Chip Interaction

User selected **Option 1 — clicking a chip only selects intent; it does not auto-send**.

### Locked Interaction

* Clicking an intent chip marks the current outgoing message with an intent label, e.g. `已选择：追问线索`.
* The visitor must still type their own message and press send.
* The visible chat history should show only the visitor's own message, not an injected template sentence.
* The selected intent may be sent as hidden/structured context for the next NPC response, but it must not replace visitor agency.
* If the visitor changes their mind, they can clear or switch the selected intent before sending.

### Product Rationale

* This avoids mechanical one-click chatting.
* It keeps the chat workbench close to SillyTavern-style free roleplay while giving users a playable direction.
* It is safer for FableMap's owner/visitor boundaries because chips suggest intent rather than inventing new story facts.

## Next Open Question

* Where should the post-reply "conversation progressed" signal appear?

## Decision Update: Post-reply Progress Signal Placement

User selected **Option 1 — show the conversation-progress signal under the related NPC reply bubble**.

### Locked Placement

* After an NPC reply, if the backend response contains relevant progression data, show a compact card directly below that reply.
* The card should be visually lightweight and should not interrupt the chat flow.
* Suggested labels:
  * `记住了 1 件事` when `created_memories` is non-empty.
  * `关系略有变化` / relationship-stage text when `affinity` or `visitor_state` indicates a change or current stage.
  * `可整理为状态卡` when `state_card_candidates` is non-empty.
* The card should remain associated with the turn that produced it, so users can understand what caused the progression.
* Mobile behavior: keep it narrow, one-column, and below the message; do not move it into a hidden sidebar.

## Converged MVP Summary

### Goal

Make ordinary tavern chat feel less monotonous by adding lightweight, optional conversation beats to the existing SillyTavern-style chat workbench.

### Requirements

* Add a default conversation-intent chip row near the chat composer.
* First chip set:
  * `追问线索`
  * `安慰一下`
  * `试探态度`
  * `请 NPC 建议`
  * `换个轻松话题`
* Clicking a chip only selects an intent; it must not auto-send.
* The visitor must still type and send their own message.
* The selected intent can be sent as structured/hidden context for the next NPC response, while visible chat history preserves the visitor's own text.
* Allow clearing or switching selected intent before send.
* After the NPC reply, show a compact progress card under that reply if existing response payload contains memory, affinity, visitor-state, or state-card-candidate signals.
* Keep mobile/narrow-screen chat input primary and avoid hiding the feature in sidebars.

### Acceptance Criteria

* [ ] Tavern chat composer shows default conversation-intent chips.
* [ ] Selecting a chip displays the selected intent but does not send a message.
* [ ] Sending with selected intent preserves the visitor's visible message in chat history.
* [ ] The NPC response can receive the selected intent as context without requiring a new gameplay session.
* [ ] If response data includes created memories, state-card candidates, or affinity/visitor-state signals, a compact progress card appears under that NPC reply.
* [ ] The feature works on desktop and narrow/mobile viewports without burying the input.
* [ ] No owner-configurable schema, paid economy, ranking, combat, or platform-auto-published canon is introduced in this MVP.

### Technical Approach

* Prefer frontend/product-chat changes first, likely around `frontend/app/product/TavernChatRoom.jsx` and existing tavern chat service helpers.
* Reuse existing backend `send_chat` response fields: `visitor_state`, `affinity`, `created_memories`, and `state_card_candidates`.
* If hidden intent context is needed, pass it through existing request/context mechanisms rather than adding a persisted schema.
* Add or update frontend script tests for chip interaction and progress-card rendering.
* Run frontend build and, for visible UI changes, Playwright desktop + mobile self-acceptance before implementation completion.

### Out of Scope

* Owner-configurable chip editor.
* New persisted `conversation_beats` schema.
* One-click auto-send chip messages.
* Gameplay-only gating.
* Platform-generated/published story facts.
* Combat, levels, equipment, rankings, platform currency, or paid boost loops.

### Implementation Plan (small PRs)

* PR1: Add composer intent-chip UI and local selected-intent state.
* PR2: Thread selected intent into send flow as non-visible context and clear it after send.
* PR3: Render per-turn progress cards from existing response payloads and add tests / visual acceptance.

## Implementation Target Correction After Code Inspection

Current `/tavern/:id` route uses the native React Router workbench at `frontend/app/features/tavern-chat-workbench/index.tsx`. The older `frontend/app/product/TavernChatRoom.jsx` remains a product-parity/legacy surface and should not be modified for this first slice unless tests reveal it is still on the active route.

Implementation should target:

* `frontend/app/features/tavern-chat-workbench/index.tsx` for the visible chat UI.
* `frontend/app/lib/taverns.ts` for typing the already-supported backend `extra_context` / `display_message` request fields.
* A small helper module under `frontend/app/features/tavern-chat-workbench/` if pure chip/progress logic becomes easier to test outside the TSX component.
* `frontend/scripts/tavern-chat-workbench-test.mjs` or a focused new script for source/pure helper regression checks.

## Child Task Decomposition (2026-05-07)

User requested Trellis task splitting only; implementation is intentionally not executed in this step.

Children created from `implementation-plan.md`:

1. `D:\work\ai-\.trellis\tasks\05-07-conversation-beats-helper-tests\` — pure helper module, default chip contract, focused helper test, package test wiring.
2. `D:\work\ai-\.trellis\tasks\05-07-conversation-beats-chat-request-typing\` — `frontend/app/lib/taverns.ts` request/local metadata typing.
3. `D:\work\ai-\.trellis\tasks\05-07-conversation-intent-chips-ui\` — composer chip UI and selected-intent local state.
4. `D:\work\ai-\.trellis\tasks\05-07-conversation-intent-send-flow\` — hidden intent context and visible message preservation through send flow.
5. `D:\work\ai-\.trellis\tasks\05-07-conversation-progress-cards\` — per-reply progress card rendering from existing response payloads.
6. `D:\work\ai-\.trellis\tasks\05-07-conversation-beats-verification\` — full frontend verification and Playwright desktop/mobile acceptance artifacts.

Execution order recommendation:

1 → 2 → 3 → 4 → 5 → 6

Parallelism note: child 1 and child 2 are mostly independent, but child 3 depends on child 1; child 4 depends on child 1+2+3; child 5 depends on child 2 and benefits from child 4; child 6 must run last.

## Child 6 Verification Notes (2026-05-07)

`05-07-conversation-beats-verification` has completed the final acceptance pass:

- `node .\frontend\scripts\conversation-beats-test.mjs` ✅
- `node .\frontend\scripts\tavern-chat-workbench-test.mjs` ✅
- `npm --prefix .\frontend test` ✅
- `npm --prefix .\frontend run typecheck` ✅
- `npm --prefix .\frontend run build` ✅
- Playwright 自验收已生成截图/报告（桌面与移动）：
  - `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-1440x1020-desktop.png`
  - `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-390x900-mobile.png`
  - `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-playwright-report.md`
