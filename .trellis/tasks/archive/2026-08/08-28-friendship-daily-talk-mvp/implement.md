# 基础好感与每日交谈 MVP：实施计划

## 1. Friendship state and v5 migration

1. 新增 FriendshipState、常量、decoder/default/reconcile/clone。
2. GameState/StoredGame 升 v5，新增显式 v4→v5 migration；旧迁移输出 v5。
3. 更新 IndexedDB v2 backup 与现有 save fixtures 的 current-version 断言，不改变 backup key/transaction。

## 2. Domain commands and day settlement

1. 新增 FriendshipSystem talk/settleDay。
2. GameCommand/GameSession 接入 talk-to-npc，统一验证 runtime 位置与42px。
3. sleep 同一 mutation 内先 friendship/farming settlement，再推进 day/time/position。
4. WorldScene 在 Shop/Dialogue 打开前 dispatch 一次 talk。

## 3. Social UI

1. game-store 投影 friendship record，增加 socialOpen 与统一 world lock。
2. 新增 SocialPanel.vue：稳定八人名册、姓名解析、关系阶段、十心进度、今日印记、focus/Escape。
3. App.vue 挂载，style.css 完成桌面/手机、focus、disabled、scroll 与现有 HUD 层级。

## 4. Focused contracts and docs

1. Life Loop：v4→v5、非法 friendship、首聊+20、重复0、次日+20、漏聊-2、满心无衰减、远距无效。
2. Town/UI：八人默认/顺序、Shop+Dialogue 同命令、Social modal lock、store projection。
3. 更新 code-spec、产品边界和路线图；gifts/两心内屋仍保持未完成。

## 5. Minimal validation

```powershell
npm --prefix .\apps\mirror-island run test:life-loop
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

最终改动后只运行一次；不连接数据库、不运行身份或 E2E。

## Risk points

- v4 migration 必须先完整验证旧字段，不能把损坏记录静默补 defaults。
- daily decay 必须在 day+1 前结算，不能通过 UI 定时器处理。
- Shop 与 Dialogue 只能在第一次点击时 dispatch talk，不能在面板按钮/对话每行重复增加。
- Social modal 必须进入统一 world lock，不能让时间在阅读名册时继续。
