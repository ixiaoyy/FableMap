export const OWNER_GAMEPLAY_TEMPLATE_FORBIDDEN = [
  '不使用战斗、等级、装备、排行榜或可交易奖励',
  '不索取身份证件、住址、手机号、银行卡等敏感信息',
  '不替代医疗、法律、投资等专业结论',
  '不绕过店主确认自动发布剧情、NPC 或酒馆内容',
]

export const OWNER_GAMEPLAY_TEMPLATE_CATEGORIES = ['全部', '线索', '回访', '陪伴', '观察']

export const OWNER_GAMEPLAY_TEMPLATES = [
  {
    id: 'three-step-clue-ledger',
    category: '线索',
    badge: '线索',
    title: '三步线索登记',
    duration: '3-5 分钟',
    bestFor: '书店、侦探角、档案馆、奇谈酒馆',
    entryLabel: '登记线索',
    summary: '让访客把一个模糊问题拆成线索、矛盾和下一步，不给唯一答案。',
    goal: '引导访客用三步记录当前线索：看见了什么、哪里矛盾、下一步准备验证什么。',
    tone: '克制、证据意识、短句追问，不直接替访客下结论。',
    materials: ['线索登记册', '铅笔', '旧地图边角', '时间戳便签'],
    rewardText: '你把这条线索归档了。答案还没有出现，但下一步已经清楚。',
    nodes: [
      {
        id: 'start',
        title: '线索开场',
        prompt: '请访客用一句话说出当前最想查清楚的事。',
        choices: [
          { id: 'record', label: '记录已知线索', next_node_id: 'record' },
          { id: 'skip', label: '直接说矛盾点', next_node_id: 'conflict' },
        ],
      },
      {
        id: 'record',
        title: '记录已知',
        prompt: '帮访客列出 2-3 条已经确认的事实，避免脑补。',
        choices: [
          { id: 'conflict', label: '找出不对劲的地方', next_node_id: 'conflict' },
          { id: 'complete', label: '先归档到这里', next_node_id: 'complete' },
        ],
      },
      {
        id: 'conflict',
        title: '矛盾检查',
        prompt: '指出一处信息空缺或矛盾，并请访客选择一个低风险验证动作。',
        choices: [
          { id: 'complete', label: '写下下一步', next_node_id: 'complete' },
        ],
      },
      { id: 'complete', title: '归档完成', prompt: '用一句话总结线索和下一步。', choices: [] },
    ],
  },
  {
    id: 'returning-note',
    category: '回访',
    badge: '回访',
    title: '回访小信笺',
    duration: '2-4 分钟',
    bestFor: '树洞、咖啡馆、深夜电台、公益站',
    entryLabel: '写回访信笺',
    summary: '帮访客留下给下次自己的短笺，不写入公开墙。',
    goal: '让访客写下一句给未来自己的回访提醒，强调这是私密/店主可见的轻量记录。',
    tone: '温柔、边界清楚、不追问隐私。',
    materials: ['便签纸', '旧邮戳', '吧台灯', '回访提醒'],
    rewardText: '这张小信笺已经写好。下次回来时，它会提醒你当时想守住的事。',
    nodes: [
      {
        id: 'start',
        title: '选择信笺主题',
        prompt: '请访客从“想记住的事 / 想放下的事 / 下次再问”里选一个。',
        choices: [
          { id: 'remember', label: '想记住的事', next_node_id: 'draft' },
          { id: 'release', label: '想放下的事', next_node_id: 'draft' },
          { id: 'ask_next', label: '下次再问', next_node_id: 'draft' },
        ],
      },
      {
        id: 'draft',
        title: '写一句话',
        prompt: '协助访客把信笺压缩成一句不暴露敏感隐私的话。',
        choices: [
          { id: 'complete', label: '封存信笺', next_node_id: 'complete' },
        ],
      },
      { id: 'complete', title: '信笺完成', prompt: '感谢访客，并提醒这不是公开留言墙。', choices: [] },
    ],
  },
  {
    id: 'kindness-checklist',
    category: '陪伴',
    badge: '陪伴',
    title: '街区善意清单',
    duration: '3-6 分钟',
    bestFor: '社区店、公益酒馆、便利店、医院陪伴站',
    entryLabel: '整理小清单',
    summary: '把一个现实压力拆成今天能做的一件小事和一个求助边界。',
    goal: '陪访客整理一个低风险、今天可做的小动作，并提醒专业/紧急事项要找现实支持。',
    tone: '务实、平稳、尊重访客选择，不冒充专业人士。',
    materials: ['小清单', '热水', '附近公告栏', '求助边界提示'],
    rewardText: '清单很短，但已经足够开始：一件小事，一个边界，一个可以求助的人。',
    nodes: [
      {
        id: 'start',
        title: '压力命名',
        prompt: '请访客把当前压力命名成一个不超过 12 字的标题。',
        choices: [
          { id: 'small_action', label: '拆一个小动作', next_node_id: 'small_action' },
        ],
      },
      {
        id: 'small_action',
        title: '小动作',
        prompt: '给出 2 个低风险、今天可完成的小动作，让访客选择一个。',
        choices: [
          { id: 'boundary', label: '加上现实边界', next_node_id: 'boundary' },
        ],
      },
      {
        id: 'boundary',
        title: '现实边界',
        prompt: '提醒哪些情况应联系可信任的人、专业人士或当地紧急服务。',
        choices: [
          { id: 'complete', label: '完成清单', next_node_id: 'complete' },
        ],
      },
      { id: 'complete', title: '清单完成', prompt: '用温和短句收束，不承诺结果。', choices: [] },
    ],
  },
  {
    id: 'quiet-object-reading',
    category: '观察',
    badge: '观察',
    title: '安静物件观察',
    duration: '2-5 分钟',
    bestFor: '展馆、旧物店、异世界旅店、收藏室',
    entryLabel: '观察一件物品',
    summary: '选择一件店内物品，从外观、触感和联想里生成一段不落库的小体验。',
    goal: '让访客观察一件店主设定的物品，用三层观察组织一段氛围体验。',
    tone: '细腻、安静、有画面感，但不擅自新增正史。',
    materials: ['旧钥匙', '杯垫', '门牌', '窗边影子'],
    rewardText: '这件物品仍然安静地待在那里，但你已经看见了它的一小部分故事。',
    nodes: [
      {
        id: 'start',
        title: '选物',
        prompt: '让访客选择一个店内物件，或请 NPC 从素材中挑一个。',
        choices: [
          { id: 'surface', label: '看外观', next_node_id: 'surface' },
          { id: 'memory', label: '听它可能见过什么', next_node_id: 'memory' },
        ],
      },
      {
        id: 'surface',
        title: '外观观察',
        prompt: '描述颜色、磨损、位置和光线，不下结论。',
        choices: [
          { id: 'memory', label: '补一层联想', next_node_id: 'memory' },
        ],
      },
      {
        id: 'memory',
        title: '联想收束',
        prompt: '给出一段可被店主改写的轻联想，并提醒这不是正式正史。',
        choices: [
          { id: 'complete', label: '收起观察', next_node_id: 'complete' },
        ],
      },
      { id: 'complete', title: '观察完成', prompt: '用一句安静的结尾收束。', choices: [] },
    ],
  },
]

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}))
}

function safeId(value) {
  return String(value || 'template')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'template'
}

export function createOwnerGameplayFromTemplate(template, index = 1) {
  if (!template?.id) return null
  return {
    id: `gp_template_${safeId(template.id)}_${Date.now().toString(36)}_${index}`,
    title: template.title,
    status: 'draft',
    summary: template.summary,
    entry_label: template.entryLabel || '开始玩法',
    mode: 'ai_directed_branch',
    owner_brief: {
      goal: template.goal,
      tone: template.tone,
      materials: [...(template.materials || [])],
      forbidden: [...OWNER_GAMEPLAY_TEMPLATE_FORBIDDEN],
    },
    nodes: clone(template.nodes),
    fallback_events: [
      {
        id: 'gentle_redirect',
        type: 'nudge',
        text: '如果访客卡住，请给出两个低风险选项，而不是替访客做决定。',
      },
    ],
    completion: {
      complete_node_ids: ['complete'],
      reward_text: template.rewardText || '你完成了这段轻量酒馆体验。',
      memory_atom: { enabled: false },
    },
  }
}

export function filterOwnerGameplayTemplates({ query = '', category = '全部' } = {}) {
  const keyword = String(query || '').trim().toLowerCase()
  return OWNER_GAMEPLAY_TEMPLATES.filter((template) => {
    if (category && category !== '全部' && template.category !== category) return false
    if (!keyword) return true
    return [
      template.title,
      template.summary,
      template.bestFor,
      template.category,
      ...(template.materials || []),
    ].join(' ').toLowerCase().includes(keyword)
  })
}
