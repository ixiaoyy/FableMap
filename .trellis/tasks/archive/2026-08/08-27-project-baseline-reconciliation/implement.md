# 实施计划

## 1. 证据与计划门

1. 固定 rewritten refs、commit map、tag targets、当前生产 run 与公网健康事实。
2. 逐项核对五个旧 active task 的 Acceptance Criteria，形成归档/保留矩阵。
3. 检查 `package.json` 与 lockfile root metadata，记录 Node/npm 版本。

## 2. 权威文档对齐

1. 更新 README 的 6 张 Original/16×16 图集说明。
2. 更新 PRODUCT_BRIEF：Life Loop、Town Gate C、Town Population 已完成；下一产品规划为 Town Functionality；Expedition 暂缓。
3. 更新 WHAT_NOT_TO_BUILD 与前端 spec，记录最新不做边界和 NPC 验收状态。
4. 更新 Life Loop checkpoint/production acceptance，补充 rewritten SHA 映射、tag 与当前生产 main。

## 3. Trellis 状态收口

1. 补齐 Life Loop release 与 Town Showcase 已被后续证据满足的 AC/notes。
2. 补齐 World Foundation 的路线、碰撞、持久化、商店、Gate B/C 人工验收 AC/notes。
3. 更新 Singleplayer Core 的 rewritten notes 与双账号隔离后续证据。
4. 运行 identity 合同和 Compose config；若通过，仅更新 Forum SSO 自动检查 AC/notes，人工双登录保持未勾选。
5. 按子任务→父任务顺序归档四个完成任务，确认 Forum SSO 与本任务仍为 active。

## 4. Lockfile 修复

1. 保存直接依赖版本清单并搜索 lockfile 缺口。
2. 运行 package-lock-only 安装，不执行 lifecycle scripts、不升级 package.json。
3. 检查 lockfile diff，要求直接依赖版本完全不变。
4. 运行真实 `npm ci` 验证新安装路径。

## 5. 最小质量门

1. `npm --prefix apps/mirror-island run test:life-loop`
2. `npm --prefix apps/mirror-island run test:town-population`
3. `npm --prefix apps/mirror-island run test:identity`
4. `npm --prefix apps/mirror-island run typecheck`
5. `npm --prefix apps/mirror-island run build:client`
6. `npm --prefix apps/mirror-island run build:server`
7. 组合 Compose config parse。
8. 全量 diff/状态检查：无业务代码、TMJ、图片、migration 或 secret 改动。

## 6. 交付

1. 更新本任务验收清单与 notes。
2. 按 Trellis 质量门审查后提交当前 branch；不推送、不部署。
3. 报告下一产品门为 Town Functionality MVP，但不在本任务实施。
