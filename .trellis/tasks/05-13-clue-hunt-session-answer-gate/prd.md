# Clue Hunt Session and Answer Gate

## Parent

`D:\work\ai-\.trellis\tasks\05-13-clue-egg-hunt-rewards\`

## Depends On

* `D:\work\ai-\.trellis\tasks\05-13-clue-hunt-route-domain-governance\`

## Goal

实现访客跨空间寻宝 session 与 answer gate：初始只显示第一站；访客在当前站提交答案，后端校验后解锁下一站；完成终点后生成完成状态。

## Requirements

* 新增或扩展 `ClueHuntSession`：`route_id`、`visitor_id`、已解锁进度、已解开节点、状态、完成时间等。
* 采用半隐藏路线：
  * 初始 payload 只返回第一站摘要与入口；
  * 答对当前节点后返回下一站摘要与入口；
  * 不提前泄露未解锁空间、答案或完整顺序。
* 答案必须后端校验；前端只负责提交。
* 答案存储不得明文暴露在公开 payload；优先 hash + normalization。
* 支持基础 normalization：trim/lowercase；如涉及 emoji/key case，要在 contract 中明确。
* 答错返回安全提示，不推进进度；可记录尝试次数但不做复杂反作弊。
* 完成后标记 session completed，但不直接发放奖励（由子任务 3 领取）。

## Acceptance Criteria

* [ ] 开始/恢复 session 只返回当前已解锁节点。
* [ ] 答错不解锁下一站，且不会泄露正确答案。
* [ ] 答对解锁下一站；终点答对后 session 进入 completed。
* [ ] 普通访客不能读取或推进其他 visitor 的 session。
* [ ] Owner 可按现有隐私边界查看本路线/本空间必要摘要，不暴露敏感答案。
* [ ] 后端测试覆盖初始、答错、答对、完成、越权访问。

## Likely Files

* `backend/src/fablemap_api/core/` clue hunt session/answer gate domain。
* `backend/src/fablemap_api/api/v1/` session/submit endpoints。
* `backend/src/fablemap_api/infrastructure/` persistence if database-backed storage is needed.
* `backend/tests/test_clue_hunt_session_*.py`
* `docs/WORLD_SCHEMA.md` / backend spec contract updates if API/schema changes.

## Validation

* `py -3 -m compileall -q backend/src`
* `py -3 -m pytest -q backend/tests/test_clue_hunt_session_*.py --tb=short`

## Out of Scope

* Route owner governance beyond consuming子任务 1 的 contract。
* Engagement reward claim（子任务 3）。
* UI（子任务 4）。
* 强反作弊、排行榜、PVP、跨 owner 协作。
