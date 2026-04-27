import assert from 'node:assert/strict'

import {
  DEFAULT_AI_DRAFT_FORBIDDEN,
  DEFAULT_AI_DRAFT_STYLE_TAGS,
  createAiCharacterDraftRequest,
  draftResponseToEditorDraft,
  splitDraftItems,
} from '../app/product/aiCharacterDrafts.js'

assert.deepEqual(splitDraftItems('猫娘, 傲娇\n复国，猫娘'), ['猫娘', '傲娇', '复国'])
assert.deepEqual(splitDraftItems('', DEFAULT_AI_DRAFT_STYLE_TAGS), DEFAULT_AI_DRAFT_STYLE_TAGS)

const request = createAiCharacterDraftRequest({
  styleTagsText: '猫娘, 傲娇',
  forbiddenText: '不要露骨\n不要真实私人地址',
  tone: '轻喜剧',
})
assert.deepEqual(request.style_tags, ['猫娘', '傲娇'])
assert.deepEqual(request.forbidden, ['不要露骨', '不要真实私人地址'])
assert.equal(request.tone, '轻喜剧')

const fallbackRequest = createAiCharacterDraftRequest({ styleTagsText: '', forbiddenText: '', tone: '  ' })
assert.deepEqual(fallbackRequest.style_tags, DEFAULT_AI_DRAFT_STYLE_TAGS)
assert.deepEqual(fallbackRequest.forbidden, DEFAULT_AI_DRAFT_FORBIDDEN)
assert.equal(fallbackRequest.tone, '')

const editorDraft = draftResponseToEditorDraft(
  {
    draft: {
      name: '猫铃看板娘',
      description: '未发布草稿',
      personality: '傲娇',
      scenario: '吧台旁',
      system_prompt: '店主确认前不发布',
      first_mes: '欢迎喵',
      mes_example: '<START>',
      tags: ['AI 草稿', '猫娘'],
    },
  },
  { name: '', tags_text: '', avatar: '', sprites: { neutral: '/old.png' }, talkativeness: 0.5 },
)
assert.equal(editorDraft.name, '猫铃看板娘')
assert.equal(editorDraft.tags_text, 'AI 草稿, 猫娘')
assert.equal(editorDraft.sprites.neutral, '/old.png')
assert.equal(editorDraft.talkativeness, 0.5)

assert.throws(() => draftResponseToEditorDraft({}, {}), /AI 草稿返回为空/)

console.log('AI character draft helpers ok')
