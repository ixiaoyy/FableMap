# 模块认领说明

- 模块名 / 区域名：页面入口与预览页双语切换第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

把当前 nearby 页面入口与 bundle 预览页补成中英双语界面，并允许用户在页面里显式切换到中文。

## 本次重点

- 为根目录 `index.html` 增加中英切换控件与前端文案字典
- 为 `fablemap.bundle` 生成的 `bundle/index.html` 增加中英切换控件与前端文案字典
- 让页面切换更偏向界面层，不改 world 数据结构与生成协议

## 计划修改范围

- 更新 `index.html`
- 更新 `fablemap/bundle.py`
- 更新 `tests/test_page.py` 与 `tests/test_bundle.py`
- 更新 `README.md` 与本次变更说明

## 明确不改范围

- 不修改 `WORLD_SCHEMA`
- 不引入第三方依赖或国际化框架
- 不改动 nearby / page API 协议
- 不新增机器翻译或 LLM 翻译链路

## 验证方式

- 执行 `tests/test_page.py` 与 `tests/test_bundle.py`
- 回归 `tests/test_cli.py`、`tests/test_nearby.py`
- 做一次页面服务 smoke，确认入口页和生成预览页都带双语切换能力
- 执行 `git diff --check`

## 风险与备注

- 本次优先做界面双语，不改变世界内容本身的生成语言
- 预览页可能被本地文件直接打开，因此切换逻辑应尽量依赖原生浏览器能力