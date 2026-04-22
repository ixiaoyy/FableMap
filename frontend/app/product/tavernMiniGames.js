export const MINI_GAME_TEMPLATES = [
  {
    id: 'clue-trail',
    title: '线索调查',
    icon: '🔎',
    duration: '5-8 分钟',
    summary: '灯下有一条线索等你翻开。',
    tags: ['clue', 'family-friendly'],
    startInstruction: '请给出一个和这间酒馆氛围相关的小线索，再用【目标】【已知线索】【可选行动】三块开始；每轮只推进一个安全动作。',
  },
  {
    id: 'riddle-quiz',
    title: '猜谜问答',
    icon: '🧩',
    duration: '3-5 分钟',
    summary: '一小题，一点提示，一声揭晓。',
    tags: ['riddle', 'family-friendly'],
    startInstruction: '请先出一道和这间酒馆氛围相关、无需专业知识的谜题，再给出【规则】【谜题】【可选回答方式】【提示次数】。',
  },
  {
    id: 'story-relay',
    title: '故事接龙',
    icon: '📚',
    duration: '5-8 分钟',
    summary: '你添一句，故事就往前走。',
    tags: ['story', 'family-friendly'],
    startInstruction: '请用 2-3 句话开一个温和短故事，并给出【接龙规则】【开头】【轮到我续写】；每次只续一小段。',
  },
  {
    id: 'card-reading',
    title: '抽卡占卜',
    icon: '🃏',
    duration: '3-5 分钟',
    summary: '抽一张象征卡，听一段轻松解读。',
    tags: ['card', 'family-friendly'],
    startInstruction: '请为我抽一张象征卡，用轻松的象征解读给出【卡面】【象征】【今日小提醒】【可选行动】；不做命运断言。',
  },
  {
    id: 'twenty-questions',
    title: '二十问',
    icon: '❓',
    duration: '5-10 分钟',
    summary: '猜一个藏在酒馆里的小东西。',
    tags: ['question', 'family-friendly'],
    startInstruction: '请在心里想一个和这间酒馆相关的物品、地点或人物，并用【规则】【剩余问题】【可以开始问】开局；你只能回答是、否、不确定或接近。',
  },
  {
    id: 'tiny-quest',
    title: '小委托',
    icon: '📜',
    duration: '3-8 分钟',
    summary: '接一张短任务，换一份文字奖励。',
    tags: ['quest', 'family-friendly'],
    startInstruction: '请发布一个 3 分钟内可完成的安全小委托，并给出【委托标题】【目标】【完成条件】【可选行动】【文字奖励】。',
  },
]

const PLAY_MODE_PRIORITY = {
  clue_game: ['clue-trail'],
  guild: ['tiny-quest', 'clue-trail'],
  text_game: ['tiny-quest', 'clue-trail'],
}

const SAFETY_BOUNDARY = '不要涉及血腥、成人、真实危险行动，不索取隐私，不给医疗、法律或金融结论。'

function textOf(value) {
  return String(value || '').trim()
}

function priorityIndex(template, priorityIds) {
  const index = priorityIds.indexOf(template.id)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

export function getMiniGameTemplates(options = {}) {
  const priorityIds = PLAY_MODE_PRIORITY[textOf(options.playModeId)] || []
  if (priorityIds.length === 0) return [...MINI_GAME_TEMPLATES]
  return [...MINI_GAME_TEMPLATES].sort((left, right) => {
    const byPriority = priorityIndex(left, priorityIds) - priorityIndex(right, priorityIds)
    if (byPriority !== 0) return byPriority
    return MINI_GAME_TEMPLATES.indexOf(left) - MINI_GAME_TEMPLATES.indexOf(right)
  })
}

export function buildMiniGameStartPrompt(template, context = {}) {
  if (!template?.title) return ''
  const characterName = textOf(context.characterName) || '当前 NPC'
  const tavernName = textOf(context.tavernName)
  const locationText = tavernName ? `，地点是「${tavernName}」` : ''
  const instruction = textOf(template.startInstruction) || '请用清晰规则带我开始，并给出 2-3 个可选行动。'
  return [
    `我想和你玩一局《${template.title}》。`,
    `请你以${characterName}的身份主持一局 ${template.duration || '3-10 分钟'} 的老少皆宜小游戏${locationText}。`,
    instruction,
    SAFETY_BOUNDARY,
  ].join('\n')
}
