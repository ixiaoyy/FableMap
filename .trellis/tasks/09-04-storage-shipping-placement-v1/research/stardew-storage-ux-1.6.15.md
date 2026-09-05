# Stardew storage and inventory UX reference

核对日期：2026-09-04。参考稳定版：PC 1.6.15。

来源：[Inventory](https://stardewvalleywiki.com/Inventory)、[Pierre's General Store](https://stardewvalleywiki.com/Pierre%27s_General_Store)、[Chest](https://stardewvalleywiki.com/Chest)、[Crafting](https://stardewvalleywiki.com/Crafting)、[Workbench](https://stardewvalleywiki.com/Workbench)、[Shipping](https://stardewvalleywiki.com/Shipping)、[Controls](https://stardewvalleywiki.com/Controls)、[Day Cycle](https://stardewvalleywiki.com/Day_Cycle)。

## Inventory and upgrades

- 背包按 12 格一行。新档只有第一行；第一次升级 2,000g 解锁 24 格，第二次升级 10,000g 解锁 36 格。
- 2,000g 升级从开局可买；10,000g 升级只在第一次升级后出现。两者由杂货店柜台右侧独立陈列点提供，不在普通商品列表；全部购买后陈列标识消失。
- 世界中始终只有一行 12 格 Hotbar。PC 数字键/滚轮只选择当前行；`Tab`/`Ctrl+Tab`轮换可用行。完整背包菜单显示所有已解锁行。
- 背包支持槽位移动、同物合并、右键取一个和 `Shift+右键`取半组；自动整理不改变工具顺序。

## Chest and crafting

- 打开普通箱时同时显示 36 格箱体和完整背包；单人游戏中箱子、背包和制作菜单暂停时间并阻断世界输入。
- 箱子提供放入已有堆叠和整理两个批量动作；前者只移动箱内已经存在同类堆叠的背包物品。
- 普通箱可随时免费选择 20 种颜色或默认棕色，颜色随箱子 identity 持久化；原作普通箱没有命名能力。
- 基础制作位于随处可开的玩家暂停菜单，不依赖工作台；只读取玩家背包。Workbench 的邻接箱取料是独立后续机制，不能混入基础制作。
- 已知且材料足够的配方正常显示，缺料变灰并明确标红缺失材料。PC 可制作 1、5、25 个；产物先进入菜单持有状态，再由玩家放入背包。配方过多时分页。

## Shipping and settlement

- 出货箱有两条等价入口：打开箱盖后从完整背包选择，或世界中手持物品直接对箱体使用。玩家靠近时箱盖打开，投入有动画与声音反馈。
- 再次打开只显示全局最后一次投入的完整物品/stack；点击后完整取回，不展示全部待售队列。
- 隔夜报告按原作类别显示摘要，并可展开每项数量、单价、小计、类别总计和总收入；玩家确认后才离开报告。

## Platform mapping

- PC 原作有键盘/鼠标与手柄入口；触摸设备应提供相同语义的显式按钮，不把 PC 快捷键硬套到移动端。
- 当前镜像岛尚未建立手柄输入合同，用户已确认本 child 暂不新增手柄。鼠标、键盘和触摸仍必须覆盖整组/单件/半组、整理、制作、出货取回和关闭面板。
