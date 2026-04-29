# AI Assisted Tavern Drafts

## Goal

在 `/create` 开店页提供 owner-confirmed AI 草稿能力：店主基于真实坐标、地址、地点类型和偏好，调用自己的默认 LLM 生成一份未发布、可编辑、可丢弃的开店草稿。草稿只填充创建表单，店主确认点击“创建酒馆”后才复用现有 `createTavern` / `addCharacter` 持久化。

## Product Constraints

- 保持 FableMap 主线：真实坐标 → 创建酒馆 → 配置 AI NPC → 对话互动。
- 遵守主人主权：AI 只生成候选草稿，不自动创建、发布、覆盖或导出酒馆内容。
- 所有酒馆仍必须挂接真实 `lat/lon`；AI 不创建坐标。
- 店主默认 LLM 配置属于敏感数据；API Key 不回传前端、不写日志、不进入公开 payload 或导出包。
- 不新增 Tavern / TavernCharacter 持久 Schema；确认后仍映射到现有字段。
- 不做平台级 token 充值、计费、抽成或市场。

## User Story

作为 Tavernkeeper，我希望在开店时先填真实坐标、地址、地点类型和少量偏好，然后让系统调用我的默认 LLM 生成一份酒馆草稿。生成后我可以编辑或丢弃；只有我点击“创建酒馆”后，内容才真正保存并上线。

## Requirements

### 1. Owner-level default LLM config

新增店主默认 LLM 配置能力，用于创建页草稿生成。

MVP 后端存储：

```text
fablemap_data/owner_configs.json
```

建议接口：

```http
GET /api/v1/owners/me/default-llm
PUT /api/v1/owners/me/default-llm
```

配置字段：

- `backend`
- `model`
- `api_key`
- `base_url`
- `temperature`
- `max_tokens`
- `top_p`

读取响应必须隐藏密钥：

```json
{
  "configured": true,
  "llm_config": {
    "backend": "openai",
    "model": "gpt-4o-mini",
    "api_key_configured": true,
    "base_url": "",
    "temperature": 0.8,
    "max_tokens": 1024,
    "top_p": 1.0
  }
}
```

### 2. Tavern draft generation API

新增接口：

```http
POST /api/v1/owners/me/tavern-drafts/generate
```

输入：

```ts
interface TavernDraftRequest {
  lat: number
  lon: number
  address?: string
  place_type?: PlaceType
  style_tags?: string[]
  forbidden?: string[]
  tone?: string
}
```

后端使用 `X-User-Id` 识别 owner，并读取该 owner 的默认 LLM 配置。没有配置时返回明确错误，不修改任何持久数据。

输出：

```ts
interface TavernDraftResponse {
  draft: {
    name: string
    description: string
    scene_prompt: string
    character: {
      name: string
      description: string
      personality?: string
      scenario?: string
      system_prompt?: string
      first_mes: string
      mes_example?: string
      tags?: string[]
    }
  }
}
```

### 3. Create page integration

`frontend/app/routes/create.tsx` 增加“AI 辅助草稿”面板：

- 显示当前 owner 默认 LLM 是否已配置。
- 未配置时提示先配置默认 LLM。
- 输入偏好：风格标签、禁止方向、语气。
- 点击“生成 AI 草稿”后调用 `POST /api/v1/owners/me/tavern-drafts/generate`。
- 返回草稿后填充现有创建表单字段：
  - 酒馆名称
  - 简介
  - 场景提示
  - 首个 NPC 名称
  - NPC 简介
  - 首次问候
- 店主可以继续编辑。
- 只有提交创建表单时才调用现有 `createTavern` / `addCharacter`。

### 4. Prompt and validation

后端 prompt 必须要求 LLM 输出 JSON，并包含以下边界：

- 生成原创酒馆和原创 NPC。
- 不生成现实名人、影视/游戏/IP 角色。
- 不生成露骨色情、未成年性化、非自愿、仇恨骚扰、现实危险行动。
- 不写真实私人地址、身份证、手机号、API Key 等敏感信息。
- 不生成战斗、等级、装备、排行榜等非酒馆主线内容。
- 不声称内容已发布。

后端需要校验/清洗：

- JSON 解析失败则返回错误。
- 字段缺失时返回错误或用安全默认文案补齐。
- 字段长度裁剪到现有 UI / schema 可接受范围。
- `tags` 归一化为短字符串数组。
- 响应中不得包含 `api_key`。


## Storage Strategy / Long-term Data Direction

当前项目仍处于 MVP / 本地原型阶段，允许使用 JSON 文件作为过渡存储，但不能让业务层直接依赖文件路径或 JSON 格式。所有新增 owner-level 配置必须通过 Store 抽象访问。

本任务的 `owner_configs.json` 定位：

- 仅作为 MVP JSON-backed persistence。
- 路由层不得直接读写 JSON。
- application service 不应拼接文件路径，只依赖 `OwnerConfigStore` 接口。
- 原始 API Key 只保存在服务端 store；read API 只返回 masked summary。
- 后续迁移 MySQL / Postgres 时，应新增 `MySQLOwnerConfigStore` 或等价实现，保持 API 与 service 契约不变。

长期方向：

- 数据库应承载动态、多 owner、多用户、需要权限和查询的数据：owner config / API Key、taverns、characters、chat history、memory atoms、guestbook、notifications、rumors、token usage。
- 文件只应保留 seed、fixtures、本地开发数据、导入导出包、artifacts 和审计材料。
- 新功能若必须新增持久化数据，优先先定义 Store 边界，再决定 JSON MVP 或数据库实现；不得让散落 JSON 文件成为长期架构核心。

对本任务的实现约束：

- `OwnerConfigStore` 是本轮必须的隔离层，不允许在 route 或 React 代码中引用 `owner_configs.json`。
- PRD 验收时需确认 raw API Key 未进入公开 payload、导出包、日志或前端读响应。
- MySQL owner config 持久化不在本轮实现，但必须在实现说明中记录为 follow-up。
## Non-goals

- 不自动创建 Tavern。
- 不自动发布 NPC。
- 不覆盖已有酒馆或角色。
- 不生成 world_info、gameplay、头像、地图画面或长期记忆。
- 不新增草稿历史、多版本审核状态或持久 draft schema。
- 不实现 MySQL owner config 表；MVP 先 JSON store，保留后续扩展点。
- 不做平台级 Token 支付或结算。

## Data Flow

```text
店主保存默认 LLM
→ 打开 /create
→ 输入坐标/地址/地点类型/偏好
→ 点击“生成 AI 草稿”
→ 后端按 X-User-Id 读取 owner 默认 LLM
→ 调用 LLM，要求 JSON 输出
→ 后端解析、校验、裁剪
→ 前端填充表单
→ 店主编辑/丢弃/重新生成
→ 店主点击“创建酒馆”
→ 现有 createTavern + addCharacter 持久化
```

## Architecture Notes

- Backend should add a focused owner config persistence helper rather than embedding owner defaults into Tavern schema.
- Draft generation should live in application/service layer and use existing `core.llm_clients.create_client`.
- Frontend service methods should be added to `frontend/app/lib/taverns.ts` or a small adjacent draft helper; route components should not call `/api/...` directly.
- API key masking should match existing tavern LLM behavior: empty key in read responses, boolean configured flag allowed.
- Existing `POST /api/v1/taverns/{tavern_id}/characters/ai-draft` remains for existing-tavern NPC drafts; this task adds create-page tavern+first-NPC draft generation.

## Acceptance Criteria

- [x] 店主可以保存 owner-level 默认 LLM 配置。
- [x] 读取默认 LLM 配置时不回显 API Key，只返回 `api_key_configured` / `configured` 等安全摘要。
- [x] `/api/v1/owners/me/tavern-drafts/generate` 使用当前 `X-User-Id` 的默认 LLM 配置。
- [x] 没有默认 LLM 配置时，草稿接口返回明确错误，不写入 Tavern / Character。
- [x] LLM 成功返回后，草稿包含酒馆名称、简介、场景提示和首个 NPC 最小字段。
- [x] 草稿生成不会创建 Tavern，不会新增 Character，不进入公开 Tavern payload。
- [x] `/create` 页可以生成草稿并填充现有表单，店主仍可编辑。
- [x] 只有点击“创建酒馆”后才调用现有 `createTavern` / `addCharacter`。
- [x] 非当前 owner 不能读取或使用他人的默认 LLM 配置。
- [x] 后端测试覆盖配置保存、密钥隐藏、无配置失败、草稿不持久化、成功响应结构。
- [x] 前端脚本测试覆盖草稿请求规范化和填表映射。
- [x] `py -3 -m compileall -q backend/src`、focused pytest、`npm --prefix .\frontend test`、`npm --prefix .\frontend run build` 通过。

## Verification Plan

Backend:

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py --tb=short
```

Frontend:

```powershell
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

Security checks:

- Search for accidental API key logging or response exposure.
- Verify owner config read payload does not contain raw `api_key`.
- Verify generated draft response does not include LLM config.

## Open Decisions

- MySQL persistence for owner configs is out of MVP and should be a follow-up if deployment requires it.
- UI location for default LLM configuration can start inside `/create` as a compact panel or link to a future owner settings page; implementation should choose the smallest path that keeps API Key hidden after save.