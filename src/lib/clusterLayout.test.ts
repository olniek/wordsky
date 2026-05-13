import { describe, expect, it } from 'vitest'
import {
  CLUSTER_MAP_NODE_BOX_H,
  CLUSTER_MAP_NODE_BOX_W,
  CLUSTER_ORBIT_GAP,
} from './constants'
import {
  clusterOffsetsForVisible,
  maxOrbitRadiusForGrid,
  orbitRadiusForSatelliteCount,
  orbitRadiusUncapped,
} from './clusterLayout'

const minChord = CLUSTER_MAP_NODE_BOX_W + CLUSTER_ORBIT_GAP

function satelliteCenters(offsets: Record<string, { x: number; y: number }>, satellites: string[]) {
  const hw = CLUSTER_MAP_NODE_BOX_W / 2
  const hh = CLUSTER_MAP_NODE_BOX_H / 2
  return satellites.map((lang) => {
    const o = offsets[lang]
    return { x: o.x + hw, y: o.y + hh }
  })
}

describe('clusterOffsetsForVisible', () => {
  it('places only the anchor when it is the sole visible language', () => {
    const o = clusterOffsetsForVisible('EN', ['EN'])
    expect(o.EN).toEqual({ x: 0, y: 0 })
    expect(Object.keys(o)).toEqual(['EN'])
  })

  it('puts the first satellite straight above the anchor (negative y)', () => {
    const o = clusterOffsetsForVisible('EN', ['EN', 'DE'])
    expect(o.EN).toEqual({ x: 0, y: 0 })
    expect(o.DE.x).toBeCloseTo(0, 5)
    expect(o.DE.y).toBeLessThan(0)
  })

  it('spaces two satellites opposite when anchor is in the middle of the visible list', () => {
    const o = clusterOffsetsForVisible('PT', ['EN', 'PT', 'ES'])
    expect(o.PT).toEqual({ x: 0, y: 0 })
    const centers = satelliteCenters(o, ['EN', 'ES'])
    const d = Math.hypot(centers[0].x - centers[1].x, centers[0].y - centers[1].y)
    const R = orbitRadiusForSatelliteCount(2)
    expect(d).toBeCloseTo(2 * R, 5)
  })

  it('uses even angular steps for five satellites', () => {
    const visible = ['EN', 'DE', 'PT', 'ES', 'FR', 'IT'] as const
    const o = clusterOffsetsForVisible('EN', [...visible])
    const sats = visible.filter((l) => l !== 'EN')
    const centers = satelliteCenters(o, [...sats])
    const R = orbitRadiusForSatelliteCount(5)
    for (const c of centers) {
      const dx = c.x - CLUSTER_MAP_NODE_BOX_W / 2
      const dy = c.y - CLUSTER_MAP_NODE_BOX_H / 2
      expect(Math.hypot(dx, dy)).toBeCloseTo(R, 4)
    }
  })

  it('keeps orbit radius at or below the grid cap', () => {
    const cap = maxOrbitRadiusForGrid()
    for (let m = 1; m <= 6; m += 1) {
      expect(orbitRadiusForSatelliteCount(m)).toBeLessThanOrEqual(cap + 1e-6)
    }
  })

  it('when uncapped radius fits the grid, adjacent satellite centers meet minimum chord', () => {
    for (let m = 2; m <= 5; m += 1) {
      const raw = orbitRadiusUncapped(m)
      const used = orbitRadiusForSatelliteCount(m)
      if (used < raw - 1e-3) continue
      const chord = 2 * used * Math.sin(Math.PI / m)
      expect(chord).toBeGreaterThanOrEqual(minChord - 1e-3)
    }
  })
})
