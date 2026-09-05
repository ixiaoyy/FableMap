# Day 1-7 节奏与镜门预告：执行计划

1. 添加窄首周 milestone domain system 与 `acknowledge-retention-event` command，覆盖日期门槛、unknown/two-heart ID、重复确认和保存恢复。
2. 添加 `TodayHint.vue`，接入 App，交付 Day1–7 目标文案和 Day3/5/7 自动一次性反馈；Day4 文案必须读取真实关系阶段。
3. 把 LifeHud/CalendarPanel 改为无上限 Day N 外显与 28 天滚动页，删除“春季结束”承诺。
4. 为 Lakeshore waystone 增加 Day7+ 代码绘制镜面微光，并让 inspect 对话按 day 返回短叙事；不增加出口或新状态。
5. 更新 life-loop/town 窄合同，运行 `test:life-loop`、`test:town-population`、`typecheck`、`build:client` 与 scoped `git diff --check`。
6. 真人后续从新游戏玩到 Day7，检查提示时机、文本、镜光体感与 Day29 UI；Agent 不启动浏览器或代签人工验收。

## Risk and Rollback Points

- 自动提示只能在 `phase=playing` 触发，必须由 seen ID 幂等，避免 watcher 重入和刷新刷屏。
- 镜光销毁时必须停止 tween，避免切区后残留 scene object。
- `calendarAt` 可以保留为未来工具，但当前 gameplay/UI 不得继续依赖其 season/dayOfSeason。
