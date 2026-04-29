import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { createTavernService } from '../app/product/services/tavernService.js'

const captured = []
globalThis.fetch = async (url, options = {}) => {
  captured.push({ url: String(url), options })
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    text: async () => '{"ok":true,"persisted":false,"episode":{"markdown":"# test"}}',
  }
}

const service = createTavernService(() => 'http://unit.test')
await service.exportEpisode(
  {
    tavernId: 'tavern one',
    visitorId: 'visitor_a',
    characterId: 'char_keeper',
    title: '桥边委托第一夜',
    includePending: false,
  },
  'visitor_a',
)

assert.equal(captured.length, 1)
assert.equal(captured[0].options.method, 'POST')
assert.ok(captured[0].url.includes('/api/v1/taverns/tavern%20one/episodes/export'))
const body = JSON.parse(captured[0].options.body)
assert.equal(body.visitor_id, 'visitor_a')
assert.equal(body.character_id, 'char_keeper')
assert.equal(body.title, '桥边委托第一夜')
assert.equal(body.include_pending, false)

const here = dirname(fileURLToPath(import.meta.url))
const tavernsSource = readFileSync(join(here, '../app/lib/taverns.ts'), 'utf8')
assert.ok(tavernsSource.includes('export type EpisodeExportResponse'))
assert.ok(tavernsSource.includes('exportEpisode'))
assert.ok(tavernsSource.includes('/episodes/export'))

const serviceSource = readFileSync(join(here, '../app/product/services/tavernService.js'), 'utf8')
assert.ok(serviceSource.includes('exportEpisode'))
assert.ok(serviceSource.includes('/episodes/export'))

console.log('episode-export-test: ok')
