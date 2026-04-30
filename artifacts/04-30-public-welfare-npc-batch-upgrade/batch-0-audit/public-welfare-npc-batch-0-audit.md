# Batch 0 audit — Public-welfare NPC visual and role upgrade

本文件是 `04-30-public-welfare-npc-batch-upgrade` 的第一步审查表。当前批次只审查，不生成、不覆盖正式 sprite。

## Sources checked
- task_prd: `.trellis\tasks\04-30-public-welfare-npc-batch-upgrade\prd.md`
- default_taverns: `backend\src\fablemap_api\core\default_taverns.py`
- asset_root: `frontend\public\assets\npcs\public-welfare`
- tests: `tests\test_default_public_welfare_taverns.py`, `tests\test_default_public_welfare_gameplays.py`
- legacy_audit_contact_sheet: `artifacts\04-30-npc-asset-audit\public-welfare-neutral-contact-sheet.png`
- rejected_manifest: `.trellis\tasks\archive\2026-04\04-29-npc-expression-art-quality-rebuild\rejected-public-welfare-npc-assets.json`
- image_style_skill: `.agents/skills/image-style-prompt-extractor/SKILL.md`
- character_prompt_skill: `.agents/skills/generate-character-prompt/SKILL.md`
- style_recipes: `.agents/skills/generate-character-prompt/references/style-recipes.md`

## Summary

- 默认公益店：9 个；角色：28 个，其中医院基线外旧角色 25 个。
- 正式资产根目录：`frontend\public\assets\npcs\public-welfare`。每个正式角色要求 `neutral, joy, anger, embarrassment, curiosity` 五张 PNG。
- 当前所有角色五表情资产完整且 hash 互异：`True`。
- 旧拒稿 manifest 中仍 pending 的 expression 数量：48；其中当前文件 hash 仍等于拒稿 hash：48；已 regenerated 数量：54。
- 旧公益角色尺寸：256×256, 512×512；医院新基线尺寸：512×512。

## Recommended first rebuild batch

| Order | Tavern | Reason | Style direction |
| --- | --- | --- | --- |
| 1 | `pw_third_shelf_observatory` | 4/4 角色有 pending expression 拒稿；非现实外星便利店最需要物种/体态差异化。 | 高对比数字工业故障 + 便利店收据/扫描线秩序；避免普通人类 anime 店员模板 |
| 2 | `pw_midnight_commission_board` | 2/3 角色有 pending expression 拒稿；文游委托局需要从普通黑夜 anime 店员升级为线索/票据/委托板视觉体系。 | 地下黑客朋克半调拼贴的低恐怖版 + Noir 委托板道具 |
| 3 | `pw_community_repair` | 2/3 角色有 pending expression 拒稿；修补工坊职责分明，适合用工具/调停/清单三种构图区分。 | 70/80 年代街头海报拼贴 + 少量修补纸张纹理，或工业档案袋风格的温暖版 |

## Shop-level matrix

| Priority | Tavern | Characters | Pending rejected expr | Dimensions | Non-human / body-plan notes | Visual thesis |
| --- | --- | ---: | ---: | --- | --- | --- |
| P1 | `pw_lantern_helpdesk` 公益·灯塔问讯台 | 3 | 4 | 256×256 | 现实人类/无需物种差异 | 公共服务地图桌、便签、路线灯箱；降低通用暖木吧台感 |
| P1 | `pw_midnight_treehole` 公益·夜航树洞电台 | 3 | 4 | 256×256 | 现实人类/无需物种差异 | Lo-fi 夜间电台、录音磁带、白线稿/软虚化；强调安静而非霓虹噪声 |
| P1 | `pw_community_repair` 公益·街角修补工坊 | 3 | 8 | 256×256 | 现实人类/无需物种差异 | 社区修理台、旧工具、圆桌调停；角色应通过道具/姿态区分维修、调停、清单整理 |
| P1 | `pw_lost_found_archive` 公益·城市拾光档案亭 | 3 | 4 | 256×256 | 现实人类/无需物种差异 | 档案袋、索引线、失物标签、城市记忆碎片；适合建立与其他现实店不同的档案视觉宇宙 |
| P0 | `pw_third_shelf_observatory` 公益·第三货架观测站 | 4 | 16 | 256×256 | 努力伪装成人类的外星临时店员；可做可爱但破绽明显的非人体态; 外星人类学社长；建议重构为瘦长/多层观察镜片的原创异星研究员; 外星礼仪实习生；可做小型多肢/漂浮观察员 | 非人类便利店社员、收据扫描、货架观察窗；每个外星角色必须有不同体态/材质/轮廓 |
| P1 | `pw_midnight_commission_board` 公益·午夜委托局 | 3 | 8 | 256×256 | 现实人类/无需物种差异 | 委托木板、线索卡、低风险任务票据；黑夜调查气质但不走战斗/等级装备 |
| P1 | `pw_after_school_hero_supply` 公益·放学后英雄补给社 | 3 | 4 | 256×256 | 现实玩具店/童年勇气角色，允许一名纸剑/影子非普通角色; 纸剑/童年影子类非普通角色 | 普通人小英雄、纸剑、星袋、旧卡套；童年勇气而非 RPG 战斗系统 |
| P3 | `pw_jingan_catbell_refuge` 公益·静安猫铃小屋 | 3 | 0 | 256×256, 512×512 | 原创成年猫亚人店主; 原创猫尾账房人; 猫铃/守门铃类半拟人或小型猫守卫 | 上海夜色、猫铃、账房、门口守铃；保持成熟安全边界，避免擦边或 IP 化猫娘 |
| BASELINE | `pw_hospital_night_care` 公益·夜间护理站 | 3 | 0 | 512×512 | 现实人类/无需物种差异 | 512×512 新质量基线；护理站、候诊卡、现实求助边界 |

## Character audit matrix

| Priority | Tavern | Character | Species / body plan | Current style / evidence | Resolution | Expression complete | Repetition risk | Suggested new style | Copy sync |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | `pw_lantern_helpdesk` | `char_pw_xiaozhou` 小舟 | 现实公益问讯台普通人类志愿者 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash；全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 米白-红色电路图 / 奶油留白赛博平面（低饱和版） | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P2 | `pw_lantern_helpdesk` | `char_pw_luming` 路明 | 现实公益问讯台普通人类志愿者 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 米白-红色电路图 / 奶油留白赛博平面（低饱和版） | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P2 | `pw_lantern_helpdesk` | `char_pw_qiaoqiao` 桥桥 | 现实公益问讯台普通人类志愿者 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 米白-红色电路图 / 奶油留白赛博平面（低饱和版） | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_midnight_treehole` | `char_pw_anlan` 安澜 | 现实夜间电台普通人类倾听者/引导员 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash；全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 混合媒介 / 写实照片 + 白色线稿，或赛璐璐内省碎片拼贴的低密度版本 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P2 | `pw_midnight_treehole` | `char_pw_yeyu` 夜雨 | 现实夜间电台普通人类倾听者/引导员 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 混合媒介 / 写实照片 + 白色线稿，或赛璐璐内省碎片拼贴的低密度版本 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P2 | `pw_midnight_treehole` | `char_pw_dengxin` 灯芯 | 现实夜间电台普通人类倾听者/引导员 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 混合媒介 / 写实照片 + 白色线稿，或赛璐璐内省碎片拼贴的低密度版本 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_community_repair` | `char_pw_ahuai` 阿槐 | 现实社区修补/调停普通人类角色 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash | 70/80 年代街头海报拼贴 + 少量修补纸张纹理，或工业档案袋风格的温暖版 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_community_repair` | `char_pw_heguang` 和光 | 现实社区修补/调停普通人类角色 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash | 70/80 年代街头海报拼贴 + 少量修补纸张纹理，或工业档案袋风格的温暖版 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_community_repair` | `char_pw_qiaoshou` 巧手 | 现实社区修补/调停普通人类角色 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 常规巡检；优先级低于 pending rejected 店铺 | 70/80 年代街头海报拼贴 + 少量修补纸张纹理，或工业档案袋风格的温暖版 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_lost_found_archive` | `char_pw_wenjian` 闻笺 | 现实档案亭普通人类记录/索引角色 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash；全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 工业档案袋风格 / 前数字时代技术档案 + 半调雕刻线稿 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P2 | `pw_lost_found_archive` | `char_pw_shiyi` 拾忆 | 现实档案亭普通人类记录/索引角色 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 工业档案袋风格 / 前数字时代技术档案 + 半调雕刻线稿 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P2 | `pw_lost_found_archive` | `char_pw_suoyin` 索引 | 现实档案亭普通人类记录/索引角色 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 全员现实人类，需靠构图/道具/材质防止同脸同姿态 | 工业档案袋风格 / 前数字时代技术档案 + 半调雕刻线稿 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P0 | `pw_third_shelf_observatory` | `char_pw_9_delta` 社长 9-Delta | 外星人类学社长；建议重构为瘦长/多层观察镜片的原创异星研究员 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash；非现实外星店需要显式物种/体态差异 | 高对比数字工业故障 + 便利店收据/扫描线秩序；避免普通人类 anime 店员模板 | 需要：把更明确的异星体态/观察器官写入 description/scenario/tags |
| P0 | `pw_third_shelf_observatory` | `char_pw_mu_mu` 临时店员 Mu-Mu | 努力伪装成人类的外星临时店员；可做可爱但破绽明显的非人体态 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash；非现实外星店需要显式物种/体态差异 | 高对比数字工业故障 + 便利店收据/扫描线秩序；避免普通人类 anime 店员模板 | 需要：伪装失败的体态和服务动作应进入 scenario/system_prompt |
| P0 | `pw_third_shelf_observatory` | `char_pw_v17` 样本保管员 V-17 | 半机械/透明档案管理员；可做记录容器式非人体态 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash；非现实外星店需要显式物种/体态差异 | 高对比数字工业故障 + 便利店收据/扫描线秩序；避免普通人类 anime 店员模板 | 需要：回访记录方式与身体结构关联 |
| P0 | `pw_third_shelf_observatory` | `char_pw_pi_pi` 地球礼仪实习生 Pi-Pi | 外星礼仪实习生；可做小型多肢/漂浮观察员 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash；非现实外星店需要显式物种/体态差异 | 高对比数字工业故障 + 便利店收据/扫描线秩序；避免普通人类 anime 店员模板 | 需要：礼仪误读与体态道具绑定 |
| P1 | `pw_midnight_commission_board` | `char_pw_mozhan` 墨栈 | 偏都市传说的普通人类委托局角色 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash | 地下黑客朋克半调拼贴的低恐怖版 + Noir 委托板道具 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_midnight_commission_board` | `char_pw_zhideng` 栀灯 | 偏都市传说的普通人类委托局角色 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash | 地下黑客朋克半调拼贴的低恐怖版 + Noir 委托板道具 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_midnight_commission_board` | `char_pw_huoyan` 火眼 | 偏都市传说的普通人类委托局角色 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 常规巡检；优先级低于 pending rejected 店铺 | 地下黑客朋克半调拼贴的低恐怖版 + Noir 委托板道具 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P2 | `pw_after_school_hero_supply` | `char_pw_aheng` 阿衡 | 现实玩具店/童年勇气角色，允许一名纸剑/影子非普通角色 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 常规巡检；优先级低于 pending rejected 店铺 | 波普 + 水墨喷溅，或克莱因蓝秩序的模型店版本 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P1 | `pw_after_school_hero_supply` | `char_pw_zhijian` 纸剑 | 纸剑/童年影子类非普通角色 | 256×256 legacy 公益 NPC 表情组；旧版表情多为变色/图标式差分，缺少真实表情变化 | 256×256 | True | 旧拒稿 manifest 仍有 4 个 pending expression，且 4 个当前 hash 仍等于拒稿 hash | 波普 + 水墨喷溅，或克莱因蓝秩序的模型店版本 | 可加强：纸质身体、折痕、影子边界进入描述与 visual prompt |
| P2 | `pw_after_school_hero_supply` | `char_pw_xingdai` 星袋 | 现实玩具店/童年勇气角色，允许一名纸剑/影子非普通角色 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 常规巡检；优先级低于 pending rejected 店铺 | 波普 + 水墨喷溅，或克莱因蓝秩序的模型店版本 | 按视觉重构幅度决定；当前角色字段已有基本分工 |
| P3 | `pw_jingan_catbell_refuge` | `char_pw_mimi_nya` 眯眯喵桑 | 原创成年猫亚人店主 | 512×512 新质量基线/高分辨率系列；无旧拒稿记录；仍需从审美疲劳角度人工复核 | 512×512 | True | 常规巡检；优先级低于 pending rejected 店铺 | 专属猫铃小屋系列；可后续做上海夜色低饱和漫画风，不与医院/外星店混用 | 不急：现有 copy 已包含猫耳/尾巴/安全边界 |
| P3 | `pw_jingan_catbell_refuge` | `char_pw_yinpiao` 银票 | 原创猫尾账房人 | 256×256 legacy 公益 NPC 表情组；无旧拒稿记录；仍需从审美疲劳角度人工复核 | 256×256 | True | 常规巡检；优先级低于 pending rejected 店铺 | 专属猫铃小屋系列；可后续做上海夜色低饱和漫画风，不与医院/外星店混用 | 不急：现有 copy 已包含账房与猫尾职责 |
| P3 | `pw_jingan_catbell_refuge` | `char_pw_tongling` 铜铃 | 猫铃/守门铃类半拟人或小型猫守卫 | 256×256 legacy 公益 NPC 表情组；旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组 | 256×256 | True | 常规巡检；优先级低于 pending rejected 店铺 | 专属猫铃小屋系列；可后续做上海夜色低饱和漫画风，不与医院/外星店混用 | 可加强：门口守铃职责与身体轮廓 |
| BASELINE | `pw_hospital_night_care` | `char_pw_mika_nurse` 弥夏 | 现实医院夜班护士人类 NPC（新基线） | 512×512 新质量基线/高分辨率系列；医院三人组：当前任务新质量基线，不纳入第一轮旧店重构 | 512×512 | True | 新质量基线；当前审查不建议改动 | 保持当前医院三人组作为基线；除非资产或聊天契约退化，否则不进入第一轮旧店重构 | 无需 |
| BASELINE | `pw_hospital_night_care` | `char_pw_qingyou_records` 青柚 | 现实医院档案员人类 NPC（新基线） | 512×512 新质量基线/高分辨率系列；医院三人组：当前任务新质量基线，不纳入第一轮旧店重构 | 512×512 | True | 新质量基线；当前审查不建议改动 | 保持当前医院三人组作为基线；除非资产或聊天契约退化，否则不进入第一轮旧店重构 | 无需 |
| BASELINE | `pw_hospital_night_care` | `char_pw_nanxing_liaison` 南星 | 现实医院急救联络员人类 NPC（新基线） | 512×512 新质量基线/高分辨率系列；医院三人组：当前任务新质量基线，不纳入第一轮旧店重构 | 512×512 | True | 新质量基线；当前审查不建议改动 | 保持当前医院三人组作为基线；除非资产或聊天契约退化，否则不进入第一轮旧店重构 | 无需 |

## Asset hash manifest

完整 hash / path 数据见 JSON：`public-welfare-npc-batch-0-audit.json`。

Generated evidence files:
- `public-welfare-all-sprites-contact-sheet.png`
- `public-welfare-expression-matrix-contact-sheet.png`
- `previous-public-welfare-neutral-contact-sheet.png` copied from previous audit

## Batch 0 conclusion

- 当前代码/资产层面已经满足每店 ≥3 角色、每角色五表情 PNG、本地 rules backend、无 API key、核心聊天回归测试覆盖。
- 质量风险主要不是缺文件，而是旧拒稿 manifest 中仍有 expression pending、旧 256×256 legacy 风格疲劳，以及非现实主题店铺的物种/体态表达不够强。
- 下一步应先为 Batch 1 三个候选店铺写 Prompt-as-Code manifest 和 style diversity matrix，再生成/落盘正式替换图；不要直接覆盖旧图。
