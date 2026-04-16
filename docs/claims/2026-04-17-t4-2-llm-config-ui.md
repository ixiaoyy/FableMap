# T4.2 任务认领：LLM 配置 UI 完善

## 任务 ID
T4.2

## 任务名称
LLM 配置 UI：API Key 输入、模型选择

## 认领时间
2026-04-17

## 负责人
Claude Sonnet (Claude Code)

## 改动类型
前端功能切片

## 任务目标
完善酒馆创建流程中的 LLM 配置体验：

1. 在 `TavernCreatePanel` Step 2 使用 `LLMConfigForm` 替代手动表单字段。
2. 店主在创建酒馆时即可选择全部 24 个 AI 后端。
3. 保留 API Key、模型、自定义端点、温度等完整配置。

## 可修改范围
- `frontend/src/TavernCreatePanel.jsx`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-17-t4-2-llm-config-ui.md`
- `docs/changes/2026-04-17-t4-2-llm-config-ui.md`

## 明确不改范围
- 不修改 Tavern / TavernCharacter / LLMConfig 数据 Schema。
- 不新增后端 API 端点（`/test-llm` 端点已存在）。
- 不修改 `LLMConfigForm.jsx` 组件本身。
- 不修改 `TavernOwnerPanel.jsx`（已接入 LLMConfigForm）。
- 不引入新的前端依赖。

## 依据文档
- `docs/CURRENT_TASKS.md`
- `docs/FABLEMAP_TAVERN_PLATFORM.md`
- `docs/ARCHITECTURE.md`
- `docs/AI参与开发协议.md`

## 预期产出
- `TavernCreatePanel` Step 2 使用 `LLMConfigForm` 组件。
- 店主在创建酒馆时可选全部 24 个后端（OpenAI/Claude/Ollama 等）。
- 当前任务状态同步。
- 本次变更记录。

## 验证方式
- `npm run build`（在 `frontend/` 目录执行）

## 当前状态
done
