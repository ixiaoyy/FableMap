# Clue Hunt Engagement Reward Integration

## Parent

`D:\work\ai-\.trellis\tasks\05-13-clue-egg-hunt-rewards\`

## Depends On

* `D:\work\ai-\.trellis\tasks\05-13-clue-hunt-route-domain-governance\`
* `D:\work\ai-\.trellis\tasks\05-13-clue-hunt-session-answer-gate\`

## Goal

将完成跨空间寻宝路线后的奖励收敛为“纪念文案 + 空间纪念币”，复用或扩展现有 Engagement 机制，保持非充值、非交易、非跨空间流通。

## Requirements

* 完成 `ClueHuntSession` 后才可领取奖励。
* 奖励类型 MVP 固定为：`reward_text` + tavern-local Engagement 纪念币。
* 领取必须幂等：同一 completed session 只能有效领取一次。
* 奖励不得是 owner LLM API Key、平台 secret、数据库 secret、真实金钱、可交易物或外部兑换码。
* 若复用 Engagement：明确 reward source 是沿用 `gameplay_completion` 还是新增 `clue_hunt_completion`；实现前需同步 backend/frontend contract。
* 奖励归属要清晰：优先绑定终点 Tavern 或 route owner 的一个明确 Tavern-local engagement bucket；不得变成平台钱包。

## Acceptance Criteria

* [ ] 未完成 session 不能领取奖励。
* [ ] completed session 首次领取成功，返回纪念文案、获得数量、余额。
* [ ] 重复领取不重复加币，并返回明确 duplicate/idempotent 结果。
* [ ] 奖励只影响当前 visitor × tavern/route 的私有进度，不进入公开 Tavern payload。
* [ ] 后端测试覆盖未完成、成功、重复、越权、跨空间不流通。
* [ ] Engagement 相关 spec/docs 更新，避免把路线奖励误写成平台钱包。

## Likely Files

* `backend/src/fablemap_api/core/engagement.py`
* `backend/src/fablemap_api/api/v1/engagement.py` 或 clue hunt reward endpoint
* `backend/src/fablemap_api/application/engagement.py`
* `backend/tests/test_engagement.py`, `backend/tests/test_v1_engagement.py`, or `backend/tests/test_clue_hunt_reward_*.py`
* `.trellis/spec/backend/engagement-api-contract.md`
* `docs/WORLD_SCHEMA.md` Engagement / clue hunt sections if new source type is introduced.

## Validation

* `py -3 -m compileall -q backend/src`
* `py -3 -m pytest -q backend/tests/test_engagement.py backend/tests/test_v1_engagement.py backend/tests/test_clue_hunt_reward_*.py --tb=short`

## Out of Scope

* 隐藏 NPC / 隐藏入口奖励。
* 店主自备外部兑换码或 API Key。
* 平台充值、提现、结算、转让、排行榜。
* UI 展示（子任务 4）。
