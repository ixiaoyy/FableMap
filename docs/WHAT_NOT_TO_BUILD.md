# 镜像岛明确不做

## 永久禁区

- 不恢复 Character、StoryWorld、StoryRun、历史故事、关系/记忆、聊天、内容后台或 LLM 运行时。
- 不恢复旧 React/Phaser 原型、RPGJS 运行时或 Colyseus 多人 active graph；多人 checkpoint 只作历史参考，不建立可切换备用运行时。
- 不为同名论坛/独立账号自动绑定、合并、解绑或迁移农场。
- 当前身份系统不建设邮箱、验证码、找回密码、密码复杂度或第二套账号库；未来离线单机是否需要无登录模式单独规划，不由 Keycloak 现状永久封死。
- 不把 access/refresh token、密码、论坛 ticket、数据库连接串或 service secret 写入 URL、浏览器存储或日志。
- 不建设现实地图、经纬度、定位权限、现实 POI 或导航。
- 不复制《星露谷物语》或其他游戏的品牌、地图、角色、文本、音乐、UI 或未授权素材。

## 当前不做

- `Stardew Life Loop 第一批` 完成前不做 Colyseus 多人、好友参观、双人模式、联机副本、聊天、交易、排行榜、战斗扩展、灵兽、肉鸽、撤离、妖潮塔防、钓鱼、矿洞、节日或复杂经济。
- 土地、作物或住宅周边公共格的私有化、保护、交易或 owner 权限。
- 公共住宅室内、多房屋、建筑材料和通用建造系统。
- 云存档、通用 ECS、大型全局状态库、地图编辑平台或无界程序生成框架；本地 GameSession 只服务 Stardew Core 当前闭环。
- 书屋、异闻世界和《乔女》《画皮》《聂小倩》等《聊斋》内容当前不做；东方志怪未来作为独立异闻故事世界逐项规划。
- 昼夜、经济、NPC 日程、天气和剧情不进入 World Foundation A/B/C；唯一店主只验证 spawn、E 交互与 Vue Dialogue 管线。
- World Foundation 与 Farm Showcase 已通过人工游玩门槛；当前只实现 Day、睡觉跨日、作物按天成长、固定金币与单商品商店闭环，不顺势扩展完整时间、Season、天气或复杂经济。
- Farm showcase 的 Gate A 截图未获确认前，不精修 Town/Cottage/Seed Shop，不新增地图，不提前摆花草、灯笼、荷叶、竹林等细节，也不混入第二套风格不一致素材。
- Gate B 不新增图片素材、互动对象或 gameplay state；花草、灯笼、荷叶、樱花、竹林、水动画和阴影继续后置到单独视觉评审。
- 当前不做 Tauri/Rust/FileSystem adapter/Steam API，不做 Unity 或 Godot 技术验证；未来桌面目标只保留架构边界。
- VectoRaith 已成为生产 Farm v1 与 Town Gate A 的正式美术底座；不提交 ZIP、截图或图片二进制到 Git。用户已要求运行时直接使用 6 张官方 Original/16×16 PNG，禁止再次裁剪、重排、合图或重编码；作者若补充许可条件则 forward-fix。

Life Loop 完成并经真实浏览器验收前，不创建或实现 `Expedition Prototype`。远征阶段即使获准，也只先验证一张小型区域、2～3 种敌人、少量材料、一次三选一事件、一个可捕获生物和继续/撤离决策，不提前建设完整随机地图、宠物养成或战斗框架。

新通用能力必须先评估成熟开源方案、许可证、维护状态、体积、数据归属和退出成本；不为一个小需求引入整套平台。
