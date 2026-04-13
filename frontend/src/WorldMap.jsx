import { useEffect, useMemo, useRef, useState } from 'react'

const SNAPSHOT_STORAGE_KEY = 'fablemap.activeMapSnapshot'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE
const AMAP_SRC = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`

function loadAmapScript() {
  if (!AMAP_KEY) {
    return Promise.reject(new Error('缺少高德地图 Key，请检查 VITE_AMAP_KEY'))
  }

  if (AMAP_SECURITY_CODE) {
    window._AMapSecurityConfig = {
      securityJsCode: AMAP_SECURITY_CODE,
    }
  }

  if (window.AMap) {
    return Promise.resolve(window.AMap)
  }

  if (window.__fablemapAmapLoader) {
    return window.__fablemapAmapLoader
  }

  window.__fablemapAmapLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-amap-sdk="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.AMap), { once: true })
      existing.addEventListener('error', () => reject(new Error('高德地图脚本加载失败')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = AMAP_SRC
    script.async = true
    script.defer = true
    script.dataset.amapSdk = 'true'
    script.onload = () => {
      if (window.AMap) {
        resolve(window.AMap)
        return
      }
      reject(new Error('高德地图脚本已加载，但 AMap 对象不可用'))
    }
    script.onerror = () => reject(new Error('高德地图脚本加载失败'))
    document.head.appendChild(script)
  })

  return window.__fablemapAmapLoader
}

function getPoiPosition(poi) {
  const lat = Number(poi?.position?.lat)
  const lon = Number(poi?.position?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return [lon, lat]
}

function getLandmarkPosition(landmark) {
  const lat = Number(landmark?.position?.lat)
  const lon = Number(landmark?.position?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return [lon, lat]
}

function getMapCenter(world, pois, landmarks) {
  const sourceLat = Number(world?.source?.lat)
  const sourceLon = Number(world?.source?.lon)
  if (Number.isFinite(sourceLat) && Number.isFinite(sourceLon)) {
    return [sourceLon, sourceLat]
  }

  const poiCenter = pois.map(getPoiPosition).find(Boolean)
  if (poiCenter) return poiCenter

  const landmarkCenter = landmarks.map(getLandmarkPosition).find(Boolean)
  if (landmarkCenter) return landmarkCenter

  return null
}

function buildPoiMarkerContent({ poi, isActive, familiarity }) {
  const label = poi?.fantasy_name || poi?.real_name || poi?.id || '未命名地点'
  return `
    <div style="
      display:flex;
      align-items:center;
      gap:8px;
      padding:8px 12px;
      border-radius:999px;
      border:1px solid ${isActive ? 'rgba(59,130,246,0.95)' : 'rgba(15,23,42,0.22)'};
      background:${isActive ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : 'rgba(255,255,255,0.96)'};
      color:${isActive ? '#eff6ff' : '#0f172a'};
      box-shadow:0 10px 24px rgba(15,23,42,0.18);
      white-space:nowrap;
      font:600 12px/1.2 Segoe UI,Arial,sans-serif;
    ">
      <span style="
        width:10px;
        height:10px;
        border-radius:50%;
        background:${isActive ? '#fef3c7' : '#2563eb'};
        box-shadow:0 0 0 3px ${isActive ? 'rgba(255,255,255,0.18)' : 'rgba(37,99,235,0.16)'};
      "></span>
      <span>${label}</span>
      <span style="opacity:${familiarity > 0 ? '1' : '0.68'};font-weight:700;">熟悉度 ${familiarity}</span>
    </div>
  `
}

function getSnapshotId(world) {
  const raw = world?.slice_id || world?.id || world?.source?.label || world?.source?.name || 'default'
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'default'
}

function collectVisibleTiles(container) {
  if (!container) return []

  const containerRect = container.getBoundingClientRect()
  const images = Array.from(container.querySelectorAll('img'))

  return images
    .map((image) => {
      const src = image.currentSrc || image.src || ''
      if (!/^https?:\/\//i.test(src)) return null

      const rect = image.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)
      if (width <= 0 || height <= 0) return null

      return {
        src,
        left: Math.round(rect.left - containerRect.left),
        top: Math.round(rect.top - containerRect.top),
        width,
        height,
      }
    })
    .filter(Boolean)
}

function buildSnapshotPayload({ world, originLabel, map, container, tiles }) {
  const center = map?.getCenter?.()
  const zoom = map?.getZoom?.()
  const size = map?.getSize?.()

  return {
    world_id: world?.slice_id || world?.id || null,
    origin_label: originLabel || '',
    captured_from: 'amap-dom',
    captured_at: new Date().toISOString(),
    center: center
      ? {
          lng: Number(center.lng),
          lat: Number(center.lat),
        }
      : null,
    zoom: Number.isFinite(Number(zoom)) ? Number(zoom) : null,
    width: Math.round(size?.width || container?.clientWidth || 0),
    height: Math.round(size?.height || container?.clientHeight || 0),
    tiles,
  }
}

function renderSnapshotTiles(snapshotManifest) {
  const tiles = snapshotManifest?.tiles || []
  return tiles.map((tile, index) => (
    <img
      key={`${tile.file || tile.source || 'tile'}-${index}`}
      src={tile.file}
      alt="snapshot tile"
      style={{
        position: 'absolute',
        left: tile.left || 0,
        top: tile.top || 0,
        width: tile.width || 'auto',
        height: tile.height || 'auto',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  ))
}

export default function WorldMap({
  world,
  onPoiClick,
  activePoiId,
  familiarityMap,
  originLabel,
  ghostTraces = [],
  visibleLayers,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const poiMarkersRef = useRef([])
  const landmarkMarkersRef = useRef([])
  const snapshotId = useMemo(() => getSnapshotId(world), [world])
  const [sdkReady, setSdkReady] = useState(Boolean(window.AMap))
  const [sdkError, setSdkError] = useState('')
  const [selectedPoi, setSelectedPoi] = useState(null)
  const [snapshotManifest, setSnapshotManifest] = useState(null)
  const [snapshotStatus, setSnapshotStatus] = useState('未发现本地快照')
  const [snapshotBusy, setSnapshotBusy] = useState(false)
  const [preferSnapshot, setPreferSnapshot] = useState(() => {
    try {
      return window.localStorage.getItem(SNAPSHOT_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const pois = world?.pois || []
  const landmarks = world?.landmarks || []
  const fam = familiarityMap || {}
  const layers = visibleLayers || {}

  const center = useMemo(() => getMapCenter(world, pois, landmarks), [world, pois, landmarks])
  const usingSnapshot = preferSnapshot && Boolean(snapshotManifest)

  useEffect(() => {
    let cancelled = false

    loadAmapScript()
      .then(() => {
        if (cancelled) return
        setSdkReady(true)
        setSdkError('')
      })
      .catch((error) => {
        if (cancelled) return
        setSdkError(error.message || '高德地图初始化失败')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadSnapshotManifest() {
      try {
        const response = await fetch(`/map-snapshots/${snapshotId}/manifest.json`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('manifest not found')
        }
        const manifest = await response.json()
        if (cancelled) return
        setSnapshotManifest(manifest)
        setSnapshotStatus(`已加载本地快照 · ${manifest.tiles?.length || 0} 张瓦片`)
      } catch {
        if (cancelled) return
        setSnapshotManifest(null)
        setSnapshotStatus('未发现本地快照')
      }
    }

    loadSnapshotManifest()

    return () => {
      cancelled = true
    }
  }, [snapshotId])

  useEffect(() => {
    try {
      window.localStorage.setItem(SNAPSHOT_STORAGE_KEY, preferSnapshot ? '1' : '0')
    } catch {
      // ignore persistence failures
    }
  }, [preferSnapshot])

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !center || mapRef.current) return

    const map = new window.AMap.Map(containerRef.current, {
      viewMode: '3D',
      zoom: 16,
      center,
      pitch: 35,
      resizeEnable: true,
      mapStyle: 'amap://styles/darkblue',
    })

    mapRef.current = map

    return () => {
      poiMarkersRef.current.forEach((marker) => marker.setMap(null))
      landmarkMarkersRef.current.forEach((marker) => marker.setMap(null))
      poiMarkersRef.current = []
      landmarkMarkersRef.current = []
      map.destroy()
      mapRef.current = null
    }
  }, [sdkReady, center])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !center) return
    map.setCenter(center)
  }, [center])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    poiMarkersRef.current.forEach((marker) => marker.setMap(null))
    poiMarkersRef.current = []

    if (layers.pois === false) return

    const markers = pois
      .map((poi) => {
        const position = getPoiPosition(poi)
        if (!position) return null

        const familiarity = fam[poi.id] ?? 0
        const marker = new window.AMap.Marker({
          position,
          anchor: 'bottom-center',
          offset: new window.AMap.Pixel(0, 0),
          content: buildPoiMarkerContent({
            poi,
            isActive: poi.id === activePoiId,
            familiarity,
          }),
        })

        marker.on('click', () => {
          setSelectedPoi(poi)
          if (onPoiClick) {
            onPoiClick(poi.id, poi)
          }
        })

        return marker
      })
      .filter(Boolean)

    poiMarkersRef.current = markers
    if (markers.length) {
      map.add(markers)
      map.setFitView(markers, false, [80, 80, 80, 80], 16)
    }
  }, [pois, fam, activePoiId, onPoiClick, layers.pois])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    landmarkMarkersRef.current.forEach((marker) => marker.setMap(null))
    landmarkMarkersRef.current = []

    if (layers.landmarks === false) return

    const markers = landmarks
      .map((landmark) => {
        const position = getLandmarkPosition(landmark)
        if (!position) return null

        return new window.AMap.Marker({
          position,
          anchor: 'bottom-center',
          offset: new window.AMap.Pixel(0, 0),
          content: `
            <div style="
              display:flex;
              align-items:center;
              gap:6px;
              padding:6px 10px;
              border-radius:999px;
              background:rgba(15,23,42,0.88);
              border:1px solid rgba(251,191,36,0.42);
              color:#fef3c7;
              box-shadow:0 8px 20px rgba(15,23,42,0.2);
              white-space:nowrap;
              font:600 12px/1.2 Segoe UI,Arial,sans-serif;
            ">
              <span>◆</span>
              <span>${landmark?.name || landmark?.id || '地标'}</span>
            </div>
          `,
        })
      })
      .filter(Boolean)

    landmarkMarkersRef.current = markers
    if (markers.length) {
      map.add(markers)
    }
  }, [landmarks, layers.landmarks])

  useEffect(() => {
    if (!selectedPoi && activePoiId) {
      const activePoi = pois.find((poi) => poi.id === activePoiId) || null
      if (activePoi) {
        setSelectedPoi(activePoi)
      }
      return
    }

    if (selectedPoi?.id && !pois.find((poi) => poi.id === selectedPoi.id)) {
      setSelectedPoi(null)
    }
  }, [activePoiId, pois, selectedPoi])

  if (!center) {
    return (
      <div className="map-empty">
        <p>当前切片缺少可用经纬度，暂时无法加载高德地图。</p>
      </div>
    )
  }

  if (sdkError && !usingSnapshot) {
    return (
      <div className="map-empty">
        <p>{sdkError}</p>
      </div>
    )
  }

  async function captureSnapshot() {
    const container = containerRef.current
    const map = mapRef.current
    if (!container || !map) {
      setSnapshotStatus('地图尚未完成加载，暂时无法抓取快照')
      return
    }

    const tiles = collectVisibleTiles(container)
    if (!tiles.length) {
      setSnapshotStatus('当前视野未抓到可下载瓦片，请稍后重试')
      return
    }

    setSnapshotBusy(true)
    setSnapshotStatus(`正在保存快照 · ${tiles.length} 张瓦片`)

    try {
      const response = await fetch(`/api/map/snapshot/${snapshotId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildSnapshotPayload({
          world,
          originLabel,
          map,
          container,
          tiles,
        })),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.detail || '地图快照保存失败')
      }

      setSnapshotManifest(payload)
      setPreferSnapshot(true)
      setSnapshotStatus(`本地快照已保存 · ${payload.tiles?.length || 0} 张瓦片`)
    } catch (error) {
      setSnapshotStatus(error.message || '地图快照保存失败')
    } finally {
      setSnapshotBusy(false)
    }
  }

  return (
    <div className="world-map-wrap">
      <div
        ref={containerRef}
        className="amap-container"
        style={{
          width: '100%',
          minHeight: '600px',
          height: 'min(72vh, 720px)',
          opacity: usingSnapshot ? 0.01 : 1,
          pointerEvents: usingSnapshot ? 'none' : 'auto',
        }}
      />

      {usingSnapshot ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            overflow: 'hidden',
            background: '#020617',
          }}
        >
          {renderSnapshotTiles(snapshotManifest)}
        </div>
      ) : null}

      <div
        className="amap-topbar"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 11,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 16,
            background: 'rgba(15,23,42,0.72)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          <strong style={{ display: 'block', marginBottom: 6 }}>
            {usingSnapshot ? '本地地图快照' : '高德地图已接入'}
          </strong>
          <span style={{ fontSize: 13, color: '#cbd5e1', display: 'block', marginBottom: 10 }}>
            {originLabel || '当前地点'} · {pois.length} 个地点 · {landmarks.length} 个地标
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={captureSnapshot}
              disabled={snapshotBusy || !sdkReady}
              style={{
                pointerEvents: 'auto',
                border: '1px solid rgba(59,130,246,0.45)',
                background: 'rgba(37,99,235,0.22)',
                color: '#dbeafe',
                borderRadius: 999,
                padding: '6px 12px',
                cursor: snapshotBusy || !sdkReady ? 'not-allowed' : 'pointer',
              }}
            >
              {snapshotBusy ? '保存中...' : '抓取当前快照'}
            </button>
            <button
              type="button"
              onClick={() => setPreferSnapshot((current) => !current)}
              disabled={!snapshotManifest}
              style={{
                pointerEvents: 'auto',
                border: '1px solid rgba(251,191,36,0.35)',
                background: snapshotManifest ? 'rgba(251,191,36,0.16)' : 'rgba(148,163,184,0.12)',
                color: snapshotManifest ? '#fef3c7' : '#94a3b8',
                borderRadius: 999,
                padding: '6px 12px',
                cursor: snapshotManifest ? 'pointer' : 'not-allowed',
              }}
            >
              {usingSnapshot ? '切回在线地图' : '优先本地快照'}
            </button>
          </div>
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 16,
            background: 'rgba(15,23,42,0.72)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          <strong style={{ display: 'block', marginBottom: 6 }}>状态</strong>
          <span style={{ fontSize: 13, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
            SDK {sdkReady ? '已就绪' : '加载中'} · 残影 {ghostTraces.length}
          </span>
          <span style={{ fontSize: 13, color: '#cbd5e1', display: 'block' }}>{snapshotStatus}</span>
          <span style={{ fontSize: 12, color: '#93c5fd', display: 'block', marginTop: 6 }}>
            快照 ID · {snapshotId}
          </span>
        </div>
      </div>

      {selectedPoi ? (
        <div
          className="amap-sidecar"
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            zIndex: 11,
            maxWidth: 360,
            padding: 16,
            borderRadius: 18,
            background: 'rgba(15,23,42,0.84)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(14px)',
            color: '#e2e8f0',
          }}
        >
          <div style={{ fontSize: 12, color: '#93c5fd', marginBottom: 8 }}>当前地点</div>
          <strong style={{ display: 'block', fontSize: 18, marginBottom: 6 }}>
            {selectedPoi.fantasy_name || selectedPoi.real_name || selectedPoi.id}
          </strong>
          <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 10 }}>
            {selectedPoi.real_name || '未命名现实地点'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span className="storyboard-chip">熟悉度 {fam[selectedPoi.id] ?? 0}</span>
            {selectedPoi.faction_alignment ? <span className="storyboard-chip">{selectedPoi.faction_alignment}</span> : null}
            {selectedPoi.fantasy_type ? <span className="storyboard-chip">{selectedPoi.fantasy_type}</span> : null}
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#e2e8f0' }}>
            {selectedPoi.satire_hook || selectedPoi.emotion_hook || '这个地点暂时还没有公开钩子。'}
          </p>
        </div>
      ) : null}
    </div>
  )
}
