# T4.2 变更记录：LLM 配置 UI 完善

## 变更日期
2026-04-17

## 任务 ID
T4.2

## 变更类型
前端功能完善

## 概述
在 `TavernCreatePanel` Step 2（AI 配置步骤）中，用 `LLMConfigForm` 组件替换手动表单字段，使店主在创建空间时即可使用完整的 24 后端选择界面。

## 为什么改
`TavernCreatePanel` Step 2 原有实现只提供了 4 个后端选项（OpenAI/Claude/Ollama/OpenRouter）的 `<select>` 下拉框，以及手动的模型名/API Key/端点输入框。

`LLMConfigForm` 组件已完整实现（含 24 个后端、完整参数、高级设置、连接测试），但 `TavernCreatePanel` 未接入该组件，导致：
1. 店主无法在创建空间时选择全部 24 个后端
2. 24 个后端选项仅在 `TavernOwnerPanel` 的编辑/配置弹窗中可用
3. 体验不一致

## 改了什么
**文件：`frontend/src/TavernCreatePanel.jsx`**

1. **新增导入**
   - `LLMConfigForm`
   - `DEFAULT_MODELS`
   - `DEFAULT_BASE_URLS`

2. **表单状态重构**
   - 将 `form.llm_backend / llm_model / llm_api_key / llm_base_url / temperature` 五个独立字段替换为统一的 `llmFormData` 状态对象
   - 初始值使用 `DEFAULT_MODELS` 和 `DEFAULT_BASE_URLS`

3. **Step 2 内容替换**
   - 移除了手动编写的 6 个表单控件（后端选择、模型输入、API Key、端点、温度滑块）
   - 替换为 `<LLMConfigForm value={llmFormData} onChange={setLlmFormData} compact={false} tavernId={null} />`

4. **handleSubmit 更新**
   - `payload.llm_config` 的构建逻辑从 `form.llm_*` 字段改为使用 `llmFormData`
   - 新增 `max_tokens` 和 `top_p` 字段（原来遗漏）

## 没改什么
- `LLMConfigForm.jsx` 组件本身未修改
- `TavernOwnerPanel.jsx` 未修改（已接入 LLMConfigForm）
- 后端 API 未修改（`/test-llm` 端点已存在）
- `styles.css` 未修改（样式已存在）
- 数据 Schema 未修改

## 影响文件
| 文件 | 改动类型 |
|------|----------|
| `frontend/src/TavernCreatePanel.jsx` | 功能修改 |
| `docs/CURRENT_TASKS.md` | 状态同步 |
| `docs/claims/2026-04-17-t4-2-llm-config-ui.md` | 认领文档（新增） |

## 验证
- `npm run build` 在 `frontend/` 目录执行成功（vite build, 72 modules, 303 kB）

## 风险点
- ~~`LLMConfigForm` 在 `TavernCreatePanel` Step 2 传入 `tavernId={null}`，连接测试按钮会提示"需要先保存空间才能测试"，属于预期行为（创建时空间不存在）~~ — **已解决**：新增 `/api/llm/test-config` 端点支持无 tavernId 测试
- 后续可考虑在空间创建成功后，自动引导到 AI 配置弹窗进行测试

## 依赖
- `LLMConfigForm.jsx`（已有，已修改 — 新增 `testDirect` prop）
- `tavernService.testLlmConfig`（已有）
- `/api/taverns/{id}/test-llm` 后端端点（已有）
- `/api/llm/test-config` 后端端点（**新增**）

---

## 后继变更 (2026-04-17 后续)：支持创建时测试 LLM 连接

### 为什么改
创建空间时，用户在 Step 2 配置 LLM 后，无法验证配置是否正确（测试按钮不显示或报错"需要先保存空间"）。需要在空间创建前就能测试 LLM 连接。

### 改了什么

**文件：`fablemap/web/router.py`**
- 新增 `@router.post("/api/llm/test-config")` 端点，接收 LLM config 直接测试，无需 tavern_id

**文件：`fablemap/web/service.py`**
- 新增 `test_llm_config_payload` 方法（逻辑同 `test_llm_payload`，去除 `tavern_id` 参数）

**文件：`frontend/src/services/tavernService.js`**
- 新增 `testLlmConfigDirect(config)` 方法，调用 `POST /api/llm/test-config`

**文件：`frontend/src/LLMConfigForm.jsx`**
- 新增 `testDirect` prop，类型：`(config) => Promise<{ok, message}>`；当传入时，测试按钮始终显示，调用此函数而非 `/api/taverns/{id}/test-llm`
- `handleTest` 重构：优先用 `testDirect`，次选用 `tavernId`，均无则报错

**文件：`frontend/src/TavernCreatePanel.jsx`**
- 新增 `handleTestDirect` 函数，调用 `tavernService.testLlmConfigDirect(config)`
- `LLMConfigForm` 传入 `testDirect={handleTestDirect}`，使创建流程中可测试 LLM

### 验证
- `npm run build` 在 `frontend/` 执行成功（73 modules, 312.84 kB）

### 风险点
- `/api/llm/test-config` 端点无需认证，但 API Key 由用户在前端直接传入，后端不存储；若后续需要持久化 LLM 配置，需在创建空间后保存到数据库
