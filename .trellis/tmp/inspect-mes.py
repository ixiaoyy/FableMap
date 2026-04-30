from pathlib import Path
text=Path('frontend/app/product/tavernTemplates.js').read_text(encoding='utf-8')
for marker in ["mes_example: '<START>"]:
    i=text.find(marker, text.find('char_guild_receptionist_lota'))
    print(text[i:i+260].encode('unicode_escape').decode('ascii'))
    j=text.find(marker, text.find('char_quest_aunt'))
    print(text[j:j+260].encode('unicode_escape').decode('ascii'))
