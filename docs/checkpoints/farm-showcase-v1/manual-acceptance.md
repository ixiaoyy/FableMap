# Farm Showcase 真实人工验收

## Why manual

decoder、build 和 GameSession route replay 不能证明实际键盘手感、镜头、遮挡和碰撞体验。Codex 内置浏览器在 Keycloak `localhost:8081` 跳转处被 Browser URL policy 阻止；禁止用代理、绕过登录或替代浏览器规避该限制。

本清单必须由用户在真实浏览器和现有登录环境中执行。

优先验收生产入口：

```text
https://fable.pingxingxian.space/
```

本地回归仍可使用下列 Start 命令；正式 profile 不再需要 `?art=vectoraith`。

## Start

```powershell
npm --prefix .\apps\mirror-island run dev:client
```

打开：

```text
http://127.0.0.1:8080/?debug=1
```

使用现有 Keycloak 账号登录，选择“新游戏”或明确知道存档状态时选择“继续游戏”。不要连接数据库、清空 IndexedDB 或覆盖未知存档来制造验收条件。

## Checklist

- [ ] 出生点：第一眼能识别小屋、水塘、院落、农田与 Town 方向；角色没有被建筑或 UI 遮挡。
- [ ] 小屋前碰撞：能绕小屋和门前院落行走；不能穿墙；门口不黏墙、不抖动。
- [ ] 池塘边缘：沿岸完整走一圈；水岸不误放行，脚底不会在合法岸边卡住。
- [ ] 树冠遮挡：从路边粉色地标树及普通树冠旁经过；上半身被树冠遮挡、脚部关系自然，离开后恢复。
- [ ] 农田路径：能从院落进入 7×5 农田周围；栅栏、干草和作物表现不挡合法操作位。
- [ ] 桥面通行：从西桥头走到东桥头再返回；不能落水，桥头不会卡脚或触发异常绕行。
- [ ] 进屋：从小屋门口进入 Cottage；淡入淡出只触发一次。
- [ ] 出屋：从 Cottage 返回 Farm；出生位置安全，不立即重复触发门。
- [ ] Farm→Town：沿弯曲道路穿过林缘到东侧出口；引导自然，出口只触发一次并到达 Town 西侧 spawn。
- [ ] 砍树：选择一棵既有资源树完成一次 ActionTimeline；只结算一次，树冠/树桩和 Hotbar 反馈正确。
- [ ] 控制台：完整路线无 error；warning 逐条记录，不能把未检查项写成通过。

## Evidence record

| 项目 | 结果 | 备注/截图路径 |
|---|---|---|
| 日期与浏览器 | pending | |
| 登录 subject 是否为预期账号 | pending | 不记录原始 subject/token |
| 出生与小屋 | pending | |
| 池塘 | pending | |
| 树冠 | pending | |
| 农田 | pending | |
| 桥面 | pending | |
| 进屋/出屋 | pending | |
| Farm→Town | pending | |
| 砍树 | pending | |
| Console | pending | |

全部通过前，World Foundation 不得标记完成；`Stardew Life Loop 第一批` 可以保持 planning，但不得开始实现。
