# PRD: NPC Simulation & Mirror World System (NPC 仿真与镜像世界系统)

## 1. 愿景
将 FableMap 打造为一个真实的数字镜像世界。在这个世界中，NPC 不再是静态的对话脚本，而是拥有独立主体性、生理需求、性格特质且能在不同坐标间自由流动的“数字居民”。

## 2. 核心功能模块

### 2.1 生理与心理状态机 (Sims-style Status)
每个 NPC 拥有以下动态属性（0-100）：
- **能量 (Energy)**：随时间下降，过低时需回锚点休息或找长椅。
- **饱腹度 (Hunger)**：过低时搜索带有 `food` 或 `konbini` 标签的酒馆。
- **水分 (Thirst)**：过低时搜索 `cafe` 或 `drink` 标签的酒馆。
- **心情 (Entertainment)**：随枯燥度下降，需去 `game` 或 `board-game` 标签的空间消遣。
- **社交需求 (Social)**：过低时倾向于进入人多的 `group-chat` 空间。

### 2.2 性格特质系统 (Personality Traits)
性格决定状态下降速率和地点偏好：
- **好吃鬼**：饱腹度下降快，更常出现在餐厅。
- **社交达人**：社交需求极高，会跨越长距离寻找人多的空间。
- **宅 (Loner)**：社交需求下降极慢，甚至社交过高会产生负面心情。

### 2.3 自主路径规划与移动 (Mobility)
- **寻找目标**：当状态值低于阈值（如 30），NPC 扫描全地图/周边坐标，寻找匹配标签的酒馆。
- **移动模拟**：NPC 从当前坐标“注销”，并在一段时间后（模拟步行时间）在目标坐标“登录”为访客。
- **跨空间对话**：NPC 进入新空间后，能利用“跨空间记忆”谈论上一个空间的见闻。

### 2.4 游客干预交互 (Human Interactivity)
- **礼赠系统**：游客可以赠送虚拟物品（水、食物、桌游券）来瞬间提升 NPC 状态。
- **陪玩/陪聊**：游客的互动可以满足 NPC 的社交和娱乐需求。

## 3. 技术实现要点 (Brainstorming)
- **Schema 扩展**：在 `CharacterModel` 中增加 `current_location_id` 和 `status_json`。
- **Tick 系统**：后端定时器每隔 5-15 分钟触发一次 `npc_update_tick`，计算状态变化。
- **记忆增强**：利用 `tavern_memory` 系统，记录 NPC 在不同空间的交互片段。

## 4. 阶段规划
- **Phase 1 (Infrastructure)**：扩展数据库字段，实现静态状态显示。
- **Phase 2- **自主移动 (Mobility)**: 需求驱动的寻路逻辑。
- **状态回升 (Recovery)**: 基于空间类型的状态补给（如在 Cafe 喝水，在 Home 休息）。
- **性格协同 (Synergy)**: 性格特质影响衰减与恢复速率。

### 3. 系统集成
- **后台 Worker**: 周期性执行仿真 Tick。
- **店主控制台**: 支持在角色编辑器中手动调整状态与特质。
- **前端监视器**: 角色列表展示五维状态条与恢复动画。

## 5. 未来演进路线 (Future Roadmap)
- **Phase 4 (Social Diffusion)**: 实现 NPC 间的跨空间八卦传递。当两个 NPC 相遇时，交换访客记忆片段。
- **Phase 5 (Mirror Economy)**: 引入简易物品栏，NPC 可在商店购买并消耗物品来恢复状态。
- **Phase 6 (Live World View)**: 在全局地图层展示所有 NPC 的实时位置与移动轨迹。
- **Phase 7 (Daily Routine)**: 引入 24 小时日程表，NPC 具备更明确的“工作-娱乐-休息”生活节奏。
- **Phase 8 (Event Response)**: 城市级事件（天气、节庆）对全城 NPC 状态的集体修正。
