# Serial Novel Export / Episode Builder

## Goal

把父任务中的 “Serial Novel Export / Episode Builder” 落成安全 MVP：用户指定一个访客会话，系统把可见聊天记录与已确认 State Cards 组装成可读的 Markdown / JSON 剧集草稿。该草稿是记录导出，不是自动小说生成；不调用 LLM，不写入持久化状态，不暴露隐藏 prompt、API Key 或其他访客私密内容。

## Scope

### In scope

- 新增 deterministic episode builder core helper。
- 新增 `/api/v1/taverns/{id}/episodes/export`。
- 导出范围限定为显式 `visitor_id`；非店主只能导出自己的会话。
- 默认只引用 `confirmed` State Cards；可选 `include_pending` 仅展示调用者可见的 pending 候选，并必须标记为待确认。
- 新增前端 typed/product 服务 helper。
- 补充 Trellis spec、README / ARCHITECTURE / changes。
- TDD：先写失败测试，再实现。

### Out of scope / Not done

- 不做 LLM 改写 / 润色 / 自动续写。
- 不生成完整连载小说章节，不自动补剧情。
- 不新增持久化 Schema，不保存导出结果。
- 不批量导出所有访客会话。
- 不暴露 hidden system prompt、owner API Key、私密记忆或其他访客记录。

## Requirements

- API 需要用户身份；请求必须显式提供 `visitor_id`。
- 访客只能导出自己的 `visitor_id`，店主可导出任意指定访客。
- 私密酒馆继续遵守可见性边界。
- 导出只包含 observable chat roles（`user` / `assistant` / 允许的可见 role），过滤 `system` / hidden prompt。
- 返回 JSON 中包含：
  - `ok`
  - `tavern_id` / `tavern_name`
  - `visitor_id` / `character_id`
  - `format`
  - `persisted=false`
  - `episode`（title、summary、markdown、messages、state_cards、counts）
- Markdown 必须清楚标记：
  - 这是导出草稿；
  - State Cards 是已确认正史或待确认候选；
  - 不代表平台自动创作内容。
- 前端必须通过 service helper 调用。

## Acceptance Criteria

- [x] Core helper 能把消息与 State Cards 组装成 Markdown，且过滤 system/hidden prompt。
- [x] API `POST /api/v1/taverns/{id}/episodes/export` 能导出指定访客+角色会话。
- [x] API 权限覆盖缺少身份、缺少 visitor_id、非店主导出其他访客、私密酒馆不可见。
- [x] 默认只包含 confirmed State Cards。
- [x] 前端 native/product 服务均有 `exportEpisode` helper，路径和请求体正确。
- [x] README、ARCHITECTURE、Trellis spec 和 changes 文档说明 no-LLM / no-persistence / privacy boundary。
- [x] 验证命令记录在本文件和 `task.json` 中。

## Technical Notes

- 后端 core helper 放在 `backend/src/fablemap_api/core/episode_builder.py`。
- 应用层优先放在 `RuntimeApplicationMixin`，复用现有 `_chat_history_for_scope(...)` 与 State Card 可见性逻辑。
- v1 路由放在 `backend/src/fablemap_api/api/v1/chat.py`；请求 contract 放在 `contracts/chat.py`。
- 前端 route-client 方法放在 `frontend/app/lib/taverns.ts`，product parity 方法放在 `frontend/app/product/services/tavernService.js`。
- 测试：
  - `tests/test_episode_builder.py`
  - `backend/tests/test_v1_episode_export.py`
  - `frontend/scripts/episode-export-test.mjs`

## Verification Log

### RED（已观察预期失败）

```powershell
py -3 -m pytest -q tests/test_episode_builder.py backend/tests/test_v1_episode_export.py --tb=short
```

结果：失败，`ModuleNotFoundError: No module named 'fablemap_api.core.episode_builder'`。

```powershell
node .\frontend\scripts\episode-export-test.mjs
```

结果：失败，`TypeError: service.exportEpisode is not a function`。

### GREEN / 完整验证

```powershell
py -3 -m pytest -q tests/test_episode_builder.py backend/tests/test_v1_episode_export.py --tb=short
```

结果：`3 passed in 1.50s`。

```powershell
node .\frontend\scripts\episode-export-test.mjs
```

结果：`episode-export-test: ok`。

```powershell
py -3 -m compileall -q backend/src
```

结果：通过（无输出）。

```powershell
npm --prefix .\frontend test
```

结果：通过，包含 `episode-export-test: ok`。

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

结果：`520 passed, 103 warnings in 38.84s`。
