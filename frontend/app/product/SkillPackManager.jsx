import { useEffect, useMemo, useState } from 'react'
import { listSkillPacks, saveSkillPacks } from '../lib/taverns'

const LOCAL_RUMOR_ID = 'local-rumor'

function settingFor(settings, packId) {
  return settings.find((item) => item?.id === packId) || { id: packId, enabled: false, config: {} }
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 3
  return Math.max(1, Math.min(5, parsed))
}

export default function SkillPackManager({ tavern, ownerId = '', onClose, onUpdated }) {
  const [availablePacks, setAvailablePacks] = useState([])
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const tavernId = tavern?.id || ''

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!tavernId) return
      setLoading(true)
      setError('')
      try {
        const result = await listSkillPacks(tavernId, ownerId)
        if (cancelled) return
        setAvailablePacks(Array.isArray(result?.available_packs) ? result.available_packs : [])
        setSettings(Array.isArray(result?.skill_packs) ? result.skill_packs : [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err || '读取技能包失败'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tavernId, ownerId])

  const mergedSettings = useMemo(() => {
    return availablePacks.map((pack) => settingFor(settings, pack.id))
  }, [availablePacks, settings])

  function updatePack(packId, patch) {
    setSettings((prev) => {
      const current = settingFor(prev, packId)
      const next = { ...current, ...patch, config: { ...(current.config || {}), ...(patch.config || {}) } }
      const without = prev.filter((item) => item?.id !== packId)
      return [...without, next]
    })
  }

  async function handleSave() {
    if (!tavernId) return
    setSaving(true)
    setError('')
    setStatus('')
    try {
      const payload = mergedSettings.map((item) => ({
        id: item.id,
        enabled: Boolean(item.enabled),
        config: { limit: normalizeLimit(item.config?.limit) },
      }))
      const result = await saveSkillPacks(tavernId, payload, ownerId)
      setSettings(Array.isArray(result?.skill_packs) ? result.skill_packs : payload)
      setStatus('技能包设置已保存。')
      onUpdated?.({ ...(tavern || {}), skill_packs: result?.skill_packs || payload })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err || '保存技能包失败'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal skill-pack-manager">
        <div className="modal-header">
          <div>
            <p className="mini-label">Tavern Skill Packs</p>
            <h2>技能包 · {tavern?.name || '未命名酒馆'}</h2>
            <p className="note muted">技能包只打开明确能力；不会写入正史、不会改角色卡、不会绕过店主设置。</p>
          </div>
          <button className="close-btn" type="button" onClick={onClose}>&times;</button>
        </div>

        {loading && <p className="note muted">正在读取技能包...</p>}
        {error && <p className="form-error">{error}</p>}
        {status && <p className="form-success">{status}</p>}

        {!loading && (
          <div className="skill-pack-list">
            {availablePacks.map((pack) => {
              const setting = settingFor(settings, pack.id)
              const enabled = Boolean(setting.enabled)
              const limit = normalizeLimit(setting.config?.limit)
              return (
                <section key={pack.id} className={`skill-pack-card ${enabled ? 'is-enabled' : ''}`}>
                  <div className="skill-pack-card__header">
                    <div>
                      <p className="mini-label">{pack.id === LOCAL_RUMOR_ID ? '环境传闻' : pack.category || '能力'}</p>
                      <h3>{pack.label || pack.id}</h3>
                      <p className="note muted">{pack.description}</p>
                    </div>
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(event) => updatePack(pack.id, { enabled: event.target.checked })}
                      />
                      <span>{enabled ? '已启用' : '未启用'}</span>
                    </label>
                  </div>

                  <div className="skill-pack-grid">
                    <div>
                      <strong>允许做什么</strong>
                      <ul>
                        {(pack.capabilities || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <strong>边界说明</strong>
                      <ul>
                        {(pack.prompt_notes || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>

                  {pack.id === LOCAL_RUMOR_ID && (
                    <label className="field compact-field">
                      <span>每轮最多参考传闻数</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={limit}
                        onChange={(event) => updatePack(pack.id, { config: { limit: normalizeLimit(event.target.value) } })}
                      />
                      <small>仅引用已有邻里传闻；没有传闻时 NPC 会明确不编造。</small>
                    </label>
                  )}
                </section>
              )
            })}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>关闭</button>
          <button type="button" className="primary" onClick={handleSave} disabled={loading || saving}>
            {saving ? '保存中...' : '保存技能包'}
          </button>
        </div>
      </div>
    </div>
  )
}
