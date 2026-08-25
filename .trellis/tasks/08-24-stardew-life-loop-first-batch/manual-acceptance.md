# Stardew Life Loop 第一批人工验收

## 已验证

- 2026-08-25 Chrome 通过现有论坛会话登录本地 `http://127.0.0.1:5173/?debug=1`。
- “新游戏”实际进入正式 Farm，HUD 显示 `Day 1 / 100g`。
- 初始 Hotbar 只有锄头和浇水壶，没有赠送萝卜种子。
- 首次完整加载时 Farm/VectoRaith 画布、HUD 与 IndexedDB 新存档均正常；浏览器控制台未发现 error/warning。开发中 HMR 重载 GameSession 文件会要求整页刷新，不作为生产运行结论。
- 自动合同已走通完整买种、三次浇水睡觉、收获、出售、再购买，并验证正式四区域 catalog 与 `cottage-bed`。

## 仍需真人完整游玩

- [ ] 从 Farm 进入 Town 与 Seed Shop，靠近 Seed Keeper 按 E 打开 ShopPanel。
- [ ] ShopPanel 显示 100g、萝卜种子 20g、萝卜出售 35g。
- [ ] ShopPanel 打开时 WASD/方向键、点击农田/树和 Debug Move 都不能移动或触发世界动作；关闭后恢复。
- [ ] 购买 1 粒种子后 Gold=80g、背包增加 1 粒；金币不足/背包满不产生半完成交易。
- [ ] 返回 Farm，完成锄地、播种、浇水；同日再次浇水不重复成长。
- [ ] 进入 Cottage，确认 code-drawn bed 清晰可见，靠近按 E 只推进一天并回到 Cottage 安全位置。
- [ ] 重复三次有效浇水+睡觉后作物 mature；未浇水睡觉只推进 Day、不成长。
- [ ] 收获 1 个萝卜，在 Seed Shop 出售后 Gold 增加 35g，再次购买成功。
- [ ] 刷新后选择“继续游戏”，day、gold、背包、作物与 region/position 一致。
- [ ] 完整路线 Console 无 error；现有 bundle >500kB build warning 不计为运行时错误。

完整清单未由用户确认前，本任务保持 `in_progress`，不得创建或实施 Expedition Prototype。
