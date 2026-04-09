import { formatTagLabel } from './services/appDisplay'
import WorldStageWritebackActionPanel from './WorldStageWritebackActionPanel'
import WorldStageWritebackInsightsPanel from './WorldStageWritebackInsightsPanel'

export default function WorldStageActivePoiPanel({
  resolvedActivePoi,
  writebackTargetSummary,
  writebackActions,
  writebackForm,
  applyWritebackAction,
  selectedActionMeta,
  updateWritebackForm,
  visibilityOptions,
  selectedVisibilityMeta,
  writebackSubmitting,
  submitWriteback,
  writebackError,
  writebackTimeline,
  writebackResult,
  revisitSummary,
  writebackResidues,
  behaviorInsights,
  lastWritebackPoiId,
  focusWritebackTarget,
}) {
  return (
    <div className="storyboard-lane">
      <div className="storyboard-lane-header">
        <span className="storyboard-category-label">当前舞台卡</span>
        <span className="storyboard-lane-meta">把选中的地点当成 RPG 世界节点来看</span>
      </div>
      {resolvedActivePoi ? (
        <div className="storyboard-stage-stack">
          <div className="poi-detail-bar storyboard-poi-bar">
            <span className="poi-detail-name">{resolvedActivePoi.fantasy_name}</span>
            <span className="poi-detail-type muted">{formatTagLabel(resolvedActivePoi.fantasy_type, '未分类地点')}</span>
            <span className="poi-detail-satire">{resolvedActivePoi.satire_hook}</span>
            <span className="poi-detail-emotion muted">{resolvedActivePoi.emotion_hook}</span>
          </div>

          <WorldStageWritebackActionPanel
            writebackTargetSummary={writebackTargetSummary}
            writebackActions={writebackActions}
            writebackForm={writebackForm}
            applyWritebackAction={applyWritebackAction}
            selectedActionMeta={selectedActionMeta}
            updateWritebackForm={updateWritebackForm}
            visibilityOptions={visibilityOptions}
            selectedVisibilityMeta={selectedVisibilityMeta}
            writebackSubmitting={writebackSubmitting}
            submitWriteback={submitWriteback}
            writebackError={writebackError}
          />

          <WorldStageWritebackInsightsPanel
            writebackTimeline={writebackTimeline}
            writebackResult={writebackResult}
            revisitSummary={revisitSummary}
            writebackResidues={writebackResidues}
            behaviorInsights={behaviorInsights}
          />
        </div>
      ) : (
        <div className="storyboard-placeholder-card">
          <strong>等待你选中第一块地图据点</strong>
          <p>这张地图应该像 2D 游戏世界入口，而不是静态平面图。先点一个地点，右侧信息就会变成你的当前舞台卡。</p>
          {writebackResult && lastWritebackPoiId ? (
            <button type="button" className="storyboard-inline-btn" onClick={focusWritebackTarget}>
              回到上次写回目标
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
