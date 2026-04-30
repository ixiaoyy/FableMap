# Tavern Discovery Experience Polish MVP

## Goal

把 `/discover` 浏览体验从普通列表进一步转译为“真实地图上的赛博酒馆入口”：用现有数据强化地点类型、氛围、公开状态、传闻/回访提示等信息层级，不新增 Schema。

## Source Brainstorm

* Parent: `.trellis/tasks/04-28-new-features-brainstorm/brainstorm.md`
* Candidate C: Tavern Discovery 高质量发现页
* Status: 已拆出，暂不认领；待 P1 创建向导完成或用户改优先级后开发。

## Requirements

* 复用现有 tavern/place/rumor/guestbook 能力，不做传统 POI 搜索、路线规划、评分排行。
* 卡片表达“酒馆入口/地点氛围/可进入状态”，不是地图 App 工具面板。
* 可考虑轻量筛选或分组，但不扩展后端契约。
* 保持移动端可用。

## Acceptance Criteria

* [ ] `/discover` 卡片信息层级更贴近“入店探索”。
* [ ] 不引入访客间社交、评分排行或商业化入口。
* [ ] 如修改前端，`npm --prefix .\frontend run build` 通过。

## Out of Scope

* 不新增 Schema/API。
* 不做全局访客社交网络。


## 2026-04-30 Implementation Notes

### Relevant Specs

* `.trellis/spec/frontend/component-guidelines.md`: discovery cards must meet consumer-grade FableMap UI quality and mobile touch target rules.
* `.trellis/spec/frontend/quality-guidelines.md`: route-level visual work requires `npm --prefix .\frontend run build`.
* `.trellis/spec/frontend/type-safety.md`: dynamic `Tavern` payload fields such as `access`, `status`, `characters`, and `visit_count` need safe display fallbacks.

### Code Patterns Found

* `frontend/app/routes/discover.tsx`: already uses `listTaverns`, `DISCOVERABLE_PLACE_TYPES`, `derivePlaceTypeDisplay`, local pure helpers, and route-local cards.
* `frontend/app/lib/place-types.js`: shared place-type display metadata is the source of truth for labels, icons, tone, and discoverability.

### Implementation Approach

* Keep the task frontend-only and avoid Schema/API changes.
* Polish existing `/discover` cards by replacing raw access/status strings with tavern-entry language and adding compact atmosphere/role/return signals from existing Tavern fields.
* Do not add rankings, POI/navigation features, public visitor social surfaces, or token/commercial UI.


