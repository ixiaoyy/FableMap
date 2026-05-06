import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  TAVERN_INTENT_FORBIDDEN_COPY,
  TAVERN_INTENT_TEMPLATES,
  deriveTavernIntent,
  getTavernIntentSearchText,
} from '../app/product/tavernIntentTemplates.js'

const expectedIds = [
  'workflow-clinic',
  'industry-desk',
  'needs-counter',
  'archive-study',
  'creation-workshop',
  'companion-beacon',
]

assert.deepEqual(TAVERN_INTENT_TEMPLATES.map((intent) => intent.id), expectedIds)

for (const intent of TAVERN_INTENT_TEMPLATES) {
  assert.equal(typeof intent.title, 'string')
  assert.equal(typeof intent.summary, 'string')
  assert.equal(typeof intent.primaryNpcRole, 'string')
  assert.ok(Array.isArray(intent.visitorInputs) && intent.visitorInputs.length >= 2)
  assert.ok(Array.isArray(intent.ownerConfigFocus) && intent.ownerConfigFocus.length >= 2)
  assert.ok(Array.isArray(intent.verifiableOutputs) && intent.verifiableOutputs.length >= 2)
  assert.ok(Array.isArray(intent.guardrails) && intent.guardrails.length >= 2)
  const joined = JSON.stringify(intent)
  for (const forbidden of TAVERN_INTENT_FORBIDDEN_COPY) {
    assert(!joined.includes(forbidden), `intent ${intent.id} must not include forbidden copy: ${forbidden}`)
  }
}

assert.equal(deriveTavernIntent('workflow-clinic').id, 'workflow-clinic')
assert.equal(deriveTavernIntent('unknown').id, 'companion-beacon')
assert.match(getTavernIntentSearchText(deriveTavernIntent('archive-study')), /档案/)
assert.match(getTavernIntentSearchText(deriveTavernIntent('creation-workshop')), /创作/)

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8')
assert.match(packageJson, /tavern-intent-templates-test\.mjs/)

console.log('tavern-intent-templates-test: ok')
