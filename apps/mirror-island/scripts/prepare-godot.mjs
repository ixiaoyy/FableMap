import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { decodeTiledRegion, createWorldCatalog } from '../client/src/game/world/tiled-region-decoder.ts';
import { paintCottageAtlas } from '../client/src/game/presentation/cottage-art.ts';
import { paintShopInteriorAtlas } from '../client/src/game/presentation/shop-interiors-art.ts';
import { fixedInteriorViewAnchorForRegion } from '../client/src/game/assets/visual-profile.ts';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(app, '../..');
const output = path.join(app, 'godot');
const manifest = JSON.parse(await readFile(path.join(root, 'deploy/cdn/game-media-manifest.json'), 'utf8'));
const lock = JSON.parse(await readFile(path.join(output, 'engine-lock.json'), 'utf8'));
const sourceMaps = path.join(app, 'public/map');
const records = [];
const assetPaths = {};

/** 计算输入字节的 SHA-256，供源素材与生成证据使用。 */
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

/** 将资源复制到限定的 Godot media 目录；必须匹配 manifest，已有代码绘制的两张内景图单独记录。 */
async function media(source) {
  const absolute = path.resolve(source);
  if (absolute === path.join(app, 'src/tiled/cottage-woodwork.runtime.png') || absolute === path.join(app, 'src/tiled/shop-interiors.runtime.png')) {
    const name = path.basename(absolute);
    const bytes = await readFile(path.join(output, 'media', name));
    if (!records.some(record => record.name === name)) records.push({ name, sha256: sha256(bytes), bytes: bytes.length,
      source: 'client/src/game/presentation/*-art.ts', provenance: { kind: 'existing-runtime-atlas', processing: '原绘制函数的矩形指令由 Godot Image 执行，不修改美术' } });
    return `res://media/${name}`;
  }
  const allowed = [path.join(app, 'src/tiled') + path.sep, path.join(app, 'public/game-media/v1') + path.sep];
  if (!allowed.some(prefix => absolute.startsWith(prefix))) throw new Error('资源路径越出已审查源目录');
  const bytes = await readFile(absolute);
  const hash = sha256(bytes);
  const entry = manifest.entries.find(candidate => candidate.sha256 === hash);
  if (!entry) throw new Error(`素材未经 manifest 登记：${path.basename(absolute)}`);
  const name = `${hash.slice(0, 12)}-${path.basename(absolute)}`;
  await writeFile(path.join(output, 'media', name), bytes);
  if (!records.some(record => record.sha256 === hash)) records.push({ name, sha256: hash, bytes: bytes.length,
    source: path.relative(root, absolute).replaceAll('\\', '/'),
    provenance: entry });
  return `res://media/${name}`;
}

/** 为一个已校验区域生成可编辑 Godot 包装场景；碰撞由原 Collision 层按行合并，禁止重画地图。 */
function regionScene(region, mapFile) {
  const blocks = [];
  const { columns, rows, blocked } = region.collision;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns;) {
      if (!blocked[row * columns + column]) { column++; continue; }
      const start = column;
      while (column < columns && blocked[row * columns + column]) column++;
      blocks.push({ x: (start + column) * 8, y: row * 16 + 8, width: (column - start) * 16 });
    }
  }
  const text = ['[gd_scene load_steps=' + (blocks.length + 2) + ' format=3]',
    `[ext_resource type="PackedScene" path="res://generated/maps/${mapFile}" id="1"]`];
  blocks.forEach((block, i) => text.push(`[sub_resource type="RectangleShape2D" id="Shape_${i}"]\nsize = Vector2(${block.width}, 16)`));
  text.push(`[node name="${region.id}" type="Node2D"]`, '[node name="Map" parent="." instance=ExtResource("1")]',
    '[node name="Collision" type="StaticBody2D" parent="."]\ncollision_layer = 1\ncollision_mask = 0');
  blocks.forEach((block, i) => text.push(`[node name="Block${i}" type="CollisionShape2D" parent="Collision"]\nposition = Vector2(${block.x}, ${block.y})\nshape = SubResource("Shape_${i}")`));
  for (const [id, spawn] of Object.entries(region.spawns)) text.push(`[node name="${id}" type="Marker2D" parent="."]\nposition = Vector2(${spawn.x}, ${spawn.y})`);
  return text.join('\n\n') + '\n';
}

for (const directory of ['generated/maps', 'generated/regions', 'scenes/regions', 'media', 'addons/YATI']) await mkdir(path.join(output, directory), { recursive: true });
// 执行已有绘图函数而非依赖某台电脑遗留 PNG，保持干净检出也可重建。
const paintings = [];
for (const [name, height, paint] of [['cottage-woodwork.runtime.png', 128, paintCottageAtlas], ['shop-interiors.runtime.png', 256, paintShopInteriorAtlas]]) {
  const operations = [];
  const context = {
    fillStyle: '#000000',
    /** 记录原绘图函数的整数矩形；未知绘制 API 会直接报错，不静默省略。 */
    fillRect(x, y, width, height) { operations.push([x, y, width, height, this.fillStyle]); },
  };
  paint(context);
  paintings.push({ name, width: 256, height, operations });
}
await writeFile(path.join(output, 'generated/interior-atlases.json'), JSON.stringify(paintings));
const executable = path.join(root, `artifacts/godot-runtime/${lock.version.replace('-stable', '')}/Godot_v${lock.version}_${process.platform === 'win32' ? 'win64_console.exe' : 'linux.x86_64'}`);
const painted = spawnSync(executable, ['--headless', '--path', output, '--script', 'res://tools/build_atlases.gd'], { encoding: 'utf8', timeout: 30000 });
if (painted.error || painted.status !== 0 || /SCRIPT ERROR|^ERROR:/m.test(painted.stderr ?? '')) throw new Error(`内景导出失败：${painted.stderr ?? painted.error}`);
const vendorZip = path.join(root, 'artifacts/godot-runtime/yati-v2.2.7-gdscript.zip');
if (sha256(await readFile(vendorZip)) !== lock.yati.sha256) throw new Error('YATI 固定版本校验失败');
const vendor = path.join(root, 'artifacts/godot-runtime/yati-v2.2.7/addons/YATI');
for (const file of await readdir(vendor)) {
  if (!file.endsWith('.gd') && file !== 'plugin.cfg') throw new Error(`未预期的插件文件：${file}`);
  await copyFile(path.join(vendor, file), path.join(output, 'addons/YATI', file));
}
// YATI 2.2.7 保存后未释放临时 Node2D；仅修复导入结束的资源泄漏，不改变地图数据。
const importerPath = path.join(output, 'addons/YATI/Importer.gd');
const importer = (await readFile(importerPath, 'utf8')).replaceAll('\r\n', '\n');
if ((importer.match(/\treturn ret\n/g) ?? []).length !== 1) throw new Error('YATI 释放补丁锚点变化');
await writeFile(importerPath, importer.replace('\treturn ret\n', '\tnode2D.free()\n\treturn ret\n'));
const creatorPath = path.join(output, 'addons/YATI/TilemapCreator.gd');
const creator = (await readFile(creatorPath, 'utf8')).replaceAll('\r\n', '\n');
const detach = '\t\t_base_node.remove_child(_parallax_background)\n';
if (creator.split(detach).length !== 2) throw new Error('YATI 视差节点补丁锚点变化');
await writeFile(creatorPath, creator.replace(detach, detach + '\t\t_parallax_background.free()\n\t\t_parallax_background = null\n'));
const regions = [];
for (const name of (await readdir(sourceMaps)).filter(name => name.endsWith('.tmj')).sort()) {
  const map = JSON.parse(await readFile(path.join(sourceMaps, name), 'utf8'));
  const region = decodeTiledRegion(map, `region-${name.slice(0, -4)}`);
  regions.push({ ...region, cameraAnchorId: fixedInteriorViewAnchorForRegion(region.id) });
  for (const tileset of map.tilesets) tileset.image = (await media(path.resolve(sourceMaps, tileset.image))).replace('res://', '../../');
  // 非可见规则层保留在 catalog；避免 YATI 把碰撞掩码当成贴图渲染。
  map.layers = map.layers.filter(layer => ['Ground', 'GroundDetail', 'Water', 'Buildings', 'AbovePlayer'].includes(layer.name));
  for (const layer of map.layers) {
    layer.properties = [...(layer.properties ?? []), { name: 'z_index', type: 'int', value: layer.name === 'AbovePlayer' ? 20 : -10 }];
  }
  await writeFile(path.join(output, 'generated/maps', name), JSON.stringify(map));
  await writeFile(path.join(output, 'generated/regions', `${region.id}.tscn`), regionScene(region, name));
  const editable = `[gd_scene load_steps=2 format=3]\n\n[ext_resource type="PackedScene" path="res://generated/regions/${region.id}.tscn" id="1"]\n\n[node name="${region.id}" instance=ExtResource("1")]\n\n[editable path="Map"]\n`;
  // 手工覆盖场景只在第一次创建，此后再准备素材也不覆盖编辑器改动。
  try { await writeFile(path.join(output, 'scenes/regions', `${region.id}.tscn`), editable, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
}
createWorldCatalog(regions);
const character = {};
for (const part of ['layers', 'materials']) character[part] = await media(path.join(app, `public/game-media/v1/assets/original/islander/2026-09-07-v3/character-${part}-v3.png`));
await writeFile(path.join(output, 'generated/catalog.json'), JSON.stringify({ regions, character }, null, 2));
const font = await readFile(path.join(root, 'artifacts/godot-runtime/NotoSansCJKsc-Regular.otf'));
if (sha256(font) !== lock.font.sha256) throw new Error('中文字体校验失败');
await writeFile(path.join(output, 'media/NotoSansCJKsc-Regular.otf'), font);
await copyFile(path.join(root, 'artifacts/godot-runtime/NotoSansCJK-LICENSE.txt'), path.join(output, 'generated/NotoSansCJK-LICENSE.txt'));
records.push({ name: 'NotoSansCJKsc-Regular.otf', sha256: lock.font.sha256, bytes: font.length, provenance: lock.font });
await writeFile(path.join(output, 'generated/media-provenance.json'), JSON.stringify(records, null, 2));
await copyFile(path.join(app, 'public/THIRD_PARTY_NOTICES.txt'), path.join(output, 'generated/THIRD_PARTY_NOTICES.txt'));
// 完整迁移需要原物品、NPC、宠物与声音；全部沿已登记对象读取，不引入新素材来源。
for (const entry of manifest.entries) {
  if (!entry.object_key || !entry.sha256 || !entry.url) continue;
  const local = path.join(app, 'public/game-media/v1', entry.object_key);
  let bytes;
  try { bytes = await readFile(local); } catch { bytes = null; }
  if (!bytes || sha256(bytes) !== entry.sha256) {
    const response = await fetch(entry.url, {signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error(`已登记素材下载失败：${entry.object_key}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) throw new Error(`已登记素材校验失败：${entry.object_key}`);
    await mkdir(path.dirname(local), {recursive:true});
    await writeFile(local,bytes);
  }
  assetPaths[entry.object_key] = await media(local);
}
await writeFile(path.join(output,'generated/asset-paths.json'), JSON.stringify(assetPaths,null,2));
await writeFile(path.join(output,'generated/media-provenance.json'), JSON.stringify(records,null,2));
console.log(`Godot 已准备 ${regions.length} 张地图、${records.length} 张源图；YATI ${lock.yati.version} 已校验。`);
