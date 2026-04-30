# Mainline Audit — 2026-04-30

## Executive Summary

The core loop is **technically present but not yet product-converged**.

- Backend has real persistence for tavern creation, LLM config, characters, entry visitor state, chat history, structured memory atoms, and state-card candidates.
- Frontend has user-facing surfaces for creation, owner LLM/NPC management, entry, chat, memory panels, state-card review, and owner revisit summaries.
- The largest gap is **not one missing module**; it is that the closed loop is scattered across many side features and lacks one explicit acceptance script/manual smoke path that proves the whole sequence end-to-end.
- Therefore all new feature work should stay frozen until the loop below has one clear “golden path” and one short regression checklist.

Canonical loop under audit:

> 创建酒馆 → 配置 NPC / LLM → 访客进入 → 对话 → 写回状态 / 记忆 → 回访展示

## Authority Constraints Applied

- `README.md` and `docs/PRODUCT_BRIEF.md` define the only current mainline as coordinate/location → map → tavern discovery → entry → NPC config → chat → memory/writeback → revisit feedback.
- `docs/WHAT_NOT_TO_BUILD.md` forbids platform-published tavern/NPC/story content, platform Token payment/settlement, unanchored spaces, visitor social networks, traditional map app features, and RPG combat/level/equipment/ranking.
- `docs/AI参与开发协议.md` requires Task First, explicit scope, real verification, and traceable task artifacts.
- `.trellis/spec/guides/cross-layer-thinking-guide.md` frames this audit as data-flow verification: Source → Transform → Store → Retrieve → Display.

## Current Data Flow Map

| Step | Frontend surface | Backend/API/store | Persistence / return payload | Current status | Evidence |
|---|---|---|---|---|---|
| 1. 创建酒馆 | `frontend/app/product/TavernCreatePanel.jsx` builds payload and calls `createTavern`; after creation it adds queued characters | `POST /api/v1/taverns` → `TavernManagementApplicationMixin.create_tavern` → `TavernService.create_tavern` | `TavernStore.create_tavern` writes tavern JSON; if LLM configured, key is stored separately and status opens | **真闭环, with risk** | `TavernCreatePanel.jsx:183-203`; `api/v1/taverns.py:46-48`; `core/tavern.py:1445-1506`; `tests/test_tavern_create_wizard_regression.py` |
| 2. 配置 NPC | Create flow queues characters; owner panel opens character manager; API supports add/update/import/delete | `POST/PUT/DELETE /api/v1/taverns/{id}/characters...` → `TavernService.add_character/update_character/import_character_card` | Characters persist inside tavern payload; SillyTavern import can attach world info | **真闭环, but should be part of golden path** | `TavernCreatePanel.jsx:194-203`; `api/v1/characters.py:42-94`; `core/tavern.py:1903-1968`; `tests/test_tavern_create_wizard_regression.py` |
| 3. 配置 LLM | Create panel includes LLM config; owner panel saves LLM config | `update_tavern(... { llm_config })`; `test_llm_config` probes without persisting | Private key vault stores API key; public/private payloads must not leak secrets to visitors | **真闭环** | `TavernCreatePanel.jsx:183-194`; `TavernOwnerPanel.jsx:736-740`; `core/tavern.py:910-921`, `1586-1610`; `application/services/runtime.py:286-322`; create-wizard tests |
| 4. 访客进入 | App/entry/interior call `enterTavern`; entry state is passed into chat room | `POST /api/v1/taverns/{id}/enter` → `TavernService.enter_tavern` | Updates `_visitors` private bucket for named visitor; increments tavern `visit_count`; returns `visitor_state` | **真闭环** | `frontend/app/lib/taverns.ts:735-744`; `api/v1/taverns.py:110-138`; `core/tavern.py:1842-1899`; `tests/test_tavern_visitor_state_api.py` |
| 5. 对话 | `TavernChatRoom` loads history and sends chat via service; group chat also exists | `GET/POST /api/v1/taverns/{id}/chat`; `RuntimeApplicationMixin.send_chat` | Writes user/assistant JSONL chat messages; token usage increments; returns response, `visitor_state`, `created_memories`, `state_card_candidates` | **真闭环 when LLM/rules backend configured; degraded no-LLM path is intentionally not a chat loop** | `frontend/app/lib/taverns.ts:944-974`; `api/v1/chat.py:22-53`; `application/services/runtime.py:143-284`; `core/tavern.py:1168-1292` |
| 6. 写回状态/记忆 | Chat room updates local `visitorMemoryState`, `createdMemories`, and pending state cards from chat response | Runtime updates affinity/VisitorState, calls `auto_create_memories_from_chat`, and creates state-card candidates | Visitor state stored in `_visitors`; memory atoms in `_memory_atoms`; state cards in `_state_cards`; chat history in JSONL | **真闭环 for storage; half-closed for canon because pending cards require review** | `TavernChatRoom.jsx:1211-1219`, `1307-1315`; `application/services/runtime.py:227-284`, `1006-1055`; `core/tavern.py:980-1105`; memory/state-card tests |
| 7. 回访展示 | `buildRevisitCue`, `TavernMemoryPanel`, `TavernContextPanel`, owner visitor panel show returning state and structured memory | `GET /api/v1/taverns/{id}/visitors`, `/memories`, `/memory-atoms`, `/state-cards` | Owner sees visitor rows/message counts; visitor can read own memories; confirmed state cards can be shown | **真闭环, but scattered** | `frontend/app/lib/revisit-summary.js:37-90`; `TavernMemoryPanel.jsx:196-445`; `TavernContextPanel.jsx:201-655`; `TavernOwnerPanel.jsx:1749-1827`; `application/services/packages.py:204-226` |

## P0 Findings

### F1 — The mainline exists, but there is no single golden-path verification artifact

There are focused backend tests and frontend script tests, but no one document/script says: create tavern with coordinate + NPC + LLM/rules backend, enter as visitor, chat, assert chat history + visitor state + memory/state-card, revisit UI cue.

Impact: future feature work can pass local tests while still damaging the perceived product loop.

Recommended next patch:

- Add a short `mainline-smoke.md` manual checklist or one focused automated backend test.
- Prefer backend first: use rules/public-welfare backend to avoid external API keys.
- Then run one browser/manual pass only after the code-level loop is stable.

### F2 — Creation and NPC/LLM setup are functionally closed, but not transactionally closed

`TavernCreatePanel` creates the tavern first, then loops through characters and calls `addCharacter`. If a character add fails, the tavern may exist with partial/no characters.

Impact: a “created” tavern may be present but not actually ready for the visitor chat loop.

Recommended next patch:

- Keep current API shape, but add owner-visible “draft needs repair” state in UI or a retry path.
- Do not add new schema unless explicitly approved.
- The golden path should require at least one character and a configured rules/LLM backend before calling the loop closed.

### F3 — Memory/writeback is real, but user-facing confirmation is split across several panels

Chat response can create memory atoms and state-card candidates. The visitor memory/context panels can load persisted memory, and the owner panel can inspect visitor state. However, the product experience currently depends on the user discovering multiple surfaces.

Impact: engineering closure exists, but product closure may still feel weak.

Recommended next patch:

- Do not add new memory features.
- Add only a single “after chat → what changed?” cue in the existing chat room if the golden path needs clarity.
- Keep state cards as candidate/confirmed, never as silently confirmed facts.

### F4 — Many review/planning tasks are now higher risk than their feature value

Short-drama, souvenir, TTS, GM preview, preset import, gameplay template library, notification polish, discovery polish, etc. are individually reasonable, but collectively increase surface area faster than the mainline can absorb.

Recommended next patch:

- Freeze planning tasks by default.
- Allow only tasks that repair F1–F3 or reduce existing surface complexity.

## Mainline Acceptance Gate

Before any frozen feature is thawed, run this gate:

1. Owner creates a real-coordinate tavern.
2. Owner adds at least one NPC.
3. Owner configures rules/local or valid LLM backend.
4. Visitor enters and receives `visitor_state`.
5. Visitor sends one chat message and receives assistant response.
6. Backend persists chat history for that visitor/NPC.
7. Backend updates visitor state and either creates memory atoms or explicitly reports none.
8. State-card candidates remain pending until the current visitor/owner confirms them.
9. Visitor can reopen memory/context panel and see relationship/visit/memory state.
10. Owner can open visitor/revisit panel and see that visitor’s return state.

## Current Go / No-Go

- **Go**: code/docs work that creates the golden-path verification artifact, fixes a failed mainline step, or removes ambiguity from existing mainline UI.
- **No-Go**: new templates, preview-only features, presentational dashboards, new research tasks, media generation, short-video/TTS/image pipelines, broader discovery polish, or social/gameplay expansion.
