# Clue Hunt Owner and Visitor UI MVP

## Parent

`D:\work\ai-\.trellis\tasks\05-13-clue-egg-hunt-rewards\`

## Depends On

* `D:\work\ai-\.trellis\tasks\05-13-clue-hunt-route-domain-governance\`
* `D:\work\ai-\.trellis\tasks\05-13-clue-hunt-session-answer-gate\`
* `D:\work\ai-\.trellis\tasks\05-13-clue-hunt-engagement-reward\`

## Goal

实现跨空间寻宝的最小 owner 配置 UI 与 visitor 体验 UI：店主选择同 owner 空间组成路线、填写线索和答案；访客按半隐藏路线逐站解锁，完成后看到纪念文案和纪念币奖励。

## Requirements

### Owner UI

* 在 owner 管理面板或独立 route 中提供“寻宝路线”入口。
* 只能选择当前 owner 名下的 Tavern；系统管理入口可选择 `system_public_welfare` 空间。
* 支持路线标题/简介、节点排序、每站线索文案、答案输入、提示文案、终点奖励文案/纪念币数量。
* 保存前明确提示：线索/答案/奖励由店主确认，平台不自动生成发布。
* 不提供跨 owner 添加空间，不提供外部兑换码/API Key 奖励。

### Visitor UI

* 路线卡显示主题、第一站、当前进度与现实安全提示。
* 半隐藏：未解锁站点不显示具体 Tavern；答对后显示下一站摘要与入口。
* 当前站支持提交答案、查看安全提示/可选提示文案。
* 完成后展示纪念文案与领取/已领取纪念币状态。
* 移动端无横向溢出。

## Acceptance Criteria

* [ ] Owner 只能从合法 Tavern 列表选节点，非法 owner 空间不可选/保存失败。
* [ ] Visitor 初始只看到第一站；答对后显示下一站。
* [ ] 答案不出现在前端源数据或公开 payload 中。
* [ ] 完成后展示纪念文案 + 纪念币领取状态。
* [ ] 桌面和移动 Playwright 自验收截图/报告记录到本任务 artifacts。
* [ ] Frontend build/test/typecheck 通过。

## Likely Files

* `frontend/app/lib/` clue hunt API client。
* `frontend/app/routes/owner.tsx` / `frontend/app/routes/tavern.tsx` or new route module.
* `frontend/app/product/` owner/visitor clue hunt components if using product parity area.
* `frontend/scripts/*clue-hunt*.mjs` tests.
* `.trellis/spec/frontend/*clue-hunt*.md` if new UI contract is introduced.

## Validation

* `npm --prefix .\frontend test`
* `npm --prefix .\frontend run typecheck`
* `npm --prefix .\frontend run build`
* Playwright desktop + mobile visual self-acceptance, with screenshots/report under this task's `artifacts/playwright/`.

## Out of Scope

* New image generation/assets.
* Cross owner collaboration UI.
* Hidden NPC / hidden entrance rewards.
* Platform wallet/recharge/leaderboard/social surfaces.
