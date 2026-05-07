# 2026-04-20 默认公益空间与系统预设角色

## 变更摘要

- 新增 6 个系统预设角色：
  - 公益互助：小舟、安澜、阿槐、闻笺
  - 城市守望：岚姨、北辰
- 新增 4 个平台默认公益空间，首次启动/空数据目录会自动写入：
  - 新手旅人服务站
  - 深夜树洞电台
  - 社区修补铺
  - 城市失物档案亭
- 默认公益空间使用 `rules` 本地规则后端：
  - 不需要 API Key
  - 不访问外部网络
  - 可进入、可聊天、可写入访客会话
  - 不计入 LLM token 消耗
  - 对自伤/即时危险表达优先提示现实求助边界
- 默认种子写入是幂等的，并增加安全边界：
  - 已存在同 ID 空间不会被覆盖，便于后续人工调整
  - `taverns.json` 损坏/不可解析时不会被自动覆盖
  - 可用 `FABLEMAP_SEED_DEFAULT_TAVERNS=0` 关闭默认公益空间种入

## 关键文件

- `frontend/src/systemCharacterPresets.js`
- `fablemap/default_taverns.py`
- `fablemap/tavern.py`
- `fablemap/web/service.py`
- `tests/test_default_public_welfare_taverns.py`

## 验证

- `pytest`（仓库 `pytest.ini` 限定 `tests/`）：216 passed
- `npm --prefix .\frontend run build`
