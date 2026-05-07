# Voice Greeting TTS Pack Preview

## Goal

把父任务中的 `voice-greeting` 能力做成安全 MVP：为指定 NPC 预览要朗读的 `first_mes` / 备用开场白，并返回“如果用户确认播放，应调用 `/tts` 的参数”。本切片不直接合成音频、不消耗 TTS、不做 voice cloning、不保存新状态。

## Scope

### In scope

- 新增 deterministic voice greeting preview helper。
- 新增 `/api/v1/taverns/{id}/voice-greeting/preview`。
- 复用现有 `VoiceConfig` 与 `/tts`，但 preview 不调用 TTS provider。
- 新增前端 typed/product service helper。
- 补充 Trellis spec、README / ARCHITECTURE / changes。
- TDD：先写失败测试，再实现。

### Out of scope / Not done

- 不直接返回音频 bytes / blob。
- 不自动播放、不消耗 owner TTS/API Key。
- 不新增声音克隆、上传 voice sample、授权存储规则。
- 不新增持久化 Schema 字段。
- 不做完整 UI 面板；本切片只提供服务边界。

## Requirements

- 输入 `character_id` 和可选 `greeting_index`。
- `greeting_index=0` 使用 `first_mes`，后续索引对应 `alternate_greetings`。
- 返回：
  - `preview_only=true`
  - `applied=false`
  - `audio_generated=false`
  - `greeting.text/source`
  - `voice.enabled/tts_provider/tts_voice/tts_model/tts_speed/tts_language/auto_play`
  - `tts_ready`
  - `tts_request={ text, character_id }`
  - `notes`
- 响应不能包含 API Key、授权头、owner secret、audio bytes。
- 私密空间遵守可见性边界。
- 角色不存在返回 404。
- 前端必须通过 service helper 调用。

## Acceptance Criteria

- [x] Core helper 能从 `first_mes` / `alternate_greetings` 选择开场白，并返回 no-audio 预览 payload。
- [x] API `POST /api/v1/taverns/{id}/voice-greeting/preview` 能返回可播放前预览和 `/tts` 请求参数。
- [x] API 覆盖 voice disabled、voice enabled、角色不存在、私密空间不可见。
- [x] 前端 native/product 服务均有 `previewVoiceGreeting` helper，路径和请求体正确。
- [x] README、ARCHITECTURE、Trellis spec 和 changes 文档说明 no-audio/no-cloning/no-cost boundary。
- [x] 验证命令记录在本文件和 `task.json` 中。

## Technical Notes

- 后端 core helper 放在 `backend/src/fablemap_api/core/voice_greeting.py`。
- v1 route 放在 `backend/src/fablemap_api/api/v1/runtime.py`。
- 应用层放在 `RuntimeApplicationMixin`，复用 `VoiceConfig` 与 `_ensure_visible(...)`。
- 前端 route-client 方法放在 `frontend/app/lib/taverns.ts`，product parity 方法放在 `frontend/app/product/services/tavernService.js`。
- 测试：
  - `tests/test_voice_greeting.py`
  - `backend/tests/test_v1_voice_greeting.py`
  - `frontend/scripts/voice-greeting-test.mjs`

## Verification Log

### RED（已观察预期失败）

```powershell
py -3 -m pytest -q tests/test_voice_greeting.py backend/tests/test_v1_voice_greeting.py --tb=short
```

结果：失败，`ModuleNotFoundError: No module named 'fablemap_api.core.voice_greeting'`。

```powershell
node .\frontend\scripts\voice-greeting-test.mjs
```

结果：失败，`TypeError: service.previewVoiceGreeting is not a function`。

### GREEN / 完整验证

```powershell
py -3 -m pytest -q tests/test_voice_greeting.py backend/tests/test_v1_voice_greeting.py --tb=short
```

结果：`4 passed in 1.28s`。

```powershell
node .\frontend\scripts\voice-greeting-test.mjs
```

结果：`voice-greeting-test: ok`。

```powershell
py -3 -m compileall -q backend/src
```

结果：通过（无输出）。

```powershell
npm --prefix .\frontend test
```

结果：通过，包含 `voice-greeting-test: ok`。

```powershell
npm --prefix .\frontend run typecheck
```

结果：通过。

```powershell
npm --prefix .\frontend run build
```

结果：通过。

```powershell
py -3 -m pytest -q --tb=short
```

结果：`524 passed, 103 warnings in 39.69s`。
