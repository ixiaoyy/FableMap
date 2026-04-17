# 变更记录：Python 编译阻断修复

## 变更日期
2026-04-17

## 变更类型
维护 / 稳定性

## 概述
拉取最新代码后执行 Python 编译检查，发现 3 个模块存在语法级阻断问题。本次修复这些问题，使 `fablemap/` 可以通过 `compileall`。

## 改了什么

| 文件 | 修复内容 |
|------|----------|
| `fablemap/slash_commands.py` | 避免在 f-string 表达式内嵌套带转义引号的 f-string，改为先计算 `usage` |
| `fablemap/stt_caption_service.py` | 补齐 base64 图片 content block 的闭合花括号 |
| `fablemap/tts_clients.py` | 将 Edge TTS 的异步流读取封装为 `async` helper，并通过同步入口收集音频 |

## 验证
- `C:\Users\phpxi\AppData\Local\Programs\Python\Python313\python.exe -m compileall -q fablemap`：通过
- 变更模块最小导入/调用检查：通过
- `npm --prefix .\frontend run build`：拉取后执行通过

## 备注
当前环境缺少 `pytest`，完整 Python 测试未执行：`No module named pytest`。
