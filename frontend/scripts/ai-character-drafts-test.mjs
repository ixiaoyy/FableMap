import assert from 'node:assert/strict'

import {
  DEFAULT_AI_DRAFT_FORBIDDEN,
  DEFAULT_AI_DRAFT_STYLE_TAGS,
  createAiCharacterDraftRequest,
  describeCharacterDraftSource,
  draftResponseToEditorDraft,
  splitDraftItems,
} from '../app/product/aiCharacterDrafts.js'

assert.deepEqual(splitDraftItems('猫娘, 傲娇\n复国，猫娘'), ['猫娘', '傲娇', '复国'])
assert.deepEqual(splitDraftItems('', DEFAULT_AI_DRAFT_STYLE_TAGS), DEFAULT_AI_DRAFT_STYLE_TAGS)

assert.deepEqual(
  createAiCharacterDraftRequest({ styleTagsText: '猫娘, 傲娇', forbiddenText: '不要露骨\n不要真实私人地址', tone: '轻喜剧' }),
  { style_tags: ['猫娘', '傲娇'], forbidden: ['不要露骨', '不要真实私人地址'], tone: '轻喜剧' },
)
assert.deepEqual(
  createAiCharacterDraftRequest({ styleTagsText: '', forbiddenText: '', tone: '  ' }),
  { style_tags: DEFAULT_AI_DRAFT_STYLE_TAGS, forbidden: DEFAULT_AI_DRAFT_FORBIDDEN, tone: '' },
)
assert.deepEqual(
  createAiCharacterDraftRequest({ styleTagsText: '', forbiddenText: '', defaultStyleTags: ['数字人档案', '视频出镜'], defaultForbidden: ['不要直接生成真人视频'] }),
  { style_tags: ['数字人档案', '视频出镜'], forbidden: ['不要直接生成真人视频'], tone: '' },
)

const editorDraft = draftResponseToEditorDraft({
  source: 'local_template_fallback',
  draft: { name: '路口向导草稿招待员', description: '未发布草稿', personality: '傲娇', scenario: '吧台旁', system_prompt: '店主确认前不发布', first_mes: '欢迎喵', mes_example: '<START>', tags: ['本地模板草稿', '猫娘'] },
}, { name: '', tags_text: '', avatar: '', sprites: { neutral: '/old.png' }, talkativeness: 0.5 })
assert.deepEqual({ name: editorDraft.name, tags_text: editorDraft.tags_text, neutral: editorDraft.sprites.neutral, talkativeness: editorDraft.talkativeness }, { name: '路口向导草稿招待员', tags_text: '本地模板草稿, 猫娘', neutral: '/old.png', talkativeness: 0.5 })
assert.ok(/店主默认 LLM 草稿/.test(describeCharacterDraftSource({ source: 'owner_llm', source_label: '店主默认 LLM 草稿' })))
assert.ok(/本地模板草稿/.test(describeCharacterDraftSource({ source: 'local_template_fallback', source_reason: 'missing_owner_llm' })) && /不是真实 AI 生成/.test(describeCharacterDraftSource({ source: 'local_template_fallback', source_reason: 'missing_owner_llm' })))
assert.throws(() => draftResponseToEditorDraft({}, {}), /AI 草稿返回为空/)

console.log('AI character draft helpers ok')
