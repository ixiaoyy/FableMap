import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import {
  DISCOVERY_LIVELINESS_FORBIDDEN_COPY,
  buildDiscoveryLiveliness,
  getDiscoveryLivelinessSearchText,
} from '../app/lib/discovery-liveliness.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')

function joinedCopy(view) {
  return [
    view.headline,
    view.summary,
    view.searchText,
    ...(view.chips || []).flatMap((chip) => [chip.label, chip.value, chip.helper]),
  ].join('\n')
}

const lively = buildDiscoveryLiveliness({
  name: '巷口灯塔',
  visit_count: 24,
  characters: [{ id: 'keeper' }, { id: 'runner' }],
  gameplay_definitions: [{ id: 'ask-rumor' }],
  skill_packs: [{ id: 'local-rumor', enabled: true }],
})

assert.equal(lively.headline, '附近有人经营')
assert.equal(lively.levelLabel, '很有活性')
assert.match(lively.summary, /传闻/)
assert.match(lively.summary, /回访反馈/)
assert(lively.chips.some((chip) => chip.id === 'rumor' && chip.value === '环境传闻可用'))
assert(lively.chips.some((chip) => chip.id === 'feedback' && chip.value === '回访反馈给店主'))
assert.match(getDiscoveryLivelinessSearchText(lively), /附近有人经营/)
assert.match(getDiscoveryLivelinessSearchText(lively), /传闻/)
assert.match(getDiscoveryLivelinessSearchText(lively), /回访/)

const quiet = buildDiscoveryLiveliness({})
assert.equal(quiet.headline, '等待第一束灯')
assert.equal(quiet.levelLabel, '等待第一束灯')
assert(quiet.chips.every((chip) => typeof chip.helper === 'string' && chip.helper.length > 0))

for (const forbidden of DISCOVERY_LIVELINESS_FORBIDDEN_COPY) {
  assert(!joinedCopy(lively).includes(forbidden), `discovery copy must not expose social/ranking term: ${forbidden}`)
  assert(!joinedCopy(quiet).includes(forbidden), `quiet discovery copy must not expose social/ranking term: ${forbidden}`)
}

const discoverRoute = readFileSync(path.join(frontendRoot, 'app/routes/discover.tsx'), 'utf8')
assert.match(discoverRoute, /buildDiscoveryLiveliness/)
assert.match(discoverRoute, /DiscoveryLivelinessStrip/)
assert.match(discoverRoute, /getDiscoveryLivelinessSearchText/)
assert(!discoverRoute.includes('TavernMessageBoard'), 'discover route must not render a public message board')
assert(!discoverRoute.includes('留言墙'), 'discover route must not become a public guestbook wall')
assert(!discoverRoute.includes('排行榜'), 'discover route must not add ranking copy')

const packageJson = readFileSync(path.join(frontendRoot, 'package.json'), 'utf8')
assert.match(packageJson, /discovery-liveliness-test\.mjs/)

console.log('discovery-liveliness-test: ok')
