# 升级、背包与委托 UI：执行计划

1. 扩展 game-store modal/dialogue projection，保持所有 open/close/helper 方法级注释。
2. WorldScene 向 `setDialogue` 传 npcId，并将 town notice board 精确路由到 RequestBoardPanel。
3. 新增 BackpackPanel，使用现有 item icon/definition，显示完整 24/32 槽与 Hotbar 标记。
4. DialoguePanel 增加昊天 Day3 Lv2 服务区；ShopPanel 增加华强 Day5 32-slot 服务区。
5. 新增 RequestBoardPanel，以 domain request/NPC/dialogue/item catalog 派生文案和持有量。
6. App 挂载两面板并补全 feedback modal flag；样式只追加游戏 HUD/modal 规则，不改首页。
7. 更新 town contract：modal lock、24/32 projection、upgrade dispatch surface、request states。
8. 运行 `test:town-population`、`test:life-loop`、typecheck、build:client；真人负责视觉/触摸/zoom。

风险：upgrade UI 不得直接扣资源；RequestPanel 不得重新计算当日 ID；Shop/Dialogue 打开期间只允许它们自身的服务按钮发送对应 command。

## Validation record — 2026-09-01

- `2c660141 feat: add progression and request surfaces`：11 files。
- BackpackPanel 渲染完整 24/32 snapshot，前八格标记快捷栏；无拖拽/排序/本地 mutation。
- 昊天 Day3 服务只 dispatch `upgrade-watering-can`；华强 Day5 服务只 dispatch `upgrade-backpack`，价格从 domain constants 导入。
- `town-notice-board` 精确路由 RequestBoardPanel，显示未开放/材料不足/材料齐/已完成；没有接受、刷新或领奖按钮。
- Town/Audio 合同 10/10；typecheck、build:client 通过，保留既有 bundle warning。
- App 当前不再出现制作入口或“采集、制作、种田”承诺；底层 CraftingSystem/command 未删除。
- 真人视觉、触摸与 200% zoom 由用户安排，不阻塞代码交付。
