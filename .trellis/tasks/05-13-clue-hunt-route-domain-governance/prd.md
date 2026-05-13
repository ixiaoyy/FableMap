# Clue Hunt Route Domain and Governance

## Parent

`D:\work\ai-\.trellis\tasks\05-13-clue-egg-hunt-rewards\`

## Goal

建立跨空间寻宝路线的后端 domain / API 契约与治理校验：普通店主只能串联同一 `owner_id` 下的真实坐标空间；系统路线只能串联系统/公益空间（当前 `owner_id=system_public_welfare`）。

## Requirements

* 定义 `ClueHuntRoute` / `ClueHuntNode` 的最小持久化模型或等价存储结构。
* 路线必须由多个真实坐标 Tavern 节点组成，每个节点绑定一个 `tavern_id`。
* 普通 owner 保存路线时，所有节点 Tavern 必须满足 `tavern.owner_id == route.owner_id`。
* 系统/公益路线只允许包含 `owner_id == system_public_welfare` 的 Tavern。
* MVP 不做跨 owner 协作、邀请、审批、撤销。
* 路线内容是 owner-authored；平台不得自动生成并发布线索、答案或奖励。
* 公开/访客摘要不得泄露答案 hash、完整未解锁顺序或未解锁节点详情。

## Acceptance Criteria

* [ ] 后端存在 route/node domain normalization，兼容缺失/旧字段默认值。
* [ ] Owner 创建/更新路线时，同 owner 校验通过、跨 owner 节点被拒。
* [ ] 系统路线可串联系统/公益 Tavern；普通 owner 不能混入系统空间。
* [ ] 私有/不可见 Tavern 不会被普通访客通过路线摘要泄露。
* [ ] `docs/WORLD_SCHEMA.md` 或 `.trellis/spec/backend/` 更新 clue-hunt contract（如新增持久字段/API）。
* [ ] 相关后端测试覆盖 Good/Base/Bad cases。

## Likely Files

* `backend/src/fablemap_api/core/` 新增或扩展 clue hunt domain。
* `backend/src/fablemap_api/api/v1/` 新增 clue hunt routes（若采用 v1 API）。
* `backend/src/fablemap_api/application/services/` 或 `core/web/service.py` 中增加 service 边界。
* `backend/src/fablemap_api/core/default_taverns.py`：只读取系统 owner 常量，不改默认空间内容，除非本任务明确需要示范数据。
* `docs/WORLD_SCHEMA.md`
* `.trellis/spec/backend/*clue-hunt*.md`（如新增规范）。
* `backend/tests/test_clue_hunt_*.py`

## Validation

* `py -3 -m compileall -q backend/src`
* `py -3 -m pytest -q backend/tests/test_clue_hunt_*.py --tb=short`

## Out of Scope

* 访客 session / 答案提交 / 解锁逻辑（子任务 2）。
* 纪念币奖励发放（子任务 3）。
* Owner/visitor UI（子任务 4）。
* 跨 owner 协作审批。
