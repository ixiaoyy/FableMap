# -*- coding: utf-8 -*-
from pathlib import Path
import re
path=Path('frontend/app/product/tavernTemplates.js')
text=path.read_text(encoding='utf-8')
text, c1 = re.subn(
    r"mes_example: '<START>\n\{\{user\}\}: 1\n\{\{char\}\}: 【完成记录】初访记录（到店贴纸）\n【可领取清单】吧台明信片：确认下一步。\n【回访提示】下次可以问明信片后来有没有寄出。\n【可选行动】1）查看明信片 2）询问吧台 3）先听规则',",
    r"mes_example: '<START>\n{{user}}: 1\n{{char}}: 【完成记录】初访记录（到店贴纸）\n【可领取清单】吧台明信片：确认下一步。\n【回访提示】下次可以问明信片后来有没有寄出。\n【可选行动】1）查看明信片 2）询问吧台 3）先听规则',",
    text,
    count=1,
)
text, c2 = re.subn(
    r"mes_example: '<START>\n\{\{user\}\}: 2\n\{\{char\}\}: 【清单项目】把今天整理成三件小事。\n【当前进度】0/3。\n【可选行动】1）写最急的一件 2）写最容易的一件 3）先休息一分钟\n【回访提示】下次可以从这三件小事里任选一件继续。',",
    r"mes_example: '<START>\n{{user}}: 2\n{{char}}: 【清单项目】把今天整理成三件小事。\n【当前进度】0/3。\n【可选行动】1）写最急的一件 2）写最容易的一件 3）先休息一分钟\n【回访提示】下次可以从这三件小事里任选一件继续。',",
    text,
    count=1,
)
if (c1, c2) != (1, 1):
    raise SystemExit(f'replacements failed: {c1}, {c2}')
path.write_text(text, encoding='utf-8')
