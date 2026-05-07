export const OWNER_GAMEPLAY_TEMPLATE_FORBIDDEN = [
  '不使用战斗、等级、装备、排行榜或可交易奖励',
  '不索取身份证件、住址、手机号、银行卡等敏感信息',
  '不替代医疗、法律、投资等专业结论',
  '不绕过店主确认自动发布剧情、NPC 或空间内容',
]

export const OWNER_GAMEPLAY_TEMPLATE_CATEGORIES = ['全部', '线索', '回访', '陪伴', '观察', '流程', '行业', '需求', '资料', '创作']

export const OWNER_GAMEPLAY_TEMPLATES = [
  {
    id: 'three-step-clue-ledger',
    category: '线索',
    badge: '线索',
    title: '三步线索登记',
    duration: '3-5 分钟',
    bestFor: '书店、侦探角、档案馆、奇谈空间',
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
    bestFor: '树洞、咖啡馆、深夜电台、社区站',
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
    bestFor: '社区店、便民设施、便利店、医院陪伴站',
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

  {
    id: 'workflow-clinic-checkup',
    category: '流程',
    badge: '流程',
    title: '三步流程问诊',
    duration: '5-8 分钟',
    bestFor: '流程诊所、行业工位、店主管理台',
    entryLabel: '开始流程问诊',
    summary: '把一个重复流程拆成现状、卡点和下一步清单；不连接真实业务系统。',
    goal: '帮助访客描述流程现状、识别一个卡点，并形成低风险下一步。',
    tone: '务实、追问事实、不承诺收益或自动化效果。',
    materials: ['流程便签', '交接表', '错误样例', '下一步清单'],
    rewardText: '流程没有被自动改掉，但下一步已经写清楚。',
    nodes: [
      {
        id: 'start',
        title: '描述流程',
        prompt: '请访客说明这个流程从谁开始、经过哪些材料、最后交给谁。',
        choices: [{ id: 'find_blocker', label: '找最卡的一步', next_node_id: 'blocker' }],
      },
      {
        id: 'blocker',
        title: '卡点定位',
        prompt: '帮访客挑出一个高频出错或最耗人的环节，不给自动化承诺。',
        choices: [{ id: 'next_step', label: '写下一步', next_node_id: 'next_step' }],
      },
      {
        id: 'next_step',
        title: '下一步清单',
        prompt: '给出一个今天能验证的小动作和一个需要人工确认的问题。',
        choices: [{ id: 'complete', label: '归档流程问诊', next_node_id: 'complete' }],
      },
      { id: 'complete', title: '问诊完成', prompt: '用三句话总结现状、卡点和下一步。', choices: [] },
    ],
  },
  {
    id: 'industry-material-triage',
    category: '行业',
    badge: '行业',
    title: '行业材料分诊',
    duration: '4-7 分钟',
    bestFor: '招聘、教培、房产、跨境、本地服务前台',
    entryLabel: '整理行业材料',
    summary: '只做材料整理/风险提示，不做最终专业判断。',
    goal: '帮助访客把行业材料整理成目录、缺口和需要人工复核的问题。',
    tone: '熟悉业务语境，但始终提醒人工复核和专业边界。',
    materials: ['材料目录', '风险便签', '跟进草稿', '人工复核栏'],
    rewardText: '材料已经分好类，真正的决定仍交给店主或专业人员确认。',
    nodes: [
      {
        id: 'start',
        title: '说明材料',
        prompt: '请访客说明材料类型，例如 JD、房源、课程信息、listing 或咨询记录。',
        choices: [{ id: 'sort', label: '整理目录', next_node_id: 'sort' }],
      },
      {
        id: 'sort',
        title: '材料目录',
        prompt: '把材料拆成已知信息、缺失信息和需要人工核对的内容。',
        choices: [{ id: 'risk', label: '检查风险', next_node_id: 'risk' }],
      },
      {
        id: 'risk',
        title: '风险提示',
        prompt: '列出 1-2 个可能误解或越界的地方，避免给最终专业结论。',
        choices: [{ id: 'complete', label: '完成分诊', next_node_id: 'complete' }],
      },
      { id: 'complete', title: '分诊完成', prompt: '输出材料目录、缺口和人工复核项。', choices: [] },
    ],
  },
  {
    id: 'needs-counter-brief',
    category: '需求',
    badge: '需求',
    title: '需求吧台摘要',
    duration: '3-6 分钟',
    bestFor: '本地服务、咨询前台、社区接待、店主私域入口',
    entryLabel: '说清需求',
    summary: '形成店主可读摘要，不公开访客记录或群发营销。',
    goal: '帮助访客把模糊请求整理成目标、限制和希望店主如何回应。',
    tone: '温和、结构化、隐私边界明确。',
    materials: ['需求卡', '限制条件', '店主可见摘要', '下一步便签'],
    rewardText: '需求已经说清楚，可以交给店主判断是否继续回应。',
    nodes: [
      {
        id: 'start',
        title: '说出目标',
        prompt: '请访客用一句话说明希望被帮助的目标。',
        choices: [{ id: 'limits', label: '补充限制', next_node_id: 'limits' }],
      },
      {
        id: 'limits',
        title: '限制条件',
        prompt: '询问时间、预算、地点或不方便透露的边界，不索取敏感证件。',
        choices: [{ id: 'summary', label: '生成摘要', next_node_id: 'summary' }],
      },
      {
        id: 'summary',
        title: '店主摘要',
        prompt: '把目标和限制整理成店主可读摘要，并说明不是公开留言墙。',
        choices: [{ id: 'complete', label: '确认摘要', next_node_id: 'complete' }],
      },
      { id: 'complete', title: '摘要完成', prompt: '用一句话确认摘要已准备好，等待店主判断下一步。', choices: [] },
    ],
  },
  {
    id: 'archive-study-lookup',
    category: '资料',
    badge: '资料',
    title: '档案书房查找',
    duration: '3-6 分钟',
    bestFor: '档案书房、团队知识吧、SOP 教练、客服质检角',
    entryLabel: '查找资料',
    summary: '基于店主确认资料做引用式整理，不编造资料来源。',
    goal: '帮助访客说明想找什么，并把回答限制在店主确认的知识范围内。',
    tone: '引用清楚、不确定就标注待复核。',
    materials: ['资料索引', 'SOP 卡', '引用便签', '待复核栏'],
    rewardText: '资料线索已经整理出来，不确定的部分也被标记出来。',
    nodes: [
      {
        id: 'start',
        title: '提出问题',
        prompt: '请访客说明想找的资料或遇到的流程问题。',
        choices: [{ id: 'scope', label: '限定资料范围', next_node_id: 'scope' }],
      },
      {
        id: 'scope',
        title: '资料范围',
        prompt: '提醒只能基于店主确认资料回答，不确定时标注待复核。',
        choices: [{ id: 'cite', label: '整理引用', next_node_id: 'cite' }],
      },
      {
        id: 'cite',
        title: '引用整理',
        prompt: '给出可能的资料位置、引用式回答和待人工复核项。',
        choices: [{ id: 'complete', label: '完成查找', next_node_id: 'complete' }],
      },
      { id: 'complete', title: '查找完成', prompt: '用短句总结已找到、未确认和下一步。', choices: [] },
    ],
  },
  {
    id: 'creation-workshop-outline',
    category: '创作',
    badge: '创作',
    title: '创作工坊大纲',
    duration: '5-8 分钟',
    bestFor: '短剧工坊、角色设计、咨询交付、方案审稿',
    entryLabel: '整理创作 brief',
    summary: '把 brief 整理成草稿大纲，不自动发布或替代最终交付。',
    goal: '帮助访客把想法整理成目标、结构和审稿问题。',
    tone: '鼓励创作但保持草稿边界，所有发布都需店主确认。',
    materials: ['brief 卡', '分镜便签', '审稿清单', '发布前确认'],
    rewardText: '草稿大纲已经形成，但它仍需要店主审稿和确认。',
    nodes: [
      {
        id: 'start',
        title: '说明 brief',
        prompt: '请访客说明主题、受众和想得到的输出格式。',
        choices: [{ id: 'outline', label: '拆成大纲', next_node_id: 'outline' }],
      },
      {
        id: 'outline',
        title: '大纲结构',
        prompt: '生成一个可编辑的大纲结构，不把它描述为最终发布内容。',
        choices: [{ id: 'review', label: '列审稿问题', next_node_id: 'review' }],
      },
      {
        id: 'review',
        title: '审稿问题',
        prompt: '列出 2-3 个店主发布前需要确认的问题。',
        choices: [{ id: 'complete', label: '收束草稿', next_node_id: 'complete' }],
      },
      { id: 'complete', title: '大纲完成', prompt: '提醒这是可改草稿，发布前必须由店主确认。', choices: [] },
    ],
  },
  {
    id: 'companion-beacon-return-note',
    category: '陪伴',
    badge: '陪伴',
    title: '灯塔回访便签',
    duration: '3-5 分钟',
    bestFor: '社区服务站、医院陪伴、社区小店、夜归树洞',
    entryLabel: '写一张回访便签',
    summary: '整理善意清单和回访便签，不替代医疗心理服务。',
    goal: '帮助访客写下一件今天能做的小事、一条边界和下次回访提醒。',
    tone: '温柔、克制、低风险，不追问隐私。',
    materials: ['热水', '善意清单', '回访便签', '现实求助提示'],
    rewardText: '便签已经写好：一件小事，一个边界，下次回来还能继续。',
    nodes: [
      {
        id: 'start',
        title: '命名此刻',
        prompt: '请访客给现在的状态起一个不暴露隐私的小标题。',
        choices: [{ id: 'kind_action', label: '拆一件小事', next_node_id: 'kind_action' }],
      },
      {
        id: 'kind_action',
        title: '善意小事',
        prompt: '给出两个今天可做、低风险的小动作，让访客选择一个。',
        choices: [{ id: 'boundary', label: '写现实边界', next_node_id: 'boundary' }],
      },
      {
        id: 'boundary',
        title: '现实边界',
        prompt: '提醒紧急或专业问题要联系可信任的人、专业人士或当地紧急服务。',
        choices: [{ id: 'complete', label: '封存便签', next_node_id: 'complete' }],
      },
      { id: 'complete', title: '便签完成', prompt: '温和收束，并邀请访客下次回来继续。', choices: [] },
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
      reward_text: template.rewardText || '你完成了这段轻量空间体验。',
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
