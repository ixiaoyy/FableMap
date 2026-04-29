# 2026-04-30 Voice Greeting Preview

## 为什么改

父任务把 `voice-greeting` 定义为 NPC 能力包候选：NPC 可以朗读 first greeting / selected replies。但语音能力涉及 owner provider 成本、API Key、授权和潜在 voice cloning 风险，因此本切片先实现 no-audio preview 边界。

## 改了什么

- 新增预览核心：`backend/src/fablemap_api/core/voice_greeting.py`。
- 新增 API：`POST /api/v1/taverns/{id}/voice-greeting/preview`。
- 新增前端 typed/product 服务方法：`previewVoiceGreeting(...)`。
- 新增测试：
  - `tests/test_voice_greeting.py`
  - `backend/tests/test_v1_voice_greeting.py`
  - `frontend/scripts/voice-greeting-test.mjs`
- 新增 Trellis backend/frontend 规范，明确 no-audio、no-cost、no-cloning 和 explicit play action 边界。

## 没改什么

- 不直接合成音频，不返回音频 bytes/blob。
- 不自动播放。
- 不新增 voice cloning、voice sample 上传或语音数据留存。
- 不新增持久化 Schema 字段。

## 验证

本变更应至少运行：

```powershell
py -3 -m pytest -q tests/test_voice_greeting.py backend/tests/test_v1_voice_greeting.py --tb=short
node .\frontend\scripts\voice-greeting-test.mjs
py -3 -m compileall -q backend/src
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

## 风险

- 预览只返回文本和 TTS 请求参数；真正音频播放仍依赖现有 `/tts` provider 配置和前端显式动作。
