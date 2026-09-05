# 地表采矿与镰刀 v1：验证记录

日期：2026-09-04。状态：生产代码已实现；自动检查与一条隔离浏览器路线通过，完整真人手感仍待用户确认。

## 实现范围

- current GameState/StoredGame 为 v12，只接受完整 current save；v1–v11 migration 与 v2/v9 IndexedDB backup 创建路径不存在。
- 新游戏第四/第五槽为基础镐/基础镰刀；石料与植物纤维均为 99 堆叠的低价值资源，售价分别为 2g/1g。
- 七个 formal stone resource 可采：Farm 1、Foothills 4、Lakeshore 2；一次镐击消耗 2 体力并获得 1 石料。
- Farm/Lakeshore cleared 永久保存；Foothills 每个新日确定性恢复最多两个，`lastSurfaceStoneRefreshDay` 保证同日幂等。
- formal weed resource 为 Farm 6、Foothills 5、Lakeshore 4；一次 Facing 挥割最多清除三株、体力不变，每株按 seed/day/stable ID 固定 50% 植物纤维。
- Weed 每日按 Farm/Foothills/Lakeshore 最多 1/2/1 确定性恢复，跳过已有农田；独立 marker 保证同日幂等。
- RockEntity/WeedEntity、ActionTimeline、GARDENS `(6,1)` 镐帧、源码镰刀/石料/纤维图标和既有 stone/harvest SFX 已接入；没有新地图、新依赖或媒体对象。

## 自动检查

- `npm --prefix .\apps\mirror-island run test:life-loop`：19/19 通过，新增覆盖 6/5/4 地图数量、三株扇区、零体力、固定 fiber、背包失败原子性、v12、1/2/1 日结和 GameSession 一次保存。
- `npm --prefix .\apps\mirror-island run test:town-population`：13/13 通过，包含基础镐/镰刀 Hotbar 选择与 `mined -> stone`、`cut -> harvest` cue。
- `npm --prefix .\apps\mirror-island run typecheck`：通过；pretypecheck 只生成 Prisma 类型，没有连接数据库。
- `npm --prefix .\apps\mirror-island run build:client`：通过，140 modules；保留既有 Phaser 主包大于 500KB 提示，本任务不扩展分包。
- 三张 TMJ JSON/对象 ID/nextobjectid/Collision/Water/矩形重叠检查通过；weed 数量为 6/5/4。镰刀/纤维源码像素图均为 16×16，tracked media binary changes 为 0，`git diff --check` 通过。

## 隔离浏览器路线

- 使用生产构建预览与全新 `http://localhost:8086/` origin，正常点击“开始新旅”并创建 Day 1 农场。
- 390×844 手机视口显示第四槽“基础镐”及触摸方向/操作按钮；镐帧、手持姿态清晰。
- 通过正常触摸移动到 Tiled `farm-rock-001`，选中镐并点击：控件在动作期间锁定，体力 100→98，石块消失，背包第五槽新增石料图标。
- 刷新并点击“继续上次”后，体力仍为 98、石料仍在、原石块仍为 cleared；console error/warning 为 `[]`。
- 使用 production preview 的全新 `http://127.0.0.1:8087/` origin 验收镰刀扩展：390×844 显示第五槽“基础镰刀”、方向键和动作键。
- 通过触控方向键走到 Farm 杂草前，动作键成功反馈“割下 1 处杂草，+1 植物纤维”；体力始终 100/100，动作期间控件锁定、结束后恢复，杂草消失且纤维进入第六槽。
- 刷新并“继续上次”后，已清杂草仍消失、第五槽镰刀和第六槽纤维均保持；console error/warning 为 `[]`。
- 临时手机 viewport 已恢复默认；预览服务已停止。浏览器操作没有读取或修改 IndexedDB 内部记录。

## 尚待真人确认

- 九种外观、键盘 C、鼠标直点和真实触摸的挥镐/挥镰握点与声音手感。
- Foothills/Lakeshore 的完整实际行走路线，以及睡眠后 stone 0～2、weed 1/2/1 恢复的主观节奏和农田不覆盖。
- 200% 浏览器缩放下的动作与图标辨识度。

## 边界

没有矿洞、铜矿/冶炼、干草/筒仓、动物、作物镰刀收获、敌人、战斗、技能、工具升级、数据库或共建面板实现。父任务 `09-04-town-community-ledger-v1` 继续保持 planning。
