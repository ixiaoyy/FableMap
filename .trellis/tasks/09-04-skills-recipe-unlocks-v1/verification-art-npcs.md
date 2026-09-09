# NPC 四向步行整改验证（2026-09-09）

## 实现

FarmAssets.npc_texture 从已有映射所在的三列四向角色块读取真实下/左/右/上图帧。FarmNpcSprite 按实际移动距离循环 0/1/2/1 列，停止或暂停时返回对应方向的中间站立帧，无位移重复刷新不跳帧。移除旧整人旋转摇摆与单帧镜像。脚底锚点从帧高 0.82 改为底边，视觉脚底对应日程世界坐标；没有改领域位置、路径、碰撞或交谈距离。

只复用已登记 VectoRaith 原图，不改字节、不上传、不采购、不产生新美术二进制。官方说明为四向、三帧、16×32 的八角色图集，入口：https://vectoraith.itch.io/top-down-rpg-npc-sprite-pack 。布局同时通过本地原图实查。

当前原图 generic_people.png 为 192×256，17354 字节；SHA-256 `eb1fe419def5a351cfc147a8273b133f1e7daaa9f59a418fe4a7d3f8d7d67ba0` 已重新核对，与 deploy/cdn/game-media-manifest.json 一致。来源 DEMO/16x16/generic_people.png，原官方压缩包 SHA-256 为 `a52db8bb457ccef75c222ecb93a25a13c2873bfc97c27480ecc53e671cb4d033`；原许可、对象 key/URL、MIME 和署名保持现有登记。没有生成图片服务或伪造 prompt。

## 检查结果

- typecheck:client 通过：内容类型、Godot 解析/导入及无窗口启动。
- validate_npc_art.gd 通过：八个居民映射共 96 个帧引用的边界与步伐差异，出生、无位移重复投影、真实位移、停止、暂停、渐隐。96 为引用数，包含重复角色块，不是 96 张新绘制图片。
- 联系图逐帧实查左右侧面与背面，不把水平翻转当前前视图当作四向素材。
- 隐藏浏览器实际游戏场景/内存仓库，使用 06:00 至 10:00 的日程 transition，让店主从货架走向柜台，再通过原 advance 推进；查看两段位置与步帧、到达后的站立、真实 talk-to-npc 对话，以及 390×844 手机画面。
- QA 的时间与运动由快捷键分段推进，玩家仅为交谈在内存移动至可站立邻近点；不证明完整真人连续日程体验，不修改玩家槽。
- 隔离 QA 出现临时 __qa_npcs 的 UID 回退警告，使用文本路径继续加载；没有观察到游戏脚本异常。正常构建不包含临时入口，不能将该 QA 日志报告为空。
- 最终无位移保护再次通过窄检查；Web、Windows 正常入口导出通过。临时 QA 源已移除，工程恢复 scenes/game.tscn。截图为此前同一实现的运动/交谈样例，最后的无位移保护由窄检查验证。

证据位于 artifacts/art-fix-npcs-2026-09-09/：directions-and-steps.png、walking-a.png、walking-b.png、arrived.png、dialogue.png、mobile.png、QA 源和构建日志。

## 待处理

现有八个居民只对应五个独立角色块，当前保持历史选择所在的角色块：seed-keeper / town-resident-xiangzi；town-blacksmith / town-resident-haonan；town-resident-01 / town-resident-haomeili 各有一组重复。另两项为 town-resident-mozi 和 town-resident-alan。后续需要区分外观，不能据本次动画接通称全部角色素材完成。

锻造、整理货架等工作动作仍为待办，未用不存在的工作帧替代。真人审美、连续步频、所有区域遮挡及多人同屏未全量真人验收。室内缩放沿用此前整改；整体美术验收尚未通过。

## 交付边界

无玩法/日程/营业/交谈规则或存档版本变化，无数据库、迁移、配置或发布要求。生产代码暂存，测试、文档、截图不自动暂存。未上传、部署、提交或推送。

回滚仅撤销 npc_sprite.gd/.uid、assets.gd 的四向选择和 game_world.gd 的居民节点投影，再重新导出；不得整文件回退覆盖此前作物、乌鸦、钓鱼和室内整改。
