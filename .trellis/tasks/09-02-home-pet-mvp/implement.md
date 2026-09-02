# 家园猫狗 MVP：实施计划

1. 搜索并冻结 v8 state/save/clone/migration、sleep、modal/input lock、WorldEntities 和 Tiled anchor owner。
2. 评审猫狗候选的真实帧与比例，选定最小 allowlist 许可子集并记录来源/署名；不合适则停止采用。
3. 实现 v9 `PetState|null`、v8 migration、name/bond/day decoder 和 typed adopt/pet commands。
4. 新增领养 modal，接入 Day≥2 derived pending；确认前二次提示不可更换，取消零 mutation。
5. 为 Farm/Cottage 增加少量 PetAnchor 与 presentation-only pet entity；不阻挡、不跨世界跟随。
6. 接入每日首次抚摸、爱心/名字反馈、短音效映射和 critical save。
7. 增加窄合同：v8→v9、名字、不可重复领养、每日 bond、刷新恢复、旧存档补发。
8. 运行相关合同、typecheck、client build、媒体审计；真人验收猫/狗各一次、手机和200% zoom。

## Risk Gates

- 同需求只有一个 v9 value migration；不新增数据库 migration 文件。
- 宠物不得复用 NPC friendship/schedule 身份，也不得进入 NPC 碰撞/避让集合。
- 素材缺方向或风格不匹配时，不用 CSS 翻转/模糊缩放伪装完整动画。

## External Publication Gate

- 2026-09-02 实测两个正式 CDN key 均为 HTTP 404；代码使用 code-drawn fallback，因此本地玩法/构建可继续，但不能宣称媒体发布完成。
- 已在工作区补齐 `publish-media.yml` 精确 allowlist、manifest、prepare-media 与 NOTICE；必须先让 workflow 改动进入默认分支，再分别 dispatch 原始 `cat_0.png` / `dog_2.png`。
- 发布后回读核对 cat `8348` bytes / `914bae85...`、dog `9202` bytes / `77f4667a...`、`image/png` 与 `public,max-age=31536000,immutable`，随后才能完成任务媒体门禁。
