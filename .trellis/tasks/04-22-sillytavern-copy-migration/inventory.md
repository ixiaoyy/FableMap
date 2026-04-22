# SillyTavern Copy Migration Inventory

> Status: inventory baseline generated on 2026-04-23. Use this before implementation migration slices.

## Source summary

- Source root: `sillytavern_copy/`
- Git tracked files: 964
- Root areas by tracked file count:
  - `public/`: 583
  - `default/`: 196
  - `src/`: 106
  - `.github/`: 25
  - `tests/`: 20
  - `docker/`: 3
- Primary implementation-bearing areas: `src/`, `public/scripts/`, `default/content/`, `tests/`.
- No active `git status` changes are currently reported under `sillytavern_copy/`; this inventory is based on tracked files.

## Generated per-file checklist

Full checklist: [`per-file-inventory.md`](./per-file-inventory.md)

Generated from:

```powershell
git ls-files sillytavern_copy
```

Checklist coverage:

| Classification | Count | Meaning for next slice |
| --- | ---: | --- |
| `adapt` | 169 | Rebuild as FableMap-shaped behavior, usually owner-config/runtime/provider related. |
| `migrate/adapt` | 75 | Preserve core compatibility but translate into native backend/frontend architecture. |
| `reference-only` | 160 | Use as behavior or test reference only; no runtime dependency. |
| `reference-only/not-applicable` | 244 | Assets/static shell/default content that needs explicit product review before any adoption. |
| `not-applicable` | 258 | Upstream app/plugin/admin/image/social-like scope outside current FableMap mainline. |
| `delete` | 58 | Copy-only tooling/metadata; remove with `sillytavern_copy/` once no references remain. |

Capability counts from the generated checklist:

| Capability | Count | Initial decision |
| --- | ---: | --- |
| SillyTavern app shell or power-user platform | 258 | Mostly not applicable unless separately approved. |
| Assets, locales, static UI shell | 239 | Reference only; do not import upstream product identity wholesale. |
| Prompt, preset, output/runtime config | 154 | Adapt owner-authored pieces into owner config/runtime modules. |
| Uncategorized compatibility source | 140 | Reference-only until a focused audit promotes or retires each file. |
| Upstream project/tooling metadata | 58 | Delete with copy. |
| Character cards, sprites, expressions | 37 | Migrate/adapt; existing native character-assets slice is baseline. |
| Upstream tests | 20 | Reference-only; translate relevant cases into FableMap tests. |
| Tokenizers | 12 | Migrate/adapt; existing native tokenizer slice is baseline. |
| LLM/provider integrations | 11 | Adapt into infrastructure/provider adapters with secret redaction. |
| Chat runtime and group chat | 10 | Migrate/adapt to tavern-scoped runtime. |
| Memory/vector/embedding | 10 | Migrate/adapt with visitor-memory boundaries. |
| World/lorebook | 6 | Migrate/adapt to `WorldInfoEntry`. |
| Default upstream content | 5 | Reference only unless owner-authored fixtures are explicitly approved. |
| Voice, TTS, STT | 4 | Adapt via native runtime/voice APIs. |

## Classification legend

- `migrate`: implement equivalent capability in FableMap native architecture.
- `adapt`: implement FableMap-specific equivalent, not a literal copy.
- `reference-only`: use only as behavior/format reference during implementation.
- `not-applicable`: do not migrate; record product/technical reason.
- `delete`: covered or unnecessary; remove with copy.

## Capability inventory

| Area | Source paths | Target native area | Status | Notes |
| --- | --- | --- | --- | --- |
| Character card parse/export | `src/character-card-parser.js`, `src/charx.js`, `src/png/`, `src/endpoints/characters.js`, `public/scripts/char-data.js`, expression assets | `backend/domain`, `backend/contracts`, `api/v1/characters`, `frontend/features/character-assets` | in progress | Preserve SillyTavern compatibility and FableMap `TavernCharacter` schema. 2026-04-23 backend slices added support for standard V2/V3 `data` envelopes, world-info `secondary_keys`/`order` import compatibility, PNG metadata writing before `IEND`, `ccv3`-first PNG parsing, and base64 CharX zip/SFX `card.json` parsing. Continue with asset extraction/golden cases before deleting copy. |
| World/lorebook | `src/endpoints/worldinfo.js`, `public/scripts/world-info.js`, lorebook templates | `api/v1/worldinfo`, `domain/world_info_policy.py`, `frontend/features/world-info` | in progress | Keep `WorldInfoEntry` semantics aligned with `docs/WORLD_SCHEMA.md`; owner-authored only. 2026-04-23 slice added SillyTavern lorebook aliases (`uid`, `key`, `keysecondary`, `secondary_keys`) plus `{"entries": {...}}` temporary test payload support. |
| Prompt/preset/output rules | `default/content/presets/`, `public/scripts/PromptManager.js`, `public/scripts/preset-manager.js`, `public/scripts/sysprompt.js`, `config.yaml` | owner config contracts/application/routes/features | adapt | Owner-authored configuration only; no platform-generated tavern/NPC/story content. |
| Chat runtime | `src/endpoints/chats.js`, `src/endpoints/groups.js`, `public/script.js`, `public/scripts/chats.js`, `public/scripts/group-chats.js` | `api/v1/chat`, chat/runtime services, `frontend/features/chat-runtime` | migrate/adapt | Must be tavern-scoped, owner-config aware, and preserve visitor history boundaries. |
| Group chat | `src/endpoints/groups.js`, `public/scripts/group-chats.js` | native group chat runtime | migrate/adapt | Existing v1 group-chat slice is a baseline; audit parity before declaring migrated. |
| Tokenizers | `src/tokenizers/`, `src/transformers.js`, `src/endpoints/tokenizers.js`, `public/scripts/tokenizers.js` | `api/v1/utilities`, tokenizer domain/application | in progress | Existing v1 tokenizer utility slice is a baseline. 2026-04-23 slice added SillyTavern-compatible tokenizer aliases (`claude`, `llama3`, `mistral`, `gemma`, etc.) and multi-part message text counting without introducing runtime dependency on `sillytavern_copy`. Continue with exact tokenizer asset strategy separately. |
| Memory/vector/embedding | `src/vectors/`, memory extension files | memory/vector domain + infra | migrate/adapt | Sensitive visitor memory boundaries must hold; vector store must not leak private memory. |
| LLM/provider integrations | `src/endpoints/openai.js`, `anthropic.js`, `google.js`, `openrouter.js`, `text-completions.js`, `chat-completions.js`, `request-proxy.js`, `secrets.js` | infrastructure/provider adapters | adapt | Owner-provided config only; no API key logging or response leakage. |
| Voice / speech | `src/endpoints/speech.js`, audio frontend helpers | runtime voice routes + infrastructure adapters | adapt | Keep owner voice config, disabled-browser STT guardrails, and secret redaction. |
| Assets/locales/default content | `public/img`, `public/locales`, `public/css`, `default/content/backgrounds`, default character/theme assets | FableMap-owned assets/fixtures/docs only if separately approved | reference-only/not-applicable | Do not import upstream product identity wholesale. |
| Plugins/extensions/power-user platform | `plugins.js`, `src/plugin-loader.js`, `public/scripts/extensions/`, `quick-replies`, slash commands | none unless separately approved | not-applicable | Avoid creating a plugin platform or power-user clone scope inside FableMap. |
| Upstream server/app shell | `server.js`, `src/server-*`, `src/middleware/`, `public/index.html`, `public/login.html` | not target architecture | not-applicable/delete | FableMap uses FastAPI + React Router/Vite; do not keep upstream runtime shell. |
| CI/docker/editor metadata | `.github`, `.gemini`, `.vscode`, `docker`, root scripts/config | none | delete | Not part of FableMap runtime after migration. |

## Next migration order

1. Audit parity for already-native baseline areas: character cards/assets, worldinfo, tokenizers, group chat, voice/runtime.
2. Promote missing owner-config prompt/preset behavior into native contracts/application/routes/features.
3. Decide memory/vector/embedding scope separately because it touches private visitor memory and infrastructure adapters.
4. Mark plugin/extensions/admin/image/static-shell areas as explicit `not-applicable` unless the user approves a separate product decision.
5. After all `migrate/adapt` items are implemented or deliberately retired, run the deletion gate:

```powershell
git grep -n "sillytavern_copy" -- . ':!.trellis/tasks/04-22-sillytavern-copy-migration/*'
py -3 -m pytest -q --tb=short
npm --prefix .\frontend run build
npm --prefix .\frontend test
```
