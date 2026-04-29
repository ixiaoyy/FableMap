# 2026-04-30 Preset Import Preview Safe Converter

## 为什么改

社区 / SillyTavern 风格预设常混合安全风格提示、模型参数和高风险越狱内容。店主需要在手动迁移前先看到风险报告，而不是让平台直接应用外部预设。

## 改了什么

- 新增后端预览解析器：`backend/src/fablemap_api/core/preset_import.py`。
- 新增 owner-only API：`POST /api/v1/taverns/{id}/preset-import/preview`。
- 新增前端 owner modal：`PresetImportPreviewModal.jsx`，从酒馆卡片和高级工具进入。
- 新增 typed/product 服务方法与脚本测试。
- 新增 Trellis backend/frontend 规范，明确 preview-only 与 no-persistence 边界。

## 没改什么

- 不应用外部预设到 `runtime_presets`、`prompt_blocks`、`world_info`、`characters`。
- 不新增持久化 Schema。
- 不导入 jailbreak / NSFW / chain-of-thought 模块为可用 Prompt。
- 不改变 Tavern / TavernCharacter / WorldInfoEntry 数据结构。

## 验证

本变更应至少运行：

```powershell
py -3 -m pytest -q tests/test_preset_import_preview.py backend/tests/test_v1_preset_import_preview.py --tb=short
node .\frontend\scripts\preset-import-preview-test.mjs
py -3 -m compileall -q backend/src
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

## 风险

- 分类器是启发式规则，不等价于安全审核；blocked/warning 结果是店主迁移前的辅助判断。
- 预览 UI 只处理粘贴 JSON；文件上传和一键应用另行设计。
