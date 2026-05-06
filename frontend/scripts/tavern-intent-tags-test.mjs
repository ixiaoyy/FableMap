import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildTavernIntentTags, getTavernIntentTagsSearchText } from '../app/lib/tavern-intent-tags.js'

const workflowTags = buildTavernIntentTags({
  characters: [{ name: '流程诊断师', tags: ['流程'] }],
  gameplay_definitions: [{ id: 'gp_template_workflow-clinic-checkup_1', title: '三步流程问诊', summary: '流程诊所' }],
})

assert(workflowTags.some((tag) => tag.id === 'workflow-clinic'))
assert.match(getTavernIntentTagsSearchText(workflowTags), /流程诊所/)

const emptyTags = buildTavernIntentTags({})
assert.deepEqual(emptyTags, [])

const forbiddenJoined = JSON.stringify(buildTavernIntentTags({
  gameplay_definitions: [{ title: '招聘驿站', summary: '材料整理' }],
}))
for (const forbidden of ['排行榜', '等级', '装备', '群发营销', '访客社交', '充值', '结算']) {
  assert(!forbiddenJoined.includes(forbidden), `intent tags must not expose forbidden copy: ${forbidden}`)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const discoverSource = readFileSync(resolve(__dirname, '../app/routes/discover.tsx'), 'utf8')
assert.match(discoverSource, /buildTavernIntentTags/)
assert.match(discoverSource, /getTavernIntentTagsSearchText/)
assert.match(discoverSource, /经营意图/)

const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8')
assert.match(packageJson, /tavern-intent-tags-test\.mjs/)

console.log('tavern-intent-tags-test: ok')
