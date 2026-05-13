import type { LanguageCode } from '../data/words'
import {
  CLUSTER_COL_WIDTH,
  CLUSTER_MAP_NODE_BOX_H,
  CLUSTER_MAP_NODE_BOX_W,
  CLUSTER_ORBIT_GAP,
  CLUSTER_ORBIT_GRID_PAD_X,
  CLUSTER_ORBIT_GRID_PAD_Y,
  CLUSTER_ORBIT_R_MIN,
  CLUSTER_ROW_HEIGHT,
} from './constants'

/** First satellite angle (radians): “up” on screen with y increasing downward. */
const ORBIT_ANGLE_START = -Math.PI / 2

/** Minimum center-to-center distance between adjacent satellites on the orbit. */
function minSatelliteCenterDistance(): number {
  return CLUSTER_MAP_NODE_BOX_W + CLUSTER_ORBIT_GAP
}

/** Max orbit radius so the cluster bounding box fits the inter-concept grid. */
export function maxOrbitRadiusForGrid(): number {
  const rx = (CLUSTER_COL_WIDTH - CLUSTER_ORBIT_GRID_PAD_X - CLUSTER_MAP_NODE_BOX_W) / 2
  const ry = (CLUSTER_ROW_HEIGHT - CLUSTER_ORBIT_GRID_PAD_Y - CLUSTER_MAP_NODE_BOX_H) / 2
  return Math.max(CLUSTER_ORBIT_R_MIN, Math.min(rx, ry))
}

/** Radius from anchor center to satellite centers (before cap). */
export function orbitRadiusUncapped(satelliteCount: number): number {
  const m = satelliteCount
  if (m <= 0) return 0
  if (m === 1) return CLUSTER_ORBIT_R_MIN
  const d = minSatelliteCenterDistance()
  return d / (2 * Math.sin(Math.PI / m))
}

/** Radius after clamping to the map grid budget. */
export function orbitRadiusForSatelliteCount(satelliteCount: number): number {
  const raw = orbitRadiusUncapped(satelliteCount)
  const cap = maxOrbitRadiusForGrid()
  if (satelliteCount <= 1) return Math.min(Math.max(raw, CLUSTER_ORBIT_R_MIN), cap)
  return Math.min(Math.max(raw, CLUSTER_ORBIT_R_MIN), cap)
}

/**
 * Top-left offsets relative to the anchor node’s top-left (same convention as React Flow positions).
 * Satellites sit on a circle through centers equivalent to radius R from anchor center when boxes match
 * `CLUSTER_MAP_NODE_BOX_*` (see `clusterLayout.test.ts`).
 */
export function clusterOffsetsForVisible(
  anchor: LanguageCode,
  visible: LanguageCode[],
): Record<LanguageCode, { x: number; y: number }> {
  const out = {} as Record<LanguageCode, { x: number; y: number }>
  const satellites = visible.filter((l) => l !== anchor)
  const m = satellites.length
  const R = orbitRadiusForSatelliteCount(m)

  out[anchor] = { x: 0, y: 0 }

  if (m === 0) {
    return out
  }

  const theta0 = ORBIT_ANGLE_START
  for (let i = 0; i < m; i += 1) {
    const lang = satellites[i]
    const theta = theta0 + (2 * Math.PI * i) / m
    out[lang] = {
      x: R * Math.cos(theta),
      y: R * Math.sin(theta),
    }
  }

  return out
}
