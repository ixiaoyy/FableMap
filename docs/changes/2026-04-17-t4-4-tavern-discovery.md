# T4.4 空间搜索发现

## 背景

Phase 4 需要把地图浏览链路从“只有 marker”推进到“可搜索、可筛选、可直接进入”的空间发现体验。

## 改动

- 新增地图舞台空间发现列表，支持搜索、入口筛选、营业状态筛选与排序。
- 搜索结果与地图空间 marker 共用同一份筛选结果，点击卡片会打开对应入场面板。
- 前端列表展示距离、访问方式、营业状态、角色数、访问次数与地址。
- `/api/taverns` 支持 `q` 与 `status` 参数，保留 `lat/lon/radius/access/owner_id` 过滤。
- 店主查询空间时允许返回自己拥有的私有空间，普通发现仍不会暴露私有空间。
- 新增发现过滤回归测试。

## 验证

- `npm run build`
- `py -3 -m pytest tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`
