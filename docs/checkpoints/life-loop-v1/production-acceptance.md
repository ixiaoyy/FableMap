# Life Loop v1 生产验收

生产入口：`https://fable.pingxingxian.space/`

## 公网健康

- [ ] 首页、生产 bundle、四区域 TMJ 与 VectoRaith atlas 返回 200。
- [ ] 生产 bundle 包含 Life Loop / v2 backup 代码，不包含 Ninja Farm profile。
- [ ] Keycloak discovery 与论坛 OIDC discovery endpoint 正确。
- [ ] GitHub Actions deploy 成功，生产 commit 与预期 main commit 一致。

## 全新账号

- [ ] 使用没有镜像岛存档的全新账号登录；不记录 username/subject/token。
- [ ] 新游戏显示 Day 1 / 100g，Hotbar 只有锄头和浇水壶。
- [ ] 完成买种、种植、浇水、睡觉、成长、刷新继续的最小链路。
- [ ] 重新登录后 owner 隔离正确，不出现其他账号存档。

## 已有 v2 存档账号

- [ ] 发布前确认该账号在当前生产能够“继续游戏”；不导出或提交原始 payload。
- [ ] 发布后继续游戏成功，region/position、Inventory、资源与 FarmPlot 状态可用。
- [ ] migration defaults 为 Day 1 / 100g，alien seed/crop 映射为 turnip。
- [ ] 首次 v3 保存、刷新与再次继续成功；未出现损坏/未来版本错误。
- [ ] 完成一次买种或出售与一次睡觉，确认迁移后仍可继续生活循环。

## Evidence record

| 项目 | 结果 | 非敏感备注 |
|---|---|---|
| main commit | pending | |
| deploy run | pending | |
| 公网健康 | pending | |
| 全新账号 | pending | |
| 已有 v2 账号 | pending | |
| `life-loop-v1` tag | pending | 两类账号通过后创建 |
