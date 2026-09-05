# NPC 日程移动 MVP：实施计划

## 1. Dependency and path adapter

1. 精确安装 npm 实际发布的 `easystarjs@0.4.4`，核对导出、内置类型与同步计算模式。
2. 在 `OPEN_SOURCE_ADOPTION.md` 登记版本、MIT 许可证与窄集成边界。
3. 新增 Collision grid 路径适配器和世界坐标转换/共线简化。

## 2. Domain runtime

1. 新增 `NpcMotionRuntime` 及只读 projection 类型。
2. 实现 schedule reset、同区 walking、跨区 transfer、无路径 fallback 和 pause-aware advance。
3. GameSession 在 new/continue/sleep/tick 生命周期接入 runtime，并公开统一查询方法。
4. movement 和 ShopSystem 改为消费 GameSession 提供的当前 NPC projection。

## 3. Phaser presentation

1. WorldScene 每帧读取当前 region projections，不再直接按 minute 解析 schedule。
2. NpcEntity 改为原位 project position/opacity/depth/metadata，保持点击和 hit target 使用当前 runtime position。
3. 处理 hit reaction 与 runtime 移动并发，确保反应结束回到最新路线位置。

## 4. Roadmap and focused contract

1. 增加一个窄 Town runtime 合同：同区路径、跨区唯一投影、pause、无路径 fallback、华强营业切换。
2. 完成后勾选 `docs/TOWN_ROADMAP.md` 的同区行走和跨区提示两项；动态避让及后续项保持未完成。

## 5. Minimal validation

```powershell
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

只在最终改动后运行这一轮，不连接数据库、不运行身份测试或全量 E2E。

## Risk points

- EasyStar 的回调计算必须被适配为当前同步 domain 命令可安全消费的结果；若包行为不满足，停止并重新评审，不把异步竞态塞入 tick。
- movement、ShopSystem 和 WorldScene 必须一次性切换到 runtime projection，禁止残留按 minute 读取终点造成位置分叉。
- NpcEntity hit tween 不得覆盖 runtime 最新位置。
