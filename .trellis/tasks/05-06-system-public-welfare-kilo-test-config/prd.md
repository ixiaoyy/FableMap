# Versioned System/Public Welfare Kilo Test Config

## Goal

把系统店 / 公益店前期测试用的 Kilo 免费模型配置落到版本库内的配置文件中；店主选择 `kilo-auto/free` 后，后端自动使用该测试配置，不再要求前端手填 API Key。

## Requirements

- 不使用 env 变量作为本轮配置入口。
- 新增仓库内版本化配置文件，包含系统 / 公益店测试期 Kilo Gateway 配置。
- 仅系统店 / 公益店在选择 `kilo-auto/free` 时自动套用该配置；普通店不继承这份测试 key。
- API Key 仍按敏感数据处理：不返回给访客、不在最终汇报中明文复述、不写日志。
- 默认新装公益店仍可保留 rules 兜底；只有店主显式选择 Kilo 免费模型时才切换到 Kilo 测试配置。

## Acceptance Criteria

- [x] 系统 / 公益店保存 `kilo-auto/free` 且不传 API Key 时，运行时 LLM config 包含 Kilo base URL 和私有 key。
- [x] 访客/普通读取 payload 不泄露 `api_key`。
- [x] 普通店保存同样的不完整配置仍不会套用系统测试 key。
- [x] V1 chat 在系统 / 公益店选择 Kilo 后走外部 LLM client 分支，而不是 rules 分支。
- [x] 前端 Kilo 预设带上 Kilo Gateway base URL，说明系统/公益店测试期后端会补齐测试配置。
- [x] 运行最小真实验证。

## Technical Notes

- 配置文件：`backend/config/system_public_welfare_llm.json`。
- 后端落点：`backend/src/fablemap_api/core/tavern.py`、`backend/src/fablemap_api/infrastructure/mysql_store.py`。
- 测试落点：`tests/test_default_public_welfare_taverns.py`、`backend/tests/test_v1_runtime_features.py`。
- 参考：Kilo Gateway 是 OpenAI-compatible，base URL 为 `https://api.kilo.ai/api/gateway`；`kilo-auto/free` 为 Auto Free 入口。

## Implementation Notes

- 2026-05-06: Added versioned system/public-welfare Kilo test config at `backend/config/system_public_welfare_llm.json`.
- 2026-05-06: System/public-welfare taverns that explicitly choose `kilo-auto/free` are hydrated from the versioned config at save/runtime/probe time; ordinary taverns do not inherit the test key.
- 2026-05-06: Frontend Kilo preset now includes the Kilo Gateway base URL and explains that only system/public-welfare testing is server-hydrated.
- 2026-05-06: Live Kilo Gateway smoke test returned `ok=True` through the repo config; focused backend/frontend verification passed.
- 2026-05-06: Playwright UI smoke entered `pw_lantern_helpdesk`, selected NPC `小舟`, sent a chat message, and received `Playwright-Kilo-UI-通了。` with `degraded=false`, `tavern_status=open`, no console errors, and no failed local requests.

## Verification Evidence

- Config direct smoke: repo-versioned Kilo config reached Kilo Gateway and returned `ok=True`.
- Local API setup: `http://127.0.0.1:8952/api/v1/health` returned HTTP 200 when bypassing proxy for localhost.
- Visitor privacy check: `GET /api/v1/taverns/pw_lantern_helpdesk?user_id=playwright-visitor` returned `api_key=""`.
- Direct chat API: `POST /api/v1/taverns/pw_lantern_helpdesk/chat` returned `response="Kilo测试通了。"`, `degraded=false`, `tavern_status=open`.
- Playwright report: `.trellis/tasks/05-06-system-public-welfare-kilo-test-config/artifacts/playwright-kilo-npc-chat-report.json`.
- Screenshots:
  - `.trellis/tasks/05-06-system-public-welfare-kilo-test-config/artifacts/kilo-npc-chat-desktop.png`
  - `.trellis/tasks/05-06-system-public-welfare-kilo-test-config/artifacts/kilo-npc-chat-mobile.png`

- 2026-05-07: Versioned system/public-welfare test config switched from Kilo Auto Free to Z.AI GLM-4.7-Flash per owner request; legacy kilo-auto/free markers are treated as a managed public-welfare alias and hydrated to the current GLM config.
