# 2026-04-30 Visual Souvenir Preview

## 为什么改

父任务提出 `visual-souvenir`：把玩家和 NPC 的共享瞬间变成可留念的资产。但图片生成涉及隐私、人物相似、临时文件和项目资源落盘规范，因此本切片先实现 no-image prompt preview。

## 改了什么

- 新增预览核心：`backend/src/fablemap_api/core/visual_souvenir.py`。
- 新增 API：`POST /api/v1/taverns/{id}/visual-souvenir/preview`。
- 新增前端 typed/product 服务方法：`previewVisualSouvenir(...)`。
- 新增测试：
  - `tests/test_visual_souvenir.py`
  - `backend/tests/test_v1_visual_souvenir.py`
  - `frontend/scripts/visual-souvenir-test.mjs`
- 新增 Trellis backend/frontend 规范，明确 no-image、no-persistence、privacy redaction 和未来资产落盘边界。

## 没改什么

- 不生成图片，不调用图片模型或 `image_gen`。
- 不创建、复制或引用任何新图片资产。
- 不保存提示词或纪念图草稿。
- 不新增持久化 Schema 字段。

## 验证

本变更应至少运行：

```powershell
py -3 -m pytest -q tests/test_visual_souvenir.py backend/tests/test_v1_visual_souvenir.py --tb=short
node .\frontend\scripts\visual-souvenir-test.mjs
py -3 -m compileall -q backend/src
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

## 风险

- 预览不是图片成品。未来如果加入真实生成，必须遵守 `docs/IMAGE_ASSETS_SPEC.md` 与 `.trellis/spec/frontend/image-asset-guidelines.md`，并在完成前把图片资产放入项目规范路径。
