# 农田自动化 v1

## Goal

建立洒水器、稻草人和基础肥料，让玩家用前期成长换取可见的农务效率提升，并复用同一有限摆放/日结合同。

## Background

- 当前水壶 Lv2 可一次浇三格，但没有自动浇水、鸟害、肥料或 placeable state。
- 本阶段依赖仓储/摆放、技能解锁、冶炼材料和四季规则已经稳定。

## Requirements

- 对齐参考基础洒水器：每天 06:00 自动浇四个正交相邻格；更高两级分别覆盖周围 8 格与 24 格，材料/技能门槛由对应 child 合同提供。
- 对齐参考稻草人：Farming Level 1 解锁，保护约 8 格半径的固定区域；乌鸦生成与损失公式必须在 child 研究后逐项记录，不自行“调成温和”。
- 基础肥料先实现参考中的作物品质影响；施用时点、概率与品质售价必须在 child design 中引用资料，不自创单一效果。
- 洒水器与稻草人共用已确认的小型 placeable 位置、冲突、移除和 current save 合同；肥料是 `farmTiles` 上的土壤状态，不进入 placeable 集合。

## Acceptance Criteria

- [ ] 玩家能解锁、制作、摆放并移除洒水器/稻草人，并能把肥料施到合法耕地；两类 placeable 与肥料 tile 状态跨日/刷新后保持。
- [ ] 洒水、保护和肥料效果只由 domain 在合法时点结算；重叠、雨天、保存失败和重复日结不叠加。
- [ ] 自动化明显减少重复劳动，但不能完全取消体力、时间和布局选择。

## Out of Scope

- 自动收获、无人化农场、温室、参考范围以外的肥料组合和全地图自动化。

## Reference Facts

- [Crafting / Sprinklers](https://stardewvalleywiki.com/Crafting)：三个洒水器等级每日分别覆盖 4、8、24 格。
- [Scarecrow](https://stardewvalleywiki.com/Scarecrow)：Farming Level 1 解锁，固定保护半径约 8 格。

