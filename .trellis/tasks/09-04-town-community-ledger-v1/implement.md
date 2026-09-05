# 小镇共建簿 v1：实施计划

## 前置门禁

- [ ] 用户评审本 child 及基础盘父任务的最终 PRD/design/implement，并明确批准本 child 实施。
- [ ] 先完成、检查并归档地表资源与基础盘其他前序 child，确认所有投入物可通过正常玩法持续取得。
- [ ] 父任务开始前运行 `trellis-before-dev`，读取 frontend spec、父/子任务文档、目标文件和完整现有 diff。
- [ ] 清理本地试玩数据作为届时 current save 验收起点；不编写此前开发版本 migration。

## 实施步骤

1. **建立 closed community domain 与下一 current version**
   - [ ] 新增三个 project、requirement definitions、固定数量和 choice-group completion。
   - [ ] 新增 CommunityState、严格 decoder/clone/default；current save 只接受届时完整 current version。
   - [ ] 新增带方法级注释的 contribution/reward/ceremony methods 和 typed commands。
   - [ ] 复用 Inventory/Stamina/WorldCatalog/weekly calendar owner，完成位置、数量、原子性与 completedDay 校验。

2. **扩展公告板但隔离每日委托**
   - [ ] 保留 `dailyRequest` 与现有委托视图/交付链，增加两个可访问 tab。
   - [ ] 实现三个项目卡、候选槽位、固定投入、持有/剩余数量和明确的 row-level contribution。
   - [ ] 接入 snapshot projection、成功/失败反馈、焦点保持、Escape 与 shared input lock。

3. **交付三处永久设施**
   - [ ] Town 增加公共苗圃 stable interaction 与完成表现；实现每周选择一种种子领取 3 粒。
   - [ ] Foothills 保留 spring stable ID，增加完成表现、每日首次 15 体力与不限次水壶补满。
   - [ ] Lakeshore 保留 dock stable ID，增加完成表现和 gated deep-water fishing zone；只调整现有暮鲈/青鳞鱼权重。
   - [ ] 为阿禾/华强、浩南/墨子、祥子/阿澜增加完成后对白，不改变普通日程 owner。

4. **完成一次性小镇仪式**
   - [ ] Town 增加八个 ceremony anchors 和永久 plaque 点，不调整主路/出口/门。
   - [ ] 实现 domain availability selector 与 final acknowledgement；当天、雨天、其他区域和 seen 状态正确拒绝。
   - [ ] 实现 30～45 秒固定线性 panel/participant projection；中断不写 seen，完整结束只写一次。
   - [ ] 加入八名居民完成对白和多通道完成反馈，不建设通用事件/节日 runtime。

5. **一致性与收尾**
   - [ ] 更新 active frontend code-spec、CURRENT_STATE、PRODUCT_BRIEF、WHAT_NOT_TO_BUILD、TOWN_ROADMAP 与必要任务记录。
   - [ ] 检查全部新增方法均有方法级注释，所有 stable IDs/definitions 只有一个 owner。
   - [ ] 确认 Git 游戏图片/音频二进制增量为零，不新增 npm 或服务端依赖。

## 最小自动验证

```powershell
npm --prefix .\apps\mirror-island run test:life-loop
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

只增加与本任务直接相关的断言：届时 current round-trip、choice/fixed contribution、原子失败、每周/每日 reward、deep-zone gating、仪式可用/中断/once-only、formal map IDs 与 modal lock。不要扩建通用任务测试平台或全量 E2E。

## 真人验收路线

1. 清理站点数据并正常新建农场，确认 Day 1–7 原生活循环与地表采矿可用。
2. Day 8 查看公告板两个 tab；并行向三个项目逐项投入，刷新与睡眠后进度保持。
3. 分别完成四种作物、20 wood+12 stone+500g、三种鱼+3 bamboo+10 wood，验证超额、缺物和已完成后继续投入均不扣资源。
4. 走访 Town nursery、Foothills spring、Lakeshore dock；验证周种子、日体力/补水、深水鱼权重提示与 current save 恢复。
5. 三项全完成当日不触发；雨天顺延；下一晴天进入 Town 完整播放一次仪式。
6. 中途刷新验证重播，完整结束后刷新/再次进镇不重复，纪念牌与居民对白保留。
7. 在桌面、手机、键鼠、单指触摸和 200% zoom 下完成公告板、种子选择和仪式。

## 回滚与提交

- 父任务只在三个项目和仪式全部通过后形成可部署边界；不得部署有面板但无世界变化、或有山路需求但无石料来源的中间状态。
- 若共建实现需回滚，精确移除 parent-owned community state/UI/sites，保留已独立完成的地表采矿子任务。
- 生产代码/配置通过最小验证后立即按项目规则暂存；测试、文档、截图和诊断产物不自动暂存。
