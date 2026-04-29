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
    text: async () => '{"ok":true,"preview_only":true,"image_generated":false}',
  }
}

const service = createTavernService(() => 'http://unit.test')
await service.previewVisualSouvenir(
  'tavern one',
  {
    visitorId: 'visitor_a',
    characterId: 'char_keeper',
    userMessage: '我接下委托。',
    assistantMessage: 'Keeper 递来杯垫。',
    style: 'warm cyber tavern postcard',
  },
  'visitor_a',
)

assert.equal(captured.length, 1)
assert.equal(captured[0].options.method, 'POST')
assert.ok(captured[0].url.includes('/api/v1/taverns/tavern%20one/visual-souvenir/preview'))
const body = JSON.parse(captured[0].options.body)
assert.equal(body.visitor_id, 'visitor_a')
assert.equal(body.character_id, 'char_keeper')
assert.equal(body.user_message, '我接下委托。')

const here = dirname(fileURLToPath(import.meta.url))
const tavernsSource = readFileSync(join(here, '../app/lib/taverns.ts'), 'utf8')
assert.ok(tavernsSource.includes('export type VisualSouvenirPreviewResponse'))
assert.ok(tavernsSource.includes('previewVisualSouvenir'))
assert.ok(tavernsSource.includes('/visual-souvenir/preview'))

const serviceSource = readFileSync(join(here, '../app/product/services/tavernService.js'), 'utf8')
assert.ok(serviceSource.includes('previewVisualSouvenir'))
assert.ok(serviceSource.includes('/visual-souvenir/preview'))

console.log('visual-souvenir-preview-test: ok')
