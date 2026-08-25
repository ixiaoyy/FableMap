# Life Loop 生产发布与 checkpoint

## Goal

将已在真实浏览器通过的 Stardew Life Loop 第一批安全合入生产，保护现有浏览器 v2 存档的原始副本，完成全新账号与已有 v2 存档账号两类生产验收，并以 `life-loop-v1` tag 固定第一个完整可玩生活循环 checkpoint。

## Confirmed baseline

- 当前生产 `main` 已包含 Farm Showcase、VectoRaith 资源、Keycloak/论坛 SSO 和 World Foundation，但尚未包含提交 `673cc6d2` 的 Life Loop。
- Life Loop 开发分支已经通过 4 个窄合同、typecheck、client build 和用户真人完整循环验收。
- 当前 IndexedDB DB/store/主 key 分别为 `mirror-island-local`、`game-saves`、`ownerKey:slotId`。
- `load()` 会把 v2 解码成内存 v3；GameSession reconcile 后的下一次 `save()` 才覆盖主记录，因此该 save transaction 是保留原始 v2 的唯一正确边界。
- 生产发布仍由推送 `main` 触发现有 GitHub Actions，不连接生产数据库做人工查询。

## Requirements

### v2 backup and atomic switch

- 保持 `SaveRepository`、IndexedDB database version、store、ownerKey 与主 slot key 不变。
- 当且仅当主 key 当前保存的是 version 2，且即将写入的值已通过 v3 `decodeStoredGame` 时，在同一个 readwrite transaction 中：
  1. 若 owner/slot 的 v2 backup key 尚不存在，写入原始 v2 payload；
  2. 写入 v3 主记录；
  3. transaction 任一步失败时两者都不提交。
- backup key 固定为主 key 的 owner/slot scoped v2 后缀，不被 `has/load/save` 当成可继续游戏的 slot。
- 已有 backup 不覆盖；v3→v3 普通保存不新增 backup。
- 显式 `delete(ownerKey, slotId)` 同时删除主记录及其 backup，保持用户删除语义。
- 不把 backup、原始 subject、token 或素材信息写入 GameState、GameSession 或 Vue。

### Release checkpoint

- 同步 `docs/checkpoints/life-loop-v1/`，记录范围、提交、自动检查、生产运行和两类人工验收，不把整个 Stardew/World 误写成完成。
- 将 Life Loop 提交安全移植到最新 `origin/main`；不合并重复的 World Foundation/OIDC 等价提交。
- 推送 main 后持续跟进自动部署，失败则只做窄修复，不创建 Expedition 代码。
- 生产验证必须覆盖：
  - 全新账号：Day 1 / 100g、无赠送种子、完整新建与刷新继续；
  - 已有 v2 存档账号：迁移后 region/inventory/farm state 可继续，day=1、gold=100、alien IDs 映射为 turnip，并能继续完成生活循环。
- 两类生产验收都通过后，更新 checkpoint 证据并创建 annotated tag `life-loop-v1`；若任一失败，不打 tag。

### Next-stage boundary

- 本任务只把用户确认的 Expedition 八项约束同步进产品路线，不创建 Expedition task、map、state、combat、cargo、capture 或 roguelike 代码。
- Expedition 后续固定为一张两段式静态森林、近战/远程两个原型与一个精英换皮、Home Inventory / Expedition Cargo 硬隔离、一个必定成功的低血捕获、一组三选一玩法改变事件和 5～8 分钟主观成功标准。

## Acceptance Criteria

- [ ] v2 原始 payload 在原子 v3 切换时只备份一次，失败事务不留下半迁移。
- [ ] v3 普通保存和全新账号不创建 v2 backup；显式 delete 同时删除两条 owner/slot 记录。
- [ ] Life Loop 合同、typecheck、client build 和 JSON/TMJ 解析通过；无 migration、数据库连接或图片二进制。
- [ ] Life Loop commits 基于最新 main 发布，GitHub Actions 成功，生产首页/资源/OIDC 健康。
- [ ] 用户分别确认全新账号和已有 v2 存档账号的生产验收。
- [ ] `docs/checkpoints/life-loop-v1/` 记录最终证据，`life-loop-v1` tag 指向已验证 checkpoint。
- [ ] Expedition 仍为设计边界，未增加任何运行时代码。

## Out of Scope

- 新数据库字段或 Prisma migration、云存档、Tauri/FileSystem、Steam。
- 第二种作物、Season/Clock、天气、NPC 日程、Town/Farm 美术扩建。
- Expedition、战斗、Cargo、灵兽、捕获、肉鸽或撤离实现。
- 创建测试账号、读取用户 token/subject、清空或手工改写生产 IndexedDB。
