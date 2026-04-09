import { useEffect, useRef } from 'react'
import AdminDebugPanel from './AdminDebugPanel'
import WorldEntryPanel from './WorldEntryPanel'
import WorldSliceResultPanel from './WorldSliceResultPanel'
import WorldStagePanel from './WorldStagePanel'
import {
  DEFAULT_VISIBLE_MAP_LAYERS,
  INITIAL_FORM,
  INITIAL_WRITEBACK_FORM,
  LOCATION_PRESETS,
  MAP_LAYER_OPTIONS,
  MAP_LAYER_PRESETS,
  VISIBILITY_OPTIONS,
  WRITEBACK_ACTIONS,
} from './appShellConfig'
import { useWorldSession } from './hooks/useWorldSession'
import { buildAppPanelProps } from './services/appPanelProps'
import { buildEntryStatusText, buildHeroMetrics } from './services/appShellViewModel'

export default function App() {
  const stageRef = useRef(null)
  const previousResultIdRef = useRef(null)
  const {
    activePoiId,
    adminOpen,
    advancedOpen,
    apiBase,
    applyMapLayerPreset,
    applyWritebackAction,
    behaviorInsights,
    checkBackend,
    checking,
    clearDisturbance,
    disturbanceActive,
    disturbanceForm,
    disturbanceSubmitting,
    errorText,
    familiarityMap,
    feedback,
    filteredWorldPois,
    focusWritebackTarget,
    form,
    ghostTraces,
    handleOrchestrationEvent,
    handlePoiClick,
    honorBoard,
    lastSessionAt,
    lastWritebackPoiId,
    locating,
    autoEntering,
    mapLayerPanelOpen,
    orchestrationEvents,
    originHint,
    originLabel,
    placeLegend,
    playerState,
    poiFactionFilter,
    poiFactionOptions,
    poiOnlyFamiliar,
    poiSearch,
    poiSearchSummary,
    poiTypeFilter,
    poiTypeOptions,
    presetMeta,
    previewUrl,
    recentEchoes,
    recentMarks,
    resolvedActivePoi,
    result,
    revisitSummary,
    selectedActionMeta,
    selectedVisibilityMeta,
    setAdminOpen,
    setAdvancedOpen,
    setApiBase,
    setDisturbanceForm,
    setMapLayerPanelOpen,
    setPoiFactionFilter,
    setPoiOnlyFamiliar,
    setPoiSearch,
    setPoiTypeFilter,
    setAllMapLayers,
    resetMapLayers,
    sliceHighlights,
    statusDetail,
    statusOk,
    statusText,
    submitDisturbance,
    submitNearby,
    submitWriteback,
    submitting,
    toggleMapLayer,
    updateForm,
    updateWritebackForm,
    useCurrentLocation,
    usePreset,
    visibleMapLayers,
    worldAtmosphere,
    writebackError,
    writebackForm,
    writebackResult,
    writebackResidues,
    writebackSubmitting,
    writebackTargetSummary,
    writebackTimeline,
  } = useWorldSession({
    initialForm: INITIAL_FORM,
    initialWritebackForm: INITIAL_WRITEBACK_FORM,
    locationPresets: LOCATION_PRESETS,
    defaultVisibleMapLayers: DEFAULT_VISIBLE_MAP_LAYERS,
    mapLayerOptions: MAP_LAYER_OPTIONS,
    mapLayerPresets: MAP_LAYER_PRESETS,
    writebackActions: WRITEBACK_ACTIONS,
    visibilityOptions: VISIBILITY_OPTIONS,
  })

  const entryStatusText = buildEntryStatusText({
    autoEntering,
    submitting,
    result,
  })
  const heroMetrics = buildHeroMetrics({
    entryStatusText,
    form,
    mapLayerOptions: MAP_LAYER_OPTIONS,
    result,
    visibleMapLayers,
    originLabel,
  })

  const {
    adminPanelProps,
    entryPanelProps,
    mapStageProps,
    resultPanelProps,
  } = buildAppPanelProps({
    advancedOpen,
    adminOpen,
    apiBase,
    autoEntering,
    checking,
    checkBackend,
    errorText,
    familiarityMap,
    feedback,
    filteredWorldPois,
    focusWritebackTarget,
    form,
    ghostTraces,
    handleOrchestrationEvent,
    handlePoiClick,
    honorBoard,
    lastSessionAt,
    lastWritebackPoiId,
    locating,
    mapLayerPanelOpen,
    orchestrationEvents,
    originHint,
    originLabel,
    placeLegend,
    playerState,
    poiFactionFilter,
    poiFactionOptions,
    poiOnlyFamiliar,
    poiSearch,
    poiSearchSummary,
    poiTypeFilter,
    poiTypeOptions,
    presetMeta,
    recentEchoes,
    recentMarks,
    resolvedActivePoi,
    result,
    setAdminOpen,
    setAdvancedOpen,
    setApiBase,
    setAllMapLayers,
    setMapLayerPanelOpen,
    statusDetail,
    statusOk,
    statusText,
    submitNearby,
    submitWriteback,
    submitting,
    updateForm,
    updateWritebackForm,
    useCurrentLocation,
    usePreset,
    visibleMapLayers,
    worldAtmosphere,
    writebackError,
    writebackForm,
    writebackResidues,
    writebackResult,
    writebackSubmitting,
    writebackTargetSummary,
    writebackTimeline,
    revisitSummary,
    selectedActionMeta,
    selectedVisibilityMeta,
    disturbanceForm,
    setDisturbanceForm,
    disturbanceSubmitting,
    submitDisturbance,
    disturbanceActive,
    clearDisturbance,
    visibilityOptions: VISIBILITY_OPTIONS,
    activePoiId,
    applyMapLayerPreset,
    applyWritebackAction,
    resetMapLayers,
    toggleMapLayer,
    locationPresets: LOCATION_PRESETS,
    mapLayerOptions: MAP_LAYER_OPTIONS,
    mapLayerPresets: MAP_LAYER_PRESETS,
    writebackActions: WRITEBACK_ACTIONS,
    sliceHighlights,
  })

  useEffect(() => {
    previousResultIdRef.current = result?.slice_id ?? null
  }, [])

  useEffect(() => {
    const currentResultId = result?.slice_id ?? null
    const previousResultId = previousResultIdRef.current

    if (currentResultId && currentResultId !== previousResultId) {
      let cancelled = false
      let attempt = 0
      let timerId = null

      const scrollToMapViewport = () => {
        if (cancelled) return

        const mapViewport = stageRef.current?.querySelector('.world-map-wrap, .map-empty')

        if (mapViewport || attempt >= 8) {
          ;(mapViewport || stageRef.current)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
          return
        }

        attempt += 1
        timerId = window.setTimeout(scrollToMapViewport, 80)
      }

      timerId = window.setTimeout(scrollToMapViewport, 0)

      return () => {
        cancelled = true
        if (timerId) {
          window.clearTimeout(timerId)
        }
      }
    }

    previousResultIdRef.current = currentResultId
  }, [result])

  const stageStatusLabel = autoEntering || submitting
    ? '地图生成中'
    : result
      ? '地图已生成'
      : '等待生成地图'

  const stageStatusTitle = autoEntering
    ? '系统正在根据当前位置生成附近世界，地图舞台会在完成后自动带到这里。'
    : submitting
      ? '正在准备画布与节点，请稍候，生成成功后页面会自动滚动到这里。'
      : result
        ? '画布已经出现在这个舞台区域，向下即可直接点地图上的节点。'
        : '点击上方主按钮后，生成出的画布会出现在这里。'

  return (
    <div className="wrap app-shell page-enter map-first-app-shell world-app-shell">
      <header className="world-app-shell__hero panel">
        <div className="world-app-shell__hero-copy">
          <p className="mini-label">World shell</p>
          <h1>{result ? '世界入口已连通，直接开始看地图' : '先选入口，马上进入你附近的世界切片'}</h1>
          <p className="note muted world-app-shell__hero-note">
            首页先只保留入口、结果摘要和地图舞台，优先让你立即进入、立即看图、立即点节点。
          </p>
        </div>
        <div className="world-app-shell__hero-metrics" aria-label="当前动作提示">
          {heroMetrics.cards.map((card) => (
            <article key={card.id} className="world-shell-metric-card">
              <span className="world-shell-metric-card__label">{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </header>

      <section className="world-app-shell__top-grid" aria-label="世界入口与切片摘要">
        <WorldEntryPanel {...entryPanelProps} />

        <WorldSliceResultPanel {...resultPanelProps} />
      </section>

      <div ref={stageRef} className="world-app-shell__stage">
        <div className={`world-app-shell__stage-status${autoEntering || submitting ? ' is-pending' : result ? ' is-ready' : ''}`} aria-live="polite">
          <span className="mini-label">地图舞台</span>
          <strong>{stageStatusLabel}</strong>
          <p>{stageStatusTitle}</p>
        </div>
        <WorldStagePanel {...mapStageProps} />
      </div>

      {adminOpen ? (
        <div className="world-app-shell__admin">
          <AdminDebugPanel {...adminPanelProps} />
        </div>
      ) : null}
    </div>
  )
}
