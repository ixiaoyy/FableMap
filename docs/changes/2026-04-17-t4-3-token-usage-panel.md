# T4.3 Token Usage Panel — Token 统计面板

## 概述

本次变更完成 Phase 4 的 `T4.3 Token 统计面板`，让店主可以在“我的空间控制台”中查看自己的空间 LLM 使用量。

## 为什么改

Phase 3 已经完成真实 LLM 调用和 token 统计记录，但店主侧缺少可见入口。T4.3 将已有 `token_used` 数据整理为控制台面板，帮助店主判断哪些空间正在产生模型消耗。

## 改了什么

### `fablemap/tavern.py`

- `TavernStore.add_token_usage` 现在会同时更新：
  - keyvault 中的私有 LLM 配置用量
  - taverns 数据中的非敏感 `llm_config.token_used`
- `TavernStore.get_token_usage` 会从 keyvault 和 taverns 数据中取较大值，兼容已有历史数据。
- `list_taverns` 与 `get_tavern` 会把累计 token 用量合并回 tavern payload。
- `TavernService.update_tavern` 保存新的 LLM 配置时会保留既有 token 用量，避免重配模型后统计归零。

### `fablemap/web/service.py`

- 在 tavern chat LLM 调用前初始化 response，避免 LLM 失败并走 fallback 时 token 统计引用未定义变量。

### `frontend/src/TavernOwnerPanel.jsx`

- 新增 `TokenUsagePanel`：
  - 累计 Token
  - 平均每馆 Token
  - 已有消耗 / 尚未消耗空间数
  - 最高消耗空间
  - 按用量排序的空间排行与占比条
  - 每行可直接进入 AI 配置
- 控制台卡片中的 Token 数字统一格式化。

### `frontend/src/styles.css`

- 新增 Token 统计面板、摘要指标、排行条与响应式样式。

### `tests/test_tavern_token_usage.py`

- 新增回归测试，验证：
  - `add_token_usage` 后列表 payload 能看到累计用量
  - 更新 LLM 配置不会清空已有 token_used

## 没改什么

- 未新增计费、充值、配额、扣费逻辑。
- 未新增前端依赖。
- 未改变聊天 API 请求 / 响应结构。
- 未修改 Tavern / Character / LLMConfig Schema 字段语义。

## 影响范围

- 店主管理台 Token 可见性
- TavernStore token_used 持久化
- LLM 配置保存时的统计保留逻辑

## 验证方式

- `python -m pytest tests/test_tavern_token_usage.py -q`
- `npm run build`（在 `frontend/` 目录执行）

## 风险点

- 当前 `token_used` 是平台记录的使用量，不是正式账单；不同后端返回 usage 的精度可能不同。
- 历史数据中只有 keyvault 记录 token 时，本次通过读取较大值兼容，但不会主动迁移所有旧文件，只有后续写入时会同步。
