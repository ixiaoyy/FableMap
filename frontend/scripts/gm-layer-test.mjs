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
    text: async () => '{"ok":true,"preview_only":true,"applied":false,"candidates":[]}',
  }
}

const service = createTavernService(() => 'http://unit.test')
await service.previewGmLayer(
  'tavern one',
  {
    visitor_id: 'visitor_a',
    character_id: 'char_keeper',
    user_message: '我接下委托，但竞争者带来风险。',
    source_message_ids: ['msg_user'],
  },
  'visitor_a',
)

assert.equal(captured.length, 1)
assert.equal(captured[0].options.method, 'POST')
assert.ok(captured[0].url.includes('/api/v1/taverns/tavern%20one/gm-layer/preview'))
const body = JSON.parse(captured[0].options.body)
assert.equal(body.visitor_id, 'visitor_a')
assert.deepEqual(body.source_message_ids, ['msg_user'])

const here = dirname(fileURLToPath(import.meta.url))
const tavernsSource = readFileSync(join(here, '../app/lib/taverns.ts'), 'utf8')
assert.ok(tavernsSource.includes('export type GmLayerPreviewResponse'))
assert.ok(tavernsSource.includes('previewGmLayer'))
assert.ok(tavernsSource.includes('/gm-layer/preview'))

const serviceSource = readFileSync(join(here, '../app/product/services/tavernService.js'), 'utf8')
assert.ok(serviceSource.includes('previewGmLayer'))
assert.ok(serviceSource.includes('/gm-layer/preview'))

console.log('gm-layer-test: ok')
