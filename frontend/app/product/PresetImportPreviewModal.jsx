import { useMemo, useState } from 'react'
import { errorMessage, previewPresetImport } from '../lib/taverns'

const SAMPLE_PRESET = {
  name: '示例社区预设',
  temperature: 0.85,
  prompts: [
    {
      name: 'Tavern Style',
      content: 'Use warm tavern atmosphere and concise dialogue.',
    },
    {
      name: 'Model note',
      content: 'Optimized for a specific model; owner should review before manual migration.',
    },
  ],
}

function countLabel(summary = {}) {
  return `${summary.supported || 0} 可参考 · ${summary.warning || 0} 需复核 · ${summary.blocked || 0} 已阻断`
}

function PreviewGroup({ title, tone, items = [] }) {
  return (
    <section className={`preset-import-preview__group is-${tone}`}>
      <div className="preset-import-preview__group-head">
        <strong>{title}</strong>
        <span>{items.length} 项</span>
      </div>
      {items.length === 0 ? (
        <p className="note muted">暂无条目。</p>
      ) : (
        <div className="preset-import-preview__items">
          {items.map((item) => (
            <article key={item.id || `${item.name}-${item.category}`} className="preset-import-preview__item">
              <div>
                <strong>{item.name || '未命名模块'}</strong>
                <small>{item.category || item.severity}</small>
              </div>
              <p>{item.reason}</p>
              {item.sample ? <pre>{item.sample}</pre> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default function PresetImportPreviewModal({ tavern, ownerId = '', onClose }) {
  const [rawText, setRawText] = useState(() => JSON.stringify(SAMPLE_PRESET, null, 2))
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const runtimeRows = useMemo(() => {
    const entries = Object.entries(result?.runtime_parameters || {})
    return entries.map(([key, value]) => ({ key, value: typeof value === 'string' ? value : JSON.stringify(value) }))
  }, [result])

  async function handlePreview() {
    setError('')
    setResult(null)
    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch (err) {
      setError(`JSON 解析失败：${err.message}`)
      return
    }
    setLoading(true)
    try {
      const payload = await previewPresetImport(tavern.id, { preset: parsed }, ownerId)
      setResult(payload)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function loadSample() {
    setRawText(JSON.stringify(SAMPLE_PRESET, null, 2))
    setError('')
    setResult(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content panel preset-import-preview" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <p className="mini-label">Preset Import · preview only</p>
            <h3>预览导入预设：{tavern?.name || '当前酒馆'}</h3>
            <p className="note muted">
              粘贴社区 / SillyTavern 风格 JSON，只生成风险报告；不会应用、不会保存、不会覆盖酒馆内容。
            </p>
          </div>
          <button className="close-btn" type="button" onClick={onClose}>&times;</button>
        </header>

        <div className="preset-import-preview__body">
          <label className="preset-import-preview__editor">
            <span className="mini-label">预设 JSON</span>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={14}
              spellCheck={false}
              placeholder='{"name":"社区预设","prompts":[...]}'
            />
          </label>

          <aside className="preset-import-preview__side">
            <div className="preset-import-preview__notice">
              <strong>只预览，不落库</strong>
              <p>Preview only：当前工具只分类 supported / warning / blocked，apply 尚未实现。</p>
              <p>blocked 条目会显示给店主识别风险，但不会成为可用 Prompt。</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={loadSample} disabled={loading}>填入示例</button>
              <button type="button" className="primary" onClick={handlePreview} disabled={loading || !rawText.trim()}>
                {loading ? '预览中...' : '生成风险报告'}
              </button>
            </div>
            {error ? <div className="llm-save-result error">{error}</div> : null}
          </aside>
        </div>

        {result ? (
          <section className="preset-import-preview__report">
            <div className="preset-import-preview__summary">
              <div>
                <p className="mini-label">报告摘要</p>
                <h4>{result.preset_name || '未命名预设'}</h4>
                <p>{countLabel(result.summary)}</p>
              </div>
              <span className="preset-import-preview__badge">applied: {String(result.applied)}</span>
            </div>

            {runtimeRows.length > 0 ? (
              <div className="preset-import-preview__runtime">
                <strong>识别到的运行参数</strong>
                <div>
                  {runtimeRows.map((row) => (
                    <span key={row.key}>{row.key}: {row.value}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="preset-import-preview__groups">
              <PreviewGroup title="可参考 supported" tone="supported" items={result.supported || []} />
              <PreviewGroup title="需复核 warning" tone="warning" items={result.warnings || []} />
              <PreviewGroup title="已阻断 blocked" tone="blocked" items={result.blocked || []} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
