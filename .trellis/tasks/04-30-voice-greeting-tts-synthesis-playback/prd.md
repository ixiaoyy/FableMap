# Voice Greeting TTS Synthesis and Playback

## Goal

在 no-audio preview 之后，设计可控 TTS 合成、音频存储和播放边界。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: voice-greeting deferred not done
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 不做 voice cloning/upload，除非另有安全设计。
* 不自动播放扰民；需要用户手势/设置。
* provider 成本和配置归店主控制，不暴露 secrets。

## Acceptance Criteria

* [ ] Relevant existing code/docs are inspected before implementation.
* [ ] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [ ] Implementation, if any, uses existing schema/API where possible; any contract change updates tests and docs.
* [ ] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task is intentionally a planning/backlog placeholder until selected for implementation.
