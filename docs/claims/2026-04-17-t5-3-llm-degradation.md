# T5.3 任务认领：LLM 降级策略

## 任务 ID
T5.3

## 任务名称
LLM 降级策略：API 失败友好提示

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前后端体验切片

## 任务目标
让空间聊天在 LLM 不可用时明确、温和、可恢复：

1. 后端返回结构化降级信息，而不只返回规则文本。
2. LLM 调用失败时自动切换规则回应，并将空间状态标记为 `closed`。
3. 前端聊天页展示降级提示与恢复建议。
4. 网络/API 错误也显示可读提示。
5. 增加回归测试覆盖 LLM 失败路径。

## 可修改范围
- `fablemap/web/service.py`
- `frontend/src/TavernChatRoom.jsx`
- `frontend/src/styles.css`
- `tests/test_tavern_llm_degradation.py`
- `docs/CURRENT_TASKS.md`
- `docs/changes/2026-04-17-t5-3-llm-degradation.md`

## 明确不改范围
- 不修改 LLM client 工厂实现。
- 不新增重试队列或后台任务。
- 不接管 T5.2 / T5.4 的并行改动。
- 不新增前端依赖。

## 验证方式
- `npm run build`
- `py -3 -m pytest tests/test_tavern_llm_degradation.py tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`

## 当前状态
done
