# 2026-04-20 - FM-VT-GC-05 Tavern 模型群聊字段 + service 层

## 范围

| 文件 | 说明 |
|------|------|
| `fablemap/tavern.py` | `TavernCharacter` 添加 `talkativeness`；`Tavern` 添加 `group_chat_enabled` 和 `group_chat_config` |
| `docs/AI_SHARED_TASKLIST.md` | 新增 FM-VT-GC-05 ~ GC-10 任务章节 |
| `docs/claims/2026-04-20-fm-vt-gc-05-tavern-model-group-chat-fields.md` | 任务认领说明 |

## 行为

- `TavernCharacter`：新增 `talkativeness: float = 0.5` 字段，含 `to_dict()` 和 `from_dict()` 序列化
- `Tavern`：新增 `group_chat_enabled: bool = False` 和 `group_chat_config: dict` 字段，含 `to_dict()` 和 `from_dict()` 序列化
- 所有序列化向后兼容：旧数据缺失字段时取默认值

## 验证

- 已通过：`py -3 -m compileall -q fablemap`
- `tavern.py` 语法检查通过，Tavern / TavernCharacter 序列化/反序列化逻辑完整
- 既有测试保持通过

## 备注

GC-05 完成后，GC-06（API 路由）、GC-07（前端 service）、GC-08（群聊界面）、GC-09（店主配置）和 GC-10（测试）待后续实现。
