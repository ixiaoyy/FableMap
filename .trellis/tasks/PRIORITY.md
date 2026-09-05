# 镜像岛任务优先级

最后对账：2026-09-06。当前分支 `codex/storage-shipping-v1`，基于本地 `main` / `16e7ee1`；实现与验收见 [CURRENT_STATE](../../docs/CURRENT_STATE.md)，详细执行顺序见 [开发计划](../../docs/DEVELOPMENT_PLAN.md)。active task 为 `09-04-storage-shipping-placement-v1`，只启动该 child。

1. **当前实施与验收**：`09-04-storage-shipping-placement-v1`（P1，in_progress）。用户已单独启动；v13 工作区接入背包 → 制作 → 占用 → 箱子 → 出货 → 木匠服务，当前完成最小验证与完整浏览器/真人路线验收。未宣称提交、合并或部署。
2. **已有验收尾项**：`09-04-surface-mining-v1`（P1，in_progress）。`15a7b61` 已提交并进入本地 main；补齐三图地表资源、再生、键鼠/触摸/200% zoom 真人反馈后归档。仓储启动不代替该项真人反馈，不重复提交已有实现。
3. **下一阶段与后续主线**：`09-04-skills-recipe-unlocks-v1` 是当前 child 收尾后的下一项，仍为 planning。`09-04-pre-pivot-life-sim-foundation`（P1，planning 父任务）管理十个 child：仓储 → 技能 → 浅矿/冶炼/工具 → 完整矿洞/战斗 → 四季 → 自动化 → 鸡舍草料 → 加工 → 烹饪 → 共建簿。父任务不直接承载代码，不批量启动 child。
4. **表现验收尾项**：`09-03-spring-art-polish-v1`、`09-03-shop-interiors-polish-v1`（P2）。均已提交进入本地 main；保留真人观感/手感反馈，部署本次未核验。
5. **独立运维尾项**：`08-21-forum-sso-compose-network`（P2）。保留生产论坛首次/再次登录人工验收，不阻塞本地玩法。

`09-02-spring-complete-v1` 已 completed，宠物任务按已有验收记录收尾。两个 `09-01` 镜门/远征任务被明确否决；即使历史状态字段仍为 planning，也不得恢复到执行队列。保留历史目录和引用，不在本次代签归档。
