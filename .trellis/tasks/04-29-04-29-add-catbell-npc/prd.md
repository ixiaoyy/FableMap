# Add NPC to Catbell Tavern

## Goal
在默认公益酒馆 `静安猫铃避难所` 中，为现有猫娘 `眯眯喵桑` 增加一个同馆 NPC。

## Requirements
- 新 NPC 与 `char_pw_mimi_nya` 位于同一个 Tavern：`pw_jingan_catbell_refuge`。
- 不新增或修改 TavernCharacter Schema 字段；只增加默认 seed 内容和项目内 NPC 资产引用。
- 新 NPC 必须是成年、原创、轻喜剧、安全边界明确的酒馆角色。
- 新 NPC 必须带项目内头像 / 表情资源路径，满足 formal NPC asset contract。
- 更新默认公益酒馆测试，验证同馆存在两个 NPC 且新 NPC 资源文件存在。

## Acceptance Criteria
- [ ] `pw_jingan_catbell_refuge` 默认 seed 的 `characters` 包含 `char_pw_mimi_nya` 和新 NPC。
- [ ] 新 NPC 的 `avatar`、`sprites.neutral/joy/anger/embarrassment/curiosity` 指向项目内 PNG。
- [ ] focused pytest 通过。
- [ ] `py -3 -m compileall -q backend/src` 或等效 Python 语法检查通过。

## Technical Notes
- 复用现有 tavern-themed NPC art 资产并复制为新 NPC 专属文件名，不使用临时目录或聊天预览图。
- 仅更新默认 seed 源码、测试和 Trellis 留痕；不做 API/schema/前端 UI 改造。
