# 2026-03-11 页面入口与预览页双语切换第一版说明

## 本次做了什么

- 为仓库根目录 `index.html` 增加中英双语字典、语言切换控件与本地存储记忆
- 为 `fablemap.bundle` 生成的 `bundle/index.html` 增加中英双语字典、语言切换控件与 `?lang=` 同步
- 让页面入口在嵌入 iframe 预览时自动带上当前语言，减少入口页与预览页语言不一致
- 更新 `tests/test_page.py` 与 `tests/test_bundle.py`，覆盖双语切换控件与相关页面输出
- 更新 `README.md`，明确“入口页”和“预览页”的区别，并补充双语体验说明

## 为什么要做

上一版已经把 nearby 体验推进成：

- 一个浏览器页面入口
- 一个生成后的 bundle 预览页

但两个页面的语言体验并不一致：

- 页面入口以中文为主
- 生成后的预览页主要是英文

这次的目标是先补齐 UI 层的双语切换，让用户能在入口页和预览页里显式切到中文或英文，而不改世界数据本身。

## 影响范围

- `index.html`
- `fablemap/bundle.py`
- `tests/test_page.py`
- `tests/test_bundle.py`
- `README.md`
- `docs/claims/2026-03-11-bilingual-page-preview-v1.md`

## 明确没有改什么

- 没有修改 `WORLD_SCHEMA`
- 没有改动 nearby / page API 协议
- 没有引入第三方国际化框架或额外依赖
- 没有把生成出来的世界内容整体改成机器翻译链路

## 验证方式

- 执行 `python -m unittest tests/test_bundle.py tests/test_page.py`
- 回归执行 `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- 执行页面服务 smoke，确认根入口页和生成后的预览页都输出语言切换控件
- 执行 `git diff --check`

## 备注

- 本次双语切换主要覆盖 UI 文案，不主动翻译世界内容字段
- 生成后的预览页既可被页面入口 iframe 打开，也可独立打开；语言状态优先从 `?lang=`、本地存储和浏览器语言推断