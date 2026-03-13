import { useEffect, useMemo, useState } from 'react'

function createApiClient(getBaseUrl) {
  async function readJson(response) {
    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload.error || `HTTP ${response.status}`)
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

export default function App() {
  const [apiBase, setApiBase] = useState(window.location.origin)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusOk, setStatusOk] = useState(false)
  const [statusText, setStatusText] = useState('等待连接 FastAPI...')
  const [statusDetail, setStatusDetail] = useState('')
  const [result, setResult] = useState(null)
  const [errorText, setErrorText] = useState('')
  const [form, setForm] = useState(initialForm)
  const [writebackForm, setWritebackForm] = useState(initialWritebackForm)
  const [writebackSubmitting, setWritebackSubmitting] = useState(false)
  const [writebackResult, setWritebackResult] = useState(null)
  const [writebackError, setWritebackError] = useState('')

  const api = useMemo(() => createApiClient(() => apiBase.replace(/\/$/, '')), [apiBase])

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateWritebackForm(key, value) {
    setWritebackForm((current) => ({ ...current, [key]: value }))
  }

  function applyMeta(meta) {
    if (!meta) {
      return
    }
    const coords = meta.default_coordinates || {}
    setForm((current) => ({
      ...current,
      lat: typeof coords.lat === 'number' ? String(coords.lat) : current.lat,
      lon: typeof coords.lon === 'number' ? String(coords.lon) : current.lon,
      radius: typeof coords.radius === 'number' ? String(coords.radius) : current.radius,
      mode: meta.default_mode || current.mode,
    }))
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
        `frontend_mode=${meta.frontend_mode} · fixture_available=${health.fixture_available} · output_root=${health.output_root}`
      )
    } catch (error) {
      setStatusOk(false)
      setStatusText('FastAPI 不可用')
      setStatusDetail(error.message || String(error))
    } finally {
      setChecking(false)
    }
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
      setErrorText('')
      setWritebackForm((current) => ({
        ...current,
        sliceId: payload.world_id || current.sliceId,
        targetId: payload.primary_poi_id || current.targetId,
        zoneId: payload.primary_zone_id || current.zoneId,
      }))
    } catch (error) {
      setResult(null)
      setErrorText(`生成失败：${error.message || String(error)}`)
    } finally {
      setSubmitting(false)
    }
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
    } catch (error) {
      setWritebackError(`写回失败：${error.message || String(error)}`)
    } finally {
      setWritebackSubmitting(false)
    }
  }

  useEffect(() => {
    checkBackend()
  }, [])

  const previewUrl = result?.preview_url || ''
  const recentEchoes = writebackResult?.place_state?.recent_echoes || []
  const recentMarks = writebackResult?.place_state?.marks || []
  const playerState = writebackResult?.player_state || null
  const feedback = writebackResult?.world_feedback || null

  return (
    <div className="wrap">
      <section className="hero panel">
        <p className="eyebrow">Persistent slice MVP</p>
        <h1>FableMap · FastAPI + React</h1>
        <p>当前版本已切换到工程化 React 前端，并把最小写回闭环接到 FastAPI：先生成 nearby 世界，再提交 observe / dwell / mark 事件。</p>
        <div className="tag-row">
          <span className="tag">FastAPI backend</span>
          <span className="tag">Vite + React frontend</span>
          <span className="tag">World writeback MVP</span>
        </div>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Backend connection</h2>
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

        <section className="panel">
          <h2>Generate nearby world</h2>
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
              <label htmlFor="mode">Mode</label>
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
          <div className="actions">
            <button type="button" disabled={submitting} onClick={() => submitNearby(false)}>
              {submitting ? 'Submitting...' : 'Generate preview'}
            </button>
            <button type="button" className="secondary" disabled={submitting} onClick={() => submitNearby(true)}>
              Refresh live map
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Result</h2>
          {errorText ? (
            <p className="note">{errorText}</p>
          ) : result ? (
            <div className="result-card">
              <div><strong>World ID:</strong> {result.world_id || '-'}</div>
              <div><strong>Theme:</strong> {result.region_theme || '-'}</div>
              <div><strong>Faction:</strong> {result.dominant_faction || '-'}</div>
              <div><strong>Counts:</strong> POI {result.poi_count ?? '-'} · Roads {result.road_count ?? '-'} · Landmarks {result.landmark_count ?? '-'}</div>
              <div><strong>Provider:</strong> {result.provider || '-'} · <strong>Cache:</strong> {result.cache_status || '-'}</div>
              <div><strong>Generated at:</strong> {result.generated_at || '-'}</div>
              <div className="link-row">
                <a href={result.preview_url} target="_blank" rel="noreferrer">Open preview</a>
                <a href={result.world_url} target="_blank" rel="noreferrer">Open world.json</a>
                <a href={result.manifest_url} target="_blank" rel="noreferrer">Open manifest.json</a>
              </div>
            </div>
          ) : (
            <p className="note">No result yet. Start FastAPI and generate one preview.</p>
          )}
        </section>
      </div>

      <section className="panel preview-panel">
        <h2>Writeback event</h2>
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
      </section>

      <section className="panel preview-panel">
        <h2>Preview</h2>
        <p className="note">生成成功后会直接嵌入 API 返回的 bundle preview。</p>
        {previewUrl ? (
          <iframe src={previewUrl} title="FableMap preview"></iframe>
        ) : (
          <div className="preview-empty">Preview not generated yet.</div>
        )}
      </section>
    </div>
  )
}
