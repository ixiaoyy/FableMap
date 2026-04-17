# 2026-04-17 — P2-01 结构化记忆模型

## 目标

把酒馆记忆从“访问次数 + 关系阶段”推进到可落库、可检索、可授权的内容型记忆原子，为后续自动提炼和 Prompt 预算注入打底。

## 改动

| 文件 | 说明 |
|------|------|
| `fablemap/memory.py` | 新增 `MemoryAtom` 模型，规范化 scope / dimension / horizon / visibility、重要度、置信度、来源消息和扩展元数据 |
| `fablemap/tavern.py` | 新增 `_memory_atoms` 私有扩展桶持久化，支持 list / get / save / delete |
| `fablemap/web/service.py` | 新增结构化记忆 CRUD、筛选和 private / owner / public 权限逻辑 |
| `fablemap/web/router.py` | 新增 `/api/taverns/{id}/memory-atoms` 列表、创建、详情、更新、删除端点 |
| `frontend/src/services/tavernService.js` | 新增结构化记忆 API 封装 |
| `tests/test_tavern_memory_atoms.py` | 覆盖模型规范化、CRUD、筛选和私密记忆权限边界 |

## 权限边界

- `private` 记忆只允许所属访客读取、更新和删除；店主不能读取其他访客的私密记忆。
- `owner` 记忆允许店主和相关访客读取。
- `public` 记忆允许可进入该酒馆视图的用户读取。
- 非店主不能创建公共酒馆或地点记忆。

## 验证

- `py -3 -m pytest tests/test_tavern_memory_atoms.py -q`：2 passed
- `py -3 -m pytest tests/test_tavern_memory_atoms.py tests/test_tavern_runtime_presets.py tests/test_tavern_prompt_blocks.py tests/test_tavern_output_rules.py tests/test_tavern_router_compat.py tests/test_tavern_token_usage.py tests/test_tavern_llm_degradation.py -q`：17 passed, 4 skipped
- `py -3 -m compileall fablemap`：通过
- `npm --prefix .\frontend run build`：通过

## 备注

仓库根目录直接执行完整 `pytest` 会收集 `tools/ComfyUI` 的外部测试；当前本机环境缺少 `torch`、`aiohttp`、`sqlalchemy` 等依赖，因此不作为本次回归口径。
