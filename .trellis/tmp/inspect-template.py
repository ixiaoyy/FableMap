from pathlib import Path
text=Path('frontend/app/product/tavernTemplates.js').read_text(encoding='utf-8')
for marker in ["description: '街角", "scenario: '公告栏"]:
    i=text.find(marker)
    print('MARK', marker, i)
    print(text[i:i+900])
