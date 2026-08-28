# Town 世界元素扩展 v1

## Goal

在不建设工具升级、采矿、钓鱼或新经济的前提下，把当前 40×30 Town 从一张主街地图扩展成可探索的小型区域网络：玩家可以进入铁匠工坊和五栋民宅的公共起居区，并从 Town 前往北侧山麓与南侧湖岸；新区域复用现有移动、切图、砍树、NPC 对话和本地存档合同。

## Confirmed Facts

- 当前工作批次已经增加 Blacksmith、Town House、Foothills 与 Lakeshore；Town 仍只有一栋民宅入口，需要把其余四栋接入并重构五栋住宅的内屋边界。
- Town Gate A/B/C 的 40×30 主街、七栋建筑、河桥与生活 Props 已通过，不应通过整体重画或无目标装饰推翻现有构图。
- 用户明确要求减少反复验证，把时间优先投入功能和地图元素，并确认本批次不做工具升级。
- 现有区域切换由 TMJ `SpawnPoints` / `Exits` 与 WorldCatalog 统一处理；新增区域不需要数据库、服务端或存档 Schema 变更。
- 已登记 VectoRaith 原始 16×16 terrain/buildings/details 图集可以继续服务户外区域；现有 Ninja Adventure interior 图集可以服务工坊与民宅，不新增图片二进制。

## Requirements

### Region network

- Town 保留现有 40×30 主体布局，只做功能入口与通往新区域的窄改动。
- `blacksmith` 工坊与五栋独立住宅各自拥有可见入口、返回 Town 的出口和不会立即反复触发的安全 spawn。
- 新增 `foothills` 北侧山麓区域：包含弯曲山道、林地、岩石、溪流或水池、矿洞口地标和少量可砍树木，但不实现石头采集或采矿。
- 新增 `lakeshore` 南侧湖岸区域：包含湖面、河口、木码头、岸边小路、树木与休憩点，但不实现钓鱼。
- Town 新增北/南出口，现有 Farm、Seed Shop、NPC 和主桥路线保持可达。

### Residential availability extension

- Town 原有五栋民宅全部可以从外门进入，玩家能参观每栋住宅的公共起居空间。
- 每栋住宅内部都包含一个可见但不可进入的私人内屋；邻近点击内屋门显示“私人房间暂不方便进入”，门槛碰撞始终阻挡。
- 该设计参考《星露谷物语》住宅公共空间与村民卧室的分层访问，但当前不实现两心好感、开门时间、钥匙、权限或任务状态。
- 五栋住宅使用独立 region、返回出口、家具组合、显示名和 inspect 文本，避免进入不同外门却落到同一间房。
- 当前借用铁匠区旁小棕屋门口的工坊入口迁移到红色铁匠工坊侧院，恢复该小棕屋的住宅入口。
- 私人内屋阻挡只属于 TMJ collision 与 transient inspect，不进入 GameState、StoredGame 或 IndexedDB；未来解锁必须另行规划。

### Environmental interaction

- 新增 `inspect` 环境交互类型，只承载固定 `dialogueId`，点击 48px 内的标牌、公告板、炉子、工具架、矿洞口、码头或室内物件时复用现有 DialoguePanel。
- Inspect 只属于 TMJ/WorldCatalog/client presentation，不进入 GameState、StoredGame 或 IndexedDB。
- Modal、ActionTimeline 或切图期间忽略 inspect；太远点击静默无效，不自动寻路。

### Content and visual boundaries

- 铁匠工坊只提供场景与环境叙事；昊天继续使用现有 Town 固定 NPC 对话，不新增升级 UI、费用、品质、耐久或工具等级。
- 民宅只提供五个固定公共起居空间和静态私人内屋，不建设住宅权限、建造、家具编辑或通用多房屋系统。
- 山麓只复用现有斧头砍树；岩石与矿洞均为不可采集地标。
- 湖岸只提供探索和环境叙事；不增加鱼、鱼竿、体力、时间或天气。
- 不新增 NPC、物品、经济、数据库 migration、图片二进制或 CDN manifest 项。
- 每个新增方法/helper 均添加方法级注释。

### Delivery preference

- 以完整内容批次为单位实施，不为每张地图单独建立验证门。
- 自动验证压缩为整批完成后一次 `typecheck` 与 `build:client`；只在实现过程中出现明确结构问题时运行更窄检查。

## Acceptance Criteria

- [ ] 玩家可从 Farm 进入 Town，并从 Town 进入/离开铁匠工坊、五栋民宅、北侧山麓和南侧湖岸，不出现出口循环或卡死。
- [x] 山麓与湖岸拥有明显不同的构图、可行走主路、边界碰撞和至少一个值得抵达的视觉地标。
- [x] 山麓树木可继续使用现有斧头规则砍伐；错误工具行为与 Farm 保持一致。
- [x] 环境 inspect 在 48px 内打开现有线性对话，太远、modal/action/transition 中无效且不产生持久状态。
- [x] 现有 Town 两名 NPC、Seed Shop 商店、Farm↔Town、Cottage 与 Life Loop 路线保持可用。
- [x] 不新增工具升级、采矿、钓鱼、NPC 日程、经济、存档字段、数据库 migration、图片二进制或新依赖。
- [x] 整批完成后 `typecheck` 与 `build:client` 通过。
- [x] 五栋民宅都可分别进入公共起居区并安全返回对应门口，室内至少有两处不同的生活化 inspect 内容。
- [x] 每栋民宅的私人内屋都可见但不可进入，邻近点击内屋门会打开隐私说明；太远点击静默无效。
- [x] 铁匠工坊入口从小棕屋迁到红色工坊侧院，工坊往返和昊天交互保持可用。

## Out of Scope

- 工具升级、品质、耐久、体力、修理、材料成本和铁匠商店。
- 采矿、矿石物品、钓鱼、鱼类、天气、Season、完整时钟和 NPC 日程。
- 五栋既有民宅之外的新住宅、通用室内生成器、住宅权限、家具系统或建筑系统。
- Expedition、敌人、战斗、灵兽、肉鸽、撤离和妖潮塔防。
