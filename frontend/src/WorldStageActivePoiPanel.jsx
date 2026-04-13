import { formatTagLabel } from './services/appDisplay'
import WorldStageWritebackActionPanel from './WorldStageWritebackActionPanel'
import WorldStageWritebackInsightsPanel from './WorldStageWritebackInsightsPanel'
import {
  formatFamiliarity,
  formatDwellTime,
  getRelationshipStageLabel,
  getRelationshipColor,
} from './services/placeProtocol'

function PlaceStateSection({ poi, writebackResult, familiarityMap }) {
  if (!poi) return null

  const placeState = writebackResult?.place_state || {}
  const playerState = writebackResult?.player_state || {}
  const familiarity = familiarityMap?.[poi.id] ?? placeState.familiarity ?? 0
  const visitCount = placeState.visit_count ?? 0
  const dwellSeconds = playerState.total_dwell_seconds ?? 0
  const markCount = (placeState.marks || []).length

  let stage = 'unexplored'
  if (visitCount > 0) stage = 'observed'
  if (dwellSeconds > 0) stage = 'dwelling'
  if (markCount > 0) stage = 'marked'
  if (familiarity >= 0.5) stage = 'familiar'
  if (familiarity >= 0.8) stage = 'home'

  return (
    <div className="poi-state-bar">
      <div className="poi-state-chip" style={{ color: getRelationshipColor(familiarity) }}>
        {getRelationshipStageLabel(stage)}
      </div>
      <div className="poi-state-chip">
        熟悉度 {formatFamiliarity(familiarity)}
      </div>
      <div className="poi-state-chip">
        {visitCount}次访问
      </div>
      {dwellSeconds > 0 ? (
        <div className="poi-state-chip">
          驻足{formatDwellTime(dwellSeconds)}
        </div>
      ) : null}
      {markCount > 0 ? (
        <div className="poi-state-chip">
          {markCount}条痕迹
        </div>
      ) : null}
    </div>
  )
}

export default function WorldStageActivePoiPanel({
  resolvedActivePoi,
  familiarityMap,
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
        <span className="storyboard-category-label">当前地点卡</span>
        <span className="storyboard-lane-meta">把选中的地点当成当前叙事入口来查看</span>
      </div>
      {resolvedActivePoi ? (
        <div className="storyboard-stage-stack">
          <div className="poi-detail-bar storyboard-poi-bar">
            <span className="poi-detail-name">{resolvedActivePoi.fantasy_name}</span>
            <span className="poi-detail-type muted">{formatTagLabel(resolvedActivePoi.fantasy_type, '未分类地点')}</span>
            <span className="poi-detail-satire">{resolvedActivePoi.satire_hook}</span>
            <span className="poi-detail-emotion muted">{resolvedActivePoi.emotion_hook}</span>
          </div>

          <PlaceStateSection
            poi={resolvedActivePoi}
            writebackResult={writebackResult}
            familiarityMap={familiarityMap}
          />

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
          <strong>等待你选中第一个地点</strong>
          <p>这里现在是地点入口，而不是静态平面图。先点一个地点，右侧信息就会变成你的当前地点卡。</p>
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
