# 2026-04-19 — QA-04 Prompt / 输出修正测试

## 目标

覆盖 QA-04 变更记录中列出的四个验收维度：

- Prompt Block 顺序稳定
- token budget 裁剪稳定
- 输出修正规则失败不影响聊天主链路
- 降级回应仍能落库

## 改动

| 文件 | 说明 |
|------|------|
| `tests/test_tavern_qa04_prompt_output.py` | 新增 QA-04 综合测试包，7 个测试用例覆盖全部四个验收维度 |

### 测试用例说明

| 测试 | 验收维度 | 说明 |
|------|----------|------|
| `test_prompt_block_order_is_stable_through_save_retrieve_and_build` | Prompt Block 顺序稳定 | 自定义 order=30/10/20 段落保存 → 检索 → 组装，保持 a/m/z 顺序 |
| `test_token_budget_truncation_is_deterministic` | token budget 裁剪稳定 | 相同输入相同 budget 结果一致；超预算以 `…` 结尾；未超原文保留 |
| `test_chat_api_with_tiny_memory_budget_never_exceeds_limit` | 聊天 API 极小 budget 不崩溃 | `memory_policy.budget_tokens=1` 时聊天仍正常返回，无异常 |
| `test_bad_output_regex_does_not_break_chat_and_message_is_still_saved` | 输出修正失败不影响链路 | 空间保存含无效正则 `pattern="("` 的规则，聊天继续完成，消息正常落库 |
| `test_apply_output_rules_bad_regex_collects_error_but_does_not_raise` | apply_output_rules 容错 | 无效正则进入 `errors` 字段，正常规则继续执行，文本不因此损坏 |
| `test_degraded_response_is_persisted_to_chat_history` | 降级回应落库 | LLM 上游错误时降级回应返回 `degraded=True`，历史记录仍含 assistant 消息 |
| `test_qa04_api_level_comprehensive` | API 级别端到端 | 默认段落顺序 scene/character_system/character_profile；输出修正 API 含坏正则时仍返回 200；preview API 正常组装 messages |

## 验证

- `py -3 -m pytest tests/test_tavern_qa04_prompt_output.py -q`：7 passed
- `py -3 -m pytest tests/ --ignore=tests/test_api.py -q`：185 passed（+7，无回归）
