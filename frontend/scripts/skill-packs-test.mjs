import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { createTavernService } from '../app/product/services/tavernService.js'

let captured = []
globalThis.fetch = async (url, options = {}) => {
  captured.push({ url: String(url), options })
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    text: async () => '{"ok":true,"skill_packs":[{"id":"local-rumor","enabled":true,"config":{"limit":2}}],"available_packs":[]}',
  }
}

const service = createTavernService(() => 'http://unit.test')
assert.equal(typeof service.listSkillPacks, 'function')
assert.equal(typeof service.saveSkillPacks, 'function')
await service.listSkillPacks('tavern one', 'owner_a')
await service.saveSkillPacks('tavern one', [{ id: 'local-rumor', enabled: true, config: { limit: 2 } }], 'owner_a')

assert.equal(captured.length, 2)
assert.ok(captured[0].url.includes('/api/v1/taverns/tavern%20one/skill-packs'))
assert.equal(captured[1].options.method, 'PUT')
assert.equal(JSON.parse(captured[1].options.body).skill_packs[0].id, 'local-rumor')
assert.equal(JSON.parse(captured[1].options.body).skill_packs[0].enabled, true)

const here = dirname(fileURLToPath(import.meta.url))
const tavernsSource = readFileSync(join(here, '../app/lib/taverns.ts'), 'utf8')
assert.ok(tavernsSource.includes('export type SkillPackDefinition'))
assert.ok(tavernsSource.includes('export type SkillPackSetting'))
assert.ok(tavernsSource.includes('listSkillPacks'))
assert.ok(tavernsSource.includes('saveSkillPacks'))

const ownerPanelSource = readFileSync(join(here, '../app/product/TavernOwnerPanel.jsx'), 'utf8')
assert.ok(ownerPanelSource.includes('SkillPackManager'))
assert.ok(ownerPanelSource.includes('技能包'))

const managerSource = readFileSync(join(here, '../app/product/SkillPackManager.jsx'), 'utf8')
assert.ok(managerSource.includes('local-rumor'))
assert.ok(managerSource.includes('不会写入正史'))
assert.ok(managerSource.includes('环境传闻'))

const styleSource = readFileSync(join(here, '../app/product/styles.css'), 'utf8')
assert.ok(styleSource.includes('.skill-pack-manager'))

console.log('skill-packs-test: ok')
