# 镜像岛 Day 1–7 开发前静态基线

记录日期：2026-09-01  
分支：`codex/tool-interaction-mvp`  
提交基线：`5984ed67498c468ca09a2235ce9a301fa34ffdc5`

## Purpose

本 checkpoint 标记 Day 1–7 留存切片开始前的可编译、可测试代码基线。用户已明确把真实浏览器游玩、听音、手机、200% zoom 和手感验收交由真人负责，因此本记录不宣称这些人工项目已经通过，也不以它们阻塞后续开发。

## Fresh static evidence

2026-09-01 在当前工作区运行：

- `npm --prefix .\apps\mirror-island run test:life-loop`：11/11 通过。
- `npm --prefix .\apps\mirror-island run test:town-population`：6/6 通过。
- `npm --prefix .\apps\mirror-island run typecheck`：通过。
- `npm --prefix .\apps\mirror-island run build:client`：通过；保留既有主包超过 500 kB 的非阻塞提示，产物 JS 约 1,583.32 kB、gzip 约 428.27 kB。

未连接任何数据库，未运行服务端、Prisma 或 Compose 验证，因为当前门禁没有修改这些边界。

## Human acceptance handoff

真人继续使用 [`docs/CURRENT_SLICE_POLISH_GATE.md`](../../CURRENT_SLICE_POLISH_GATE.md) 检查：

- 新游戏/继续/刷新与错误恢复；
- Farm、Town、十个室内/扩展区域的入口、碰撞、遮挡、出生点和看板；
- 八名 NPC 的四时段日程、活动、避让、交谈、好感与家庭文本；
- 工具、采集、睡觉、交易、对话、Social、Calendar 和输入锁；
- 桌面、手机、200% zoom、键盘、鼠标和触摸；
- 夜间可读性、完整路线和 console。

未获得真人证据的清单项保持未勾选。真人反馈必须包含地图/时间、视口、操作路径、实际结果和期望结果，再按确定性 P0/P1 窄修。

## Dirty-worktree boundary

checkpoint 记录的权威代码基线是上述 commit，不把未提交工作区自动视为 checkpoint 内容。记录时存在并行的首页重设计改动，至少覆盖：

- `apps/mirror-island/client/src/App.vue`
- `apps/mirror-island/client/src/style.css`
- `apps/mirror-island/client/src/game/assets/media-catalog.ts`
- `apps/mirror-island/scripts/prepare-media.mjs`
- `deploy/cdn/game-media-manifest.json`
- 对应媒体发布 workflow、来源记录和产品文档

这些改动属于并行任务，后续声音批次必须基于其当前内容做精确增量合并；不得整文件 restore、覆盖或把它们误归为本 checkpoint 成果。
