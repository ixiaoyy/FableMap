# brainstorm: 设计空间软货币与礼物系统

> Archived compact summary. Verbose historical PRD/brainstorm content was removed to reduce AI context noise.

- Status: completed
- Created: 2026-05-06
- Completed: 2026-05-12
- Scope: engagement wallet gifts vouchers mvp
- Notes: 2026-05-09: Codex claimed implementation. Added tavern-local engagement config + visitor private progress persistence, v1 engagement API/service/store wiring, gameplay-completion reward claim, gift send, voucher redeem, tavern-route visitor engagement panel, service normalization for backend gift icon fields, and Playwright self-acceptance report at .trellis/tasks/05-06-tavern-soft-currency-gifts-design/artifacts/playwright/report.md. Validation passed with backend compile + focused pytest, frontend typecheck + build, engagement-panel regression script, and desktop/mobile Playwright. 2026-05-12 final validation: backend engagement unit/v1 tests passed (26 passed) and engagement-panel script passed; full frontend test/build also passed after unrelated regression blockers were fixed. Deferred items remain documented in meta.deferred_not_done.

## Deferred / not done
- Bonus-voucher consumption is not yet wired into the gacha draw pipeline; this slice stops at voucher issuance.
- Owner-side custom engagement config editor UI is not included in this slice.

## Context policy
- Use current product docs/spec files as source of truth; do not load removed historical brainstorm detail unless restored from git history.
