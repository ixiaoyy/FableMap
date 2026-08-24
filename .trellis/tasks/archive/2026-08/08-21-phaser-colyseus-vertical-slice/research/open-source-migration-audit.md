# 开源代码迁移审计

## 固定来源

| 项目 | 固定提交 | 许可结论 | 用途 |
| --- | --- | --- | --- |
| Phaser Vue TS template | `2fe6c3e42a877422c0f13e85634fb6ca16fca49b` | MIT，Phaser Studio | 主工程生命周期和 Vite/Vue 结构 |
| Farming-Simulator-Cabacos | `79e423defc12bd99327cfcc28bf7ec0085996244` | 仓库声明 MIT，但 LICENSE holder 仍为 Phaser Studio，直接复制前需澄清 | 物品、背包、种田、输入、Tiled、Hotbar 行为参考 |
| Rick Survival | `ea9738ce922423d91b1ec51c21be8632bd3ea660` | 源码 MIT，素材/IP 不采用 | 后续战斗、对象池、波次和掉落参考 |

## Cabacos 分类

- `ItemData.ts`：迁为 shared 定义，删除纹理路径和翻译耦合。
- `InventoryService.ts`：迁为 server 权威系统，补未知物品、越界、负数和跨槽部分堆叠验证。
- `FarmingSystem.ts`：状态转换进 shared/server；指针命中、高亮和精灵只留 client。
- `TimeService`/`EnergyService`/`WateringCanService`：纯规则可参考，服务端拥有；首阶段只采用必要部分。
- `GameInput.ts`：机械迁到 Phaser 4，但输出意图而不是修改玩家状态。
- `Player.ts`/`GameWorld.ts`：只采用表现、Tiled 图层和碰撞加载模式。
- `InventoryUi.ts`/`InventorySlotView.ts`：保留交互语义，Vue 重写，不复制 Phaser GameObjects UI。
- `SaveService.ts`、菜单/商店 Scene、TMJ/PNG/MP3：不采用。

## Rick Survival 分类

- `weaponConstants.ts`：后续提炼通用武器字段，删除名称/纹理/平衡数据。
- `Bullet.ts`/`AmmoGroup.ts`：只参考客户端对象池，服务端拥有弹道、命中和伤害。
- 33 个武器薄子类与巨型 switch：不采用，改为数据驱动 factory。
- `Enemy.ts`/`EnemyGroup.ts`：只参考动画、出生环和对象池；AI/生命/掉落服务端重写。
- `Wave`/`WaveAction`：后续可提炼 shared 数据；`WaveGenerator` 服务端重写。
- `WeightedRandomBag`：后续可迁，但必须注入可复现 RNG 并处理空集合。
- World generator、Snowpack、Electron、网站、Rick/怪物/声音/图片：不采用。

## 当前阶段结论

- 首个纵向切片优先迁 Cabacos 规则，不进入 Rick 战斗。
- 复用比例按系统/行为计算约 40%，按可逐行复制代码计算更低；主要收益是避免重新设计数据结构、状态转换和交互语义。
- 所有新规则从第一天服从 `shared contract -> server mutation -> client projection`，不先复制客户端状态再二次重构。
