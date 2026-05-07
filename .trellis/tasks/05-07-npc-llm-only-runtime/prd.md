# NPC LLM-only runtime boundary

## Decision

- 所有可对话 NPC 都必须走 LLM，不再把本地规则模板伪装成 NPC 回复。
- 当前仓库里前期内置 / 开发出的空间都按公益空间处理：它们统一走系统公益 LLM 配置。
- 后续店主自建空间必须使用店主自己的 LLM 配置；没有配置或调用失败时，不生成本地规则 NPC 回复。

## Scope

- 改 NPC chat / group chat runtime、response_mode 和前端聊天状态文案。
- 保留 Gameplay `fallback_events`、导出、预览等非 NPC 对话的确定性 fallback。
- 不新增 schema 字段，不新增依赖，不实现平台 Token 充值/结算。

## Implementation plan

1. Backend tests first: public-welfare default `rules` seed must hydrate to system public-welfare LLM and call `create_client`; owner tavern without configured external LLM must degrade; LLM errors must not return local rules text.
2. Backend runtime: make `rules` not count as configured NPC LLM; public-welfare rules/unconfigured markers hydrate to versioned system public-welfare LLM when available; chat LLM errors return unavailable degradation instead of rules text.
3. Frontend tests first: chat workbench/product chat room should show public-welfare/AI LLM copy, not “本地规则 / 无 Key”。
4. Frontend UI: skip assistant bubble when degraded response has no NPC text; show degradation/response-mode notice.
5. Run focused pytest, frontend script test, compile/build as appropriate.

## Acceptance

- [x] 公益空间默认聊天调用系统公益 LLM，而不是 `public_welfare_rules.py`。
- [x] 店主空间缺少 LLM 时提示配置，不生成 NPC 回复。
- [x] LLM 调用失败时提示不可用，不切本地规则 NPC 回复。
- [x] 前端不再出现“本地规则模板接待 / 不是外部 LLM NPC / 无 Key 轻量接待”作为 NPC 聊天状态。
- [x] 验证命令与结果记录在最终汇报。
