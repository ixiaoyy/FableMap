# 技术设计

## IndexedDB migration commit boundary

```text
load main record (readonly)
  -> decode v2 to in-memory v3
  -> GameSession reconcile
  -> save validated v3 (readwrite transaction)
       read main key + backup key
       if main.version === 2 && backup missing:
         put exact raw main payload at owner:slot:backup:v2
       put validated v3 at owner:slot
       transaction commit
```

- `IndexedDbSaveRecord.game` 在存储边界改为 `unknown`；只有主记录通过 `decodeStoredGame` 后才能离开 adapter。
- backup 保留原始 v2 envelope，不调用 v3 decoder 后再序列化，避免丢失恢复证据。
- 两个 get request 在 transaction 内立即发出；只有都成功后同步排队 put，防止 await 导致 transaction inactive。
- backup key 不进入 SaveRepository port。显式 delete 在同一 transaction 删除 main 与 backup。

## Release topology

```text
codex/life-loop-release-checkpoint
  -> verified commits
  -> isolated worktree at latest origin/main
  -> cherry-pick Life Loop + release commits only
  -> push main
  -> existing Deploy Mirror Island workflow
  -> production two-profile acceptance
  -> checkpoint evidence commit
  -> annotated tag life-loop-v1
```

- 不 merge feature branch 历史，因为 main 已包含等价 OIDC/World Foundation cherry-picks；只移植 Life Loop 之后的独立提交。
- 自动部署继续使用现有生产备份/健康检查，不修改数据库拓扑。
- tag 只在两类人工验收通过后创建；它指向包含最终 checkpoint 证据的 main commit。

## Recovery

- v3 客户端失败但 transaction 未提交：主记录仍是 v2。
- v3 transaction 已提交：主 key 是 v3，backup key 保留首次 v2。
- 若需恢复，必须通过单独 forward-fix 版本读取 backup；本版本不增加用户可见恢复按钮或自动降级。
- 用户显式删除 slot 时，main 与 backup 一并删除；不保留违反删除意图的隐藏数据。

## Expedition planning boundary

下一任务只允许 PRD/design 描述以下原型，不在本发布任务创建代码：

- 静态入口 → 区域 A → 安全撤离点 → 风险区域 B；
- A 提供第一批可售 30g 左右的 Cargo，B 提供精英、稀有灵兽、一个三选一事件和高价值箱；
- Home Inventory 永久安全，Expedition Cargo 只在撤离时一次 commit，失败 discard；
- 捕获为低血量 + 灵契动作 + 首只必定成功，撤离后必须在家园产生可见反馈；
- 两个敌人行为原型，精英只复用并强化，不建立 Enemy Framework；
- 连玩 3～5 局后按“是否产生贪心犹豫与再开一局欲望”决定是否继续。
