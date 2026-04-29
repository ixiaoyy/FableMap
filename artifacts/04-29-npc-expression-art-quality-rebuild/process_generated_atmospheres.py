from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, shutil

folder = Path(r'C:\Users\phpxi\.codex\generated_images\019dd8d7-6a36-7b63-80fb-4aa1cae9a8ce')
files = sorted(folder.glob('*.png'), key=lambda p: p.stat().st_mtime)[-10:]
names = [
    'atmosphere-healing.png',
    'atmosphere-supply.png',
    'atmosphere-judgement.png',
    'atmosphere-ember.png',
    'atmosphere-lore.png',
    'atmosphere-grove.png',
    'atmosphere-spirit.png',
    'atmosphere-shrine.png',
    'atmosphere-market.png',
    'atmosphere-transit.png',
]
out_dir = Path('frontend/public/place-atmosphere')
out_dir.mkdir(parents=True, exist_ok=True)
art_dir = Path('artifacts/04-29-npc-expression-art-quality-rebuild')
review_dir = art_dir / 'accepted-atmosphere-sources'
review_dir.mkdir(parents=True, exist_ok=True)
manifest=[]
thumbs=[]
for src, name in zip(files, names):
    with Image.open(src) as im:
        im = im.convert('RGB')
        w,h = im.size
        target_ratio = 16/9
        if w/h > target_ratio:
            new_w = int(h * target_ratio)
            left = (w-new_w)//2
            crop = im.crop((left,0,left+new_w,h))
        else:
            new_h = int(w / target_ratio)
            top = (h-new_h)//2
            crop = im.crop((0,top,w,top+new_h))
        final = crop.resize((512,288), Image.Resampling.LANCZOS)
        dst = out_dir / name
        final.save(dst, optimize=True)
        # provenance copy at source resolution
        prov = review_dir / name.replace('.png','-source.png')
        shutil.copy2(src, prov)
        thumbs.append((name, final.copy()))
        data = dst.read_bytes()
        manifest.append({
            'target': str(dst).replace('\\','/'),
            'source': str(src),
            'source_width': w,
            'source_height': h,
            'target_width': 512,
            'target_height': 288,
            'sha256': hashlib.sha256(data).hexdigest(),
            'bytes': len(data),
        })
# contact sheet
sheet = Image.new('RGB',(1024,(288+34)*5),(10,14,24))
d = ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(thumbs):
    x=(i%2)*512; y=(i//2)*(288+34)
    sheet.paste(im,(x,y)); d.rectangle((x,y+288,x+512,y+322), fill=(10,14,24)); d.text((x+8,y+296),name, fill=(235,241,245))
sheet.save(art_dir/'place-atmosphere-contact-sheet.png', optimize=True)
(art_dir/'place-atmosphere-assets.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(manifest, ensure_ascii=False, indent=2))
