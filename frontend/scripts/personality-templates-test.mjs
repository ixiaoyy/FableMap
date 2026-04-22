import assert from 'node:assert/strict'

import {
  NPC_PERSONALITY_TEMPLATES,
  applyNpcPersonalityTemplateToDraft,
  filterNpcPersonalityTemplates,
  recommendNpcPersonalityTemplates,
} from '../app/product/personalityTemplates.js'

assert.ok(NPC_PERSONALITY_TEMPLATES.length >= 7)

const warmGuide = NPC_PERSONALITY_TEMPLATES.find((template) => template.id === 'warm-guide')
assert.ok(warmGuide)

const filledDraft = applyNpcPersonalityTemplateToDraft({
  name: '门口向导',
  description: '',
  personality: '',
  scenario: '',
  system_prompt: '',
  first_mes: '',
  mes_example: '',
  alternate_greetings_text: '欢迎回来',
  tags_text: '已有标签, 温柔',
  talkativeness: null,
}, warmGuide, { mode: 'fill' })
assert.equal(filledDraft.description, warmGuide.description)
assert.equal(filledDraft.personality, warmGuide.personality)
assert.ok(filledDraft.tags_text.includes('已有标签'))
assert.equal((filledDraft.tags_text.match(/温柔/g) || []).length, 1)
assert.ok(filledDraft.alternate_greetings_text.includes('欢迎回来'))
assert.ok(filledDraft.alternate_greetings_text.includes(warmGuide.alternate_greetings[0]))
assert.equal(filledDraft.talkativeness, warmGuide.talkativeness)

const overwrittenDraft = applyNpcPersonalityTemplateToDraft({
  description: '旧描述',
  personality: '旧性格',
  scenario: '旧场景',
  system_prompt: '旧指令',
  first_mes: '旧开场',
  mes_example: '旧示例',
  alternate_greetings_text: '旧备用',
  tags_text: '旧标签',
  talkativeness: 0.99,
}, warmGuide, { mode: 'overwrite' })
assert.equal(overwrittenDraft.description, warmGuide.description)
assert.equal(overwrittenDraft.personality, warmGuide.personality)
assert.equal(overwrittenDraft.alternate_greetings_text, warmGuide.alternate_greetings.join('\n'))
assert.equal(overwrittenDraft.tags_text, warmGuide.tags.join(', '))
assert.equal(overwrittenDraft.talkativeness, warmGuide.talkativeness)

const recommended = recommendNpcPersonalityTemplates({
  name: '雨夜档案亭',
  tags_text: '失物, 档案, 线索',
}, 3)
assert.ok(recommended.some((template) => template.id === 'evidence-archivist'))

const filteredByCategory = filterNpcPersonalityTemplates({
  category: '线索推理',
  query: '档案',
  draft: {},
  limit: 4,
})
assert.ok(filteredByCategory.length > 0)
assert.ok(filteredByCategory.every((template) => template.category === '线索推理'))
assert.ok(filteredByCategory.some((template) => template.id === 'evidence-archivist'))

const filteredRecommended = filterNpcPersonalityTemplates({
  category: '推荐',
  query: '社区',
  draft: { name: '路口服务站', tags_text: '社区, 问路' },
  limit: 4,
})
assert.ok(filteredRecommended.some((template) => template.id === 'street-guardian'))

console.log('personality-templates-test: ok')
