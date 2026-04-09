import WorldDensityIndicator from './WorldDensityIndicator'
import WorldStageActivePoiPanel from './WorldStageActivePoiPanel'
import WorldStageDisturbancePanel from './WorldStageDisturbancePanel'
import WorldStageMapFrame from './WorldStageMapFrame'
import WorldStageParticipationLane from './WorldStageParticipationLane'
import WorldStagePoiFilterLane from './WorldStagePoiFilterLane'
import { formatTagLabel } from './services/appDisplay'

export default function WorldStagePanel({
  result,
  originLabel,
  form,
  statusOk,
  mapLayerPanelOpen,
  setMapLayerPanelOpen,
  visibleMapLayers,
  mapLayerOptions,
  mapLayerPresets,
  applyMapLayerPreset,
  setAllMapLayers,
  resetMapLayers,
  toggleMapLayer,
  activePoiId,
  familiarityMap,
  ghostTraces,
  handlePoiClick,
  writebackForm,
  handleOrchestrationEvent,
  submitting,
  submitNearby,
  resolvedActivePoi,
  writebackResult,
  selectedVisibilityMeta,
  poiSearch,
  setPoiSearch,
  poiTypeFilter,
  setPoiTypeFilter,
  poiTypeOptions,
  poiFactionFilter,
  setPoiFactionFilter,
  poiFactionOptions,
  poiOnlyFamiliar,
  setPoiOnlyFamiliar,
  poiSearchSummary,
  filteredWorldPois,
  orchestrationEvents,
  disturbanceForm,
  setDisturbanceForm,
  disturbanceSubmitting,
  submitDisturbance,
  disturbanceActive,
  clearDisturbance,
  selectedActionMeta,
  visibilityOptions,
  writebackTargetSummary,
  writebackActions,
  applyWritebackAction,
  updateWritebackForm,
  writebackSubmitting,
  submitWriteback,
  writebackError,
  writebackTimeline,
  revisitSummary,
  writebackResidues,
  behaviorInsights,
  focusWritebackTarget,
  lastWritebackPoiId,
  mapOnly = false,
}) {
  if (mapOnly) {
    return (
      <section className="panel preview-panel player-preview-panel storyboard-panel map-only-stage">
        <WorldStageMapFrame
          className="storyboard-map-frame map-only-stage__frame"
          mapLayerPanelOpen={mapLayerPanelOpen}
          setMapLayerPanelOpen={setMapLayerPanelOpen}
          visibleMapLayers={visibleMapLayers}
          mapLayerOptions={mapLayerOptions}
          mapLayerPresets={mapLayerPresets}
          applyMapLayerPreset={applyMapLayerPreset}
          setAllMapLayers={setAllMapLayers}
          resetMapLayers={resetMapLayers}
          toggleMapLayer={toggleMapLayer}
          world={result?.world}
          onPoiClick={handlePoiClick}
          activePoiId={activePoiId}
          familiarityMap={familiarityMap}
          originLabel={originLabel}
          ghostTraces={ghostTraces}
          toolbarLabel="地图"
          toolbarCopy={result ? `${originLabel} · ${form.radius}m · ${result?.poi_count ?? 0} 个节点` : '正在准备附近地图'}
          toolbarClassName="map-layer-toolbar map-only-stage__toolbar"
        />
        <div className="map-only-stage__feedback" aria-live="polite">
          <div>
            <span className="storyboard-category-label">当前据点</span>
            <strong>{resolvedActivePoi ? resolvedActivePoi.fantasy_name : '点击地图上的一个地点'}</strong>
            <p>
              {resolvedActivePoi
                ? resolvedActivePoi.satire_hook || '该地点已选中，可继续悬停或切换图层观察周边结构。'
                : result
                  ? '先点一个节点，立即查看它的名字、阵营与世界钩子。'
                  : '生成世界切片后，即可点击地图节点开始探索。'}
            </p>
          </div>
          <div className="map-only-stage__feedback-meta">
            <span>{resolvedActivePoi?.faction_alignment ? formatTagLabel(resolvedActivePoi.faction_alignment, '游离势力') : '等待选择阵营'}</span>
            <span>{resolvedActivePoi?.fantasy_type ? formatTagLabel(resolvedActivePoi.fantasy_type, '未知地点') : '等待选择地点类型'}</span>
            <span>{activePoiId ? '已设为当前据点' : '尚未选中据点'}</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="panel preview-panel player-preview-panel storyboard-panel">
      <div className="section-heading storyboard-heading">
        <div>
          <p className="mini-label">步骤 3</p>
          <h2>进入 2D 世界地图</h2>
        </div>
        <div className="storyboard-heading-copy">
          <p className="note muted">这里不再是平面预览区，而是你附近切片被转译成 2D 游戏世界地图的主舞台。</p>
        </div>
      </div>

      <div className="storyboard-shell">
        <div className="storyboard-shell-top">
          <div className="storyboard-category">
            <span className="storyboard-category-label">世界气候层</span>
            <div className="storyboard-chip-row">
              <span className={`storyboard-chip${result ? '' : ' storyboard-chip--empty'}`}>
                {result ? '切片已就绪' : '待生成'}
              </span>
              <span className="storyboard-chip">{formatTagLabel(result?.world?.region?.vibe_profile, '静雨')}</span>
              <span className="storyboard-chip">{formatTagLabel(result?.dominant_faction, '未显形势力')}</span>
              <span className="storyboard-chip">{formatTagLabel(result?.region_theme, '未命名切片')}</span>
            </div>
          </div>
          <div className="storyboard-category">
            <span className="storyboard-category-label">进入设定</span>
            <div className="storyboard-chip-row">
              <span className="storyboard-chip">{originLabel}</span>
              <span className="storyboard-chip">{form.radius}m 半径</span>
              <span className="storyboard-chip">{result?.landmark_count ?? 0} 个地标</span>
            </div>
          </div>
        </div>

        <WorldStageMapFrame
          className="storyboard-map-frame"
          mapLayerPanelOpen={mapLayerPanelOpen}
          setMapLayerPanelOpen={setMapLayerPanelOpen}
          visibleMapLayers={visibleMapLayers}
          mapLayerOptions={mapLayerOptions}
          mapLayerPresets={mapLayerPresets}
          applyMapLayerPreset={applyMapLayerPreset}
          setAllMapLayers={setAllMapLayers}
          resetMapLayers={resetMapLayers}
          toggleMapLayer={toggleMapLayer}
          world={result?.world}
          onPoiClick={handlePoiClick}
          activePoiId={activePoiId}
          familiarityMap={familiarityMap}
          originLabel={originLabel}
          ghostTraces={ghostTraces}
        />

        <div className="storyboard-shell-bottom">
          <div className="storyboard-lane">
            <div className="storyboard-lane-header">
              <span className="storyboard-category-label">探索引导</span>
              <span className="storyboard-lane-meta">按 2D 世界地图的方式进入，而不是读表单</span>
            </div>
            {result?.world_id ? (
              <WorldDensityIndicator
                sliceId={result.world_id}
                playerId={writebackForm.playerId}
                lat={form.lat}
                lon={form.lon}
                onEvent={handleOrchestrationEvent}
              />
            ) : null}
            <div className="shared-task-grid">
              <article className={`shared-task-card shared-task-card--gen${result ? ' is-done' : submitting ? ' is-loading' : ''}`}>
                <span className="shared-task-index">00</span>
                <div className="shared-task-gen-body">
                  <h3>{result ? formatTagLabel(result.region_theme, '世界已生成') : '生成当前切片'}</h3>
                  <p className="shared-task-gen-meta">
                    {result
                      ? `${result.poi_count ?? 0} 个节点 · ${result.road_count ?? 0} 条路径 · ${formatTagLabel(result.dominant_faction, '未知势力')}`
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
              <article className={`shared-task-card${resolvedActivePoi ? ' is-active' : ''}`}>
                <span className="shared-task-index">01</span>
                <div>
                  <h3>选一个据点</h3>
                  <p>{resolvedActivePoi ? `${resolvedActivePoi.fantasy_name} 已成为当前主据点。` : '先在地图上点击一个节点，把它变成你这次进入世界的主据点。'}</p>
                </div>
              </article>
              <article className="shared-task-card">
                <span className="shared-task-index">02</span>
                <div>
                  <h3>读地图气氛</h3>
                  <p>{resolvedActivePoi?.satire_hook || '悬停节点先读名字、阵营、钩子，再决定往哪一块世界深入。'}</p>
                </div>
              </article>
              <article className="shared-task-card">
                <span className="shared-task-index">03</span>
                <div>
                  <h3>留下你的动静</h3>
                  <p>{writebackResult ? `最近一次观察已经落在 ${writebackResult?.event?.target?.target_id || writebackForm.targetId || '当前地点'}。` : '点“驻足观察”，把这次进入留成地点的第一层痕迹。'}</p>
                </div>
              </article>
              <article className="shared-task-card shared-task-card--visibility">
                <span className="shared-task-index">04</span>
                <div>
                  <h3>决定这次写回留在哪一层</h3>
                  <p>{selectedVisibilityMeta.title} · {selectedVisibilityMeta.hint}</p>
                </div>
              </article>
            </div>

            <WorldStagePoiFilterLane
              filteredWorldPois={filteredWorldPois}
              familiarityMap={familiarityMap}
              handlePoiClick={handlePoiClick}
              poiFactionFilter={poiFactionFilter}
              poiFactionOptions={poiFactionOptions}
              poiOnlyFamiliar={poiOnlyFamiliar}
              poiSearch={poiSearch}
              poiSearchSummary={poiSearchSummary}
              poiTypeFilter={poiTypeFilter}
              poiTypeOptions={poiTypeOptions}
              resolvedActivePoi={resolvedActivePoi}
              result={result}
              setPoiFactionFilter={setPoiFactionFilter}
              setPoiOnlyFamiliar={setPoiOnlyFamiliar}
              setPoiSearch={setPoiSearch}
              setPoiTypeFilter={setPoiTypeFilter}
            />

            {orchestrationEvents.length ? (
              <div className="storyboard-lane orchestration-lane">
                <div className="storyboard-lane-header">
                  <span className="storyboard-category-label">编排事件</span>
                  <span className="storyboard-lane-meta">世界编排器正在根据当前切片与你的位置发出信号</span>
                </div>
                <div className="orchestration-event-grid">
                  {orchestrationEvents.map((event, index) => (
                    <article key={`${event.type}-${event.priority}-${index}`} className="orchestration-event-card">
                      <strong>{event.type || 'unknown_event'}</strong>
                      <span>priority · {event.priority ?? '-'}</span>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {result?.world_id ? (
              <WorldStageDisturbancePanel
                disturbanceForm={disturbanceForm}
                setDisturbanceForm={setDisturbanceForm}
                disturbanceSubmitting={disturbanceSubmitting}
                submitDisturbance={submitDisturbance}
                disturbanceActive={disturbanceActive}
                clearDisturbance={clearDisturbance}
              />
            ) : null}

            <WorldStageParticipationLane
              selectedVisibilityMeta={selectedVisibilityMeta}
              selectedActionMeta={selectedActionMeta}
              writebackForm={writebackForm}
              visibilityOptions={visibilityOptions}
            />
          </div>

          <WorldStageActivePoiPanel
            resolvedActivePoi={resolvedActivePoi}
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
            writebackTimeline={writebackTimeline}
            writebackResult={writebackResult}
            revisitSummary={revisitSummary}
            writebackResidues={writebackResidues}
            behaviorInsights={behaviorInsights}
            lastWritebackPoiId={lastWritebackPoiId}
            focusWritebackTarget={focusWritebackTarget}
          />
        </div>
      </div>
    </section>
  )
}
