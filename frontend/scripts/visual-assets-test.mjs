import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { getKnownAtmosphereImages, resolveTavernAtmosphereImage } from '../app/product/services/atmosphereAssets.js'

const projectRoot = process.cwd()

const expectedAtmospheres = [
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

function pngDimensions(path) {
  const data = readFileSync(path)
  assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${path} must be a PNG`)
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  }
}

for (const file of expectedAtmospheres) {
  const fullPath = join(projectRoot, 'public', 'place-atmosphere', file)
  const stat = statSync(fullPath)
  assert.ok(stat.size > 4096, `${file} should be a real atmosphere illustration, not a tiny placeholder`)
  assert.deepEqual(pngDimensions(fullPath), { width: 512, height: 288 }, `${file} dimensions`)
}

const knownAtmospheres = getKnownAtmosphereImages()
for (const expected of expectedAtmospheres) {
  assert.ok(
    knownAtmospheres.includes(`/place-atmosphere/${expected}`),
    `resolver should expose ${expected}`,
  )
}

assert.equal(
  resolveTavernAtmosphereImage({ fantasy_type: 'healing_sanctum' }),
  '/place-atmosphere/atmosphere-healing.png',
)
assert.equal(
  resolveTavernAtmosphereImage({ place: { fantasy_type: 'market_hall' } }),
  '/place-atmosphere/atmosphere-market.png',
)
assert.equal(
  resolveTavernAtmosphereImage({ layout_style: 'quest-play' }),
  '/place-atmosphere/atmosphere-supply.png',
)
assert.equal(
  resolveTavernAtmosphereImage({ fantasy_type: 'unknown_type' }),
  '/place-atmosphere/atmosphere-ember.png',
)

const expectedEmblems = [
  'emblem-trade.svg',
  'emblem-order.svg',
  'emblem-clinic.svg',
  'emblem-memory.svg',
  'emblem-night.svg',
]
for (const file of expectedEmblems) {
  const fullPath = join(projectRoot, 'public', 'faction-emblems', file)
  const data = readFileSync(fullPath, 'utf8')
  assert.ok(data.startsWith('<svg'), `${file} must be an SVG`)
  assert.match(data, /viewBox="0 0 64 64"/, `${file} should use the 64x64 emblem viewport`)
  assert.ok(data.length > 500, `${file} should contain drawn emblem shapes, not an empty placeholder`)
}

console.log('visual-assets-test: ok')
