export const AI_DRAFT_LIFECYCLE_STEPS = [
  {
    id: 'draft',
    label: 'AI 草稿',
    helper: '只是一份未发布建议。',
  },
  {
    id: 'review',
    label: '店主待确认',
    helper: '店主可编辑、丢弃或重新生成。',
  },
  {
    id: 'published',
    label: '已发布内容',
    helper: '只有店主提交保存后才进入酒馆。',
  },
]

const CONTEXT_COPY = {
  tavern: {
    title: '酒馆草稿生命周期',
    summary: 'AI 草稿只填入可编辑表单；店主检查并点击「创建酒馆」后，才会保存为正式酒馆和首个 NPC。',
    guardrails: [
      '确认前不进入公开 Tavern payload',
      '不自动创建酒馆或 NPC',
      '不替店主承担最终创作责任',
    ],
  },
  character: {
    title: 'NPC 草稿生命周期',
    summary: '生成结果只进入右侧编辑器；店主可改写、丢弃或点击「保存角色」后再成为正式 TavernCharacter。',
    guardrails: [
      '确认前不覆盖已有 NPC',
      '确认前不随酒馆包导出',
      '不绕过店主保存动作',
    ],
  },
  gameplay: {
    title: '玩法草稿生命周期',
    summary: '玩法模板先生成本地 draft；店主检查、保存/发布后访客才可见。',
    guardrails: [
      '不含战斗、等级、装备、排行',
      'draft 不是已发布玩法',
      'disabled 会从访客入口隐藏',
    ],
  },
}

export function buildAiDraftLifecycle(context = 'tavern') {
  const copy = CONTEXT_COPY[context] || CONTEXT_COPY.tavern
  return {
    context,
    steps: AI_DRAFT_LIFECYCLE_STEPS.map((step) => ({ ...step })),
    title: copy.title,
    summary: copy.summary,
    guardrails: [...copy.guardrails],
  }
}
