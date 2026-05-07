# T2.1 角色卡编辑器 UI

## 背景

T2.1 原为 `partial`：创建流程已有基础角色导入和手动添加，但缺少完整字段编辑、已有空间角色维护，以及头像/表情立绘的持久化闭环。

## 改动

- 新增 `CharacterEditor.jsx`，统一编辑角色名称、描述、性格、场景、系统提示词、开场白、示例对话、备用开场白、标签、默认头像和标准表情立绘。
- 创建空间 Step 3 支持编辑已导入角色，并用同一编辑器手动新增角色。
- 店主控制台新增 `CharacterManagementModal.jsx` 角色管理入口，可对已有空间新增、导入、编辑、删除角色。
- 创建完成后会把已新增角色回填到前端空间对象，角色数量立即可见。
- 前端角色卡解析保留 `avatar` 与 `sprites` 字段。
- 后端 `add_character` / `update_character` / `update_tavern({"characters": ...})` 支持保存 `avatar` 和 `sprites`。
- 补充角色编辑器持久化测试，覆盖直接角色更新和整表角色更新。
- 修复角色精灵图 API 的服务层调用，`/characters/{id}/sprites` 可以读取并保存到空间角色数据。

## 验证

- `npm run build`
- `py -3 -m pytest tests/test_tavern_character_editor.py tests/test_tavern_llm_degradation.py tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`（当前环境缺少 `httpx`，API 路由级用例会跳过）
- `py -3 -m py_compile fablemap/tavern.py fablemap/web/service.py fablemap/web/router.py`
- `git diff --check`（仅有 LF/CRLF 提示）
