import assert from 'node:assert/strict'
import fs from 'node:fs'

import {
  BACKGROUND_NPC_TAG,
  MAX_NPC_BATCH_IMPORT_SIZE,
  NPC_BATCH_IMPORT_EXAMPLE,
  createBackgroundNpcDraft,
  parseNpcBatchInput,
} from '../app/product/npcBatchImport.js'

const textBatch = parseNpcBatchInput('夜班灯叔 | 调暗霓虹灯的背景店员 | 后勤, 低干扰\n雨巷信使 | 送街区传闻 | 消息')
assert.equal(textBatch.source, 'text')
assert.equal(textBatch.count, 2)
assert.equal(textBatch.characters[0].name, '夜班灯叔')
assert.equal(textBatch.characters[0].gender, 'unspecified')
assert(textBatch.characters[0].tags.includes(BACKGROUND_NPC_TAG), 'plain-text drafts should be marked as background NPCs')
assert.match(textBatch.characters[0].system_prompt, /店主确认加入酒馆/, 'background drafts must keep owner confirmation boundary')
assert.match(textBatch.characters[0].system_prompt, /不要擅自扩写酒馆正史/, 'background drafts must not auto-expand canon')

const jsonBatch = parseNpcBatchInput(JSON.stringify({
  characters: [
    {
      id: 'external_should_not_persist',
      name: '猫耳清洁工',
      description: '只在被叫到时吐槽',
      gender: 'female',
      tags: ['猫系', '背景'],
      alternate_greetings: ['地板刚拖过，小心。'],
      sprites: { neutral: '/assets/npcs/cat/neutral.png', empty: '' },
      talkativeness: 2,
    },
  ],
}))
assert.equal(jsonBatch.source, 'json')
assert.equal(jsonBatch.characters[0].name, '猫耳清洁工')
assert.equal(jsonBatch.characters[0].gender, 'female')
assert.equal(jsonBatch.characters[0].talkativeness, 1)
assert.deepEqual(jsonBatch.characters[0].sprites, { neutral: '/assets/npcs/cat/neutral.png' })
assert.equal('id' in jsonBatch.characters[0], false, 'batch import should not preserve external character ids')

const sillyTavernCard = parseNpcBatchInput(JSON.stringify([{ data: { name: '吧台影子', first_mes: '我在。', tags: '背景, 酒保' } }]))
assert.equal(sillyTavernCard.characters[0].name, '吧台影子')
assert.deepEqual(sillyTavernCard.characters[0].tags, ['背景', '酒保'])

assert.throws(() => parseNpcBatchInput(''), /请先粘贴/)
assert.throws(
  () => parseNpcBatchInput(Array.from({ length: MAX_NPC_BATCH_IMPORT_SIZE + 1 }, (_, index) => `NPC${index}`).join('\n')),
  /一次最多确认创建/,
)

const draft = createBackgroundNpcDraft({ name: '巡灯人' })
assert.equal(draft.name, '巡灯人')
assert.equal(draft.talkativeness, 0.25)

assert(NPC_BATCH_IMPORT_EXAMPLE.includes('|'), 'example should teach the line format')

const modal = fs.readFileSync(new URL('../app/product/CharacterManagementModal.jsx', import.meta.url), 'utf8')
const styles = fs.readFileSync(new URL('../app/product/styles.css', import.meta.url), 'utf8')
const pkg = fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')

assert.match(modal, /parseNpcBatchInput/, 'CharacterManagementModal should use the batch parser')
assert.match(modal, /确认创建 .* 个背景 NPC/, 'UI should require explicit owner confirmation before creating batch NPCs')
assert.match(modal, /不自动发布、不会覆盖已有角色/, 'UI copy should state the no-auto-publication boundary')
assert.match(modal, /for \(const draft of batchPreview\)/, 'batch creation should iterate confirmed preview drafts')
assert.match(modal, /addCharacter\(tavern\.id, draft, ownerId\)/, 'batch creation should reuse the existing addCharacter API')
assert.match(styles, /\.char-mgmt-batch-panel/, 'batch panel should have product styling')
assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.char-mgmt-batch-actions[\s\S]*flex-direction: column/, 'mobile layout should stack batch actions')
assert.match(pkg, /npc-batch-import-test\.mjs/, 'package test script should include NPC batch import regression test')

console.log('npc-batch-import-test: ok')
