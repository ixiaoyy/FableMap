# FableMap 当前任务清单（项目管理版）

## 目标判断

基于当前仓库文档与任务表，FableMap 现阶段最重要的主线已经不是继续堆地图表现层，而是完成“玩家写回世界”的最小闭环。

当前最核心的推进顺序应为：

1. 统一世界写回协议
2. 打通最小写回闭环
3. 补齐可见性与治理边界
4. 再进入历史深度、社区化与长期世界事件

---

## 一、当前进行中

### 1. P5 · World Writeback Protocol v0.1
**状态：in_progress**

目标：统一玩家行为如何进入事件流，并让世界切片第一次具备可持续写回能力。

当前重点：
- 定义 `observe / dwell / mark` 三种最小行为
- 统一 `event / target / effect / visibility` 结构
- 打通 API、持久化与前端动作入口
- 验证同一 slice 再次进入时仍能看到写回痕迹

### 2. D3 · 玩家参与感与城市神话共创主线收束
**状态：in_progress**

目标：把“玩家如何参与城市神话共创”整理成更明确的产品主线与展示入口，为后续写回协议提供叙事承接层。

当前重点：
- 收束已有共创数据块、入口面板与叙事线索
- 明确玩家参与路径与世界反馈关系
- 为后续社区化与地点共创能力提供产品层接口

---

## 二、本周待做

### P0：主线补位

#### Map Assets 主线补位（M1）

1. 将 [`docs/MAP_ASSETS_PLAN.md`](docs/MAP_ASSETS_PLAN.md)、[`docs/MAP_ASSETS_GENERATION_GUIDE.md`](docs/MAP_ASSETS_GENERATION_GUIDE.md) 与 [`scripts/generate_map_assets.py`](scripts/generate_map_assets.py) 收束为统一主线入口
2. 明确 Pack A / Pack B 的 scene、icons、tiles 输出规范与命名约定
3. 为后续 [`M2`](docs/AI_SHARED_TASKLIST.md:53) 资源生成与 [`M3`](docs/AI_SHARED_TASKLIST.md:54) 验收 / 前端接入建立任务边界，避免协作重叠

#### Map Assets 资源生成与落盘（M2）

1. 以 [`scripts/generate_map_assets.py`](scripts/generate_map_assets.py) 为批量生成入口，校准 Pack A / Pack B 的 prompts、输出路径与命名一致性
2. 对齐 [`docs/MAP_ASSETS_GENERATION_GUIDE.md`](docs/MAP_ASSETS_GENERATION_GUIDE.md) 与 [`docs/LOCAL_GPU_MAP_ASSETS_GUIDE.md`](docs/LOCAL_GPU_MAP_ASSETS_GUIDE.md) 的执行说明，明确 API 路径与本地 GPU 路径
3. 将生成结果稳定落盘到 [`fablemap/demo_assets/new_map_assets/`](fablemap/demo_assets/new_map_assets/)，为后续 [`M3`](docs/AI_SHARED_TASKLIST.md:54) 验收与前端接入提供可检查资产

### P0：必须优先完成

#### 技术方向监控（新增）

1. **AI 技术实况跟踪**：定期了解最新 AI 研究进展（Genie 3、Sora、世界模型等）
2. **各大厂 AI 方向分析**：跟踪 Google DeepMind、OpenAI、Anthropic 等的研究方向
3. **技术路线验证**：确保 FableMap 的技术选型不会被快速替代，及时调整架构方向
4. **竞品与趋势分析**：识别可能影响项目价值的技术突破，提前规划应对策略

#### 世界写回协议闭环

5. 完成 `WORLD_WRITEBACK_PROTOCOL.md` 的收束与确认
6. 定义 `observe / dwell / mark` 的统一事件结构
7. 实现最小事件接口：`POST /api/world/event`
8. 实现最小文件级持久化，至少保存：
   - player state
   - slice state
   - place marks
   - recent echoes
9. 前端接入三种动作：
   - observe
   - dwell
   - mark
10. 在 UI 中显示状态变化结果，而不只是一次性提示
11. 验证”重新进入同一 slice 后写回结果仍存在”

### P0.5：紧跟其后

8. 推进 P3 写回权限与治理边界
9. 定义 `private / local_public / global`
10. 明确默认 visibility 与最小 AI 改写边界

---

## 三、待排期

### 社区化与共创层

1. E1 · 都市精灵共同发现、互助与交换生态
2. E2 · 公共地标修复任务与城市荣誉榜
3. E3 · 玩家命名权、地点传说与地点气质演化
4. E4 · 玩家据点、幽灵回放与城市身份系统

### 历史深度层

5. P4 · 历史深度 / 尘封之眼 / Time Folds 协议 v0.1

说明：以上任务都应建立在 P5 + P3 已成立的基础上再推进，否则容易变成无统一协议支撑的表现层扩张。

---

## 四、长期项

1. F1 · 审美宪法投票与社区转义规则治理
2. F2 · 现实行为输入与人为扰动接口
3. F3 · 地理脚本注入与创作者权限模型
4. G1 · 异世界电台与音景叙事层
5. G2 · 城市觉醒事件、世界 Boss 与阵营战争长期路线

---

## 五、当前依赖关系与阻塞判断

当前依赖关系非常明确：

- `E1 ~ E4` 依赖 `P5 + P3`
- `P4` 依赖 `P5 + P3`
- 长期社区能力、历史沉淀与大型世界事件，都依赖最小写回闭环先跑通

因此当前真正的瓶颈不是地图还能不能更炫，而是：

- 玩家行为能否进入统一事件流
- 地点状态能否被稳定写回
- 世界是否会记住玩家做过什么
- 这些变化下次回来是否仍然存在

---

## 六、已完成、暂不作为当前追逐重点

### Web-2D 主舞台
- W1
- W1a
- W2
- W3

### 视觉转义层
- V1
- V2
- V3

### 参与感基础层
- C1
- C2
- C3

### 世界入口深化
- D1
- D2

结论：地图骨架、2D 主舞台、视觉转义、移动、缩放、回声、家园等前置层已经具备较强基础。当前最需要补的是“演化能力”，不是继续堆叠表现层。

---

## 七、建议的当前主线

现阶段建议团队只盯住一条核心主线：

**P5 → P3**

展开为：

1. 先完成写回协议
2. 再打通最小写回闭环
3. 再补治理边界
4. 然后才进入社区化、历史深度与长期世界事件

---

## 八、短期执行口号

> 先让玩家第一次真正写回世界，并且下次回来还能看到它还记得。