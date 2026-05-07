import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import {
  buildMapAnchorCardCopy,
  buildMapAnchorMarkerCopy,
  buildMapAnchorSummaryCopy,
  formatTavernAnchorLocation,
} from '../app/product/mapAnchorCopy.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const addressed = formatTavernAnchorLocation({
  address: '上海市黄浦区南京东路 1 号',
  lat: 31.230391,
  lon: 121.473701,
})
assert.equal(addressed.label, '街角门牌')
assert.equal(addressed.text, '上海市黄浦区南京东路 1 号')
assert.equal(addressed.line, '街角门牌 · 上海市黄浦区南京东路 1 号')

const coordinated = formatTavernAnchorLocation({ lat: 31.230391, lon: 121.473701 })
assert.equal(coordinated.label, '坐标门牌')
assert.match(coordinated.text, /31\.2304, 121\.4737/)
assert.equal(coordinated.line, '坐标门牌 · 31.2304, 121.4737')

const missing = formatTavernAnchorLocation({})
assert.equal(missing.label, '真实锚点')
assert.equal(missing.text, '坐标待确认')

const openCard = buildMapAnchorCardCopy({
  name: '巷口灯塔',
  access: 'public',
  status: 'open',
  address: '老街巷口 17 号',
})
assert.equal(openCard.eyebrow, '街区灯牌')
assert.match(openCard.statusLine, /灯牌亮着/)
assert.match(openCard.accessLine, /可推门/)
assert.equal(openCard.anchorLine, '街角门牌 · 老街巷口 17 号')

const passwordCard = buildMapAnchorCardCopy({
  name: '暗门吧台',
  access: 'password',
  status: 'closed',
  lat: 40,
  lon: 116,
})
assert.match(passwordCard.statusLine, /灯牌暂暗/)
assert.match(passwordCard.accessLine, /口令/)
assert.match(passwordCard.anchorLine, /坐标门牌/)

const markerCopy = buildMapAnchorMarkerCopy({
  name: '夜班便利店',
  access: 'private',
  status: 'open',
})
assert.equal(markerCopy.badgeLabel, '👤 私人灯牌')
assert.equal(markerCopy.statusText, '灯牌亮着')
assert.match(markerCopy.title, /夜班便利店 · 灯牌亮着/)

assert.equal(
  buildMapAnchorSummaryCopy({ matching: 0, total: 0 }),
  '这片街区还没有灯牌亮起'
)
assert.equal(
  buildMapAnchorSummaryCopy({ matching: 3, total: 10 }),
  '街区里有 3 / 10 盏灯牌可查看'
)

const laneSource = readFileSync(path.join(repoRoot, 'app/product/WorldStageTavernDiscoveryLane.jsx'), 'utf8')
assert.match(laneSource, /buildMapAnchorCardCopy/)
assert.match(laneSource, /map-anchor-card/)
assert(!laneSource.includes('个 marker'), 'Discovery lane should not expose raw marker copy')

const mapSource = readFileSync(path.join(repoRoot, 'app/product/WorldMap.jsx'), 'utf8')
assert.match(mapSource, /buildMapAnchorSummaryCopy/)
assert(!mapSource.includes('空间标记'), 'Map chrome should use lantern/anchor copy instead of raw marker copy')

const adapterSource = readFileSync(path.join(repoRoot, 'app/product/mapAdapter/AMapAdapter.js'), 'utf8')
assert.match(adapterSource, /buildMapAnchorMarkerCopy/)

const packageJson = readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
assert.match(packageJson, /map-anchor-copy-test\.mjs/)

console.log('map-anchor-copy-test: ok')
