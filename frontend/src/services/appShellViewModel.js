export function buildEntryStatusText({ autoEntering, submitting, result }) {
  if (autoEntering) {
    return '正在自动进入附近世界'
  }

  if (submitting) {
    return '正在刷新当前切片'
  }

  if (result) {
    return '当前切片已就绪'
  }

  return '等待生成附近切片'
}

export function buildHeroMetrics({
  entryStatusText,
  form,
  mapLayerOptions,
  result,
  visibleMapLayers,
  originLabel,
}) {
  const visibleLayerCount = Object.values(visibleMapLayers || {}).filter(Boolean).length
  const mapReady = Boolean(result?.world)

  return {
    visibleLayerCount,
    cards: [
      {
        id: 'entry',
        label: '当前步骤',
        value: result ? '世界已生成' : entryStatusText,
        detail: result ? `入口已锁定在 ${originLabel}` : `先确认入口：${originLabel}`,
      },
      {
        id: 'map',
        label: '现在就做',
        value: mapReady ? '直接点地图节点' : '先生成附近世界',
        detail: mapReady
          ? `地图已可点击 · 当前显示 ${visibleLayerCount} / ${mapLayerOptions.length} 个图层`
          : `${form.radius}m 半径 · ${form.mode === 'fixture' ? '离线样例' : '实时地图'}`,
      },
      {
        id: 'world',
        label: '世界规模',
        value: result ? `${result?.poi_count ?? 0} 个节点` : '等待切片生成',
        detail: result
          ? `${result.landmark_count ?? 0} 个地标 · ${result.road_count ?? 0} 条路径`
          : '生成后即可点击节点进入观察',
      },
    ],
  }
}
