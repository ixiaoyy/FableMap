# Public Site Reference Matrix Research

## Goal

把“调研 5 个公开首页/产品页”的规划落成可继续执行、可复核的研究矩阵，为 FableMap 首页、发现页、创建链路和 owner 工具提供参考。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research 参考网站调研矩阵
* Implemented: 2026-05-03 research-only slice.

## Scope

* Public-page research only.
* Screenshots and notes under `artifacts/research/ai-creation-sites/`.
* No product code, API, schema, dependency, or UI implementation change.

## Requirements

* 只访问公开页面，不绕过登录 / 验证码 / 付费墙 / 私有内容。
* 截图保存到 `artifacts/research/ai-creation-sites/`。
* 结论必须转译为 FableMap，不照搬品牌素材或文案。
* 调研结论必须遵守 owner-sovereignty、真实坐标锚点、AI 草稿需确认、无无边界访客社交、无平台 token 付费等边界。

## Acceptance Criteria

* [x] Relevant existing docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] At least 5 public home/product pages have desktop + mobile screenshot evidence saved under `artifacts/research/ai-creation-sites/`.
* [x] Research matrix exists and translates findings into FableMap-safe patterns.
* [x] Blocked/partial public pages are recorded as evidence only; no bypass attempted.
* [x] No product code/API/schema/contract change was introduced.
* [x] Verification commands are recorded in this PRD.

## Core Research Output

* Matrix: `artifacts/research/ai-creation-sites/research.md`
* Core 5 samples:
  * Discord — <https://discord.com/>
  * Suno — <https://suno.com/>
  * Krea — <https://www.krea.ai/>
  * Glif — <https://glif.app/>
  * Hugging Face — <https://huggingface.co/>
* Additional captured / partial references:
  * Runway — <https://runwayml.com/>
  * Character.AI — <https://character.ai/> (desktop blocked by Cloudflare; mobile public surface captured)
  * Canva AI — <https://www.canva.com/ai/> (blocked/login-like surface captured, not used as core)
  * Replit AI — <https://replit.com/ai> (desktop blocked by Cloudflare; mobile public surface captured)

## Artifact Inventory

Core screenshot evidence:

```text
artifacts/research/ai-creation-sites/discord/discord-home-desktop.png
artifacts/research/ai-creation-sites/discord/discord-home-mobile.png
artifacts/research/ai-creation-sites/suno/suno-home-desktop.png
artifacts/research/ai-creation-sites/suno/suno-home-mobile.png
artifacts/research/ai-creation-sites/krea/krea-home-desktop.png
artifacts/research/ai-creation-sites/krea/krea-home-mobile.png
artifacts/research/ai-creation-sites/glif/glif-home-desktop.png
artifacts/research/ai-creation-sites/glif/glif-home-mobile.png
artifacts/research/ai-creation-sites/huggingface/huggingface-home-desktop.png
artifacts/research/ai-creation-sites/huggingface/huggingface-home-mobile.png
```

Metadata / scripts:

```text
artifacts/research/ai-creation-sites/capture-report.json
artifacts/research/ai-creation-sites/combined-capture-report.json
artifacts/research/ai-creation-sites/*/capture.json
.trellis/tmp/playwright-mainline/public-site-reference-capture.cjs
.trellis/tmp/playwright-mainline/public-site-reference-extra-capture.cjs
```

## FableMap-safe Synthesis

* Landing/discovery should emphasize: real-coordinate tavern, enter/talk/return, and owner-authored creation.
* Owner creation can borrow “template cards + prompt-like brief + preview” patterns, but every AI result must remain a visible, editable, discardable, owner-confirmed draft.
* Public library ideas should become compatibility/provenance/template browsing, not rankings, social feeds, DMs, or public visitor walls.
* Existing product guardrails remain: no platform token billing, no autonomous tavern/NPC/story publication, no route planning/POI scoring, no combat/levels/equipment.

## Verification Commands

```powershell
node .\.trellis\tmp\playwright-mainline\public-site-reference-capture.cjs
node .\.trellis\tmp\playwright-mainline\public-site-reference-extra-capture.cjs
Get-ChildItem .\artifacts\research\ai-creation-sites -Recurse -File | Where-Object { $_.Extension -in '.png','.json','.md' }
py -3 .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-public-site-reference-matrix-research
```

Additional checks run:

```powershell
Get-Content -Raw .\artifacts\research\ai-creation-sites\research.md
```

## Out of Scope / Deferred

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, equipment, route planning, or POI scoring.
* No product UI implementation in this task.
* No reuse/copying of external brands' art direction, copy, screenshots, or visual assets.

## Technical Notes

* The task intentionally records blocked/partial pages as “no bypass attempted” evidence; blocked pages are not counted in the core 5 matrix.
* Screenshots are research artifacts only and should not become product assets.
