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
      fetchMyTaverns()
    }
  }, [showCreate, editingTavern])

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

  async function handleToggleStatus(tavern) {
    const newStatus = tavern.status === 'open' ? 'closed' : 'open'
    try {
      await tavernService.updateTavern(tavern.id, { status: newStatus })
      setMyTaverns(prev => prev.map(t => t.id === tavern.id ? { ...t, status: newStatus } : t))
    } catch (err) {
      alert(`更新失败: ${err.message}`)
    }
  }

  async function handleSaveEdit(updatedData) {
    try {
      const result = await tavernService.updateTavern(editingTavern.id, updatedData)
      setMyTaverns(prev => prev.map(t => t.id === editingTavern.id ? { ...t, ...result } : t))
      setEditingTavern(null)
      if (onTavernCreated) onTavernCreated(result)
    } catch (err) {
      alert(`保存失败: ${err.message}`)
    }
  }

  async function handleDelete(tavernId) {
    try {
      await tavernService.deleteTavern(tavernId)
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
      const result = await tavernService.updateTavern(editingLlmTavern.id, { llm_config: llmFormData })
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
          <button className="secondary" onClick={fetchMyTaverns} disabled={loading}>
            {loading ? '刷新中...' : '刷新列表'}
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
