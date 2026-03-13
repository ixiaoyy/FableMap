# 变更说明：玩家参与感与城市神话共创主线 D3

## 为什么改

此前浏览器 2D 世界地图已经具备观察、移动、视觉转义、扰动代理、记忆回声、播报系统与镜像家园等层级，但“玩家如何真正进入城市神话并参与共创”仍然缺少统一收口。

D3 这一轮不是直接做真实写回系统，而是先把共创主线整理成一个完整、可展示、可测试的中间层：

- 世界数据里有明确的共创结构
- showcase 里能读到城市神话阶段与可参与方式
- bundle 预览页里能看到神话线索与参与入口
- 测试里能稳定验证这些输出

这样后续无论接 `P3` 的写回治理，还是接 `E1`~`E4` 的轻社区方向，都有统一的数据与界面落点。

## 改了什么

### `fablemap/world_builder.py`

新增 / 收口 `world.co_creation` 共创数据块，包括：

- `city_myth_stage`
- `writing_rights`
- `participation_modes`
- `memory_policy`
- `open_threads`

其中把玩家参与先约束为三类可理解的最小入口：

1. `private_capsules`：私密情绪胶囊
2. `street_legends`：本地公开的街道传说
3. `repair_rituals`：全区可见的修复痕迹

这些模式同时带有：

- `visibility`
- `player_action`
- `capacity_hint`
- `status`

用于后续接入真正交互时延续同一语义。

### `fablemap/showcase.py`

在 showcase 输出中增加并整理：

- `co_creation_storyline`
- `mythline_threads`
- `participation_entries`

具体包括：

- 从 `world.co_creation` 抽取城市神话阶段、写回权限、参与模式、开放线程、记忆策略
- 基于 `POI`、`memory_anchors`、`historical_echoes` 生成更细粒度的 `mythline_threads`
- 基于 `sprites`、`secret_slot`、`memory_anchors` 生成 `participation_entries`
- 在 `playable_hooks` 中追加与共创模式相关的可玩钩子文案
- 在 markdown 导出中同步加入 Co-Creation、Mythline Threads、Participation Entries 章节

这让 D3 不再只是 world schema 中的字段存在，而是形成一条可阅读、可解释的叙事主线。

### `fablemap/bundle.py`

bundle 预览页继续向“2D 世界地图主舞台”推进，在地图侧栏接入：

- `sectionMythlineThreads`
- `sectionParticipationEntries`
- mythline / participation 对应 lead 文案
- 线程列表与参与入口列表 HTML 渲染

同时保留双语 i18n，使共创面板能作为地图体验中的稳定组成部分，而不是临时 debug 信息。

### `tests/test_showcase.py` / `tests/test_bundle.py`

新增断言覆盖：

- `co_creation_storyline.city_myth_stage`
- `participation_modes` 非空
- bundle manifest 中的 `city_myth_stage`
- bundle manifest 中的 `participation_mode_count`
- `mythline_threads` / `participation_entries` 的输出链路存在

## 影响范围

- `fablemap/world_builder.py`
- `fablemap/showcase.py`
- `fablemap/bundle.py`
- `tests/test_showcase.py`
- `tests/test_bundle.py`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-03-12-player-participation-mythline-d3.md`

## 没改什么

- 没有新增真实玩家写回接口
- 没有落地权限审核、封禁、moderation 流程
- 没有实现跨时间历史深层入口
- 没有修改 `P3` / `P4` 协议文档正文
- 没有引入第三方库

## 验证

当前仓库内已具备与 D3 对应的测试覆盖点，重点包括：

- `tests/test_showcase.py`：验证 `co_creation_storyline` 与参与模式输出
- `tests/test_bundle.py`：验证 bundle manifest 与展示链路中的共创字段

本轮文档收束后，建议以相关单测作为 D3 的最小回归基线。

## 设计注记

- D3 的核心不是“立刻让玩家写回世界”，而是先把写回前的叙事入口、参与模式与展示层统一起来。
- `writing_rights` 当前更多是前置语义占位，用来承接后续 `P3` 的治理协议，而不是立即开放的写权限实现。
- `mythline_threads` 与 `participation_entries` 的价值，在于把“世界有故事”推进到“玩家知道自己可以怎样进入故事”。
