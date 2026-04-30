const QUEST_TYPES = {
  exploration: '探索引导',
  npc: 'NPC 互动',
  creation: '创作引导',
  gameplay: '探索玩法',
}

export const PLATFORM_QUEST_GUIDES = [
  {
    id: 'visit-first-open-tavern',
    title: '记录第一间营业酒馆',
    type: 'exploration',
    targetCount: 1,
    icon: '🧭',
    description: '从真实坐标锚定的公开酒馆开始，记录一次安全入场体验。',
    ctaLabel: '去发现页找酒馆',
    ctaTo: '/discover',
    measure: ({ openTaverns }) => openTaverns,
  },
  {
    id: 'tour-three-open-taverns',
    title: '巡礼三间开放酒馆',
    type: 'exploration',
    targetCount: 3,
    icon: '🍻',
    description: '比较不同店主设定的氛围、NPC 和开场白，而不是做地图打卡排行。',
    ctaLabel: '查看开放酒馆',
    ctaTo: '/discover',
    measure: ({ openTaverns }) => openTaverns,
  },
  {
    id: 'meet-three-npcs',
    title: '认识三位酒馆 NPC',
    type: 'npc',
    targetCount: 3,
    icon: '💬',
    description: '优先体验店主配置的角色、表情和第一句话，感受 NPC 是否记得场景。',
    ctaLabel: '进入酒馆对话',
    ctaTo: '/discover',
    measure: ({ npcCount }) => npcCount,
  },
  {
    id: 'try-quest-play-tavern',
    title: '试一间探索玩法酒馆',
    type: 'gameplay',
    targetCount: 1,
    icon: '📜',
    description: '体验店主发布的轻量文本玩法；只记录完成与回访提示，不引入战斗、数值成长或竞赛榜单。',
    ctaLabel: '寻找玩法酒馆',
    ctaTo: '/discover',
    measure: ({ questPlayTaverns }) => questPlayTaverns,
  },
  {
    id: 'create-real-anchor',
    title: '创建自己的真实坐标锚点',
    type: 'creation',
    targetCount: 1,
    icon: '✨',
    description: '创建一间由店主确认内容的酒馆；AI 草稿只能辅助填写，不能自动发布。',
    ctaLabel: '创建酒馆',
    ctaTo: '/create',
    measure: ({ ownerTaverns }) => ownerTaverns,
  },
]

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function isPublishedGameplay(definition) {
  return definition && typeof definition === 'object' && definition.status === 'published'
}

function questPlayCandidate(tavern = {}) {
  if (tavern.layout_style === 'quest-play') return true
  return asArray(tavern.gameplay_definitions).some(isPublishedGameplay)
}

export function buildQuestGuideSummary({ taverns = [], ownerId = '' } = {}) {
  const safeTaverns = asArray(taverns)
  const openTaverns = safeTaverns.filter((tavern) => tavern.status === 'open' && tavern.access !== 'private')
  const metrics = {
    taverns: safeTaverns.length,
    openTaverns: openTaverns.length,
    npcCount: openTaverns.reduce((sum, tavern) => sum + asArray(tavern.characters).length, 0),
    questPlayTaverns: openTaverns.filter(questPlayCandidate).length,
    ownerTaverns: ownerId ? safeTaverns.filter((tavern) => tavern.owner_id === ownerId).length : 0,
  }

  const quests = PLATFORM_QUEST_GUIDES.map((quest) => {
    const current = Math.max(0, Number(quest.measure(metrics)) || 0)
    const target = Math.max(1, Number(quest.targetCount) || 1)
    const completed = current >= target
    return {
      id: quest.id,
      title: quest.title,
      type: quest.type,
      typeLabel: QUEST_TYPES[quest.type] || quest.type,
      icon: quest.icon,
      description: quest.description,
      ctaLabel: quest.ctaLabel,
      ctaTo: quest.ctaTo,
      current: Math.min(current, target),
      rawCurrent: current,
      target,
      progress: Math.min(1, current / target),
      status: completed ? 'completed' : current > 0 ? 'in_progress' : 'available',
      statusLabel: completed ? '可记录' : current > 0 ? '进行中' : '可开始',
      rewardText: completed ? '可获得一段文字纪念章和下一步探索建议' : '完成后显示温和文字反馈与回访提示',
    }
  })

  return {
    metrics,
    quests,
    completedCount: quests.filter((quest) => quest.status === 'completed').length,
    activeCount: quests.filter((quest) => quest.status !== 'completed').length,
  }
}
