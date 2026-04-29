from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random, math, hashlib, json
W, H = 512, 288
out_dir = Path('frontend/public/place-atmosphere')
out_dir.mkdir(parents=True, exist_ok=True)
art_dir = Path('artifacts/04-29-npc-expression-art-quality-rebuild')
art_dir.mkdir(parents=True, exist_ok=True)
SCENES = [
    ('atmosphere-healing.png', 'healing_sanctum', (246,210,130), (64,120,98)),
    ('atmosphere-supply.png', 'supply_outpost', (225,138,54), (91,54,34)),
    ('atmosphere-judgement.png', 'judgement_tower', (52,63,91), (18,24,44)),
    ('atmosphere-ember.png', 'ember_parlor', (211,91,35), (82,38,24)),
    ('atmosphere-lore.png', 'lore_academy', (106,102,181), (42,38,78)),
    ('atmosphere-grove.png', 'whispering_grove', (75,144,102), (38,63,58)),
    ('atmosphere-spirit.png', 'spirit_anchor', (74,194,228), (25,69,117)),
    ('atmosphere-shrine.png', 'forgotten_shrine', (130,151,95), (55,75,49)),
    ('atmosphere-market.png', 'market_hall', (236,154,80), (90,52,57)),
    ('atmosphere-transit.png', 'transit_node', (70,157,229), (35,45,92)),
]
def lerp(a,b,t): return int(a+(b-a)*t)
def blend(c1,c2,t): return tuple(lerp(a,b,t) for a,b in zip(c1,c2))
def base_gradient(top, bottom, seed):
    random.seed(seed); img = Image.new('RGB', (W,H), bottom); px = img.load()
    for y in range(H):
        t = y/(H-1); sky = blend(top,bottom,t)
        for x in range(W):
            v = random.randint(-3,3); px[x,y] = tuple(max(0,min(255,c+v)) for c in sky)
    return img.convert('RGBA')
def watercolor_overlay(img, seed, tone):
    random.seed(seed); layer = Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(layer,'RGBA')
    for _ in range(170):
        x=random.randint(-70,W+50); y=random.randint(-50,H+35); r=random.randint(18,95)
        col=(*blend(tone,(255,255,255),random.random()*0.35), random.randint(10,34))
        d.ellipse((x-r,y-r,x+r,y+r), fill=col)
    return Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(12)))
def draw_lantern(d,x,y,scale=1.0,glow=(255,190,90)):
    r=int(20*scale); d.ellipse((x-r*2,y-r*2,x+r*2,y+r*2), fill=(*glow,36))
    d.rounded_rectangle((x-7*scale,y-13*scale,x+7*scale,y+9*scale), radius=int(5*scale), fill=(255,184,86,210), outline=(255,228,160,160), width=max(1,int(1*scale)))
    d.line((x,y+10*scale,x,y+20*scale), fill=(80,50,35,200), width=max(1,int(2*scale)))
def draw_buildings(d, seed, dark=(22,30,45)):
    random.seed(seed)
    for i in range(13):
        x=i*45+random.randint(-18,10); w=random.randint(38,74); h=random.randint(36,96); y=H-32-h
        d.rectangle((x,y,x+w,H), fill=(*dark, random.randint(85,145)))
        for wx in range(x+9,x+w-6,16):
            for wy in range(y+12,H-45,20):
                if random.random()<0.33: d.rectangle((wx,wy,wx+4,wy+6), fill=(255,190,91,random.randint(45,105)))
def draw_tavern_room(d, palette, seed, academy=False, market=False):
    random.seed(seed)
    d.polygon([(0,H),(W,H),(420,183),(90,183)], fill=(51,34,25,210))
    for i in range(14): d.line((int(i*W/13),H, W/2,185), fill=(177,112,64,50), width=1)
    for y in range(200,H,18): d.line((0,y,W,y-8), fill=(255,212,135,32), width=1)
    d.rectangle((40,58,472,182), fill=(42,29,26,170), outline=(246,187,105,75), width=2)
    for y in [82,112,145]: d.line((58,y,454,y), fill=(221,150,84,120), width=3)
    for x in range(70,438,36):
        if market: d.rectangle((x,126,x+23,164), fill=(blend(palette,(255,255,255),0.2)+(160,)), outline=(255,220,130,80))
        elif academy:
            d.rectangle((x,73,x+16,144), fill=(82+random.randint(-18,20),54,38,185)); d.line((x+4,78,x+14,138), fill=(214,166,104,90), width=1)
        else: d.ellipse((x,92,x+16,126), fill=(137,78,38,170), outline=(255,194,113,80))
    d.rounded_rectangle((78,166,434,218), radius=8, fill=(74,42,28,225), outline=(246,172,91,80), width=2)
    for x in range(104,410,58): d.ellipse((x,156,x+24,172), fill=(241,191,117,110)); d.rectangle((x+3,166,x+21,184), fill=(132,83,45,180))
    for x in [92,202,322,430]: draw_lantern(d,x,52,0.75)
def draw_healing(d):
    d.ellipse((164,72,348,210), outline=(255,244,184,110), width=4)
    for x in range(190,323,42): d.rounded_rectangle((x,94,x+18,194), radius=8, fill=(246,237,188,95), outline=(255,255,225,105), width=2)
    for i in range(16):
        a=i*math.pi/8; x=256+math.cos(a)*80; y=146+math.sin(a)*60; d.ellipse((x-3,y-3,x+3,y+3), fill=(255,255,210,170))
    d.rounded_rectangle((132,204,380,228), radius=10, fill=(94,64,44,170))
def draw_judgement(d):
    d.polygon([(184,228),(328,228),(298,58),(214,58)], fill=(47,51,68,220), outline=(165,179,205,80))
    d.polygon([(204,62),(308,62),(280,33),(232,33)], fill=(37,41,56,230))
    for x in [222,254,286]: d.rectangle((x,88,x+12,188), fill=(25,29,42,170), outline=(134,145,170,70))
    for x in range(0,W,55): d.line((x,0,x+90,H), fill=(183,204,235,45), width=1)
    d.polygon([(120,230),(392,230),(350,250),(160,250)], fill=(26,29,41,170))
def draw_grove(d):
    for x in [42,82,140,356,418,466]:
        d.rectangle((x,26,x+16,H), fill=(35,56,44,155)); d.line((x+8,95,x-45,150), fill=(49,82,58,100), width=5); d.line((x+8,95,x+45,150), fill=(49,82,58,100), width=5)
    for x in range(18,492,38): d.arc((x,178,x+62,242),180,360, fill=(120,230,145,120), width=3)
    for _ in range(40):
        x=random.randint(0,W); y=random.randint(80,240); d.ellipse((x,y,x+3,y+3), fill=(178,255,204,150))
def draw_spirit(d):
    for r,a in [(124,55),(90,85),(58,130)]: d.ellipse((256-r,88-r/2,256+r,88+r*1.5), outline=(205,245,255,a), width=3)
    for a in range(0,360,24):
        x=256+math.cos(math.radians(a))*78; y=154+math.sin(math.radians(a))*42; d.line((256,154,x,y), fill=(150,229,255,58), width=1)
    d.ellipse((222,120,290,188), fill=(191,243,255,75), outline=(230,255,255,140), width=3); d.polygon([(156,232),(356,232),(310,202),(198,202)], fill=(61,86,118,150))
def draw_shrine(d):
    d.rectangle((188,102,324,214), fill=(86,76,56,180), outline=(175,162,118,80)); d.polygon([(166,108),(346,108),(256,54)], fill=(88,73,56,205), outline=(192,169,116,80))
    for x in [204,292]: d.rectangle((x,128,x+22,215), fill=(70,61,48,190))
    for x in range(0,W,42): d.arc((x,194,x+80,270),180,360, fill=(94,164,93,130), width=4)
    for _ in range(48):
        x=random.randint(0,W); y=random.randint(150,H); d.ellipse((x,y,x+5,y+5), fill=(126,181,92,120))
def draw_transit(d):
    d.polygon([(98,216),(414,216),(330,160),(182,160)], fill=(44,66,101,160), outline=(163,212,255,90)); d.polygon([(190,180),(322,180),(256,92)], fill=(94,154,214,85), outline=(180,226,255,115))
    for r in [70,112,154]: d.arc((256-r,92-r/3,256+r,92+r/2),190,350, fill=(164,220,255,105), width=2)
    for x in range(115,406,58): d.line((x,216,256,130), fill=(143,210,255,65), width=2)
def draw_scene(file, key, top, bottom, seed):
    img = watercolor_overlay(base_gradient(top,bottom,seed),seed+99,top); d=ImageDraw.Draw(img,'RGBA')
    draw_buildings(d,seed+10, blend(bottom,(0,0,0),0.35))
    if key in ['ember_parlor','supply_outpost','lore_academy','market_hall']: draw_tavern_room(d, top, seed+20, academy=key=='lore_academy', market=key in ['supply_outpost','market_hall'])
    if key=='healing_sanctum': draw_tavern_room(d, top, seed+21); draw_healing(d)
    elif key=='judgement_tower': draw_judgement(d)
    elif key=='whispering_grove': draw_grove(d)
    elif key=='spirit_anchor': draw_spirit(d)
    elif key=='forgotten_shrine': draw_shrine(d)
    elif key=='transit_node': draw_transit(d)
    fog=Image.new('RGBA',(W,H),(0,0,0,0)); fd=ImageDraw.Draw(fog,'RGBA'); random.seed(seed+30)
    for _ in range(90):
        x=random.randint(0,W); y=random.randint(10,H-20); r=random.randint(1,3); fd.ellipse((x-r,y-r,x+r,y+r), fill=(235,245,255,random.randint(28,100)))
    for _ in range(3):
        y=random.randint(132,226); fd.rectangle((0,y,W,y+random.randint(18,34)), fill=(230,230,255,18))
    img=Image.alpha_composite(img,fog.filter(ImageFilter.GaussianBlur(2)))
    vig=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(vig,'RGBA').rectangle((0,0,W,H), outline=(5,8,18,90), width=18)
    Image.alpha_composite(img,vig).convert('RGB').save(out_dir/file, optimize=True)
for i,(file,key,top,bottom) in enumerate(SCENES): draw_scene(file,key,top,bottom,4200+i)
thumbs=[]
for file, *_ in SCENES:
    with Image.open(out_dir/file) as im: thumbs.append((file,im.resize((256,144)).copy()))
sheet=Image.new('RGB',(512,(144+24)*5),(12,18,28)); d=ImageDraw.Draw(sheet)
for idx,(file,im) in enumerate(thumbs):
    x=(idx%2)*256; y=(idx//2)*(144+24); sheet.paste(im,(x,y)); d.text((x+6,y+148),file,fill=(235,241,245))
sheet.save(art_dir/'place-atmosphere-contact-sheet.png', optimize=True)
manifest=[]
for file, *_ in SCENES:
    data=(out_dir/file).read_bytes(); manifest.append({'path': str(out_dir/file).replace('\\','/'), 'width': W, 'height': H, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)})
(art_dir/'place-atmosphere-assets.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print('regenerated', len(manifest), 'atmosphere assets')
