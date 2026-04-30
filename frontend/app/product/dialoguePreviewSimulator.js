export const DEFAULT_OWNER_PREVIEW_MESSAGE = '如果我是第一次进店的访客，你会怎么打招呼？'

function toText(value) {
  return typeof value === 'string' ? value : ''
}

function firstSegment(value, fallback = '') {
  return toText(value)
    .split(/[。！？!?；;\n]/)
    .map((item) => item.trim())
    .find(Boolean) || fallback
}

function clampText(value, maxLength = 80) {
  const text = toText(value).trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}

export function redactSensitivePreviewText(value) {
  return toText(value)
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, '[已隐藏 API Key]')
    .replace(/(api[_-]?key\s*[:=]\s*)[^\s,;，；]+/gi, '$1[已隐藏]')
    .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s,;，；]+/gi, '$1[已隐藏]')
}

export function summarizePreviewCharacter(character = {}) {
  const name = toText(character.name).trim() || '未命名 NPC'
  const tags = Array.isArray(character.tags) ? character.tags.filter(Boolean).slice(0, 4) : []
  const fieldCoverage = [
    ['描述', character.description],
    ['性格', character.personality],
    ['场景', character.scenario],
    ['开场白', character.first_mes],
    ['边界指令', character.system_prompt],
  ].map(([label, value]) => ({ label, done: Boolean(toText(value).trim()) }))

  return {
    name,
    tags,
    tone: clampText(firstSegment(character.personality, '暂未填写性格，建议先补充口吻。'), 80),
    setting: clampText(firstSegment(character.scenario, '暂未填写场景，模拟会更偏通用。'), 80),
    hasBoundaryInstruction: Boolean(toText(character.system_prompt).trim()),
    fieldCoverage,
  }
}

export function buildOwnerDialoguePreview({ tavern = {}, character = {}, visitorMessage = '' } = {}) {
  const summary = summarizePreviewCharacter(character)
  const message = redactSensitivePreviewText(visitorMessage).trim() || DEFAULT_OWNER_PREVIEW_MESSAGE
  const tavernName = toText(tavern.name).trim() || '当前酒馆'
  const firstGreeting = clampText(firstSegment(character.first_mes, `欢迎来到${tavernName}`), 72)
  const tone = clampText(firstSegment(character.personality, '保持简短、克制、贴合店主已写设定'), 72)
  const setting = clampText(firstSegment(character.scenario, `${tavernName}的日常场景`), 72)
  const messageEcho = clampText(message, 52)
  const boundaryLine = summary.hasBoundaryInstruction
    ? '会遵守已配置的边界指令，但本预览不会展开隐藏 prompt。'
    : '尚未配置边界指令，建议保存前补充 system_prompt。'

  return {
    ok: Boolean(summary.name),
    preview_only: true,
    persisted: false,
    llm_called: false,
    history_written: false,
    writeback_written: false,
    provider_cost: 'none',
    tavern_name: tavernName,
    character_name: summary.name,
    visitor_message: message,
    assistant_message: `${summary.name}会先接住“${messageEcho}”，用「${tone}」的口吻回应，并把语境落在「${setting}」。可参考开场气质：“${firstGreeting}”。`,
    prompt_summary: {
      character_name: summary.name,
      tone: summary.tone,
      setting: summary.setting,
      has_boundary_instruction: summary.hasBoundaryInstruction,
      tags: summary.tags,
    },
    notes: [
      '本地模拟：不调用 LLM，不消耗店主 provider token。',
      '不会写入 chat history、访客记忆、writeback 或公开 Tavern payload。',
      boundaryLine,
    ],
  }
}
