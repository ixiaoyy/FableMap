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
  }
}

const initialForm = {
  lat: '35.6580',
  lon: '139.7016',
  radius: '300',
  mode: 'fixture',
  seed: '',
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

  const api = useMemo(() => createApiClient(() => apiBase.replace(/\/$/, '')), [apiBase])

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
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
    } catch (error) {
      setResult(null)
      setErrorText(`生成失败：${error.message || String(error)}`)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    checkBackend()
  }, [])

  const previewUrl = result?.preview_url || ''

  return (
    <div className="wrap">
      <section className="hero panel">
        <p className="eyebrow">Full-stack engineered migration</p>
        <h1>FableMap · FastAPI + React</h1>
        <p>当前版本已切换到工程化 React 前端，并通过 FastAPI 提供最小可运行的 nearby 世界生成入口。</p>
        <div className="tag-row">
          <span className="tag">FastAPI backend</span>
          <span className="tag">Vite + React frontend</span>
          <span className="tag">Minimal runnable MVP</span>
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
