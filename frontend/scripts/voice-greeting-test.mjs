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
    text: async () => '{"ok":true,"preview_only":true,"audio_generated":false}',
  }
}

const service = createTavernService(() => 'http://unit.test')
await service.previewVoiceGreeting(
  'tavern one',
  {
    characterId: 'char_keeper',
    greetingIndex: 1,
  },
  'visitor_a',
)

assert.equal(captured.length, 1)
assert.equal(captured[0].options.method, 'POST')
assert.ok(captured[0].url.includes('/api/v1/taverns/tavern%20one/voice-greeting/preview'))
const body = JSON.parse(captured[0].options.body)
assert.equal(body.character_id, 'char_keeper')
assert.equal(body.greeting_index, 1)

const here = dirname(fileURLToPath(import.meta.url))
const tavernsSource = readFileSync(join(here, '../app/lib/taverns.ts'), 'utf8')
assert.ok(tavernsSource.includes('export type VoiceGreetingPreviewResponse'))
assert.ok(tavernsSource.includes('previewVoiceGreeting'))
assert.ok(tavernsSource.includes('/voice-greeting/preview'))

const serviceSource = readFileSync(join(here, '../app/product/services/tavernService.js'), 'utf8')
assert.ok(serviceSource.includes('previewVoiceGreeting'))
assert.ok(serviceSource.includes('/voice-greeting/preview'))

console.log('voice-greeting-test: ok')
