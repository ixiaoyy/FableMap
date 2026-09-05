# Day 1–7 留存纵向切片 checkpoint

记录日期：2026-09-01

实现提交：`85b7b629`（`feat: add first-week pacing and mirror teaser`）

静态验证基线：`7460a7d395b079f306865f9d605372ac717198aa`

## Status

- 静态集成：通过。
- 真人浏览器、听音、视觉、手感、手机、200% zoom、console、Day 1–7 与 Day 28→29：用户于 2026-09-01 明确确认通过。
- 生产部署：通过；东方首页、15 张图片与 19 个音频对象已通过严格媒体账本/CDN 校验。数据库和身份服务未因本 checkpoint 连接或修改。
- 当前没有从静态证据发现 P0/P1；Vite 主包超过 500 kB 的既有提示保留为非阻塞工程项。

本 checkpoint 现冻结为 Day 1–7 真人通过基线。真人清单与通过来源见 [human-acceptance.md](human-acceptance.md)。

## Frozen slice

- 浏览器真实 SFX/环境声、Master/Music/SFX 本地设置；本阶段没有音乐曲目。
- StoredGame/GameState v8：24→32 背包、水壶 Lv1→Lv2、每日确定性委托、关系对话 history、once-only events、Day N 无上限日历。
- Day2 委托板，Day3 水壶目标，Day4 熟悉关系反馈，Day5 背包目标，Day6 高投入委托，Day7 湖岸镜门预告。
- 八名居民三日对话去重、委托感谢、关系阶段台词，以及华强/昊天正确工作地点的两心短事件。
- Day7 石标只有代码绘制微光与三句 inspect 叙事；没有出口、传送、战斗、敌人、掉落、Cargo、捕获或 Expedition 状态。

## Final static evidence

在静态验证基线运行：

- `npm --prefix .\apps\mirror-island run test:life-loop`：15/15 通过。
- `npm --prefix .\apps\mirror-island run test:town-population`：10/10 通过。
- `npm --prefix .\apps\mirror-island run typecheck`：通过。
- `npm --prefix .\apps\mirror-island run build:client`：通过；104 modules，JS 约 1,622.20 kB / gzip 440.67 kB，CSS 约 47.45 kB / gzip 11.10 kB。
- 当前 client/gameplay UI 已无 `calendarAt(...)` 调用；Day28→29 合同、v8 milestone 保存、Day6 固定委托和 Day7 对话均有窄断言。
- 从开发前基线到当前提交，`apps/mirror-island` 没有新增 Git 跟踪的 PNG/JPG/WebP/GIF/OGG/MP3/WAV/FLAC 二进制。

## First-week economy reachability

静态规则证明一条正常积极路线最迟 Day5 可完成水壶升级：

1. Day1 砍 8 棵 Farm 树得到 24 木材；买 2 粒萝卜种子花 40g并种下。
2. 只完成 Day2 的 6 木材委托，保留 18 木材；Day4/Day6 木材委托允许放弃，不存在失败惩罚。
3. Day1–5 收集所有当日确定性采集物；Day3 留 2 朵野花交委托，其余卖出。
4. Day1–4 每天浇两株萝卜，Day5 把两份萝卜交给阿禾。
5. 按固定生成与价格计算，Day5 交付后为 1215g / 18 木材，可购买 900g+15 木材的水壶 Lv2，剩余 315g / 3 木材。

这证明数值上可达；路线是否过于奔波、目标是否清晰，仍以真人 Day1–7 反馈为准。

## Human evidence policy

- 通过来源：用户在完成真人路线后于 2026-09-01 明确回复“真人通过”；没有补录 IndexedDB 原文、浏览器 profile、token 或其他隐私数据。
- 清单按该明确确认冻结为通过；不虚构逐项截图、设备型号、数值或对话日志。
- 后续若出现 P0/P1，仍附最短稳定复现步骤并只做确定性窄修，再重跑受影响的最小检查。
