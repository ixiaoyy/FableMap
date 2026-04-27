# AI 草稿正式功能设计

## 背景

`AI 草稿` 已在产品文档中被定义为“未发布、可编辑、可丢弃、必须由店主确认”的 NPC 创作辅助。本设计把草稿从静态产品说明落到 MVP 功能：后端提供确定性草稿生成，前端把结果放进既有角色编辑器，保存仍复用现有角色创建流程。

## 架构

- API：新增 `POST /api/v1/taverns/{tavern_id}/characters/ai-draft`。
- Contract：新增 `CharacterDraftRequest`，支持 `style_tags`、`forbidden`、`tone`。
- Application：在 `CharacterApplicationMixin` 中实现 `generate_character_draft`，负责 owner 校验、输入清洗、确定性草稿生成和响应封装。
- Frontend service：`frontend/app/lib/taverns.ts` 新增 `generateCharacterDraft`。
- Frontend UI：`CharacterManagementModal` 新增 AI 草稿小面板；草稿生成后进入 `CharacterEditor`，店主点击保存才调用 `addCharacter`。
- Assets：`frontend/public/assets/npcs/mimi-nya-*.png` 存放默认猫娘头像 / 表情，后端默认 seed 只引用路径。

## 数据流

```text
店主输入标签/禁忌 → POST ai-draft → 后端校验 owner → 返回 NpcDraftPreview
→ 前端合并为 editorDraft → 店主编辑/取消/保存 → POST characters → TavernCharacter 持久化
```

草稿响应不写入 `Tavern.characters`，也不进入公开分享或酒馆包导出。确认保存后的角色仍是现有 `TavernCharacter`，因此不新增持久化 schema。

## 错误处理

- 酒馆不存在：404 `酒馆不存在`。
- 非店主：403 `你不是此酒馆的主人`。
- 空输入允许：使用酒馆文本和安全默认标签生成通用 NPC。
- 禁忌方向会写入 `system_prompt` 的安全边界，但不会触发任何自动审核状态。

## 测试

- 后端 API 测试覆盖 owner 成功、非 owner 拒绝、不持久化、确认保存后才持久化。
- 默认酒馆测试覆盖猫娘头像 / 表情路径和 PNG 文件存在。
- 前端脚本测试覆盖 AI 草稿输入规范化与草稿合并逻辑。
- 构建测试覆盖 React / TypeScript 编译。
