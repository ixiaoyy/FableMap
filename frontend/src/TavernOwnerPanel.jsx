import { useState, useEffect, useMemo } from 'react'
import { getDefaultTavernService, getTavernAccessIcon, getTavernAccessLabel, getTavernStatusColor, getTavernStatusLabel } from './services/tavernService'
import LLMConfigForm from './LLMConfigForm'
import TavernCreatePanel from './TavernCreatePanel'
import CharacterManagementModal from './CharacterManagementModal'

const STATUS_FILTERS = [
  { id: 'all', label: '全部状态' },
  { id: 'open', label: '营业中' },
  { id: 'closed', label: '歇业中' },
]

const ACCESS_FILTERS = [
  { id: 'all', label: '全部权限' },
  { id: 'public', label: '公开' },
  { id: 'password', label: '密码' },
  { id: 'private', label: '私人' },
]

function formatCoordinate(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toFixed(4) : '未设置'
}

function formatTokens(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return '—'
  if (numeric >= 1000000) return `${(numeric / 1000000).toFixed(2)}M`
  if (numeric >= 1000) return `${(numeric / 1000).toFixed(1)}K`
  return numeric.toLocaleString()
}

function formatChatTimestamp(value) {
  if (!value) return '暂无时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelationshipStage(stage) {
  const labels = {
    stranger: '初访者',
    acquaintance: '熟面孔',
    regular: '常客',
    confidant: '熟客盟友',
  }
  return labels[stage] || stage || '未建立'
}

function getSessionVisitorLabel(session) {
  return session?.visitor_name || (session?.visitor_id ? session.visitor_id.slice(0, 16) : '匿名访客')
}

function getChatMessageSpeaker(message, session) {
  if (message?.role === 'assistant') {
    return session?.character_name || 'NPC'
  }
  if (message?.role === 'system') {
    return '系统'
  }
  return message?.visitor_name || getSessionVisitorLabel(session)
}

function buildChatTranscript(session, messages = []) {
  if (!session || !Array.isArray(messages) || messages.length === 0) return ''
  const header = [
    `酒馆：${session.tavern_name || session.tavern_id || '未知酒馆'}`,
    `角色：${session.character_name || session.character_id || '未知角色'}`,
    `访客：${getSessionVisitorLabel(session)}`,
  ].join('\n')
  const body = messages.map((message) => {
    const timestamp = message?.timestamp ? `[${formatChatTimestamp(message.timestamp)}] ` : ''
    const speaker = getChatMessageSpeaker(message, session)
    return `${timestamp}${speaker}: ${message?.content || ''}`
  }).join('\n')
  return `${header}\n\n${body}`
}

function getTavernTokenUsage(tavern) {
  const usage = Number(tavern?.llm_config?.token_used || 0)
  return Number.isFinite(usage) && usage > 0 ? usage : 0
}

/**
 * TavernOwnerPanel — 店主管理面板
 *
 * Props:
 *   ownerId        — 店主 ID
 *   onClose        — () => void — 关闭面板
 *   onTavernCreated — (tavern) => void — 酒馆创建/更新后回调
 *   initialTab     — number — 初始标签页（0=列表，1=创建）
 *   editTavern     — object — 初始要编辑的酒馆数据
 */
export default function TavernOwnerPanel({
  ownerId = '',
  onClose,
  onTavernCreated,
  initialTab = 0,
  editTavern = null,
}) {
  const [tab, setTab] = useState(initialTab)
  const [myTaverns, setMyTaverns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreate, setShowCreate] = useState(initialTab === 1 && !editTavern)
  const [editingTavern, setEditingTavern] = useState(editTavern)
  const [editingLlmTavern, setEditingLlmTavern] = useState(null)
  const [characterManagerTavern, setCharacterManagerTavern] = useState(null)
  const [llmFormData, setLlmFormData] = useState(null)
  const [savingLlm, setSavingLlm] = useState(false)
  const [llmSaveResult, setLlmSaveResult] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [accessFilter, setAccessFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [chatSessions, setChatSessions] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [chatSearchTavernId, setChatSearchTavernId] = useState('')
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [chatSearchResults, setChatSearchResults] = useState([])
  const [chatSearchLoading, setChatSearchLoading] = useState(false)
  const [chatSearchError, setChatSearchError] = useState('')
  const [chatSearchStatus, setChatSearchStatus] = useState('')
  const [chatDetailSession, setChatDetailSession] = useState(null)
  const [chatDetailMessages, setChatDetailMessages] = useState([])
  const [chatDetailLoading, setChatDetailLoading] = useState(false)
  const [chatDetailError, setChatDetailError] = useState('')
  const [chatExportText, setChatExportText] = useState('')
  const [chatExportLoading, setChatExportLoading] = useState(false)
  const [chatExportStatus, setChatExportStatus] = useState('')
  const [visitorStates, setVisitorStates] = useState([])
  const [visitorLoading, setVisitorLoading] = useState(false)
  const [visitorError, setVisitorError] = useState('')
  const tavernService = getDefaultTavernService()
  const ownerLabel = ownerId || '未识别店主'

  const ownerStats = useMemo(() => {
    return myTaverns.reduce(
      (stats, tavern) => {
        const tokenUsed = getTavernTokenUsage(tavern)
        stats.total += 1
        stats.characters += tavern?.characters?.length || 0
        stats.tokens += tokenUsed
        if (tavern.status === 'open') stats.open += 1
        if (tavern.status === 'closed') stats.closed += 1
        return stats
      },
      { total: 0, open: 0, closed: 0, characters: 0, tokens: 0 },
    )
  }, [myTaverns])

  const tokenStats = useMemo(() => {
    const rows = myTaverns
      .map((tavern) => ({
        tavern,
        tokens: getTavernTokenUsage(tavern),
        backend: tavern?.llm_config?.backend || '未配置',
        model: tavern?.llm_config?.model || '未配置模型',
      }))
      .sort((a, b) => b.tokens - a.tokens || String(a.tavern.name || '').localeCompare(String(b.tavern.name || '')))

    const total = rows.reduce((sum, row) => sum + row.tokens, 0)
    const usedRows = rows.filter((row) => row.tokens > 0)
    const topTokens = rows[0]?.tokens || 0

    return {
      rows,
      total,
      average: rows.length ? Math.round(total / rows.length) : 0,
      usedCount: usedRows.length,
      unusedCount: rows.length - usedRows.length,
      topTokens,
      topTavernName: usedRows[0]?.tavern?.name || '',
    }
  }, [myTaverns])

  const chatStats = useMemo(() => {
    const visitorIds = new Set()
    const visitorNames = new Set()
    let messageCount = 0
    chatSessions.forEach((session) => {
      if (session.visitor_id) visitorIds.add(session.visitor_id)
      if (session.visitor_name) visitorNames.add(session.visitor_name)
      messageCount += Number(session.message_count || 0)
    })
    return {
      sessions: chatSessions.length,
      visitors: visitorNames.size || visitorIds.size,
      messages: messageCount,
    }
  }, [chatSessions])

  const visitorStats = useMemo(() => {
    const totalVisits = visitorStates.reduce((sum, visitor) => sum + Number(visitor.visit_count || 0), 0)
    const returningVisitors = visitorStates.filter((visitor) => Number(visitor.visit_count || 0) >= 2).length
    const engagedVisitors = visitorStates.filter((visitor) => Number(visitor.message_count || 0) > 0).length
    return {
      visitors: visitorStates.length,
      visits: totalVisits,
      returningVisitors,
      engagedVisitors,
    }
  }, [visitorStates])

  const filteredTaverns = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return myTaverns.filter((tavern) => {
      const matchesStatus = statusFilter === 'all' || tavern.status === statusFilter
      const matchesAccess = accessFilter === 'all' || tavern.access === accessFilter
      const searchable = [
        tavern.name,
        tavern.description,
        tavern.scene_prompt,
        tavern.characters?.map((character) => character.name).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesKeyword = !keyword || searchable.includes(keyword)
      return matchesStatus && matchesAccess && matchesKeyword
    })
  }, [myTaverns, statusFilter, accessFilter, searchQuery])

  const hasActiveFilters = statusFilter !== 'all' || accessFilter !== 'all' || Boolean(searchQuery.trim())

  useEffect(() => {
    if (!showCreate && !editingTavern) {
      refreshOwnerData()
    }
  }, [showCreate, editingTavern])

  useEffect(() => {
    if (!ownerId || showCreate || editingTavern || myTaverns.length === 0) {
      setVisitorStates([])
      return
    }
    fetchOwnerVisitorStates(myTaverns)
  }, [ownerId, showCreate, editingTavern, myTaverns])

  useEffect(() => {
    if (!myTaverns.length) {
      if (chatSearchTavernId) setChatSearchTavernId('')
      return
    }
    if (!chatSearchTavernId || !myTaverns.some((tavern) => tavern.id === chatSearchTavernId)) {
      setChatSearchTavernId(myTaverns[0].id)
    }
  }, [chatSearchTavernId, myTaverns])

  // Switch to create tab when editTavern prop is provided
  useEffect(() => {
    if (editTavern) {
      setEditingTavern(editTavern)
      setShowCreate(false)
      setTab(1)
    }
  }, [editTavern])

  async function fetchMyTaverns() {
    setLoading(true)
    setError(null)
    if (!ownerId) {
      setMyTaverns([])
      setError('缺少店主身份，暂时无法读取你的酒馆。')
      setLoading(false)
      return
    }
    try {
      const result = await tavernService.listTaverns({ owner_id: ownerId })
      const list = Array.isArray(result) ? result : (result?.taverns || [])
      // Filter to only show taverns owned by this user
      setMyTaverns(list.filter(t => t.owner_id === ownerId))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOwnerChatSessions() {
    setChatError('')
    if (!ownerId) {
      setChatSessions([])
      return
    }
    setChatLoading(true)
    try {
      const result = await tavernService.listChatSessions({}, ownerId)
      const chats = Array.isArray(result?.chats) ? result.chats : []
      setChatSessions(chats)
    } catch (err) {
      setChatError(err.message)
    } finally {
      setChatLoading(false)
    }
  }

  async function openChatSessionDetail(session) {
    if (!session?.tavern_id || !session?.visitor_id) return
    setChatDetailSession(session)
    setChatDetailMessages([])
    setChatDetailError('')
    setChatExportText('')
    setChatExportStatus('')
    setChatDetailLoading(true)
    try {
      const result = await tavernService.getChatHistory(
        session.tavern_id,
        session.visitor_id,
        session.character_id,
        ownerId,
        200,
      )
      setChatDetailMessages(Array.isArray(result?.messages) ? result.messages : [])
    } catch (err) {
      setChatDetailError(err.message)
    } finally {
      setChatDetailLoading(false)
    }
  }

  async function openVisitorLatestSession(visitor) {
    if (!visitor?.tavern_id || !visitor?.visitor_id) return
    setChatError('')
    const matchesCurrentSession = (session) => (
      session.tavern_id === visitor.tavern_id && session.visitor_id === visitor.visitor_id
    )
    const knownSessions = chatSessions
      .filter(matchesCurrentSession)
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
    if (knownSessions[0]) {
      openChatSessionDetail(knownSessions[0])
      return
    }

    setChatLoading(true)
    try {
      const result = await tavernService.listChatSessions(
        { tavernId: visitor.tavern_id, visitorId: visitor.visitor_id },
        ownerId,
      )
      const fetchedSessions = Array.isArray(result?.chats) ? result.chats : []
      if (fetchedSessions.length === 0) {
        setChatError('该访客还没有可查看的聊天会话。')
        return
      }
      setChatSessions((prev) => {
        const existingKeys = new Set(prev.map((session) => `${session.tavern_id}:${session.visitor_id}:${session.character_id}`))
        const additions = fetchedSessions.filter((session) => !existingKeys.has(`${session.tavern_id}:${session.visitor_id}:${session.character_id}`))
        return [...additions, ...prev]
      })
      openChatSessionDetail(
        fetchedSessions.sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))[0],
      )
    } catch (err) {
      setChatError(`读取访客会话失败：${err.message}`)
    } finally {
      setChatLoading(false)
    }
  }

  function resolveChatSearchSession(message = {}) {
    const knownSession = chatSessions.find((session) => (
      session.tavern_id === message.tavern_id
      && session.visitor_id === message.visitor_id
      && session.character_id === message.character_id
    ))
    if (knownSession) return knownSession

    const tavern = myTaverns.find((item) => item.id === message.tavern_id)
    const character = tavern?.characters?.find((item) => item.id === message.character_id)
    return {
      tavern_id: message.tavern_id || '',
      tavern_name: tavern?.name || message.tavern_id || '未知酒馆',
      visitor_id: message.visitor_id || '',
      visitor_name: message.visitor_name || '',
      character_id: message.character_id || '',
      character_name: character?.name || message.character_id || '未知角色',
      message_count: 0,
      last_message: message.content || '',
      last_role: message.role || '',
      updated_at: message.timestamp || '',
    }
  }

  async function runChatSearch(event) {
    event?.preventDefault?.()
    const keyword = chatSearchQuery.trim()
    setChatSearchError('')
    setChatSearchStatus('')
    setChatSearchResults([])

    if (!ownerId) {
      setChatSearchError('缺少店主身份，无法搜索聊天记录。')
      return
    }
    if (!chatSearchTavernId) {
      setChatSearchError('请先选择要搜索的酒馆。')
      return
    }
    if (!keyword) {
      setChatSearchStatus('请输入关键词后再搜索。')
      return
    }

    setChatSearchLoading(true)
    try {
      const result = await tavernService.searchChatHistory(
        {
          tavernId: chatSearchTavernId,
          query: keyword,
          limit: 20,
        },
        ownerId,
      )
      const results = Array.isArray(result?.results) ? result.results : []
      setChatSearchResults(results)
      if (result?.count > 0) {
        const suffix = result.truncated ? `，仅显示前 ${result.limit || results.length} 条` : ''
        setChatSearchStatus(`找到 ${result.count} 条匹配${suffix}`)
      } else {
        setChatSearchStatus('没有找到匹配消息。')
      }
    } catch (err) {
      setChatSearchError(err.message)
    } finally {
      setChatSearchLoading(false)
    }
  }

  function openChatSearchResult(result) {
    const session = resolveChatSearchSession(result?.message || {})
    if (!session?.tavern_id || !session?.visitor_id) return
    openChatSessionDetail(session)
  }

  async function refreshChatSessionDetail() {
    if (!chatDetailSession) return
    openChatSessionDetail(chatDetailSession)
  }

  async function generateChatExportText() {
    if (!chatDetailSession) return
    setChatExportLoading(true)
    setChatExportStatus('')
    try {
      const result = await tavernService.exportChatHistory(
        {
          tavernId: chatDetailSession.tavern_id,
          characterId: chatDetailSession.character_id,
          visitorId: chatDetailSession.visitor_id,
          format: 'text',
        },
        ownerId,
      )
      setChatExportText(result?.text || buildChatTranscript(chatDetailSession, chatDetailMessages))
      setChatExportStatus('导出文本已生成')
    } catch (err) {
      setChatExportStatus(`导出失败：${err.message}`)
    } finally {
      setChatExportLoading(false)
    }
  }

  async function copyChatExportText() {
    const text = chatExportText || buildChatTranscript(chatDetailSession, chatDetailMessages)
    if (!text) return
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable')
      }
      await navigator.clipboard.writeText(text)
      setChatExportStatus('已复制到剪贴板')
    } catch {
      setChatExportStatus('当前浏览器不允许自动复制，请手动选中文本复制')
    }
  }

  function closeChatSessionDetail() {
    setChatDetailSession(null)
    setChatDetailMessages([])
    setChatDetailError('')
    setChatExportText('')
    setChatExportStatus('')
  }

  async function fetchOwnerVisitorStates(tavernList = myTaverns) {
    setVisitorError('')
    if (!ownerId || !tavernList.length) {
      setVisitorStates([])
      return
    }
    setVisitorLoading(true)
    try {
      const visitorPayloads = await Promise.all(
        tavernList.map(async (tavern) => {
          const result = await tavernService.getTavernVisitors(tavern.id, ownerId)
          const visitors = Array.isArray(result?.visitors) ? result.visitors : []
          return visitors.map((visitor) => ({
            ...visitor,
            tavern_id: tavern.id,
            tavern_name: tavern.name,
          }))
        })
      )
      setVisitorStates(
        visitorPayloads
          .flat()
          .sort((a, b) => String(b.last_visit || '').localeCompare(String(a.last_visit || '')))
      )
    } catch (err) {
      setVisitorError(err.message)
    } finally {
      setVisitorLoading(false)
    }
  }

  function refreshOwnerData() {
    fetchMyTaverns()
    fetchOwnerChatSessions()
    fetchOwnerVisitorStates()
  }

  async function handleToggleStatus(tavern) {
    const newStatus = tavern.status === 'open' ? 'closed' : 'open'
    try {
      await tavernService.updateTavern(tavern.id, { status: newStatus }, ownerId)
      setMyTaverns(prev => prev.map(t => t.id === tavern.id ? { ...t, status: newStatus } : t))
    } catch (err) {
      alert(`更新失败: ${err.message}`)
    }
  }

  async function handleSaveEdit(updatedData) {
    try {
      const result = await tavernService.updateTavern(editingTavern.id, updatedData, ownerId)
      setMyTaverns(prev => prev.map(t => t.id === editingTavern.id ? { ...t, ...result } : t))
      setEditingTavern(null)
      if (onTavernCreated) onTavernCreated(result)
    } catch (err) {
      alert(`保存失败: ${err.message}`)
    }
  }

  async function handleDelete(tavernId) {
    try {
      await tavernService.deleteTavern(tavernId, ownerId)
      setMyTaverns(prev => prev.filter(t => t.id !== tavernId))
      setDeleteTarget(null)
    } catch (err) {
      alert(`删除失败: ${err.message}`)
    }
  }

  async function handleSaveLlm() {
    if (!editingLlmTavern || !llmFormData) return
    setSavingLlm(true)
    setLlmSaveResult(null)
    try {
      const result = await tavernService.updateTavern(editingLlmTavern.id, { llm_config: llmFormData }, ownerId)
      setMyTaverns(prev => prev.map(t => t.id === editingLlmTavern.id ? { ...t, ...result } : t))
      setEditingLlmTavern(prev => prev ? { ...prev, ...result } : prev)
      setLlmSaveResult({ ok: true, message: 'AI 配置已保存' })
      if (onTavernCreated) onTavernCreated(result)
    } catch (err) {
      setLlmSaveResult({ ok: false, message: `保存失败：${err.message}` })
    } finally {
      setSavingLlm(false)
    }
  }

  function handleTavernCreated(newTavern) {
    setShowCreate(false)
    setEditingTavern(null)
    if (!myTaverns.find(t => t.id === newTavern.id)) {
      setMyTaverns(prev => [newTavern, ...prev])
    } else {
      setMyTaverns(prev => prev.map(t => t.id === newTavern.id ? newTavern : t))
    }
    setTab(0)
    if (onTavernCreated) onTavernCreated(newTavern)
  }

  function handleCharactersUpdated(updatedTavern) {
    setMyTaverns(prev => prev.map(t => t.id === updatedTavern.id ? { ...t, ...updatedTavern } : t))
    setCharacterManagerTavern(updatedTavern)
    if (onTavernCreated) onTavernCreated(updatedTavern)
  }

  function openLlmEdit(tavern) {
    setEditingLlmTavern(tavern)
    setLlmFormData({
      backend: tavern.llm_config?.backend || 'openai',
      model: tavern.llm_config?.model || 'gpt-4o-mini',
      api_key: '',  // Don't pre-fill for security
      base_url: tavern.llm_config?.base_url || '',
      temperature: tavern.llm_config?.temperature ?? 0.8,
      max_tokens: tavern.llm_config?.max_tokens ?? 4096,
      top_p: tavern.llm_config?.top_p ?? 1.0,
    })
    setLlmSaveResult(null)
  }

  function closeLlmEdit() {
    setEditingLlmTavern(null)
    setLlmFormData(null)
    setLlmSaveResult(null)
  }

  function handleEditTavern(tavern) {
    setEditingTavern(tavern)
    setShowCreate(false)
  }

  function clearFilters() {
    setStatusFilter('all')
    setAccessFilter('all')
    setSearchQuery('')
  }

  // Show create panel
  if (showCreate) {
    return (
      <div className="owner-create-container">
        <TavernCreatePanel
          initialLat={0}
          initialLon={0}
          ownerId={ownerId}
          onCreated={handleTavernCreated}
          onCancel={() => { setShowCreate(false); setTab(0) }}
        />
      </div>
    )
  }

  // Show edit modal
  if (editingTavern) {
    return (
      <TavernEditModal
        tavern={editingTavern}
        onSave={handleSaveEdit}
        onClose={() => setEditingTavern(null)}
      />
    )
  }

  return (
    <div className="tavern-owner-panel page-enter">
      <header className="owner-header">
        <div className="owner-header__title">
          <p className="mini-label">店主控制台</p>
          <h1>我的酒馆控制台</h1>
          <p className="note muted owner-header__note">
            店主身份：<code>{ownerLabel}</code>
          </p>
        </div>
        <div className="owner-header__actions">
          <button className="secondary" onClick={refreshOwnerData} disabled={loading || chatLoading}>
            {loading || chatLoading ? '刷新中...' : '刷新列表'}
          </button>
          {onClose ? (
            <button className="secondary" onClick={onClose}>返回</button>
          ) : null}
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + 创建新酒馆
          </button>
        </div>
      </header>

      <section className="owner-overview" aria-label="我的酒馆摘要">
        <article className="owner-overview-item">
          <span className="mini-label">全部酒馆</span>
          <strong>{ownerStats.total}</strong>
          <p>当前身份拥有的酒馆数量</p>
        </article>
        <article className="owner-overview-item">
          <span className="mini-label">营业中</span>
          <strong>{ownerStats.open}</strong>
          <p>{ownerStats.closed} 间正在歇业</p>
        </article>
        <article className="owner-overview-item">
          <span className="mini-label">角色总数</span>
          <strong>{ownerStats.characters}</strong>
          <p>已导入或创建的 NPC</p>
        </article>
        <article className="owner-overview-item">
          <span className="mini-label">Token 消耗</span>
          <strong>{ownerStats.tokens > 0 ? ownerStats.tokens.toLocaleString() : '—'}</strong>
          <p>来自已记录的 LLM 配置</p>
        </article>
      </section>

      <TokenUsagePanel
        tokenStats={tokenStats}
        onManageLlm={openLlmEdit}
      />

      <OwnerChatActivityPanel
        sessions={chatSessions}
        stats={chatStats}
        loading={chatLoading}
        error={chatError}
        onRefresh={fetchOwnerChatSessions}
        onOpenSession={openChatSessionDetail}
      />

      <OwnerChatSearchPanel
        taverns={myTaverns}
        selectedTavernId={chatSearchTavernId}
        query={chatSearchQuery}
        results={chatSearchResults}
        loading={chatSearchLoading}
        error={chatSearchError}
        status={chatSearchStatus}
        onSelectTavern={setChatSearchTavernId}
        onQueryChange={setChatSearchQuery}
        onSearch={runChatSearch}
        onOpenResult={openChatSearchResult}
        resolveSession={resolveChatSearchSession}
      />

      <OwnerVisitorStatePanel
        visitors={visitorStates}
        stats={visitorStats}
        loading={visitorLoading}
        error={visitorError}
        onRefresh={() => fetchOwnerVisitorStates(myTaverns)}
        onOpenVisitorSessions={openVisitorLatestSession}
      />

      <section className="owner-filters" aria-label="酒馆筛选">
        <label className="owner-search">
          <span className="mini-label">搜索酒馆</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="按名称、描述、场景或角色搜索"
          />
        </label>
        <label>
          <span className="mini-label">营业状态</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.id} value={filter.id}>{filter.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mini-label">访问权限</span>
          <select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}>
            {ACCESS_FILTERS.map((filter) => (
              <option key={filter.id} value={filter.id}>{filter.label}</option>
            ))}
          </select>
        </label>
        <div className="owner-filter-summary">
          <strong>{filteredTaverns.length}</strong>
          <span> / {myTaverns.length} 间可见</span>
          {hasActiveFilters ? (
            <button type="button" className="button-link" onClick={clearFilters}>清除筛选</button>
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="owner-loading panel">正在读取酒馆数据...</div>
      ) : error ? (
        <div className="owner-error panel">读取失败: {error}</div>
      ) : myTaverns.length === 0 ? (
        <div className="owner-empty panel">
          <div className="empty-icon">🏚️</div>
          <p>你还没有创建任何酒馆。现在就开始你的店主生涯吧！</p>
          <button className="button-link" onClick={() => setShowCreate(true)}>立即创建</button>
        </div>
      ) : filteredTaverns.length === 0 ? (
        <div className="owner-empty panel">
          <div className="empty-icon">🔎</div>
          <p>当前筛选没有匹配的酒馆。</p>
          <button className="button-link" onClick={clearFilters}>清除筛选</button>
        </div>
      ) : (
        <div className="owner-list">
          {filteredTaverns.map(tavern => (
            <TavernCard
              key={tavern.id}
              tavern={tavern}
              onEdit={() => handleEditTavern(tavern)}
              onToggleStatus={() => handleToggleStatus(tavern)}
              onManageLlm={() => openLlmEdit(tavern)}
              onManageCharacters={() => setCharacterManagerTavern(tavern)}
              onDelete={() => setDeleteTarget(tavern.id)}
            />
          ))}
        </div>
      )}

      {characterManagerTavern && (
        <CharacterManagementModal
          tavern={characterManagerTavern}
          ownerId={ownerId}
          onClose={() => setCharacterManagerTavern(null)}
          onCharactersChanged={(chars) => handleCharactersUpdated({ ...characterManagerTavern, characters: chars })}
        />
      )}

      {chatDetailSession && (
        <OwnerChatDetailModal
          session={chatDetailSession}
          messages={chatDetailMessages}
          loading={chatDetailLoading}
          error={chatDetailError}
          exportText={chatExportText}
          exportLoading={chatExportLoading}
          exportStatus={chatExportStatus}
          onClose={closeChatSessionDetail}
          onRefresh={refreshChatSessionDetail}
          onGenerateExport={generateChatExportText}
          onCopyExport={copyChatExportText}
        />
      )}

      {/* LLM Config Modal */}
      {editingLlmTavern && (
        <div className="modal-overlay" onClick={closeLlmEdit}>
          <div className="modal-content panel llm-modal" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>AI 配置 — {editingLlmTavern.name}</h3>
              <button className="close-btn" onClick={closeLlmEdit}>&times;</button>
            </header>
            <div className="llm-modal-body">
              <p className="form-hint" style={{ marginBottom: 12 }}>
                保存 API Key 后，酒馆将变为"营业中"状态，访客可以和 AI NPC 对话了。
              </p>
              <LLMConfigForm
                value={llmFormData || {}}
                onChange={(cfg) => { setLlmFormData(cfg); setLlmSaveResult(null) }}
                compact={false}
                tavernId={editingLlmTavern.id}
              />
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={closeLlmEdit}>取消</button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleSaveLlm}
                  disabled={savingLlm}
                >
                  {savingLlm ? '保存中...' : '保存 AI 配置'}
                </button>
              </div>
              {llmSaveResult && (
                <div className={`llm-save-result ${llmSaveResult.ok ? 'ok' : 'error'}`}>
                  {llmSaveResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content panel delete-modal" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>确认删除酒馆</h3>
              <button className="close-btn" onClick={() => setDeleteTarget(null)}>&times;</button>
            </header>
            <p className="delete-warning">
              删除酒馆将清除所有角色和对话记录。此操作不可恢复。
            </p>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setDeleteTarget(null)}>取消</button>
              <button type="button" className="btn-danger" onClick={() => handleDelete(deleteTarget)}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TokenUsagePanel({ tokenStats, onManageLlm }) {
  const rows = tokenStats.rows.slice(0, 8)
  const hasUsage = tokenStats.total > 0

  return (
    <section className="owner-token-panel panel" aria-label="Token 统计面板">
      <div className="owner-token-panel__header">
        <div>
          <p className="mini-label">Token 统计</p>
          <h2>LLM 使用量</h2>
          <p className="note muted">
            统计来自酒馆聊天链路记录的 token_used，用于店主观察模型消耗趋势。
          </p>
        </div>
        <div className="owner-token-total">
          <span>累计</span>
          <strong>{formatTokens(tokenStats.total)}</strong>
          <small>tokens</small>
        </div>
      </div>

      <div className="owner-token-summary">
        <div>
          <span className="mini-label">平均每馆</span>
          <strong>{formatTokens(tokenStats.average)}</strong>
        </div>
        <div>
          <span className="mini-label">已有消耗</span>
          <strong>{tokenStats.usedCount}</strong>
        </div>
        <div>
          <span className="mini-label">尚未消耗</span>
          <strong>{tokenStats.unusedCount}</strong>
        </div>
        <div>
          <span className="mini-label">最高消耗</span>
          <strong>{tokenStats.topTavernName || '—'}</strong>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="owner-token-empty">创建酒馆后，这里会显示每间酒馆的 LLM 使用量。</div>
      ) : (
        <div className="owner-token-list">
          {rows.map(({ tavern, tokens, backend, model }) => {
            const percent = tokenStats.topTokens ? Math.round((tokens / tokenStats.topTokens) * 100) : 0
            return (
              <article key={tavern.id} className="owner-token-row">
                <div className="owner-token-row__main">
                  <div>
                    <strong>{tavern.name}</strong>
                    <span>{backend} · {model}</span>
                  </div>
                  <div className="owner-token-row__usage">
                    <strong>{formatTokens(tokens)}</strong>
                    <small>{hasUsage ? `${percent}%` : '未使用'}</small>
                  </div>
                </div>
                <div className="owner-token-bar" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <div className="owner-token-row__footer">
                  <span>{tavern.status === 'open' ? '营业中' : '歇业中'}</span>
                  <button type="button" className="button-link" onClick={() => onManageLlm(tavern)}>
                    AI 配置
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function OwnerChatDetailModal({
  session,
  messages,
  loading,
  error,
  exportText,
  exportLoading,
  exportStatus,
  onClose,
  onRefresh,
  onGenerateExport,
  onCopyExport,
}) {
  const visitorLabel = getSessionVisitorLabel(session)
  const transcript = exportText || buildChatTranscript(session, messages)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content panel owner-chat-detail-modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header owner-chat-detail-header">
          <div>
            <p className="mini-label">会话详情</p>
            <h3>{visitorLabel} ↔ {session.character_name || '未知角色'}</h3>
            <p className="note muted">
              {session.tavern_name || '未知酒馆'} · {session.message_count || messages.length || 0} 条消息 · {formatChatTimestamp(session.updated_at)}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="owner-chat-detail-actions">
          <button type="button" className="secondary" onClick={onRefresh} disabled={loading}>
            {loading ? '刷新中...' : '刷新历史'}
          </button>
          <button type="button" className="secondary" onClick={onGenerateExport} disabled={exportLoading || loading}>
            {exportLoading ? '生成中...' : '生成导出文本'}
          </button>
          <button type="button" className="primary" onClick={onCopyExport} disabled={!transcript}>
            复制导出
          </button>
        </div>

        {error ? (
          <div className="owner-chat-detail-empty is-error">读取会话失败：{error}</div>
        ) : loading ? (
          <div className="owner-chat-detail-empty">正在读取完整聊天历史...</div>
        ) : messages.length === 0 ? (
          <div className="owner-chat-detail-empty">这条会话暂时没有可展示的消息。</div>
        ) : (
          <div className="owner-chat-detail-list">
            {messages.map((message, index) => {
              const role = message.role === 'assistant' ? 'assistant' : (message.role === 'system' ? 'system' : 'user')
              const speaker = getChatMessageSpeaker(message, session)
              return (
                <article key={message.id || `${role}-${index}`} className={`owner-chat-detail-message is-${role}`}>
                  <div className="owner-chat-detail-message__meta">
                    <strong>{speaker}</strong>
                    <time>{formatChatTimestamp(message.timestamp)}</time>
                  </div>
                  <p>{message.content}</p>
                </article>
              )
            })}
          </div>
        )}

        <label className="owner-chat-export">
          <span className="mini-label">导出预览</span>
          <textarea readOnly value={transcript} placeholder="点击“生成导出文本”，或直接复制当前历史预览。" rows={8} />
        </label>
        {exportStatus ? <p className="note muted owner-chat-export-status">{exportStatus}</p> : null}
      </div>
    </div>
  )
}

function OwnerChatActivityPanel({ sessions, stats, loading, error, onRefresh, onOpenSession }) {
  const rows = sessions.slice(0, 8)

  return (
    <section className="owner-chat-panel panel" aria-label="访客会话反馈">
      <div className="owner-chat-panel__header">
        <div>
          <p className="mini-label">访客反馈</p>
          <h2>最近对话会话</h2>
          <p className="note muted">
            来自酒馆聊天历史的会话摘要，帮助店主观察访客回访与 NPC 互动情况。
          </p>
        </div>
        <button type="button" className="secondary" onClick={onRefresh} disabled={loading}>
          {loading ? '刷新中...' : '刷新会话'}
        </button>
      </div>

      <div className="owner-chat-summary">
        <div>
          <span className="mini-label">会话数</span>
          <strong>{stats.sessions}</strong>
        </div>
        <div>
          <span className="mini-label">访客数</span>
          <strong>{stats.visitors}</strong>
        </div>
        <div>
          <span className="mini-label">消息数</span>
          <strong>{stats.messages}</strong>
        </div>
      </div>

      {error ? (
        <div className="owner-chat-empty is-error">读取会话失败：{error}</div>
      ) : loading ? (
        <div className="owner-chat-empty">正在读取访客会话...</div>
      ) : rows.length === 0 ? (
        <div className="owner-chat-empty">还没有访客对话。开放酒馆后，这里会显示最近的 NPC 互动。</div>
      ) : (
        <div className="owner-chat-list">
          {rows.map((session) => {
            const visitorLabel = session.visitor_name || (session.visitor_id ? session.visitor_id.slice(0, 16) : '匿名访客')
            const lastMessage = session.last_message || '暂无消息预览'
            return (
              <article
                key={`${session.tavern_id}-${session.visitor_id}-${session.character_id}`}
                className="owner-chat-row"
              >
                <div className="owner-chat-row__meta">
                  <div>
                    <strong>{visitorLabel}</strong>
                    <span>{session.tavern_name || '未知酒馆'} · {session.character_name || '未知角色'}</span>
                  </div>
                  <time>{formatChatTimestamp(session.updated_at)}</time>
                </div>
                <p>{session.last_role === 'assistant' ? 'NPC' : '访客'}：{lastMessage}</p>
                <div className="owner-chat-row__footer">
                  <span>{session.message_count || 0} 条消息</span>
                  <button type="button" className="button-link" onClick={() => onOpenSession?.(session)}>
                    查看历史
                  </button>
                  {session.visitor_id && !session.visitor_name ? (
                    <small>{session.visitor_id.slice(0, 18)}</small>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function OwnerChatSearchPanel({
  taverns,
  selectedTavernId,
  query,
  results,
  loading,
  error,
  status,
  onSelectTavern,
  onQueryChange,
  onSearch,
  onOpenResult,
  resolveSession,
}) {
  const hasTaverns = taverns.length > 0

  return (
    <section className="owner-chat-search-panel panel" aria-label="会话关键词搜索">
      <div className="owner-chat-search-panel__header">
        <div>
          <p className="mini-label">会话检索</p>
          <h2>搜索访客消息</h2>
          <p className="note muted">
            在单个酒馆的聊天历史中查找关键词，便于回看高价值反馈或问题线索。
          </p>
        </div>
      </div>

      <form className="owner-chat-search-form" onSubmit={onSearch}>
        <label>
          <span className="mini-label">酒馆</span>
          <select
            value={selectedTavernId}
            onChange={(event) => onSelectTavern(event.target.value)}
            disabled={!hasTaverns || loading}
          >
            {hasTaverns ? taverns.map((tavern) => (
              <option key={tavern.id} value={tavern.id}>{tavern.name || tavern.id}</option>
            )) : (
              <option value="">暂无酒馆</option>
            )}
          </select>
        </label>
        <label className="owner-chat-search-form__query">
          <span className="mini-label">关键词</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="例如：价格、BUG、喜欢的角色..."
            disabled={!hasTaverns || loading}
          />
        </label>
        <button type="submit" className="primary" disabled={!hasTaverns || loading}>
          {loading ? '搜索中...' : '搜索聊天'}
        </button>
      </form>

      {error ? <div className="owner-chat-search-status is-error">搜索失败：{error}</div> : null}
      {!error && status ? <div className="owner-chat-search-status">{status}</div> : null}

      {results.length > 0 ? (
        <div className="owner-chat-search-results">
          {results.map((result) => {
            const message = result.message || {}
            const session = resolveSession?.(message) || {}
            const visitorLabel = getSessionVisitorLabel(session)
            const speaker = getChatMessageSpeaker(message, session)
            return (
              <article
                key={`${message.tavern_id}-${message.visitor_id}-${message.character_id}-${result.index}`}
                className="owner-chat-search-result"
              >
                <div className="owner-chat-search-result__meta">
                  <div>
                    <strong>{speaker}</strong>
                    <span>{session.tavern_name || '未知酒馆'} · {visitorLabel} · {session.character_name || '未知角色'}</span>
                  </div>
                  <time>{formatChatTimestamp(message.timestamp)}</time>
                </div>
                <p>{message.content || '空消息'}</p>
                <div className="owner-chat-search-result__footer">
                  <span>匹配序号 #{Number(result.index || 0) + 1}</span>
                  <button type="button" className="button-link" onClick={() => onOpenResult?.(result)}>
                    打开会话
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

function OwnerVisitorStatePanel({ visitors, stats, loading, error, onRefresh, onOpenVisitorSessions }) {
  const rows = visitors.slice(0, 8)

  return (
    <section className="owner-visitor-panel panel" aria-label="访客回访状态">
      <div className="owner-visitor-panel__header">
        <div>
          <p className="mini-label">回访状态</p>
          <h2>访客关系与回访</h2>
          <p className="note muted">
            来自入场记录和聊天写回的 VisitorState，用来观察哪些访客正在形成持续关系。
          </p>
        </div>
        <button type="button" className="secondary" onClick={onRefresh} disabled={loading}>
          {loading ? '刷新中...' : '刷新访客'}
        </button>
      </div>

      <div className="owner-visitor-summary">
        <div>
          <span className="mini-label">访客</span>
          <strong>{stats.visitors}</strong>
        </div>
        <div>
          <span className="mini-label">访问</span>
          <strong>{stats.visits}</strong>
        </div>
        <div>
          <span className="mini-label">回访者</span>
          <strong>{stats.returningVisitors}</strong>
        </div>
        <div>
          <span className="mini-label">已对话</span>
          <strong>{stats.engagedVisitors}</strong>
        </div>
      </div>

      {error ? (
        <div className="owner-visitor-empty is-error">读取访客状态失败：{error}</div>
      ) : loading ? (
        <div className="owner-visitor-empty">正在读取访客状态...</div>
      ) : rows.length === 0 ? (
        <div className="owner-visitor-empty">还没有可展示的访客状态。访客进入酒馆后，这里会开始记录回访。</div>
      ) : (
        <div className="owner-visitor-list">
          {rows.map((visitor) => {
            const rel = visitor.relationship || {}
            const strength = Number(rel.strength || 0)
            const percent = Math.max(0, Math.min(100, Math.round(strength * 100)))
            const visitorLabel = visitor.visitor_name || (visitor.visitor_id ? visitor.visitor_id.slice(0, 16) : '匿名访客')
            return (
              <article
                key={`${visitor.tavern_id}-${visitor.visitor_id}`}
                className="owner-visitor-row"
              >
                <div className="owner-visitor-row__main">
                  <div>
                    <strong>{visitorLabel}</strong>
                    <span>{visitor.tavern_name || '未知酒馆'} · {formatRelationshipStage(rel.stage)}</span>
                  </div>
                  <div className="owner-visitor-row__visits">
                    <strong>{visitor.visit_count || 0}</strong>
                    <small>次访问</small>
                  </div>
                </div>
                <div className="owner-visitor-bar" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <div className="owner-visitor-row__footer">
                  <span>{visitor.message_count || 0} 条消息</span>
                  {Number(visitor.message_count || 0) > 0 ? (
                    <button type="button" className="button-link" onClick={() => onOpenVisitorSessions?.(visitor)}>
                      查看会话
                    </button>
                  ) : null}
                  <time>{formatChatTimestamp(visitor.last_visit)}</time>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function TavernCard({ tavern, onEdit, onToggleStatus, onManageLlm, onManageCharacters, onDelete }) {
  const isOpen = tavern.status === 'open'
  const tokenUsed = getTavernTokenUsage(tavern)
  const statusColor = getTavernStatusColor(tavern?.status)
  const charCount = tavern?.characters?.length || 0

  return (
    <div className={`tavern-card panel ${!isOpen ? 'is-closed' : ''}`}>
      <div className="tavern-card__header">
        <div className="tavern-card__info">
          <h3>
            {getTavernAccessIcon(tavern.access)} {tavern.name}
          </h3>
          <p className="note muted">{tavern.description || '无描述'}</p>
        </div>
        <div className="status-badge-row">
          <span className={`status-badge ${tavern.status}`} style={{ borderColor: `${statusColor}55` }}>
            <span className={`dot ${isOpen ? 'ok' : ''}`}></span>
            {getTavernStatusLabel(tavern.status)}
          </span>
          <span className="char-count-badge">{charCount} 角色</span>
        </div>
      </div>

      <div className="tavern-card__metrics">
        <div className="owner-metric">
          <span className="mini-label">Token 消耗</span>
          <strong>{tokenUsed > 0 ? `${formatTokens(tokenUsed)} tokens` : '—'}</strong>
        </div>
        <div className="owner-metric">
          <span className="mini-label">访问权限</span>
          <strong>{getTavernAccessIcon(tavern.access)} {getTavernAccessLabel(tavern.access)}</strong>
        </div>
        <div className="owner-metric">
          <span className="mini-label">坐标</span>
          <strong>{formatCoordinate(tavern.lat)}, {formatCoordinate(tavern.lon)}</strong>
        </div>
      </div>

      <div className="tavern-card__actions">
        <button className="secondary" onClick={onManageLlm}>AI 配置</button>
        <button className="secondary" onClick={onManageCharacters}>角色</button>
        <button className="secondary" onClick={onEdit}>编辑</button>
        <button className={isOpen ? 'secondary' : ''} onClick={onToggleStatus}>
          {isOpen ? '歇业' : '开放'}
        </button>
        <button className="btn-danger-ghost" onClick={onDelete}>删除</button>
      </div>
    </div>
  )
}

function TavernEditModal({ tavern, onSave, onClose }) {
  const [form, setForm] = useState({
    name: tavern.name,
    description: tavern.description,
    access: tavern.access,
    scene_prompt: tavern.scene_prompt,
    llm_config: tavern.llm_config || {},
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content panel edit-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3>编辑酒馆: {tavern.name}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-main">
              <div className="form-group">
                <label>酒馆名称</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                />
              </div>
              <div className="form-group">
                <label>酒馆描述</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>访问权限</label>
                <select
                  value={form.access}
                  onChange={e => setForm(f => ({...f, access: e.target.value}))}
                >
                  <option value="public">公开 — 任何人都能进入</option>
                  <option value="password">密码 — 需要密码才能进入</option>
                  <option value="private">私人 — 仅自己可用</option>
                </select>
              </div>
              <div className="form-group">
                <label>场景设定 (AI Prompt)</label>
                <textarea
                  value={form.scene_prompt}
                  onChange={e => setForm(f => ({...f, scene_prompt: e.target.value}))}
                  rows={4}
                  placeholder="描述酒馆的环境、气氛，帮助 AI 更好入戏"
                />
              </div>
            </div>

            <div className="form-side">
              <div className="form-group">
                <label>AI 配置</label>
                <LLMConfigForm
                  value={form.llm_config}
                  onChange={cfg => setForm(f => ({...f, llm_config: cfg}))}
                  compact={true}
                  tavernId={tavern.id}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>取消</button>
            <button type="submit" className="primary">保存修改</button>
          </div>
        </form>
      </div>
    </div>
  )
}
