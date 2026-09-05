# 实施记录

## 2026-08-28 第一轮

### 实机证据

- 桌面 1280×720：Farm 与 Town 可正常进入，24:00 最深夜色下地图、Life HUD、Hotbar 仍可辨。
- 手机 390×844：入口与游戏画面可用；新增生产态按住方向盘后，四向按钮均出现在可触达区域，单击移动已生效。
- 200% zoom 等效 640×360：方向盘、Hotbar 不互相覆盖；Social 占满可用高度并保持列表滚动与关闭按钮。
- Town 公告板：hover 显示“查看公告”，移开即收起；远距离点击显示“走近一些再查看”，2.4 秒后自动收起。
- Town 相邻铁匠铺/民宅：原先两个入口提示重叠；改为只显示最近目标，hover 仍可指定另一目标。
- Vite 热更新后切图暴露旧 WorldScene 订阅残留；补齐 Phaser `DESTROY` 清理并做幂等防护。全新标签页加载后 console warn/error 为空。

### 已实现

- NPC、床、inspect 不再常驻“点击”；靠近或 hover 才显示“交谈 / 购买 / 休息 / 查看”等准确动词。
- 私人内屋、公告板、封闭矿洞、路牌使用差异化但不承诺未实现能力的提示。
- 所有 Tiled exit 共用“进入地点 / 前往地点 / 出门”接近提示，提示层独立高于 AbovePlayer，身体与家具仍正常被屋檐遮挡。
- 同一时刻只展示最近的 proximity 目标，避免相邻门、NPC、看板标签互抢。
- NPC 行走增加横向朝向和步态；waiting 标签可辨；每天首次有效交谈播放一次无数值心形反馈。
- 反馈 toast 成功 1.6 秒、错误 2.4 秒后自动释放，不长期占屏。
- 手机方向盘复用现有 `move` 命令与 modal 锁，不新增存档字段或移动规则。

### 最小检查

- `npm run typecheck`：通过。
- 最终客户端改动后 `npx vue-tsc --noEmit -p tsconfig.client.json`：通过。
- 重启 Vite 后从全新内置浏览器标签进入：console warn/error 为空。

### 仍须完成（不得在后续遗漏）

- 在白天重新实走八名 NPC 的 walking / waiting / activity / hit / 首次交谈心形反馈。
- 实走 Seed Shop 的“购买”提示、对话与 Shop 切换。
- 逐间走完五住宅、Blacksmith，确认公共区可参观、私人内屋只提示不可进入、入口/出门提示无裁切。
- 实走 Foothills / Lakeshore 的路牌、矿洞、码头和巡逻 NPC。
- 完成 Farm→Town→住宅/工坊→山麓/湖岸→Cottage 睡觉→刷新继续的整轮路线，再勾选 PRD 与全局精细化门禁。

## 2026-08-31 第二轮

### 实机证据

- 真实走完 Town→Farm→Cottage，床边提示出现并完成 Day 1 24:00 → Day 2 06:00 日结；随后返回 Town 观察 09:00 居民离家。
- 九点 Town 远处 NPC 不再常驻“锻 / 修 / 护”等活动字；活动仍由 body-local 动作表达，靠近/hover 才显示文字层。
- 晚间 Seed Shop 靠近华强显示“交谈”；首次交谈显示一次“与华强更熟悉了一点”，当天重复交谈不再显示。
- Dialogue 获得真实焦点并显示 `1 / 1`；Escape 关闭后 `document.activeElement` 回到 `.game-canvas`。
- 调试方向盘与手机方向盘统一为 9.6px 单步语义，修复窄门前 pointerdown + click 双移动导致永远无法对准的问题。
- `?debug=1` 增加只读 `region · x,y`，坐标来自现有 GameSession snapshot，不进入玩法存档。

### 本轮实现

- Shop/Dialogue 增加打开聚焦、Escape 关闭与关闭后恢复世界焦点；Phaser host 成为可聚焦元素。
- Shop 买入金币不足、卖出无库存时显示真实 disabled 状态；domain 仍是最终规则 owner。
- action feedback 提升到 modal 之上并在 modal 打开时移到顶部，Shop 买卖与首次交谈反馈不再被遮罩盖住。
- 私人房间接近提示从“私人内屋”收紧为“内屋止步”。
- 修复异步 shutdown 竞态：旧 App 只释放自己捕获的 session subscription / repository，不能再关闭新一代 GameSession 或清空新 UI projection。
- 区分 Phaser `SHUTDOWN` 与 `DESTROY`：前者在 systems 可用时显式清 views，后者只解绑外部状态并交给 Phaser 销毁 GameObjects，消除 detached Scene 的 tween 报错。
- 抽取 `useHeldMovement`，生产触摸盘与调试盘共用同一方向、锁、按住重复和键盘激活合同。

### 检查

- `npx vue-tsc --noEmit -p tsconfig.client.json`：通过。
- 全新标签页加载/关闭：浏览器 warn/error 为空；修复后的 Scene destroy 未再产生 Vite client unhandled error。
- Impeccable detector：修复 Shop welcome 的 3px 单侧色条；底层双轴网格为 World Foundation 地图/蓝图语义，保留为有意设计。

### 仍须完成（更新）

- 本轮到达 Seed Shop 时已过 17:00，实际 Shop modal 的 disabled/feedback/焦点仍需在下一白天实走；代码与类型检查已通过，但不据此勾选验收。
- 五间住宅、Blacksmith 私人内屋以及 Foothills/Lakeshore 仍按上一轮清单逐处完成。

## 2026-08-31 第三轮

### 实机证据

- Day 3 09:50 白天进入 Seed Shop：华强靠近时同时显示“购买”和职业“迎”，远处不显示活动文字。
- Shop 自动获得焦点；萝卜为 0 时“无可出售”真实 disabled；连续购买两粒种子后 gold 100→80→60、持有量 0→1→2、Hotbar 同步。
- 首次交谈 toast、购买成功 toast 都位于 z-index 10；实测 modal 内 rect `top=18px`，不再压住商品行；Escape 关闭后焦点回到 `.game-canvas`。
- 东岸民宅外门可进入；公共窗台显示“查看”并打开“东岸窗台”对话；私人门显示“内屋止步”并打开“门后是屋主的私人房间，暂时不便参观”。
- 私人门外允许横向通行；在 `x=298,y=133` 连续向上五次后 y 不变，证明 Collision row 7 阻止进入私人空间。五栋住宅同模板对应网格一致。
- 浏览器 console warn/error 为空。

### 本轮修正

- 修复 debug shell 中 modal toast 仍沿用底部定位、覆盖 Shop 商品行的问题；modal toast 规则现在同时适用于正式全屏和 `?debug=1`。
- 将 19 个非私人 inspect 点从泛化“查看”细化为“查看锻炉 / 工具架 / 餐桌 / 窗台 / 航图 / 茶桌 / 山泉 / 码头 / 石标”等具体动词；私人房间仍统一“内屋止步”。

### 验收进度

- 已勾选：桌面提示无常驻噪音；Shop/Dialogue/首次交谈反馈不重复且不打断 modal。
- 仍待：其余四栋住宅、Blacksmith、Foothills/Lakeshore、八名 NPC 全姿态和最终完整路线。

## 2026-08-31 正式工具栏图标整合

- 用户截图确认当前 `codex/tool-interaction-mvp` 仍显示“锄 / 水 / 斧”大字占位。根因是正式图标提交 `43819d06` 已在 `origin/main`，但当前分支仍基于 `a03fd2b9`；当前 Hotbar 还依赖 DEV-only `?toolArt=free/preview`。
- 未直接 cherry-pick 覆盖当前大量并行改动；逐文件迁入发布白名单、manifest、`item-icons.ts`、Hotbar 默认 frame 映射、产品内 CC-BY 署名和采用记录。
- 补齐原发布提交遗漏的 localhost 链路：`prepare-media.mjs` 现在下载并校验 GARDENS exact 13,130 bytes / SHA-256 `de4dbbb5...`，写入 ignored `public/game-media/v1`。
- `prepare-media` 准备 14 项资源；manifest 14项/214,731 bytes 一致；客户端 typecheck、production build 通过。
- localhost 实机：锄头、浇水壶、木斧、萝卜种子共 4 个 `.hotbar-slot__image`，`.hotbar-slot__mark` 为 0；资源与 `/THIRD_PARTY_NOTICES.txt` 均 HTTP 200，浏览器 warn/error 为空。

## 2026-08-31 工具栏精调

- Hotbar 从 760px 拉伸式深绿面板收紧为约 500px 的木质工具带，与 LifeHud / Shop 的羊皮纸与木框视觉统一。
- 桌面槽位 56px；390px 手机槽位 44px 且八格完整显示；320px 窄屏保留横向滑动并隐藏原生滚动条。
- 空槽只保留序号，不重复显示“空”；物品名称保留在底部暖色标签；数量移到右上角深色角标。
- 选中态使用暖金背景、深木描边、2px 抬升和底部阴影，不再使用荧光绿光晕。
- 桌面、390×844、320×720 与选中态均完成实机截图检查；客户端 typecheck 通过，浏览器 warn/error 为空。
