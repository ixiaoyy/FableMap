# 变更说明：地点记忆回声与情绪胶囊 MVP C2

## 为什么改

地图已经具备交互层、视觉转义、扰动层、治愈层与播报层，但还缺少一条更贴近“城市记忆”的最小入口。

这次不做完整的私密留言系统，也不提前展开权限与写回，而是按敏捷方式先收口一个**只读记忆回声 MVP**：

- 地标旁能看见历史回声
- 私密地点能看见情绪胶囊标记
- 侧边详情能显示一条回声摘要

## 改了什么

### `fablemap/world_builder.py`

- 生成 `historical_echoes`
- 通过 `_build_private_marks(pois)` 生成 `state.private_marks`
- 只使用现有 landmark / POI 字段派生最小示例数据，不改 Schema

### `fablemap/bundle.py`

- 新增 `echo-node` / `echo-text` 的地图回声层
- 新增 `capsule-mark` / `capsule-bubble` 的情绪胶囊标记
- 在地标 detail-card 中新增 `echo-panel`
- 补充 `detailEchoTitle` i18n 与对应 CSS

### `tests/test_bundle.py`

- 已覆盖 `echo-node`
- 已覆盖 `echo-text`
- 已覆盖 `capsule-mark`
- 已覆盖 `capsule-bubble`
- 已覆盖 `echo-panel`
- 已覆盖 `data-i18n="detailEchoTitle"`

### `tests/test_page.py`

本轮补充页面服务级断言，确保通过 `page.py` 返回的 preview HTML 也稳定包含：

- `echo-node`
- `echo-text`
- `capsule-mark`
- `capsule-bubble`
- `echo-panel`
- `detailEchoTitle`

## 影响范围

- `fablemap/world_builder.py`
- `fablemap/bundle.py`
- `tests/test_bundle.py`
- `tests/test_page.py`
- `docs/claims/2026-03-12-memory-echo-layer-c2.md`

## 没改什么

- 没有新增用户写入接口
- 没有实现可见性权限、好友系统、时间胶囊生命周期
- 没有修改 Schema 或协议字段
- 没有引入第三方库

## 验证

- `python -m unittest tests/test_bundle.py tests/test_page.py`：通过
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`：通过
- `git diff --check`：无 diff 格式错误（仅现有 LF/CRLF 提示）

## 设计注记

- 这次故意把 `C2` 收缩为**只读入口 MVP**，不把长期共创、权限、写回一次做满
- 这样用户已经能感到“地图里有历史与情绪残留”，同时不会过早把系统复杂度推高