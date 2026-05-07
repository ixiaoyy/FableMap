# 2026-04-29 公益空间重命名归类与 NPC 补齐

## 变更摘要

- 将 8 间默认公益空间统一改为“公益·分类化空间名”的展示命名：
  - 公益·灯塔问讯台
  - 公益·夜航树洞电台
  - 公益·街角修补工坊
  - 公益·城市拾光档案亭
  - 公益·第三货架观测站
  - 公益·午夜委托局
  - 公益·放学后英雄补给社
  - 公益·静安猫铃空间
- 补齐公益空间 NPC 阵容：每间默认公益空间至少 3 名角色。
- 新增 10 名公益 NPC：路明、桥桥、夜雨、灯芯、巧手、拾忆、索引、火眼、星袋、铜铃。
- 新增对应项目内 NPC PNG 资源，每名新增 NPC 包含 neutral / joy / anger / embarrassment / curiosity 资源，并由 seed 直接引用。

## 边界说明

- 本次只调整平台默认公益 seed 内容，不新增 Tavern schema 字段，不改变 API 协议。
- 新增 NPC 均为平台默认公益示例角色，不替店主自动生成或发布用户空间内容。
- 所有公益空间仍使用本地 `rules` 后端，不需要 API Key，不产生外部 LLM token 消耗。

## 关键文件

- `backend/src/fablemap_api/core/default_taverns.py`
- `tests/test_default_public_welfare_taverns.py`
- `frontend/public/assets/npcs/char_pw_*-*.png`

## 验证

- `C:\Users\phpxi\miniconda3\python.exe -m pytest -q --tb=short tests/test_default_public_welfare_taverns.py tests/test_default_public_welfare_gameplays.py`：19 passed

## 2026-04-29 追加：公益空间美术与内容打磨

- 替换新增 10 名公益 NPC 的项目内 PNG 资源，保留原有 `/assets/npcs/<char_id>-<expression>.png` 引用路径。
- 每名新增 NPC 仍保留 `neutral / joy / anger / embarrassment / curiosity` 五套表情资源。
- 为 8 间公益空间追加 `NPC 分工` 世界书，明确每间空间 3+ NPC 的职责边界。
- 为 8 间公益空间追加“角色分工”玩法入口，作为低风险、安全边界清晰的文字互动入口。
- 不新增 schema/API 字段，不改变 owner/API key/token 边界。

## 追加验证

- `C:\Users\phpxi\miniconda3\python.exe -m pytest -q --tb=short tests/test_default_public_welfare_taverns.py tests/test_default_public_welfare_gameplays.py`：20 passed
- `C:\Users\phpxi\miniconda3\python.exe -m compileall -q backend/src`：passed
- `npm --prefix .\frontend run build`：passed（沙箱内因 Tailwind native dependency / spawn EPERM 失败后，按授权在沙箱外重跑通过）
