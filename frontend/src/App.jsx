import { useEffect, useMemo, useState } from 'react'
import WorldMap from './WorldMap'

function getDefaultApiBase() {
  const envBase = import.meta.env.VITE_API_BASE?.trim()
  if (envBase) {
    return envBase.replace(/\/$/, '')
  }
  return ''
}

function createApiClient(getBaseUrl) {
  async function readJson(response) {
    const raw = await response.text()
    let payload = {}

    if (raw) {
      try {
        payload = JSON.parse(raw)
      } catch {
        const snippet = raw.trim().slice(0, 80)
        if (snippet.startsWith('<')) {
          throw new Error(`API returned HTML instead of JSON. The frontend is likely talking to the Vite shell, not FastAPI. (${response.url})`)
        }
        throw new Error(`API returned invalid JSON (${response.status}): ${snippet}`)
      }
    }

    if (!response.ok) {
      throw new Error(payload.error || payload.detail || `HTTP ${response.status}`)
    }
    return payload
  }

  return {
    async getHealth() {
      const response = await fetch(`${getBaseUrl()}/api/health`, { cache: 'no-store' })
      return readJson(response)
    },
    async getMeta() {
      const response = await fetch(`${getBaseUrl()}/api/meta`, { cache: 'no-store' })
      return readJson(response)
    },
    async createNearbyPreview(form) {
      const response = await fetch(`${getBaseUrl()}/api/nearby`, {
        method: 'POST',
        body: new URLSearchParams(form),
      })
      return readJson(response)
    },
    async submitWorldEvent(event) {
      const response = await fetch(`${getBaseUrl()}/api/world/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
      return readJson(response)
    },
  }
}

const LOCATION_PRESETS = [
  {
    id: 'shibuya-crossing',
    title: '涩谷十字路口',
    subtitle: '高密度都市神话入口',
    lat: '35.6595',
    lon: '139.7005',
    radius: '320',
    mode: 'live',
  },
  {
    id: 'tokyo-tower',
    title: '东京塔周边',
    subtitle: '纪念碑 / 观景台 / 夜色氛围',
    lat: '35.6586',
    lon: '139.7454',
    radius: '360',
    mode: 'live',
  },
  {
    id: 'fixture-demo',
    title: '演示样例世界',
    subtitle: '离线可用，适合先确认流程',
    lat: '35.6580',
    lon: '139.7016',
    radius: '300',
    mode: 'fixture',
  },
]

const initialForm = {
  lat: '35.6580',
  lon: '139.7016',
  radius: '300',
  mode: 'fixture',
  seed: '',
}

const initialWritebackForm = {
  playerId: 'player_local',
  eventType: 'observe',
  visibility: 'private',
  targetType: 'poi',
  targetId: 'poi_clocktower_01',
  sliceId: 'slice_demo_shibuya',
  zoneId: 'zone_shibuya_core',
  intensity: '1',
  tag: 'safe',
  note: '',
}

const LAST_WORLD_STORAGE_KEY = 'fablemap:last-world-session'

function isPersistedResultUsable(result) {
  return Boolean(result && typeof result === 'object' && result.preview_url)
}

function loadPersistedWorldSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(LAST_WORLD_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const payload = JSON.parse(raw)
    if (!payload || typeof payload !== 'object') {
      return null
    }

    const restoredResult = payload.result && typeof payload.result === 'object' ? payload.result : null

    return {
      form: payload.form && typeof payload.form === 'object' ? { ...initialForm, ...payload.form } : null,
      result: isPersistedResultUsable(restoredResult) ? restoredResult : null,
      originLabel: typeof payload.originLabel === 'string' ? payload.originLabel : '',
      originHint: typeof payload.originHint === 'string' ? payload.originHint : '',
      lastUpdatedAt: typeof payload.lastUpdatedAt === 'string' ? payload.lastUpdatedAt : '',
    }
  } catch {
    return null
  }
}

function persistWorldSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      LAST_WORLD_STORAGE_KEY,
      JSON.stringify({
        ...session,
        result: isPersistedResultUsable(session?.result) ? session.result : null,
        lastUpdatedAt: new Date().toISOString(),
      })
    )
  } catch {
  }
}

function formatCoordinates(lat, lon) {
  const latNumber = Number(lat)
  const lonNumber = Number(lon)
  if (!Number.isFinite(latNumber) || !Number.isFinite(lonNumber)) {
    return '坐标未设置'
  }
  return `${latNumber.toFixed(4)}, ${lonNumber.toFixed(4)}`
}

function pickPresetMeta(form) {
  return LOCATION_PRESETS.find(
    (preset) =>
      preset.lat === form.lat &&
      preset.lon === form.lon &&
      preset.radius === form.radius &&
      preset.mode === form.mode
  )
}

function buildSliceHighlights(result) {
  if (!result) {
    return []
  }

  return [
    result.region_theme ? `这片区域当前被“${result.region_theme}”主导。` : '世界主题仍在等待生成。',
    result.dominant_faction ? `主导势力是 ${result.dominant_faction}。` : '主导势力尚未显形。',
    result.poi_count
      ? `附近浮现 ${result.poi_count} 个可观察节点，可直接点入。`
      : '这次切片还没有稳定的观察节点。',
  ]
}

function buildWorldAtmosphere(result) {
  if (!result) {
    return '先选择一个入口，世界才会开始组织自己的语气。'
  }

  const sourceText = result.provider || 'unknown source'
  const cacheText = result.cache_status || 'fresh'
  return `现实骨架来自 ${sourceText}，当前缓存状态为 ${cacheText}。你现在看到的不是表单结果，而是一段可进入的局部世界。`
}

export default function App() {
  const restoredSession = useMemo(loadPersistedWorldSession, [])
  const [apiBase, setApiBase] = useState(getDefaultApiBase)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusOk, setStatusOk] = useState(false)
  const [statusText, setStatusText] = useState('等待连接 FastAPI...')
  const [statusDetail, setStatusDetail] = useState('')
  const [result, setResult] = useState(restoredSession?.result || null)
  const [errorText, setErrorText] = useState('')
  const [form, setForm] = useState(restoredSession?.form || initialForm)
  const [originLabel, setOriginLabel] = useState(restoredSession?.originLabel || '演示样例世界')
  const [originHint, setOriginHint] = useState(restoredSession?.originHint || '先用预设入口确认世界生成链路，再切到实时地图。')
  const [lastSessionAt] = useState(restoredSession?.lastUpdatedAt || '')
  const [locating, setLocating] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(restoredSession?.result))
  const [writebackForm, setWritebackForm] = useState(initialWritebackForm)
  const [writebackSubmitting, setWritebackSubmitting] = useState(false)
  const [writebackResult, setWritebackResult] = useState(null)
  const [writebackError, setWritebackError] = useState('')
  const [adminOpen, setAdminOpen] = useState(false)
  const [activePoiId, setActivePoiId] = useState(null)
  const [activePoi, setActivePoi] = useState(null)
  const [familiarityMap, setFamiliarityMap] = useState({})

  const api = useMemo(() => createApiClient(() => apiBase.replace(/\/$/, '')), [apiBase])
  const presetMeta = pickPresetMeta(form)
  const previewUrl = result?.preview_url || ''
  const recentEchoes = writebackResult?.place_state?.recent_echoes || []
  const recentMarks = writebackResult?.place_state?.marks || []
  const playerState = writebackResult?.player_state || null
  const feedback = writebackResult?.world_feedback || null
  const sliceHighlights = buildSliceHighlights(result)
  const worldAtmosphere = buildWorldAtmosphere(result)

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateWritebackForm(key, value) {
    setWritebackForm((current) => ({ ...current, [key]: value }))
  }

  function applyOrigin(nextForm, nextLabel, nextHint) {
    setForm((current) => ({ ...current, ...nextForm }))
    setOriginLabel(nextLabel)
    setOriginHint(nextHint)
  }

  function applyMeta(meta) {
    if (!meta) {
      return
    }
    const coords = meta.default_coordinates || {}
    setForm((current) => {
      if (restoredSession?.form) {
        return current
      }
      return {
        ...current,
        lat: typeof coords.lat === 'number' ? String(coords.lat) : current.lat,
        lon: typeof coords.lon === 'number' ? String(coords.lon) : current.lon,
        radius: typeof coords.radius === 'number' ? String(coords.radius) : current.radius,
        mode: meta.default_mode || current.mode,
      }
    })
  }

  async function checkBackend() {
    setChecking(true)
    setStatusOk(false)
    setStatusText('正在检查 FastAPI 服务...')
    setStatusDetail('')
    try {
      const [health, meta] = await Promise.all([api.getHealth(), api.getMeta()])
      applyMeta(meta)
      setStatusOk(true)
      setStatusText(`FastAPI 已连接 · ${meta.project || 'FableMap'}`)
      setStatusDetail(
        `api=${meta.api_base || apiBase} · frontend_mode=${meta.frontend_mode} · fixture_available=${health.fixture_available}`
      )
    } catch (error) {
      setStatusOk(false)
      setStatusText('FastAPI 不可用')
      setStatusDetail(error.message || String(error))
    } finally {
      setChecking(false)
    }
  }

  function usePreset(preset) {
    applyOrigin(
      {
        lat: preset.lat,
        lon: preset.lon,
        radius: preset.radius,
        mode: preset.mode,
      },
      preset.title,
      preset.subtitle
    )
    setErrorText('')
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setErrorText('当前浏览器不支持定位，可先使用预设入口或手动填写高级坐标。')
      return
    }

    setLocating(true)
    setErrorText('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyOrigin(
          {
            lat: position.coords.latitude.toFixed(6),
            lon: position.coords.longitude.toFixed(6),
            radius: form.radius || '300',
            mode: 'live',
          },
          '我的当前位置',
          '已抓取浏览器定位，可直接生成你附近的世界切片。'
        )
        setAdvancedOpen(true)
        setLocating(false)
      },
      (error) => {
        setLocating(false)
        setErrorText(`定位失败：${error.message || '浏览器拒绝了位置权限。'}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  async function submitNearby(refresh) {
    setSubmitting(true)
    setErrorText(refresh ? '正在刷新附近世界...' : '正在生成附近世界...')
    try {
      const payload = await api.createNearbyPreview({
        lat: form.lat,
        lon: form.lon,
        radius: form.radius,
        mode: form.mode,
        seed: form.seed,
        refresh: refresh ? 'true' : 'false',
      })
      setResult(payload)
      setAdvancedOpen(true)
      setActivePoiId(null)
      setActivePoi(null)
      setFamiliarityMap({})
      setErrorText('')
      setWritebackForm((current) => ({
        ...current,
        sliceId: payload.world_id || current.sliceId,
        targetId: payload.primary_poi_id || current.targetId,
        zoneId: payload.primary_zone_id || current.zoneId,
      }))
    } catch (error) {
      setErrorText(`生成失败：${error.message || String(error)}`)
    } finally {
      setSubmitting(false)
    }
  }

  function handlePoiClick(poiId, poi) {
    setActivePoiId(poiId)
    setActivePoi(poi)
    setWritebackForm((current) => ({
      ...current,
      targetId: poi?.id || current.targetId,
      targetType: 'poi',
    }))
  }

  async function submitWriteback() {
    setWritebackSubmitting(true)
    setWritebackError('')
    setWritebackResult(null)

    const event = {
      event_type: writebackForm.eventType,
      player_id: writebackForm.playerId,
      visibility: writebackForm.visibility,
      target: {
        target_type: writebackForm.targetType,
        target_id: writebackForm.targetId,
        slice_id: writebackForm.sliceId,
      },
      payload:
        writebackForm.eventType === 'mark'
          ? {
              tag: writebackForm.tag,
              note: writebackForm.note,
            }
          : writebackForm.eventType === 'observe'
            ? {
                intensity: Number(writebackForm.intensity || '1'),
                note: writebackForm.note,
              }
            : {
                zone_id: writebackForm.zoneId,
                note: writebackForm.note,
              },
      source: {
        client: 'web',
        surface: 'react_writeback_panel',
        version: 'v0.1',
      },
      context: {
        current_zone_id: writebackForm.zoneId,
        nearest_poi_id: writebackForm.targetId,
      },
    }

    try {
      const payload = await api.submitWorldEvent(event)
      setWritebackResult(payload)
      const poiFam = payload?.player_state?.poi_familiarity || {}
      if (Object.keys(poiFam).length > 0) {
        setFamiliarityMap((current) => ({ ...current, ...poiFam }))
      }
    } catch (error) {
      setWritebackError(`写回失败：${error.message || String(error)}`)
    } finally {
      setWritebackSubmitting(false)
    }
  }

  useEffect(() => {
    checkBackend()
  }, [])

  useEffect(() => {
    persistWorldSession({
      form,
      result,
      originLabel,
      originHint,
    })
  }, [form, result, originLabel, originHint])

  return (
    <div className="wrap app-shell">
      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Player-facing world explorer</p>
          <h1>FableMap 世界入口</h1>
          <p>
            不再把玩家扔进经纬度表单里。先选一个入口，再生成附近世界，随后直接进入可点击的地图切片。
          </p>
          <div className="hero-metrics">
            <div className="hero-metric-card">
              <span className="hero-metric-label">当前入口</span>
              <strong>{originLabel}</strong>
              <span>{originHint}</span>
            </div>
            <div className="hero-metric-card">
              <span className="hero-metric-label">坐标骨架</span>
              <strong>{formatCoordinates(form.lat, form.lon)}</strong>
              <span>{form.radius}m · {form.mode === 'fixture' ? '离线样例' : '实时地图'}</span>
            </div>
          </div>
        </div>
        <div className="hero-status-card">
          <p className="mini-label">服务状态</p>
          <p className="status compact-status">
            <span className={`dot${statusOk ? ' ok' : ''}`}></span>
            <span>{statusText}</span>
          </p>
          <p className="note muted">
            {statusDetail || '将自动检查当前 FastAPI 服务状态。开发模式下默认尝试连接 8950 端口。'}
          </p>
          <div className="hero-actions">
            <button type="button" className="secondary" disabled={checking} onClick={checkBackend}>
              {checking ? 'Checking...' : '重新检查服务'}
            </button>
            {previewUrl ? (
              <a className="button-link" href={previewUrl} target="_blank" rel="noreferrer">
                打开当前预览
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid main-grid">
        <section className="panel primary-panel">
          <div className="section-heading">
            <div>
              <p className="mini-label">Step 1</p>
              <h2>选择入口并生成世界</h2>
            </div>
            <p className="note muted">
              优先用人类能理解的入口，再把坐标与种子折叠为高级选项。
              {lastSessionAt ? ` 已恢复上次记录：${new Date(lastSessionAt).toLocaleString()}` : ''}
            </p>
          </div>

          <div className="origin-card">
            <div className="origin-card-copy">
              <strong>{originLabel}</strong>
              <p className="note muted">{originHint}</p>
            </div>
            <div className="origin-card-meta">
              <span>{formatCoordinates(form.lat, form.lon)}</span>
              <span>{form.radius}m 半径</span>
            </div>
          </div>

          <div className="preset-grid">
            {LOCATION_PRESETS.map((preset) => {
              const active = preset.id === presetMeta?.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-card${active ? ' active' : ''}`}
                  onClick={() => usePreset(preset)}
                >
                  <span className="preset-title">{preset.title}</span>
                  <span className="preset-subtitle">{preset.subtitle}</span>
                  <span className="preset-meta">{preset.mode === 'fixture' ? '离线稳定' : '实时地图'} · {preset.radius}m</span>
                </button>
              )
            })}
          </div>

          <div className="actions origin-actions">
            <button type="button" className="secondary" disabled={locating} onClick={useCurrentLocation}>
              {locating ? '定位中...' : '用我的当前位置'}
            </button>
            <button type="button" disabled={submitting} onClick={() => submitNearby(false)}>
              {submitting ? '生成中...' : '生成世界预览'}
            </button>
            <button type="button" className="secondary" disabled={submitting} onClick={() => submitNearby(true)}>
              刷新实时地图
            </button>
          </div>

          <button
            type="button"
            className="ghost-toggle"
            onClick={() => setAdvancedOpen((current) => !current)}
          >
            {advancedOpen ? '收起高级参数' : '展开高级参数'}
          </button>

          {advancedOpen ? (
            <div className="advanced-panel">
              <div className="row">
                <div>
                  <label htmlFor="lat">Latitude</label>
                  <input id="lat" type="number" step="0.000001" value={form.lat} onChange={(event) => updateForm('lat', event.target.value)} />
                </div>
                <div>
                  <label htmlFor="lon">Longitude</label>
                  <input id="lon" type="number" step="0.000001" value={form.lon} onChange={(event) => updateForm('lon', event.target.value)} />
                </div>
                <div>
                  <label htmlFor="radius">Radius (m)</label>
                  <input id="radius" type="number" min="1" step="1" value={form.radius} onChange={(event) => updateForm('radius', event.target.value)} />
                </div>
              </div>

              <div className="row-2">
                <div>
                  <label htmlFor="mode">World source</label>
                  <select id="mode" value={form.mode} onChange={(event) => updateForm('mode', event.target.value)}>
                    <option value="live">Live OSM</option>
                    <option value="fixture">Fixture demo</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="seed">Seed</label>
                  <input id="seed" type="text" placeholder="optional stable seed" value={form.seed} onChange={(event) => updateForm('seed', event.target.value)} />
                </div>
              </div>
            </div>
          ) : null}

          {errorText ? <p className="note error-note">{errorText}</p> : null}
        </section>

        <section className="panel secondary-panel">
          <div className="section-heading">
            <div>
              <p className="mini-label">Step 2</p>
              <h2>当前切片结果</h2>
            </div>
            <p className="note muted">生成成功后，这里先给出世界摘要，再进入地图和文字观察窗。</p>
          </div>

          {result ? (
            <div className="result-stack">
              <div className="result-card emphasis-card story-card">
                <p className="mini-label">World snapshot</p>
                <h3 className="story-card-title">{result.region_theme || '未命名切片'}</h3>
                <p className="note story-card-copy">{worldAtmosphere}</p>
                <div className="story-chip-row">
                  <span>Faction · {result.dominant_faction || '-'}</span>
                  <span>POI · {result.poi_count ?? '-'}</span>
                  <span>Roads · {result.road_count ?? '-'}</span>
                  <span>Landmarks · {result.landmark_count ?? '-'}</span>
                </div>
              </div>

              <div className="result-grid">
                <div className="result-card">
                  <p className="mini-label">你将进入什么</p>
                  <div className="story-bullets">
                    {sliceHighlights.map((item) => (
                      <div key={item} className="story-bullet">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="result-card">
                  <p className="mini-label">下一步</p>
                  <div className="story-bullets">
                    <div className="story-bullet">先打开下方地图，悬停节点查看地点名字与讽刺钩子。</div>
                    <div className="story-bullet">点击一个节点，页面会把它提升为当前观察目标。</div>
                    <div className="story-bullet">如果要看更完整的文本世界，再打开文字预览。</div>
                  </div>
                </div>
              </div>

              <div className="link-row action-links">
                <a className="button-link" href={result.preview_url} target="_blank" rel="noreferrer">打开预览</a>
                <a href={result.world_url} target="_blank" rel="noreferrer">world.json</a>
                <a href={result.manifest_url} target="_blank" rel="noreferrer">manifest.json</a>
              </div>
            </div>
          ) : (
            <div className="empty-state story-empty-state">
              <div>
                <p className="empty-title">还没有打开任何世界切片</p>
                <p className="note muted">先选一个入口：可以用预设地点，也可以直接用浏览器定位。</p>
                <div className="empty-chips">
                  <span>{statusOk ? '服务已就绪' : '先确认服务'}</span>
                  <span>推荐先试演示样例世界</span>
                  <span>生成后可直接点地图节点</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="panel preview-panel player-preview-panel storyboard-panel">
        <div className="section-heading storyboard-heading">
          <div>
            <p className="mini-label">Step 3</p>
            <h2>进入 2D 世界地图</h2>
          </div>
          <div className="storyboard-heading-copy">
            <p className="note muted">这里不再是平面预览区，而是你附近切片被转译成 2D 游戏世界地图的主舞台。</p>
          </div>
        </div>

        <div className="storyboard-shell">
          <div className="storyboard-shell-top">
            <div className="storyboard-category">
              <span className="storyboard-category-label">World biome</span>
              <div className="storyboard-chip-row">
                <span className={`storyboard-chip${result ? '' : ' storyboard-chip--empty'}`}>
                  {result ? '切片已就绪' : '待生成'}
                </span>
                <span className="storyboard-chip">{result?.world?.region?.vibe_profile || 'quiet_rain'}</span>
                <span className="storyboard-chip">{result?.dominant_faction || '未显形势力'}</span>
                <span className="storyboard-chip">{result?.region_theme || '未命名切片'}</span>
              </div>
            </div>
            <div className="storyboard-category">
              <span className="storyboard-category-label">Adventure setup</span>
              <div className="storyboard-chip-row">
                <span className="storyboard-chip">{originLabel}</span>
                <span className="storyboard-chip">{form.radius}m 半径</span>
                <span className="storyboard-chip">{result?.landmark_count ?? 0} 个地标</span>
              </div>
            </div>
          </div>

          <div className="storyboard-map-frame">
            <WorldMap
              world={result?.world}
              onPoiClick={handlePoiClick}
              activePoiId={activePoiId}
              familiarityMap={familiarityMap}
              originLabel={originLabel}
            />
          </div>

          <div className="storyboard-shell-bottom">
            <div className="storyboard-lane">
              <div className="storyboard-lane-header">
                <span className="storyboard-category-label">探索引导</span>
                <span className="storyboard-lane-meta">按 2D 世界地图的方式进入，而不是读表单</span>
              </div>
              <div className="shared-task-grid">
                <article className={`shared-task-card shared-task-card--gen${result ? ' is-done' : submitting ? ' is-loading' : ''}`}>
                  <span className="shared-task-index">00</span>
                  <div className="shared-task-gen-body">
                    <h3>{result ? result.region_theme || '世界已生成' : '生成当前切片'}</h3>
                    <p className="shared-task-gen-meta">
                      {result
                        ? `${result.poi_count ?? 0} 个节点 · ${result.road_count ?? 0} 条路径 · ${result.dominant_faction || '未知势力'}`
                        : `${originLabel} · ${form.radius}m · ${form.mode === 'fixture' ? '离线样例' : '实时地图'}`
                      }
                    </p>
                    {!result ? (
                      <div className="shared-task-gen-actions">
                        <button
                          type="button"
                          className="shared-task-gen-btn"
                          disabled={submitting}
                          onClick={() => submitNearby(false)}
                        >
                          {submitting ? '生成中...' : '生成世界'}
                        </button>
                        <button
                          type="button"
                          className="shared-task-gen-btn secondary"
                          disabled={submitting}
                          onClick={() => submitNearby(true)}
                        >
                          刷新
                        </button>
                      </div>
                    ) : (
                      <div className="shared-task-gen-actions">
                        <button
                          type="button"
                          className="shared-task-gen-btn secondary"
                          disabled={submitting}
                          onClick={() => submitNearby(true)}
                        >
                          {submitting ? '刷新中...' : '重新生成'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
                <article className={`shared-task-card${activePoi ? ' is-active' : ''}`}>
                  <span className="shared-task-index">01</span>
                  <div>
                    <h3>选一个据点</h3>
                    <p>{activePoi ? `${activePoi.fantasy_name} 已成为当前主据点。` : '先在地图上点击一个节点，把它变成你这次进入世界的主据点。'}</p>
                  </div>
                </article>
                <article className="shared-task-card">
                  <span className="shared-task-index">02</span>
                  <div>
                    <h3>读地图气氛</h3>
                    <p>{activePoi?.satire_hook || '悬停节点先读名字、阵营、钩子，再决定往哪一块世界深入。'}</p>
                  </div>
                </article>
                <article className="shared-task-card">
                  <span className="shared-task-index">03</span>
                  <div>
                    <h3>留下你的动静</h3>
                    <p>{writebackResult ? `最近一次观察已经落在 ${writebackResult?.event?.target?.target_id || writebackForm.targetId || '当前地点'}。` : '点“驻足观察”，把这次进入留成地点的第一层痕迹。'}</p>
                  </div>
                </article>
              </div>
            </div>

            <div className="storyboard-lane">
              <div className="storyboard-lane-header">
                <span className="storyboard-category-label">当前舞台卡</span>
                <span className="storyboard-lane-meta">把选中的地点当成 RPG 世界节点来看</span>
              </div>
              {activePoi ? (
                <div className="poi-detail-bar storyboard-poi-bar">
                  <span className="poi-detail-name">{activePoi.fantasy_name}</span>
                  <span className="poi-detail-type muted">{activePoi.fantasy_type}</span>
                  <span className="poi-detail-satire">{activePoi.satire_hook}</span>
                  <span className="poi-detail-emotion muted">{activePoi.emotion_hook}</span>
                  <button
                    type="button"
                    className="secondary"
                    style={{ width: 'auto', minWidth: 140 }}
                    disabled={writebackSubmitting}
                    onClick={submitWriteback}
                  >
                    {writebackSubmitting ? '写回中...' : '进入并观察'}
                  </button>
                </div>
              ) : (
                <div className="storyboard-placeholder-card">
                  <strong>等待你选中第一块地图据点</strong>
                  <p>这张地图应该像 2D 游戏世界入口，而不是静态平面图。先点一个地点，右侧信息就会变成你的当前舞台卡。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="panel admin-panel">
        <div className="admin-header">
          <div>
            <p className="mini-label">Admin / Debug</p>
            <h2>后台与调试工具</h2>
            <p className="note muted">开发调试、接口验证和写回实验都留在折叠区，不再占据首页主叙事。</p>
          </div>
          <button type="button" className="secondary admin-toggle" onClick={() => setAdminOpen((current) => !current)}>
            {adminOpen ? '收起后台工具' : '展开后台工具'}
          </button>
        </div>

        {adminOpen ? (
          <div className="admin-content">
            <div className="grid admin-grid">
              <section className="panel inner-panel">
                <h3>Backend connection</h3>
                <label htmlFor="server-base">API base URL</label>
                <div className="row-2">
                  <input id="server-base" type="text" value={apiBase} onChange={(event) => setApiBase(event.target.value)} />
                  <button type="button" className="secondary" disabled={checking} onClick={checkBackend}>
                    {checking ? 'Checking...' : 'Recheck'}
                  </button>
                </div>
                <p className="status">
                  <span className={`dot${statusOk ? ' ok' : ''}`}></span>
                  <span>{statusText}</span>
                </p>
                <p className="note muted">{statusDetail}</p>
              </section>

              <section className="panel inner-panel">
                <h3>Writeback event</h3>
                <p className="note">使用同一切片提交最小事件，验证玩家状态、地点痕迹与世界反馈是否会被后端持久化。</p>
                <div className="row-3">
                  <div>
                    <label htmlFor="player-id">Player ID</label>
                    <input id="player-id" type="text" value={writebackForm.playerId} onChange={(event) => updateWritebackForm('playerId', event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="event-type">Event type</label>
                    <select id="event-type" value={writebackForm.eventType} onChange={(event) => updateWritebackForm('eventType', event.target.value)}>
                      <option value="observe">observe</option>
                      <option value="dwell">dwell</option>
                      <option value="mark">mark</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="visibility">Visibility</label>
                    <select id="visibility" value={writebackForm.visibility} onChange={(event) => updateWritebackForm('visibility', event.target.value)}>
                      <option value="private">private</option>
                      <option value="local_public">local_public</option>
                      <option value="global">global</option>
                    </select>
                  </div>
                </div>
                <div className="row-3">
                  <div>
                    <label htmlFor="target-type">Target type</label>
                    <select id="target-type" value={writebackForm.targetType} onChange={(event) => updateWritebackForm('targetType', event.target.value)}>
                      <option value="poi">poi</option>
                      <option value="zone">zone</option>
                      <option value="route">route</option>
                      <option value="home">home</option>
                      <option value="world">world</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="target-id">Target ID</label>
                    <input id="target-id" type="text" value={writebackForm.targetId} onChange={(event) => updateWritebackForm('targetId', event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="slice-id">Slice ID</label>
                    <input id="slice-id" type="text" value={writebackForm.sliceId} onChange={(event) => updateWritebackForm('sliceId', event.target.value)} />
                  </div>
                </div>
                <div className="row-3">
                  <div>
                    <label htmlFor="zone-id">Zone ID</label>
                    <input id="zone-id" type="text" value={writebackForm.zoneId} onChange={(event) => updateWritebackForm('zoneId', event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="intensity">Observe intensity</label>
                    <input id="intensity" type="number" min="1" max="3" step="1" value={writebackForm.intensity} onChange={(event) => updateWritebackForm('intensity', event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="mark-tag">Mark tag</label>
                    <select id="mark-tag" value={writebackForm.tag} onChange={(event) => updateWritebackForm('tag', event.target.value)}>
                      <option value="safe">safe</option>
                      <option value="uncanny">uncanny</option>
                      <option value="warm_corner">warm_corner</option>
                      <option value="return_again">return_again</option>
                      <option value="rain_friendly">rain_friendly</option>
                    </select>
                  </div>
                </div>
                <label htmlFor="writeback-note">Optional note</label>
                <input id="writeback-note" type="text" value={writebackForm.note} onChange={(event) => updateWritebackForm('note', event.target.value)} placeholder="lightweight annotation for the event" />
                <div className="actions">
                  <button type="button" disabled={writebackSubmitting} onClick={submitWriteback}>
                    {writebackSubmitting ? 'Writing back...' : 'Submit writeback event'}
                  </button>
                </div>
                {writebackError ? <p className="note error-note">{writebackError}</p> : null}
              </section>
            </div>

            {writebackResult ? (
              <div className="writeback-grid">
                <div className="result-card">
                  <h3>Player state</h3>
                  <div><strong>Action:</strong> {playerState?.action_state || '-'}</div>
                  <div><strong>Clarity:</strong> {playerState?.clarity ?? '-'}</div>
                  <div><strong>Tension:</strong> {playerState?.tension ?? '-'}</div>
                  <div><strong>Attunement:</strong> {playerState?.attunement ?? '-'}</div>
                  <div><strong>Zone familiarity:</strong> {JSON.stringify(playerState?.zone_familiarity || {})}</div>
                  <div><strong>POI familiarity:</strong> {JSON.stringify(playerState?.poi_familiarity || {})}</div>
                </div>
                <div className="result-card">
                  <h3>Place state</h3>
                  <div><strong>Target:</strong> {writebackResult.place_state?.target_id || '-'}</div>
                  <div><strong>Type:</strong> {writebackResult.place_state?.target_type || '-'}</div>
                  <div><strong>Familiarity:</strong> {writebackResult.place_state?.familiarity ?? '-'}</div>
                  <div><strong>Mark count:</strong> {writebackResult.place_state?.mark_count ?? '-'}</div>
                  <div><strong>Last event:</strong> {writebackResult.place_state?.last_event_type || '-'}</div>
                  <div><strong>Stored events:</strong> {writebackResult.persistence?.stored_event_count ?? '-'}</div>
                </div>
                <div className="result-card">
                  <h3>World feedback</h3>
                  <div><strong>Summary:</strong> {feedback?.summary || '-'}</div>
                  <div><strong>Broadcast:</strong> {(feedback?.broadcast_hints || []).join(' · ') || '-'}</div>
                  <div><strong>Revealed:</strong> {(feedback?.revealed_fields || []).join(' · ') || '-'}</div>
                  <div><strong>Persistence file:</strong> {writebackResult.persistence?.state_file || '-'}</div>
                </div>
              </div>
            ) : null}

            {recentEchoes.length ? (
              <div className="result-card stacked-card">
                <h3>Recent echoes</h3>
                {recentEchoes.map((entry) => (
                  <div key={`${entry.timestamp}-${entry.target_id}-${entry.entry_type}`} className="subtle-block">
                    <strong>{entry.entry_type}</strong> · {entry.text}
                  </div>
                ))}
              </div>
            ) : null}

            {recentMarks.length ? (
              <div className="result-card stacked-card">
                <h3>Recent marks</h3>
                {recentMarks.map((entry) => (
                  <div key={entry.event_id} className="subtle-block">
                    <strong>{entry.tag}</strong> · {entry.visibility} {entry.note ? `· ${entry.note}` : ''}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
