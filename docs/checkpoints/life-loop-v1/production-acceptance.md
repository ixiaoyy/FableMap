# Life Loop v1 生产验收

> 历史基线：以下“全新账号/已有账号”步骤记录当时生产发布条件，不是当前无账号试玩的现行验收流程。

生产入口：`https://fable.pingxingxian.space/`

## 公网健康

- [x] 首页、生产 bundle、Cottage TMJ 与 VectoRaith atlas 返回 200；四区域 catalog 已在 production image 合同中解码。
- [x] 生产 bundle 包含 Life Loop / v2 backup 代码，不包含 Ninja Farm profile。
- [x] Keycloak discovery 与论坛 OIDC discovery endpoint 正确。
- [x] GitHub Actions deploy 成功，生产 commit 与预期 main commit 一致。

## 全新账号

- [x] 使用没有镜像岛存档的全新账号登录；不记录 username/subject/token。
- [x] 新游戏显示 Day 1 / 100g，Hotbar 只有锄头和浇水壶。
- [x] 完成买种、种植、浇水、睡觉、成长、刷新继续的最小链路。
- [x] 重新登录后 owner 隔离正确，不出现其他账号存档。

## 已有 v2 存档账号

- [x] 发布前确认该账号在当前生产能够“继续游戏”；不导出或提交原始 payload。
- [x] 发布后继续游戏成功，region/position、Inventory、资源与 FarmPlot 状态可用。
- [x] migration defaults 为 Day 1 / 100g，alien seed/crop 映射为 turnip。
- [x] 首次 v3 保存、刷新与再次继续成功；未出现损坏/未来版本错误。
- [x] 完成一次买种或出售与一次睡觉，确认迁移后仍可继续生活循环。

## Evidence record

| 项目 | 结果 | 非敏感备注 |
|---|---|---|
| main commit | passed | 原部署 `7414986a71508f438ecda1c94da29562327a0f06`；rewritten 等价 `55360a6ccf746fbbcd35a28f7ac15818122d8d1b` |
| deploy run | passed | GitHub Actions `32827316974`；保留 rewrite 前 head SHA |
| 公网健康 | passed | bundle `index-BRQNlJwq.js`；Life Loop、backup、Cottage bed、Vecto、OIDC 正常 |
| 全新账号 | passed | 用户于 2026-08-26 确认；未记录身份或存档原文 |
| 已有 v2 账号 | passed | 用户于 2026-08-26 确认迁移、保存与继续游戏正常 |
| Town Gate C | passed | 用户于 2026-08-26 确认生产通行正常 |
| `life-loop-v1` tag | passed | rewritten target `cc4b6ff5fad37df0ebde500de1549b795f4b9087` |

历史于 2026-08-27 原地重写后，当前生产 `main=83410ca5ba5414f10d0d95ed6ea5cd57cc3fa95f`；文件树与重写前最终生产树保持一致，并已通过新的部署 run `33046402832`。
