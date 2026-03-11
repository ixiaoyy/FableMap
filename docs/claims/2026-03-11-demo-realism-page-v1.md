# 模块认领说明

- 模块名 / 区域名：nearby 页面 demo 真实性增强第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：done

## 目标

把当前的 nearby 页面体验从“能生成预览”推进到“更像真实 demo”：增加当前位置入口、预设地点入口，并在结果区展示更完整的现实来源与生成元信息。

## 本次重点

- 在仓库根目录 `index.html` 增加“用我的当前位置”和预设地点交互
- 在结果区补充坐标、半径、模式、区域名、世界种子和生成文件链接等真实性信息
- 对 `fablemap.page` / `fablemap.nearby` 做最小兼容扩展，返回页面渲染需要的元信息

## 计划修改范围

- `index.html`
- `fablemap/page.py`
- `fablemap/nearby.py`
- `tests/test_page.py`
- `README.md`
- `docs/changes/2026-03-11-demo-realism-page-v1.md`

## 明确不改范围

- 不修改 `WORLD_SCHEMA`
- 不重写 `world_builder` 的幻想映射规则
- 不引入第三方前端框架或地图 SDK
- 不在本次实现复杂地图选点、账户系统或持久历史记录

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/claims/README.md`

## 预期产出

- 页面交互增强代码
- 最小 API 元信息增强
- 对应测试与 README 体验说明更新
- 本次变更说明文档

## 验证方式

- 执行 `python -m unittest tests/test_page.py`
- 回归 `tests/test_nearby.py`、`tests/test_cli.py`、`tests/test_bundle.py`、`tests/test_demo.py`、`tests/test_showcase.py`
- 执行页面 smoke，确认当前位置、预设地点与结果区输出可用
- 执行 `git diff --check`

## 风险与备注

- 浏览器定位能力依赖用户授权与运行环境，需提供失败提示与手动回退
- 页面真实性增强应优先依赖现有世界/输出元信息，避免偷偷扩展协议边界