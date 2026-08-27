# 项目基线对齐

## Goal

让新根历史上的权威文档、checkpoint 证据、Trellis 任务状态与可复现安装重新一致，明确当前产品已经完成 Life Loop、Town Gate A/B/C 与 Town Population MVP，下一阶段继续 Stardew/Town，暂缓 Expedition、战斗与灵兽。

## Requirements

### 权威产品状态

- `README.md`、`docs/PRODUCT_BRIEF.md`、`docs/WHAT_NOT_TO_BUILD.md` 与前端 Trellis spec 必须反映当前生产 `main=83410ca5`、Life Loop v1、Town Gate C 和三名 NPC 已完成。
- 当前下一产品门只记录为 `Town Functionality MVP` 的后续规划；本任务不创建铁匠铺室内、工具系统、经济命令、地图或运行时代码。
- 用户最新决定优先于旧路线：继续完善 Stardew/Town，Expedition、战斗、灵兽、肉鸽、塔防、Tauri、Steam 继续后置。
- README 必须写明生产直接使用 6 张 VectoRaith Original/16×16 官方图集，不再描述 5 个派生图集。

### 历史重写证据

- Life Loop checkpoint 必须同时保留历史部署证据与 rewritten commit 对应关系，避免把已删除的旧 SHA 当成当前可解析引用。
- 当前 rewritten 对应至少记录：原部署 `7414986a -> 55360a6c`、Town Gate C `37c51953 -> 4ec3e152`、Life Loop implementation `1d1ca3e2`、本地验收 `77144831`、checkpoint tag target `cc4b6ff5`、当前生产 `83410ca5`。
- GitHub Actions 历史 run ID 可以保留为当时的生产证据，但需注明其 head SHA 来自 rewrite 前历史。

### Trellis 状态

- 只归档有完整代码/生产/用户验收证据的旧任务：Life Loop release、Town Showcase、Singleplayer Stardew Core 与 World Foundation。
- 归档前补齐它们已经由后续生产验收满足的 Acceptance Criteria，并将过时的素材/commit 说明改为 rewritten 当前事实。
- Forum SSO 跨 Compose 任务不得盲目归档：先运行已有身份合同与组合 Compose 配置检查；若通过则只补自动门禁证据，仍保留“新论坛票据首次登录 + 既有论坛账号再登录”的人工验收缺口。
- 清除已不存在的 history-rewrite task session 指针，当前任务成为唯一 active task。

### 可复现安装

- 只更新 `apps/mirror-island/package-lock.json`，使它与已锁定的 `package.json` 完全一致；不升级任何直接依赖版本。
- 使用当前 Node/npm 生成 lockfile 后，必须从 lockfile 完成一次真实 `npm ci`。
- lockfile diff 只允许补齐/纠正依赖图与 package metadata；若出现直接依赖版本漂移，必须中止并复核。

## Acceptance Criteria

- [x] 权威文档一致说明 Life Loop、Town Gate A/B/C、Town Population 已完成，当前继续 Stardew/Town 且不进入战斗远征。
- [x] README 与素材规范一致写明 6 张官方 Original/16×16 图集。
- [x] Life Loop checkpoint 的旧 SHA、rewritten SHA、tag 与当前生产关系可审计，不再留下不可解释的旧提交引用。
- [x] Life Loop release、Town Showcase、Singleplayer Stardew Core、World Foundation 四个已验收任务归档；Forum SSO 任务只按真实证据更新，未获人工登录证据前保持开放。
- [x] `npm ci` 从更新后的 lockfile 成功，不修改直接依赖版本。
- [x] `test:life-loop`、`test:town-population`、`test:identity`、typecheck、client build、server build 与组合 Compose config 通过。
- [x] `git diff` 不含玩法、TMJ、图片二进制、数据库 schema/migration、CDN 对象或 secret 改动。

## Out of Scope

- Town Functionality、铁匠功能、第二种作物、工具规则、NPC 日程、完整时间或 Season。
- Expedition、战斗、灵兽、肉鸽、塔防、剧情、Tauri、Rust、Steam。
- 数据库连接、生产发布、GitHub tag/branch/history 再次变更。
- 删除现有历史重写 bundle、恢复 ZIP、ignored 素材或本地环境配置。
