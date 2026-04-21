import { useEffect, useMemo, useState } from 'react'
import {
  formatTavernDistance,
  getTavernAccessDescription,
  getTavernAccessIcon,
  getTavernAccessLabel,
  getTavernAccessTone,
  getTavernStatusColor,
  getTavernStatusLabel,
} from './services/tavernService'
import { inferTavernPlayMode } from './tavernPlayModes'

const ACCESS_OPTIONS = [
  { value: 'all', label: '全部入口' },
  { value: 'public', label: '公开' },
  { value: 'password', label: '需要密码' },
  { value: 'private', label: '私人' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'open', label: '营业中' },
  { value: 'closed', label: '歇业中' },
]

const SORT_OPTIONS = [
  { value: 'distance', label: '离我最近' },
  { value: 'name', label: '名称排序' },
  { value: 'visits', label: '访问最多' },
  { value: 'characters', label: '角色最多' },
]

const DISCOVERY_BATCH_SIZE = 12

function getCharacterCount(tavern) {
  return Array.isArray(tavern?.characters) ? tavern.characters.length : 0
}

function getTavernDescription(tavern) {
  return tavern?.description || tavern?.scene_prompt || '店主还没有留下公开介绍。'
}

function getDistanceLabel(tavern) {
  return tavern?._distance == null ? '距离待定位' : formatTavernDistance(tavern._distance)
}

function SkeletonTavernCard() {
  return (
    <div className="tavern-discovery-card tavern-discovery-card--skeleton">
      <div className="skeleton-line skeleton-line--title" />
      <div className="skeleton-line skeleton-line--text" />
      <div className="skeleton-line skeleton-line--meta" />
    </div>
  )
}

function ShimmerLoader() {
  return (
    <div className="tavern-discovery-shimmer">
      <div className="shimmer-line shimmer-line--short" />
      <div className="shimmer-line shimmer-line--medium" />
      <div className="shimmer-line shimmer-line--long" />
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div className="tavern-discovery-loading-overlay" aria-live="polite">
      <ShimmerLoader />
      <span className="loading-text">正在扫描附近酒馆</span>
    </div>
  )
}

export default function WorldStageTavernDiscoveryLane({
  taverns,
  totalTaverns,
  loading,
  error,
  search,
  setSearch,
  accessFilter,
  setAccessFilter,
  statusFilter,
  setStatusFilter,
  sortMode,
  setSortMode,
  activeTavernId,
  mapMarkerCount = taverns.length,
  mapMarkerLimit = 0,
  onTavernClick,
  onRefreshTaverns,
  onQuickStartTavern,
  quickStartLoading = false,
}) {
  const [visibleCount, setVisibleCount] = useState(DISCOVERY_BATCH_SIZE)
  const canReset = Boolean(search || accessFilter !== 'all' || statusFilter !== 'all' || sortMode !== 'distance')
  const visibleTaverns = useMemo(() => taverns.slice(0, visibleCount), [taverns, visibleCount])
  const hiddenCount = Math.max(0, taverns.length - visibleTaverns.length)
  const markerHiddenCount = Math.max(0, taverns.length - mapMarkerCount)
  const summary = totalTaverns
    ? `匹配 ${taverns.length} / ${totalTaverns} 间附近酒馆`
    : '附近暂无可发现酒馆'

  useEffect(() => {
    setVisibleCount(DISCOVERY_BATCH_SIZE)
  }, [search, accessFilter, statusFilter, sortMode, taverns.length])

  function resetFilters() {
    setSearch('')
    setAccessFilter('all')
    setStatusFilter('all')
    setSortMode('distance')
  }

  function loadMore() {
    setVisibleCount((count) => Math.min(taverns.length, count + DISCOVERY_BATCH_SIZE))
  }

  return (
    <div className="storyboard-lane tavern-discovery-lane">
      <div className="storyboard-lane-header">
        <span className="storyboard-category-label">酒馆发现</span>
        <span className="storyboard-lane-meta">{loading ? '正在扫描当前入口周围的酒馆' : summary}</span>
      </div>

      <div className="tavern-discovery-toolbar">
        <label className="tavern-discovery-field tavern-discovery-field--search">
          <span>搜索酒馆</span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="名称、介绍、地址、角色或状态"
          />
        </label>

        <label className="tavern-discovery-field">
          <span>入口</span>
          <select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}>
            {ACCESS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="tavern-discovery-field">
          <span>状态</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="tavern-discovery-field">
          <span>排序</span>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button type="button" className="secondary tavern-discovery-reset" onClick={resetFilters} disabled={!canReset}>
          清空
        </button>

        <button type="button" className="secondary tavern-discovery-refresh" onClick={onRefreshTaverns} disabled={loading}>
          {loading ? (
            <span className="refresh-spinner">⟳</span>
          ) : (
            '↻ 刷新'
          )}
        </button>
      </div>

      <div className="tavern-discovery-summary-row" aria-live="polite">
        <span>{summary}</span>
        {activeTavernId ? <span className="tavern-discovery-active">已选中酒馆</span> : null}
        {hiddenCount ? <span>列表还有 {hiddenCount} 间未展开</span> : null}
        {markerHiddenCount ? <span>地图显示 {mapMarkerCount} / {taverns.length} 个 marker</span> : null}
      </div>

      {onQuickStartTavern ? (
        <div className="tavern-discovery-quick-start">
          <div>
            <span className="mini-label">新手直达</span>
            <strong>先体验一次完整聊天，再决定要不要调地图。</strong>
            <p>进入平台内置公益酒馆：公开、营业中、本地规则回应，不需要 API Key。</p>
          </div>
          <button
            type="button"
            className="primary tavern-discovery-quick-btn"
            onClick={onQuickStartTavern}
            disabled={quickStartLoading}
          >
            {quickStartLoading ? (
              <span className="btn-loading-text">正在进入...</span>
            ) : (
              '⚡ 立即试玩'
            )}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="storyboard-placeholder-card tavern-discovery-empty tavern-discovery-empty--error">
          <span className="empty-icon">⚠️</span>
          <strong>附近酒馆暂时没有连通</strong>
          <p>{error}</p>
          <button type="button" className="secondary" onClick={onRefreshTaverns}>重试</button>
        </div>
      ) : loading ? (
        <div className="tavern-discovery-loading">
          <div className="loading-spinner">
            <div className="spinner-ring" />
          </div>
          <p>正在扫描附近酒馆...</p>
          <div className="skeleton-list">
            <SkeletonTavernCard />
            <SkeletonTavernCard />
            <SkeletonTavernCard />
          </div>
        </div>
      ) : visibleTaverns.length ? (
        <div className="tavern-discovery-results">
          {visibleTaverns.map((tavern, index) => {
            const isActive = tavern.id === activeTavernId
            const characterCount = getCharacterCount(tavern)
            const playMode = inferTavernPlayMode(tavern)
            return (
              <button
                key={tavern.id}
                type="button"
                className={`tavern-discovery-card${isActive ? ' is-active' : ''}`}
                onClick={() => onTavernClick?.(tavern.id, tavern)}
                aria-pressed={isActive}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="tavern-discovery-card__top">
                  <strong>{tavern.name || '未命名酒馆'}</strong>
                  <span className="tavern-discovery-status">
                    <i style={{ background: getTavernStatusColor(tavern.status) }} aria-hidden="true" />
                    {getTavernStatusLabel(tavern.status)}
                  </span>
                </div>
                <p>{getTavernDescription(tavern)}</p>
                <div className="tavern-discovery-card__meta">
                  <span
                    className={`tavern-access-chip tavern-access-chip--${getTavernAccessTone(tavern.access)}`}
                    title={getTavernAccessDescription(tavern.access)}
                  >
                    {getTavernAccessIcon(tavern.access)} {getTavernAccessLabel(tavern.access)}
                  </span>
                  <span>{getDistanceLabel(tavern)}</span>
                  <span>{characterCount} 位角色</span>
                  <span>{playMode.icon} {playMode.label}</span>
                  <span>{tavern.visit_count || 0} 次访问</span>
                </div>
                <div className="tavern-discovery-card__footer">
                  <span>{tavern.address || `${Number(tavern.lat || 0).toFixed(4)}, ${Number(tavern.lon || 0).toFixed(4)}`}</span>
                </div>
              </button>
            )
          })}
          {hiddenCount ? (
            <button type="button" className="tavern-discovery-load-more" onClick={loadMore}>
              <strong>加载更多酒馆</strong>
              <span>再显示 {Math.min(DISCOVERY_BATCH_SIZE, hiddenCount)} 间；地图最多显示 {mapMarkerLimit || mapMarkerCount} 个 marker</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="storyboard-placeholder-card tavern-discovery-empty">
          <span className="empty-icon">🏮</span>
          <strong>{totalTaverns ? '没有匹配的酒馆' : '附近还没有公开酒馆'}</strong>
          <p>{totalTaverns ? '可以放宽搜索词、入口或营业状态。' : '切换入口位置或扩大半径，再刷新附近酒馆。'}</p>
          {onQuickStartTavern ? (
            <button
              type="button"
              className="primary tavern-discovery-empty-action"
              onClick={onQuickStartTavern}
              disabled={quickStartLoading}
            >
              {quickStartLoading ? '正在进入新手酒馆...' : '先进入新手公益酒馆'}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
