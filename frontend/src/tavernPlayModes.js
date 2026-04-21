const DEFAULT_PROMPTS = [
  '你好，我第一次来，这里怎么玩？',
  '请用三句话介绍这间酒馆。',
  '给我一个不用想太多的开始方式。',
  '如果我只想体验 3 分钟，应该先做什么？',
]

const TEXT_GAME_PROMPTS = [
  '开始文字游戏，用简单规则带我玩。',
  '查看当前目标、线索和可选行动。',
  '调查我身边最显眼的东西。',
  '给我 3 个选择，我选一个继续。',
]

const CLUE_PROMPTS = [
  '我想查线索，从哪里开始？',
  '帮我整理目前的疑点。',
  '查看我已经发现的线索。',
  '继续调查下一个异常细节。',
]

const HELP_PROMPTS = [
  '我需要一点帮助，请一步一步告诉我。',
  '我不会用，先带我完成一次。',
  '我想开一间自己的酒馆，最少要做什么？',
  '请解释公开、密码、私人酒馆有什么区别。',
]

const GUILD_PROMPTS = [
  '查看冒险工会任务板。',
  '我想接一个适合新人的委托。',
  '查看我的身份、声望和当前待遇。',
  '我想发布一个友善委托。',
  '我完成任务了，帮我提交委托。',
]

export const GUILD_REPUTATION_TIERS = [
  {
    id: 'newcomer',
    title: '新人旅人',
    min: 0,
    badge: '木牌',
    treatment: '可领取入门委托；吧台会先给一杯欢迎水和清楚的玩法说明。',
  },
  {
    id: 'apprentice',
    title: '见习冒险者',
    min: 2,
    badge: '铜章',
    treatment: '可坐靠窗任务桌；接待员会优先推荐低难度线索委托。',
  },
  {
    id: 'regular',
    title: '正式冒险者',
    min: 5,
    badge: '银边卡',
    treatment: '可查看“今日特别委托”；酒馆 NPC 会用正式称号接待你。',
  },
  {
    id: 'silver',
    title: '银徽冒险者',
    min: 9,
    badge: '银徽',
    treatment: '可获得包间座位和隐藏菜单提示；任务结算会附带更多背景线索。',
  },
  {
    id: 'gold',
    title: '金徽守望者',
    min: 14,
    badge: '金徽',
    treatment: '可发起友善委托；酒馆会把你视为可靠常客并开放荣誉留言。',
  },
]

export const DEFAULT_GUILD_QUESTS = [
  {
    id: 'errand-postcard',
    title: '跑腿委托：吧台明信片',
    summary: '帮接待员确认一张明信片应该送给谁，适合第一次体验。',
    objective: '询问明信片上的线索，说出你认为的收件人或下一步。',
    difficulty: '入门',
    reward: 1,
    identityReward: '可靠跑腿人',
    treatment: '吧台会记住你“愿意帮忙”的第一印象。',
    familyFriendly: true,
  },
  {
    id: 'clue-signboard',
    title: '线索委托：旧告示牌',
    summary: '观察公会门口旧告示牌，找出今天最适合你的任务方向。',
    objective: '选择一个关键词：方向、人物、物品；让 NPC 给出下一条线索。',
    difficulty: '轻松',
    reward: 2,
    identityReward: '线索记录员',
    treatment: '可查看一条额外提示，不需要猜谜太久。',
    familyFriendly: true,
  },
  {
    id: 'welcome-guide',
    title: '协助委托：带新访客入座',
    summary: '用一句温和的话欢迎后来者，学习酒馆里的友好待客方式。',
    objective: '写一句不涉及隐私、让人安心的欢迎语。',
    difficulty: '轻松',
    reward: 2,
    identityReward: '友善引路人',
    treatment: '酒馆会为你保留靠近公告板的位置。',
    familyFriendly: true,
  },
  {
    id: 'choice-trial',
    title: '选择委托：三岔路小试炼',
    summary: '从 3 个安全选项里做选择，让 AI 主持一段 5 分钟微冒险。',
    objective: '让 NPC 给出三个选项，回复序号推进到结算。',
    difficulty: '标准',
    reward: 3,
    identityReward: '小队决策者',
    treatment: '可接到带“身份称呼”的进阶委托。',
    familyFriendly: true,
  },
]

function textOf(value) {
  return String(value || '').trim()
}

function collectTavernText(tavern = {}, character = null) {
  const characters = Array.isArray(tavern.characters) ? tavern.characters : []
  const bookmarks = Array.isArray(tavern.bookmarks) ? tavern.bookmarks : []
  return [
    tavern.name,
    tavern.description,
    tavern.scene_prompt,
    tavern.address,
    ...bookmarks.map((bookmark) => bookmark?.content),
    ...characters.flatMap((char) => [
      char?.name,
      char?.description,
      char?.personality,
      char?.scenario,
      char?.system_prompt,
      ...(Array.isArray(char?.tags) ? char.tags : []),
    ]),
    character?.name,
    character?.description,
    character?.personality,
    character?.scenario,
    character?.system_prompt,
    ...(Array.isArray(character?.tags) ? character.tags : []),
  ].map(textOf).filter(Boolean).join(' ').toLowerCase()
}

function hasAny(haystack, keywords) {
  return keywords.some((keyword) => haystack.includes(keyword))
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map((item) => String(item || '').trim()).filter(Boolean)))
}

export function normalizeGuildProgress(progress = {}) {
  const reputation = Number.parseInt(progress?.reputation, 10)
  return {
    acceptedQuestIds: uniqueStrings(progress?.acceptedQuestIds),
    completedQuestIds: uniqueStrings(progress?.completedQuestIds),
    reputation: Number.isFinite(reputation) ? Math.max(0, reputation) : 0,
    updatedAt: progress?.updatedAt || null,
  }
}

export function getGuildTier(reputationOrProgress = 0) {
  const reputation = typeof reputationOrProgress === 'object'
    ? Number.parseInt(reputationOrProgress?.reputation, 10)
    : Number.parseInt(reputationOrProgress, 10)
  const safeReputation = Number.isFinite(reputation) ? Math.max(0, reputation) : 0
  return [...GUILD_REPUTATION_TIERS]
    .reverse()
    .find((tier) => safeReputation >= tier.min) || GUILD_REPUTATION_TIERS[0]
}

function getQuestSource(tavern = {}) {
  const customQuests = Array.isArray(tavern?.guild_quests) ? tavern.guild_quests : []
  if (customQuests.length === 0) return DEFAULT_GUILD_QUESTS
  return customQuests
    .map((quest, index) => ({
      ...DEFAULT_GUILD_QUESTS[index % DEFAULT_GUILD_QUESTS.length],
      ...quest,
      id: quest.id || `custom-guild-quest-${index + 1}`,
      reward: Math.max(1, Number.parseInt(quest.reward, 10) || 1),
      familyFriendly: quest.familyFriendly !== false,
    }))
}

export function getGuildQuestBoard(tavern = {}, progress = {}) {
  const normalized = normalizeGuildProgress(progress)
  const accepted = new Set(normalized.acceptedQuestIds)
  const completed = new Set(normalized.completedQuestIds)
  return getQuestSource(tavern).map((quest) => ({
    ...quest,
    status: completed.has(quest.id)
      ? 'completed'
      : (accepted.has(quest.id) ? 'accepted' : 'available'),
  }))
}

export function updateGuildProgress(progress = {}, action = {}) {
  const normalized = normalizeGuildProgress(progress)
  const questId = String(action?.questId || '').trim()
  if (!questId) return normalized

  const accepted = new Set(normalized.acceptedQuestIds)
  const completed = new Set(normalized.completedQuestIds)
  let reputation = normalized.reputation

  if (action.type === 'accept') {
    if (!completed.has(questId)) accepted.add(questId)
  }

  if (action.type === 'complete') {
    const quest = action.quest || DEFAULT_GUILD_QUESTS.find((item) => item.id === questId)
    accepted.add(questId)
    if (!completed.has(questId)) {
      completed.add(questId)
      reputation += Math.max(1, Number.parseInt(quest?.reward, 10) || 1)
    }
  }

  return {
    acceptedQuestIds: Array.from(accepted),
    completedQuestIds: Array.from(completed),
    reputation,
    updatedAt: new Date().toISOString(),
  }
}

export function getGuildProgressStorageKey(tavernId = 'tavern', visitorId = 'visitor') {
  return `fablemap_guild_progress:${tavernId || 'tavern'}:${visitorId || 'visitor'}`
}

export function loadGuildProgress(tavernId, visitorId) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return normalizeGuildProgress()
  }
  try {
    const raw = window.localStorage.getItem(getGuildProgressStorageKey(tavernId, visitorId))
    return normalizeGuildProgress(raw ? JSON.parse(raw) : {})
  } catch (err) {
    return normalizeGuildProgress()
  }
}

export function saveGuildProgress(tavernId, visitorId, progress) {
  const normalized = normalizeGuildProgress(progress)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        getGuildProgressStorageKey(tavernId, visitorId),
        JSON.stringify(normalized),
      )
    } catch (err) {
      // localStorage may be disabled; keep in-memory state usable.
    }
  }
  return normalized
}

export function buildGuildActionPrompt(action, quest = null, tier = GUILD_REPUTATION_TIERS[0]) {
  const questTitle = quest?.title || '当前委托'
  const questObjective = quest?.objective || quest?.summary || '请给我一个清楚、老少皆宜的下一步。'
  const tierTitle = tier?.title || GUILD_REPUTATION_TIERS[0].title
  const treatment = tier?.treatment || GUILD_REPUTATION_TIERS[0].treatment

  if (action === 'accept') {
    return `我接受委托《${questTitle}》。请以冒险工会接待员身份登记任务，并用老少皆宜的文字游戏格式告诉我【目标】【完成条件】【可选行动】。委托目标：${questObjective}`
  }

  if (action === 'complete') {
    return `我提交委托《${questTitle}》。请检查我的完成情况；如果认可，请授予声望、身份奖励和身份待遇。当前身份：${tierTitle}；当前待遇：${treatment}。然后给我一个可以继续玩的下一步。`
  }

  if (action === 'post') {
    return `我想发布友善委托。请以冒险工会接待员身份，帮我把想法整理成老少皆宜、安全无压力的任务卡，并给出【委托标题】【目标】【完成条件】【适合对象】【可选行动】。当前身份：${tierTitle}；当前待遇：${treatment}。`
  }

  return `查看我的冒险者身份、声望、当前待遇和可接委托。当前身份：${tierTitle}；当前待遇：${treatment}。请用【身份】【可接委托】【当前待遇】【可选行动】四块回复。`
}

export function inferTavernPlayMode(tavern = {}, character = null) {
  const text = collectTavernText(tavern, character)
  const isHelp = hasAny(text, ['新手', '帮助', '公益', '向导', '服务站', '怎么用', '开店'])
  const isGuild = hasAny(text, [
    '冒险工会',
    '冒险者公会',
    '公会',
    '委托',
    '任务板',
    '悬赏',
    '声望',
    '身份奖励',
    '身份待遇',
    '待遇',
    '发任务',
    '发布任务',
    '发布委托',
    '发委托',
    '接任务',
    '交任务',
    '完成任务',
    'guild',
    'quest board',
  ])
  const isMystery = hasAny(text, ['线索', '调查', '档案', '失物', '谜题', '悬疑', '推理', '异常', '真相'])
  const isTextGame = hasAny(text, ['文字游戏', '轻文字游戏', '任务', '选择', '背包', '道具', '目标', '探索', '冒险'])

  if (isGuild) {
    return {
      id: 'guild',
      label: '冒险工会',
      icon: '🛡️',
      summary: '这间酒馆支持任务板：接委托、提交任务、积累声望并解锁身份待遇。',
      prompts: GUILD_PROMPTS,
    }
  }

  if (isTextGame || isMystery) {
    return {
      id: isMystery ? 'clue_game' : 'text_game',
      label: isMystery ? '线索调查' : '文字游戏',
      icon: isMystery ? '🔎' : '🎲',
      summary: isMystery
        ? '这间酒馆适合按线索推进：调查、整理疑点、做选择。'
        : '这间酒馆支持轻文字游戏：目标、选择、道具或小任务。',
      prompts: isMystery
        ? [...CLUE_PROMPTS, ...TEXT_GAME_PROMPTS.slice(0, 2)]
        : TEXT_GAME_PROMPTS,
    }
  }

  if (isHelp) {
    return {
      id: 'helpdesk',
      label: '新手友好',
      icon: '🧭',
      summary: '这间酒馆适合第一次体验：可以直接问“怎么玩”。',
      prompts: HELP_PROMPTS,
    }
  }

  return {
    id: 'chat',
    label: '轻松聊天',
    icon: '💬',
    summary: '不知道说什么也没关系，点一个快捷句就能开始。',
    prompts: DEFAULT_PROMPTS,
  }
}

export function getTavernPlayBadges(tavern = {}) {
  const mode = inferTavernPlayMode(tavern)
  const badges = [mode.label]
  const hasCharacters = Array.isArray(tavern.characters) && tavern.characters.length > 0
  if (hasCharacters) badges.push(`${tavern.characters.length} 位角色`)
  if (tavern.group_chat_enabled) badges.push('多人群聊')
  return badges
}
