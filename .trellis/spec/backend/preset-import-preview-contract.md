# Preset Import Preview API Contract

## Scope

Use this spec when changing the draft-only preset import preview parser or
`POST /api/v1/taverns/{tavern_id}/preset-import/preview`.

This feature is an owner utility for community / SillyTavern-style preset JSON.
It produces a risk report only; it must not apply or persist imported preset
content to live tavern state.

## API contract

```http
POST /api/v1/taverns/{tavern_id}/preset-import/preview
```

Request body accepts one of:

```json
{"preset": {"name": "...", "prompts": []}}
{"preset_json": "{\"name\":\"...\",\"prompts\":[]}"}
```

Response shape:

```json
{
  "ok": true,
  "tavern_id": "...",
  "preview_only": true,
  "applied": false,
  "preset_name": "...",
  "summary": {
    "total_modules": 0,
    "supported": 0,
    "warning": 0,
    "blocked": 0,
    "runtime_parameters": 0
  },
  "supported": [],
  "warnings": [],
  "blocked": [],
  "runtime_parameters": {},
  "notes": []
}
```

## Classification contract

- `supported`: safe style/runtime hints such as style, atmosphere, dialogue
  density, role consistency, world-info placement hints.
- `warning`: model/provider-specific hints, memory/summary/long-term-state
  wording, high-variance runtime parameters, or unknown modules requiring owner
  review.
- `blocked`: jailbreak/absolute obedience, safety bypass, chain-of-thought
  forcing, user impersonation, private address / phone / API key / PII requests,
  explicit NSFW or forced sexual content.

Blocked items must be visible in the report with a reason; they must not be
silently discarded or converted into usable prompt blocks.

## Persistence and security

- Preview must not mutate `Tavern.runtime_presets`, `prompt_blocks`,
  `world_info`, `characters`, `skill_packs`, State Cards, memory atoms, access
  rules, LLM config, or owner keyvault data.
- Endpoint is owner-only because imported preset text may contain private or
  unsafe prompts.
- Response must not include `api_key`, authorization headers, keyvault content,
  or raw secret values from uploaded JSON.
- Invalid embedded JSON returns HTTP 400 with a readable error.

## Good / Base / Bad cases

- Good: owner previews a preset containing one style prompt, one model-specific
  note, and one jailbreak; response has supported/warning/blocked groups and no
  tavern fields change.
- Base: JSON-string body parses successfully and produces a preview report.
- Bad: preview applies imported prompt blocks or runtime presets automatically;
  non-owner can inspect private prompt text; response echoes uploaded API keys.

## Required verification

```powershell
py -3 -m pytest -q tests/test_preset_import_preview.py backend/tests/test_v1_preset_import_preview.py --tb=short
py -3 -m compileall -q backend/src
```
