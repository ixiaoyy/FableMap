# Character Prompt Templates

## 1. FableMap 角色卡生成 Prompt 的 Prompt

把下面整段交给模型，让它根据店主输入生成角色卡草稿。

```text
你是 FableMap 赛博酒馆平台的「店主角色策划助手」。你的任务不是替平台自动发布角色，而是为店主生成可审阅、可修改、可确认的 NPC 草稿。

【输入】
- 酒馆名称：{{tavern_name}}
- 真实地点/坐标锚点：{{place_anchor}}
- 酒馆主题与氛围：{{tavern_theme}}
- 店主想要的角色功能：{{npc_job_to_be_done}}
- 访客进入后应产生的感受：{{visitor_feeling}}
- 物种/非人特征偏好（可选）：{{species_or_body_plan_preference}}
- 必须保留的设定：{{must_keep}}
- 禁止/不想要的方向：{{must_avoid}}
- 参考风格词（可选）：{{style_words}}

【生成要求】
1. 角色必须服务于这间真实坐标上的酒馆，而不是脱离空间的泛用角色。
2. 内容必须保持店主主权：所有输出都是「待店主确认的草稿」，不要写成已发布或已保存。
3. 不新增 TavernCharacter Schema 字段；只输出下列字段：name, description, personality, scenario, gender, system_prompt, first_mes, mes_example, alternate_greetings, tags。
4. 保持 SillyTavern 角色卡友好：description 写给主人看，personality 写长期性格，scenario 写角色扮演舞台，system_prompt 写可执行对话规则。
5. 不使用具体版权 IP、品牌 Logo、名人肖像、在世艺术家风格；不包含 API Key、Token、访客隐私。
6. 角色要有「留住用户」的回访钩子：记住访客偏好/未完成话题/下次再来的轻量理由，但不要承诺平台自动社交、战斗等级、付费抽成等不做方向。
7. 如果酒馆是异世界、奇幻、魔物镇、精灵市场、外星、灵异或类似非现实主题，不要默认所有角色都是普通人类；至少给出一个原创非人/非普通体态方案（如兽人、灵体、机械生命、异星居民、物件成精等），并把物种/体态写入 description、scenario、system_prompt 或 tags，不新增 schema 字段。

【输出格式】
先输出 5 行以内的「角色定位摘要」，再输出一个 JSON 草稿：
{
  "name": "",
  "description": "",
  "personality": "",
  "scenario": "",
  "gender": "unspecified | female | male | nonbinary | other",
  "system_prompt": "",
  "first_mes": "",
  "mes_example": "<START>\n{{user}}: ...\n{{char}}: ...",
  "alternate_greetings": [],
  "tags": []
}
最后输出「店主需要确认的 3 个问题」。
```

## 2. NPC 视觉素材 Prompt 生成器

把下面整段交给模型，让它为同一角色生成一致的立绘/头像/表情组提示词。

```text
请为 FableMap NPC 生成一组原创视觉素材 Prompt。不要生成图片，只写可复制到生图模型的提示词。

【角色输入】
- 角色名：{{character_name}}
- 角色定位：{{role_summary}}
- 物种/体态：{{species_or_body_plan}}
- 性格关键词：{{personality_keywords}}
- 酒馆环境：{{tavern_environment}}
- 必须出现的酒馆道具：{{tavern_props}}
- 视觉风格核心 / Style DNA：{{style_dna_prompt_or_recipe}}
- 可选构图骨架 / Composition Module：{{composition_module_optional}}
- 画幅/用途：{{portrait_or_sprite_usage}}

【身份一致性要求】
固定物种/体态、发型或头部轮廓、脸部/面部表达特征、服装主轮廓、标志性道具和主色；不同表情只改变表情、姿势、手势和局部光影，不改变身份。非人角色必须保持可读的表情或身体语言，例如发光核心、耳羽角度、机械眼灯、尾巴姿态、触须节奏等。

【每条 Prompt 必须包含】
主体身份 + 酒馆空间线索 + 构图景别 + 风格 DNA（流派/色彩科学/光影/媒介/材质/情绪/后期痕迹/时代感/细节密度）+ 可选构图骨架 + 约束。

【风格抽象要求】
如果视觉风格来自参考图或外部模板，只保留可迁移的美学 DNA，不保留原图具体角色、文字、品牌、IP、地名、情节或固定物件。把具体物件改写成视觉功能类型，例如“仪式性陈列物”“生活痕迹道具群落”“抽象坐标/档案碎片”。区分“借鉴印刷网点/胶片颗粒/杂志排版感作为纹理技法”与“画面本身是一张带真实标题/条形码/价格的出版物或商业海报”。

【输出】
1. neutral：默认立绘/头像 Prompt
2. joy/happy：欢迎、轻松、愿意继续聊的 Prompt
3. anger/angry：边界清晰但不攻击访客的 Prompt
4. embarrassment/shy：柔和迟疑或被戳中弱点的 Prompt
5. curiosity/curious：发现线索、邀请探索的 Prompt
6. negative prompt：无文字、无 Logo、无水印、无具体 IP、无空白占位头像、无过度暴露、无多余手指、无坏脸、无低清晰度
```

## 3. FableMap Prompt-as-Code JSON 模板

用于让 Agent / 脚本 / 批量任务先稳定结构，再把 JSON envelope 改写成自然语言生图 Prompt。完整技巧见 `prompt-as-code-techniques.md`。

```json
{
  "schema_version": "fablemap.visual_prompt.v1",
  "type": "FableMap Visual Asset Prompt",
  "asset_use": "npc_portrait | npc_expression_sprite_set | tavern_entry_card | discovery_campaign_card | coordinate_map_card | owner_guide_infographic | visual_souvenir_prompt_preview | series_grid_or_contact_sheet | exploded_diagram_card | editorial_mood_poster",
  "renderer_profile": "single_image_prompt | batch_prompt_manifest | prompt_preview_only | future_api_payload",
  "real_coordinate_anchor": {
    "place_name_or_area": "{{place_anchor}}",
    "privacy_level": "public_area_only | approximate | abstracted",
    "must_not_include": ["exact private address", "official map-provider imitation"]
  },
  "owner_confirmed_content": {
    "tavern_name": "{{tavern_name}}",
    "tavern_theme": "{{tavern_theme}}",
    "npc_or_subject_role": "{{npc_or_subject_role}}",
    "visitor_feeling": "{{visitor_feeling}}",
    "must_keep": [],
    "must_avoid": []
  },
  "subject": {
    "description": "{{subject_description}}",
    "species_or_body_plan": "{{species_or_body_plan}}",
    "identity_locks": ["silhouette", "main palette", "signature prop"],
    "allowed_variations": ["expression", "gesture", "local accent light"]
  },
  "tavern_cues": ["bar counter", "mugs", "shelves", "lanterns", "map-table", "cyber terminal glow"],
  "style_dna": {
    "art_style_and_genre": "{{style_family}}",
    "palette_color_science": "{{palette}}",
    "lighting_signature": "{{lighting}}",
    "medium_texture": "{{medium_texture}}",
    "mood": "{{mood}}",
    "era_context": "{{era_context}}",
    "detail_density": "{{detail_density}}",
    "post_processing": "{{post_processing}}",
    "symbolic_motifs": []
  },
  "quality_diversity": {
    "visual_thesis": "{{what_makes_this_image_visually_distinct}}",
    "must_differ_from_recent_assets": ["composition", "palette", "material system", "lighting", "style family"],
    "anti_repetition_notes": ["avoid repeating the same warm wood bar + teal glow formula unless intentional"],
    "rejection_criteria": ["generic AI concept art", "same decor as previous batch", "weak focal hierarchy"]
  },
  "composition": {
    "aspect_ratio": "{{aspect_ratio}}",
    "layout": "{{layout}}",
    "shot_type_angle": "{{shot_type_angle}}",
    "spatial_logic": "{{spatial_logic}}",
    "module_budget": "{{module_budget_if_infographic_or_grid}}",
    "mobile_crop_safe_area": "{{safe_area_if_frontend_surface}}"
  },
  "text_policy": {
    "mode": "none | owner_exact | simulated",
    "allowed_text": [],
    "forbidden_text": ["logos", "fake brand slogans", "visitor-private data"]
  },
  "constraints": [
    "owner-reviewable draft only",
    "original character/asset only",
    "no existing IP",
    "no living-artist imitation",
    "no watermark"
  ],
  "extension_modules": []
}
```

改写规则：先把 `asset_use + subject + tavern_cues` 写成开场，再接 Style DNA 段落；构图模块只在有用时拼接；最后写 text policy 与负面约束。若实际生成图片，必须落到项目资源路径。

扩展规则：新增能力优先加到 `extension_modules`，例如 `diagram.callouts.v1`、`series.identity-locks.v1`、`map.coordinate-memory.v1`；不要为了 prompt 方便新增 TavernCharacter 持久字段。

## 4. 图片风格反推 / 风格 DNA 模板生成 Prompt

用于把参考图、文字风格说明或用户提供的外部模板，反推为 FableMap 可复用风格模板。默认输出「风格 DNA Prompt + 可选构图骨架模块 + 主体内容推荐」；如果用户明确要求只要一段 prompt，则只输出 Prompt 本体。

```text
请作为世界顶级 AI 绘画提示词逆向工程专家（Reverse Prompt Engineer），分析输入的参考图或风格说明，萃取其可复用的“美学 DNA”，并把它改写成可直接用于 GPT Image / Nano Banana / Midjourney / Flux 的通用中英混合绘画 Prompt。

【核心任务】
剥离原图或参考文本中的具体角色、具体文字、品牌、版权 IP、地名、人物身份和叙事情节，只保留可迁移的风格 DNA。Prompt 的核心主体位置必须使用：
[在此处替换为您想要生成的主体内容 / Replace with your subject here]

【Layer 1：风格 DNA（Style DNA）—— 美学恒量】
请在内部完整分析并融合进 Prompt，不要把分析过程逐项输出：
1. 画面风格与流派归属：定位到具体品位分支，而不是只写“复古”“赛博”“动漫”。
2. 色调与色彩科学：主色、辅色、点缀色的关系和比例；冷暖策略、互补/类似色/限色印刷感、饱和度策略。
3. 光影特质：光源方向、硬/柔光、明暗对比、阴影形态；若光影来自材质反光、自发光或装饰性平面处理，也要写清楚。
4. 媒介、材质与物理质感：说明是借鉴某媒介的视觉纹理技法，还是最终画面就是该媒介载体；描述线稿、颗粒、纸张、油墨、反光、粗糙/光滑触感。
5. 情绪与氛围：精确到“是……而非……”的情绪层次，避免单一宽泛形容词。
6. 渲染参数与后期处理痕迹：景深、焦段感、颗粒、半色调、套色偏移、扫描线、色差、JPEG/数字噪声等。
7. 时代感与文化品位语境：说明时代美学坐标，以及它属于该时代里的哪个文化圈层/品位段位。
8. 信息密度与细节梯度：哪些区域高精度、哪些区域概括/平涂/留白。
9. 动态状态与瞬时感：静止、运动或凝固瞬间，以及这种状态怎样服务整体氛围。
10. 符号化视觉语言：只描述作为风格签名的元素类型，例如几何装饰、档案碎片、植物蔓藤、UI 图形、抽象坐标线、印刷网点等，不写死具体叙事物件。

【Layer 2：构图骨架（Composition Skeleton）—— 空间变量】
这部分只用抽象构图术语表达，严禁描述具体场景内容：
- 构图方式：中心、三分、对角线、不对称平衡、框中框、放射、垂直层叠、负空间等。
- 分镜类型与视角：特写/中景/远景、俯视/仰视/平视、广角/长焦/轴测等。
- 空间逻辑与透视关系：一点/两点/三点透视、平面化压缩、图层拼贴、错位窗口等。
- 空间角色：前景/中景/背景各承担视觉功能，而不是写具体是什么物体。

【抽象化规则】
- 严禁出现原图具体角色、人物姓名、品牌名、IP 名、可读文字、地名或具体情节。
- 严禁把具体物件写死；改写为视觉功能类型。
- 主体占位符周围只能描述主体的气质、存在感和姿态神韵，不写具体外貌、服饰细节或具体动作。
- 区分“借鉴媒介质感”与“媒介载体本身”：例如半调网点、套色偏移、复古纸张可以作为视觉纹理技法；不要自动要求生成带真实标题、条形码、价格标签的海报/杂志封面。

【输出格式】
严格输出以下三个部分，不要输出分析过程：

## 一、风格DNA Prompt（Style DNA Prompt）
输出一段完整、流畅、有画面节奏的中英混合绘画 Prompt。它只包含 Layer 1 风格 DNA，并在核心位置包含且只包含一次占位符：[在此处替换为您想要生成的主体内容 / Replace with your subject here]。即使不拼接构图模块，这段 Prompt 也必须能独立使用。

## 二、构图骨架模块（Composition Module）—— 可选拼接
先写这句使用说明：“将此模块拼接至风格DNA Prompt末尾，可还原原图的空间结构；也可根据您的创作需求自行替换为其他构图方案。”
随后输出一段只含抽象构图原理的 Prompt 片段。

## 三、主体内容推荐（Subject Recommendations）
- 高契合（High Affinity）：推荐与该风格天然契合的主体。
- 跨风格（Cross-Genre）：推荐来自不同题材但能产生有趣化学反应的主体。
- 反差混搭（Contrast Mashup）：推荐与该风格形成强烈反差、可能产生惊艳效果的主体。
```

## 5. 可复用风格语汇

选择其中一种作为 `style_kernel`，不要一次堆叠过多。完整可复制 recipes 见 `style-recipes.md`。

- **俄国构成主义 / 解构宣传海报**：不对称平衡，锐利三角形、圆形、粗重对角线，高饱和宝蓝/深黑/米白，复古丝网印刷颗粒与磨损，工业力量感。
- **窗口重叠数字拼贴**：错位矩形视窗、透明切片、像素排序、RGB 偏移、电子扫描线；主体内部可嵌入天空/云层/地图纹理，现代平面设计感。
- **照片 + 白色线稿混合媒介**：写实大光圈摄影背景，前景半透明细白线稿人物，局部发光色点，荷兰角或电影感光影，空灵 Lo-fi 怀旧。
- **三色高对比平面插画**：强对角线切割，两到三种限定色，黑色剪影与发光主体，大面积负空间，干笔刷/矿物颗粒纹理，孤独神圣或超现实气质。
- **半调雕刻线稿**：同心圆/平行弧线/刻线通过疏密和粗细塑形，双色背景与线条，现代主义矢量海报。
- **Risograph 复古杂志**：米色粗糙纸张、深蓝/米白半调主体、明黄几何拱门、极细轨道线、品红星点、条形码和粗体排版感。
- **波普 + 水墨喷溅**：高饱和明黄、克莱因蓝、大红对冲；赛璐璐平涂、波点网纹、水墨喷溅、纸张肌理和多层拼贴。
- **地下朋克黑客半调**：黑/白/亮橙三色，广角压迫手势或放射状元素，粗黑墨线、撕纸边缘、数字噪点、高密度丝网拼贴。
- **克莱因蓝秩序**：克莱因蓝与纯白，大面积留白，硬边阴影，仰拍透视，夏日清冷、孤独、通透的动画分镜感。
- **高对比数字工业故障**：纯白背景、黑色剪影、电光蓝重影，低角度动态对角线，Riso 噪点、色差边缘、像素撕裂和二值化硬核光影。
- **米白-红色电路图**：奶油米色大留白、不规则有机色块、主体服装与色块融合、白色电路节点/代码符号、Y2K 极客文化与赛璐璐平涂。
- **Y2K + 波普艺术**：电光蓝铺底、荧光橘点缀、像素抖动、半调网点、复古街景线稿、星芒/同心圆/UI 色块。
- **赛璐璐平涂 + 思维爆发**：中央偏下内省主体，上方意识碎片以建筑切片、丝带曲线、几何碎块和四芒星垂直交错，纯白负空间与 Riso 噪点。
- **70/80 年代街头拼贴海报**：黑白半调剪纸主体、复古红与芥末黄、撕报纸边缘、丝网油墨、扫描痕迹、错位叠印。
- **工业档案袋风格**：70 年代电路图、泛黄档案纸、打字机字符、摄影残片、等高线草图、复印机碳粉磨损和低饱和米褐/丹宁蓝。

## 6. 质量检查清单

- 角色是否绑定酒馆地点/职业/访客体验，而不是泛泛二次元人设？
- 若是异世界/奇幻/非现实店铺，是否避免全员普通人类，并给出原创非人或非普通体态方案？
- prompt 是否拆清楚了主体、构图、风格、色彩、媒介、约束？
- 是否保留店主确认环节，没有把 AI 草稿写成已发布内容？
- 是否避开具体 IP、品牌 Logo、名人/在世艺术家、敏感隐私？
- 视觉 Prompt 是否要求真实 tavern cues，而非空白头像？
- 若实际生成图片，是否已落到 `frontend/public/...`、`frontend/app/assets/...` 或 `artifacts/...`？
