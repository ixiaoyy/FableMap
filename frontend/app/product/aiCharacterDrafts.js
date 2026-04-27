export const DEFAULT_AI_DRAFT_STYLE_TAGS = ['酒馆 NPC', '招待员', '温暖']
export const DEFAULT_AI_DRAFT_FORBIDDEN = ['不要露骨', '不要现实名人', '不要真实私人地址']

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function splitDraftItems(value, fallback = []) {
  const source = Array.isArray(value)
    ? value
    : cleanText(value).split(/[,，\r\n]+/)
  const items = source
    .map((item) => cleanText(String(item || '')))
    .filter(Boolean)
  const unique = []
  items.forEach((item) => {
    if (!unique.includes(item)) unique.push(item)
  })
  return unique.length ? unique : [...fallback]
}

export function createAiCharacterDraftRequest({ styleTagsText = '', forbiddenText = '', tone = '' } = {}) {
  return {
    style_tags: splitDraftItems(styleTagsText, DEFAULT_AI_DRAFT_STYLE_TAGS),
    forbidden: splitDraftItems(forbiddenText, DEFAULT_AI_DRAFT_FORBIDDEN),
    tone: cleanText(tone),
  }
}

export function draftResponseToEditorDraft(response, baseDraft = {}) {
  const draft = response?.draft
  if (!draft || typeof draft !== 'object') {
    throw new Error('AI 草稿返回为空')
  }
  const tags = Array.isArray(draft.tags) ? draft.tags.filter(Boolean) : []
  return {
    ...baseDraft,
    ...draft,
    id: '',
    tavern_id: '',
    tags_text: tags.join(', '),
    alternate_greetings_text: Array.isArray(draft.alternate_greetings)
      ? draft.alternate_greetings.filter(Boolean).join('\n')
      : cleanText(draft.alternate_greetings),
    avatar: cleanText(draft.avatar) || cleanText(baseDraft.avatar),
    sprites: {
      ...(baseDraft.sprites || {}),
      ...(draft.sprites || {}),
    },
  }
}
