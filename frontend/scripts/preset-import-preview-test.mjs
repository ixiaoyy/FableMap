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
    text: async () => JSON.stringify({
      ok: true,
      preview_only: true,
      applied: false,
      summary: { supported: 1, warning: 1, blocked: 1 },
      supported: [],
      warnings: [],
      blocked: [],
    }),
  }
}

const service = createTavernService(() => 'http://unit.test')
assert.equal(typeof service.previewPresetImport, 'function')
await service.previewPresetImport('tavern one', { preset_json: '{"name":"demo"}' }, 'owner_a')

assert.equal(captured.length, 1)
assert.ok(captured[0].url.includes('/api/v1/taverns/tavern%20one/preset-import/preview'))
assert.equal(captured[0].options.method, 'POST')
assert.equal(captured[0].options.headers['X-User-Id'], 'owner_a')
assert.equal(JSON.parse(captured[0].options.body).preset_json, '{"name":"demo"}')

const here = dirname(fileURLToPath(import.meta.url))
const tavernsSource = readFileSync(join(here, '../app/lib/taverns.ts'), 'utf8')
assert.ok(tavernsSource.includes('export type PresetImportPreviewItem'))
assert.ok(tavernsSource.includes('export type PresetImportPreviewResponse'))
assert.ok(tavernsSource.includes('previewPresetImport'))
assert.ok(tavernsSource.includes('/preset-import/preview'))

const ownerPanelSource = readFileSync(join(here, '../app/product/TavernOwnerPanel.jsx'), 'utf8')
assert.ok(ownerPanelSource.includes('PresetImportPreviewModal'))
assert.ok(ownerPanelSource.includes('setPresetImportTavern'))
assert.ok(ownerPanelSource.includes('预览导入'))

const modalSource = readFileSync(join(here, '../app/product/PresetImportPreviewModal.jsx'), 'utf8')
assert.ok(modalSource.includes('previewPresetImport'))
assert.ok(modalSource.includes('不会应用'))
assert.ok(modalSource.includes('preview only') || modalSource.includes('Preview only'))
assert.ok(modalSource.includes('blocked') || modalSource.includes('blockedItems'))

const sectionsSource = readFileSync(join(here, '../app/product/OwnerConsoleSections.jsx'), 'utf8')
assert.ok(sectionsSource.includes('onPreviewPresetImport'))

const styleSource = readFileSync(join(here, '../app/product/styles.css'), 'utf8')
assert.ok(styleSource.includes('.preset-import-preview'))

console.log('preset-import-preview-test: ok')
