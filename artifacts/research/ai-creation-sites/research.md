# Public Site Reference Matrix — AI Creation / Community Products

> Task: `.trellis/tasks/04-30-public-site-reference-matrix-research/`  
> Captured: 2026-05-03 with Playwright, public pages only.  
> Artifact root: `artifacts/research/ai-creation-sites/`

## Guardrails

- Only public pages were loaded; no login, payment, CAPTCHA, or private content was bypassed.
- Screenshots are evidence for product research only; do **not** copy brand art, layout, illustrations, screenshots, product names, or marketing copy into FableMap.
- Takeaways below are translated into FableMap's constraints: real-coordinate anchoring, owner-authored taverns, owner-confirmed AI drafts, no platform token billing, no unbounded visitor social network, no rankings/combat/levels/equipment.

## Core 5-site matrix

| Site | Public URL | Screenshots | What the public page emphasizes | Transferable FableMap pattern | Boundary translation |
|---|---|---|---|---|---|
| Discord | <https://discord.com/> | `discord/discord-home-desktop.png`, `discord/discord-home-mobile.png` | Community-first hero, playful interaction verbs, repeated examples of talking/playing/hanging out, clear app/browser CTAs. | Homepage/discovery copy should sell “enter a living place” with simple verbs: discover, enter, talk, return. Keep one primary visitor CTA plus one owner CTA. | Do **not** import friend presence, DMs, global online state, or cross-tavern social graph. FableMap liveliness stays tavern/NPC-centered. |
| Suno | <https://suno.com/> | `suno/suno-home-desktop.png`, `suno/suno-home-mobile.png` | Prompt box + fast creation promise; examples below the fold show output variety and social proof. | `/create` can foreground a single owner prompt/brief surface, then show editable draft preview and examples of safe outputs. | AI output must remain an editable draft; never auto-publish tavern/NPC/story content. No platform token purchase flow. |
| Krea | <https://www.krea.ai/> | `krea/krea-home-desktop.png`, `krea/krea-home-mobile.png` | Capability taxonomy is explicit: generate, edit, enhance, customize, asset manager; hero shows prompt-to-output snippets. | Owner creation can be grouped into “生成草稿 / 编辑确认 / 导入资产 / 预览开门” instead of one dense form. | Capabilities are owner tools, not autonomous platform generation. Generated images/assets still need project paths and sidecars if shipped. |
| Glif | <https://glif.app/> | `glif/glif-home-desktop.png`, `glif/glif-home-mobile.png` | “One chat” creation entry plus template cards for common creative outcomes; mobile page keeps search/get-started/template flow compact. | Tavern owner tools can start from template cards: “角色卡草稿”, “世界书提示”, “开场白”, “酒馆邀请文案”, each leading to owner review. | Templates must not become public content or generic social prompts; they should write into owner-confirmed draft state only. |
| Hugging Face | <https://huggingface.co/> | `huggingface/huggingface-home-desktop.png`, `huggingface/huggingface-home-mobile.png` | Public community index: models, spaces, datasets, trending sections, profile/portfolio framing. | FableMap can expose a curated owner-facing library/index of importable examples, templates, or NPC packs with clear provenance and compatibility notes. | Avoid public leaderboard/ranking mechanics. If “trending” is used, translate to non-competitive categories or editor-curated examples. |

## Extra captured reference / not counted in core 5

| Site | Public URL | Screenshots | Why not core |
|---|---|---|---|
| Runway | <https://runwayml.com/> | `runway/runway-home-desktop.png`, `runway/runway-home-mobile.png` | Useful for cinematic product hierarchy and research/product split, but less directly community/UGC than the core set. |
| Character.AI | <https://character.ai/> | `character-ai/character-ai-home-desktop.png`, `character-ai/character-ai-home-mobile.png` | Desktop capture hit Cloudflare block; mobile public page was visible. Kept as blocked/partial evidence only, no bypass attempted. |
| Canva AI | <https://www.canva.com/ai/> | `canva-ai/canva-ai-home-desktop.png`, `canva-ai/canva-ai-home-mobile.png` | Desktop showed “Just a moment”; mobile redirected to login/sign-up surface. Kept as blocked/partial evidence only. |
| Replit AI | <https://replit.com/ai> | `replit-ai/replit-ai-home-desktop.png`, `replit-ai/replit-ai-home-mobile.png` | Desktop capture hit Cloudflare block; mobile public page was visible. Kept as blocked/partial evidence only. |

## FableMap synthesis

### 1. Landing / discovery message hierarchy

Recommended FableMap translation:

1. One-line proposition: “在真实坐标上发现 / 开一间赛博酒馆”。
2. Visitor CTA: “发现附近酒馆 / 进店”。
3. Owner CTA: “开自己的酒馆 / 导入角色卡”。
4. Proof below the fold: a few owner-confirmed tavern cards, NPC previews, and return-memory cues.

Avoid:

- “全球在线好友 / 私信 / 加入频道” style social graph copy.
- Competitive ranking, “top taverns”, creator scoreboards, combat/level language.

### 2. Owner creation flow

Recommended FableMap translation:

- Use template cards and a prompt-like brief input to lower friction.
- Split owner workflow into `真实坐标` → `酒馆草稿` → `首个非真人 NPC` → `开门预览`.
- Keep every AI result visibly labelled `AI 草稿 / 店主待确认 / 可编辑 / 可丢弃`.

Avoid:

- One-click auto-publish.
- Platform-authored tavern/NPC/story content.
- Token purchase/recharge UI.

### 3. Public library / examples

Recommended FableMap translation:

- A library can show compatibility and provenance: SillyTavern card support, prompt-risk status, NPC art status, import/export affordances.
- Discovery should show “附近有人经营 / 环境传闻 / 回访反馈给店主” rather than social feed mechanics.

Avoid:

- Unbounded public visitor walls.
- Friend systems, DMs, global online presence.
- Rankings or POI scoring copied from app stores/social platforms.

## Artifact inventory

Core matrix screenshots:

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

Capture metadata:

```text
artifacts/research/ai-creation-sites/capture-report.json
artifacts/research/ai-creation-sites/combined-capture-report.json
artifacts/research/ai-creation-sites/*/capture.json
```

Capture scripts:

```text
.trellis/tmp/playwright-mainline/public-site-reference-capture.cjs
.trellis/tmp/playwright-mainline/public-site-reference-extra-capture.cjs
```

## Verification run

```powershell
node .\.trellis\tmp\playwright-mainline\public-site-reference-capture.cjs
node .\.trellis\tmp\playwright-mainline\public-site-reference-extra-capture.cjs
Get-ChildItem .\artifacts\research\ai-creation-sites -Recurse -File | Where-Object { $_.Extension -in '.png','.json','.md' }
```


