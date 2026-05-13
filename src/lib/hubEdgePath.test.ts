import { describe, expect, it } from 'vitest'
import { hubEdgePath } from './hubEdgePath'

function parseCubic(path: string) {
  const match = path.match(
    /^M (-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?) C (-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/,
  )
  if (!match) throw new Error(`unexpected hub edge path: ${path}`)
  return {
    start: { x: parseFloat(match[1]), y: parseFloat(match[2]) },
    c1: { x: parseFloat(match[3]), y: parseFloat(match[4]) },
    c2: { x: parseFloat(match[5]), y: parseFloat(match[6]) },
    end: { x: parseFloat(match[7]), y: parseFloat(match[8]) },
  }
}

describe('hubEdgePath', () => {
  it('starts at the hub and ends at the satellite', () => {
    const path = hubEdgePath(0, 0, 100, 0)
    const p = parseCubic(path)
    expect(p.start).toEqual({ x: 0, y: 0 })
    expect(p.end).toEqual({ x: 100, y: 0 })
  })

  it('bows control points perpendicular to the hub→satellite vector', () => {
    const horizontal = parseCubic(hubEdgePath(0, 0, 200, 0))
    expect(Math.abs(horizontal.c1.y)).toBeGreaterThan(0)
    expect(Math.abs(horizontal.c2.y)).toBeGreaterThan(0)

    const vertical = parseCubic(hubEdgePath(0, 0, 0, 200))
    expect(Math.abs(vertical.c1.x)).toBeGreaterThan(0)
    expect(Math.abs(vertical.c2.x)).toBeGreaterThan(0)
  })

  it('keeps bow magnitude bounded so curves do not balloon for long edges', () => {
    const long = parseCubic(hubEdgePath(0, 0, 1000, 0))
    expect(Math.abs(long.c1.y)).toBeLessThanOrEqual(28)
    expect(Math.abs(long.c2.y)).toBeLessThanOrEqual(28)
  })

  it('returns a valid path string even when source and target overlap', () => {
    const path = hubEdgePath(50, 50, 50, 50)
    const p = parseCubic(path)
    expect(p.start).toEqual({ x: 50, y: 50 })
    expect(p.end).toEqual({ x: 50, y: 50 })
  })
})
