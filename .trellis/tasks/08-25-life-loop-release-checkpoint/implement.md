# 实施计划

## A. Planning and branch

1. 固定本 PRD/design/implement，激活发布任务并切换 `codex/life-loop-release-checkpoint`。
2. 同步产品文档中的 Expedition 八项约束，但不创建其运行时代码。

## B. v2 backup

3. 在 `IndexedDbSaveRepository` 增加 owner/slot scoped v2 backup key。
4. 将 save 改为读取 main/backup 后同 transaction 条件写 backup + v3 main。
5. 将 delete 改为同 transaction 删除 main + backup。
6. 更新方法注释和 IndexedDB v3 code-spec；不改 SaveRepository port、DB version 或 store。

## C. Verification

7. 运行 `test:life-loop`、typecheck、client build、JSON/TMJ parse、migration/binary diff checks。
8. 审查 main divergence，只选择 Life Loop 与本 release task commits。

## D. Release

9. 在隔离 main worktree cherry-pick选定提交，核对完整 diff 后推送 main。
10. 等待 GitHub Actions 完成；核对公网首页、bundle、Farm map、Vecto atlas、Keycloak 与论坛 OIDC。
11. 请用户分别完成全新账号与已有 v2 存档账号清单；期间不打 tag。

## E. Checkpoint and tag

12. 两类验收通过后填写生产 run/commit/evidence，提交 checkpoint 文档。
13. 创建并推送 annotated `life-loop-v1` tag。
14. 归档本发布任务；下一步只创建 Expedition Prototype 设计任务。

## Rollback points

- backup transaction 设计或检查失败：不推 main。
- CI/deploy 失败：不打 tag，窄修复后重跑。
- 任一生产账号验收失败：保留 main forward-fix，使用 v2 backup 设计恢复方案；不进入 Expedition。
