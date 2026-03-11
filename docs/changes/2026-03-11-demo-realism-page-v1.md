# 2026-03-11 demo 真实性增强（页面入口 v1）

## 背景

用户要求把现有 nearby 页面入口继续做成一个“更完善的 demo”，并进一步增强“真实性”。

## 本次改动

- 扩展 `fablemap.nearby.generate_nearby_preview()` 返回字段，补充页面可直接消费的现实来源 / 生成元信息：
  - `seed`
  - `source_lat` / `source_lon` / `source_radius_m`
  - `source_file`
  - `osm_url`
  - `region_name` / `region_theme` / `region_summary`
  - `dominant_faction`
  - `source_element_count`
  - `generated_at`
- 增强仓库根目录 `index.html`：
  - 增加“用我的当前位置”按钮
  - 增加预设地点按钮
  - 扩展结果卡片，区分现实来源 / 异世界解释 / 生成资产
  - 保持中英双语切换兼容
- 更新 `README.md` 的 30 秒 demo 说明
- 补充 `tests/test_page.py` 回归断言

## 结果

当前 nearby 页面入口不再只是“填表单 → 打开预览”的壳，而是具备：

- 更真实的地点选择入口
- 更适合演示的预设地点体验
- 更明确的现实来源 / 异世界解释 / 生成资产信息

## 验证

- `python -m unittest tests/test_page.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`