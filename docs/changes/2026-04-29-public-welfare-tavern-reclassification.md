# 2026-04-29 公益酒馆重命名归类与 NPC 补齐

## 变更摘要

- 将 8 间默认公益酒馆统一改为“公益·分类化酒馆名”的展示命名：
  - 公益·灯塔问讯台
  - 公益·夜航树洞电台
  - 公益·街角修补工坊
  - 公益·城市拾光档案亭
  - 公益·第三货架观测站
  - 公益·午夜委托局
  - 公益·放学后英雄补给社
  - 公益·静安猫铃小屋
- 补齐公益酒馆 NPC 阵容：每间默认公益酒馆至少 3 名角色。
- 新增 10 名公益 NPC：路明、桥桥、夜雨、灯芯、巧手、拾忆、索引、火眼、星袋、铜铃。
- 新增对应项目内 NPC PNG 资源，每名新增 NPC 包含 neutral / joy / anger / embarrassment / curiosity 资源，并由 seed 直接引用。

## 边界说明

- 本次只调整平台默认公益 seed 内容，不新增 Tavern schema 字段，不改变 API 协议。
- 新增 NPC 均为平台默认公益示例角色，不替店主自动生成或发布用户酒馆内容。
- 所有公益酒馆仍使用本地 `rules` 后端，不需要 API Key，不产生外部 LLM token 消耗。

## 关键文件

- `backend/src/fablemap_api/core/default_taverns.py`
- `tests/test_default_public_welfare_taverns.py`
- `frontend/public/assets/npcs/char_pw_*-*.png`

## 验证

- `C:\Users\phpxi\miniconda3\python.exe -m pytest -q --tb=short tests/test_default_public_welfare_taverns.py tests/test_default_public_welfare_gameplays.py`：19 passed
