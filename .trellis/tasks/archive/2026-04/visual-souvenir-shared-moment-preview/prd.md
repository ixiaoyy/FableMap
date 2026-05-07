# Visual Souvenir Shared Moment Preview

## Goal

把父任务中的 `visual-souvenir` 做成安全 MVP：从指定访客和 NPC 的可观察回合文本中生成“纪念图提示词预览”，供店主/访客复核后再进入未来图片生成流程。本切片不调用图片模型、不生成图片、不复制资产、不写入持久化状态。

## Scope

### In scope

- 新增 deterministic visual souvenir prompt preview helper。
- 新增 `/api/v1/taverns/{id}/visual-souvenir/preview`。
- 输入显式 `visitor_id`、`character_id`、可观察回合文本和可选风格。
- 输出安全图片 brief / prompt / negative_prompt / privacy_notes / next_action。
- 新增前端 typed/product service helper。
- 补充 Trellis spec、README / ARCHITECTURE / changes。
- TDD：先写失败测试，再实现。

### Out of scope / Not done

- 不生成图片，不使用 `image_gen`，不调用外部图像服务。
- 不落文件到 `frontend/public`、`artifacts` 或 `.codex/generated_images`。
- 不保存提示词、图片草稿或用户照片。
- 不做人脸复刻、voice/persona cloning、真实人物识别。
- 不新增持久化 Schema 字段。
- 不做完整 UI 面板。

## Requirements

- API 需要明确用户身份和 `visitor_id`。
- 非店主只能为自己的 `visitor_id` 生成预览。
- 私密空间遵守可见性边界。
- `character_id` 必须存在。
- 预览只使用可观察文本，不包含 hidden prompt / API key / private memory。
- 输出必须包含：
  - `preview_only=true`
  - `applied=false`
  - `image_generated=false`
  - `requires_confirmation=true`
  - `souvenir.prompt`
  - `souvenir.negative_prompt`
  - `souvenir.source_summary`
  - `privacy_notes`
- Prompt 应使用“访客/旅人”等泛称，不直接暴露 visitor_id 或私人姓名。

## Acceptance Criteria

- [x] Core helper 能生成不含 visitor_id/hidden prompt 的纪念图 prompt 预览。
- [x] API `POST /api/v1/taverns/{id}/visual-souvenir/preview` 返回 no-image 预览。
- [x] API 权限覆盖缺少身份、非店主导出其他访客、角色不存在、私密空间不可见。
- [x] 前端 native/product 服务均有 `previewVisualSouvenir` helper，路径和请求体正确。
- [x] README、ARCHITECTURE、Trellis spec 和 changes 文档说明 no-image/no-persistence/privacy boundary。
- [x] 验证命令记录在本文件和 `task.json` 中。

## Technical Notes

- 后端 core helper 放在 `backend/src/fablemap_api/core/visual_souvenir.py`。
- v1 route 可放在 `backend/src/fablemap_api/api/v1/runtime.py`。
- 应用层放在 `RuntimeApplicationMixin`，复用可见性和 owner/visitor scope 检查。
- 前端 route-client 方法放在 `frontend/app/lib/taverns.ts`，product parity 方法放在 `frontend/app/product/services/tavernService.js`。
- 测试：
  - `tests/test_visual_souvenir.py`
  - `backend/tests/test_v1_visual_souvenir.py`
  - `frontend/scripts/visual-souvenir-test.mjs`

## Verification Log

### RED（已观察预期失败）

```powershell
py -3 -m pytest -q tests/test_visual_souvenir.py backend/tests/test_v1_visual_souvenir.py --tb=short
```

结果：失败，`ModuleNotFoundError: No module named 'fablemap_api.core.visual_souvenir'`。

```powershell
node .\frontend\scripts\visual-souvenir-test.mjs
```

结果：失败，`TypeError: service.previewVisualSouvenir is not a function`。

### GREEN / 完整验证

```powershell
py -3 -m pytest -q tests/test_visual_souvenir.py backend/tests/test_v1_visual_souvenir.py --tb=short
```

结果：`3 passed in 1.35s`。

```powershell
node .\frontend\scripts\visual-souvenir-test.mjs
```

结果：`visual-souvenir-preview-test: ok`。

```powershell
py -3 -m compileall -q backend/src
```

结果：通过（无输出）。

```powershell
npm --prefix .\frontend test
```

结果：通过，包含 `visual-souvenir-preview-test: ok`。

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

结果：`527 passed, 103 warnings in 40.35s`。
