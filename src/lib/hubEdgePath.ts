/**
 * Angle-aware curve from the anchor hub to a satellite. Pulls the control
 * points sideways relative to the hub→satellite vector so multiple lines
 * fanning out from the same anchor don't sit on top of each other.
 */
export function hubEdgePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): string {
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const dist = Math.hypot(dx, dy) || 1
  // Unit perpendicular to the hub→satellite vector. We bow each edge to the
  // perpendicular side so adjacent satellites don't share the same midline.
  const px = -dy / dist
  const py = dx / dist
  const bow = Math.min(28, dist * 0.18)
  const c1x = sourceX + dx * 0.35 + px * bow
  const c1y = sourceY + dy * 0.35 + py * bow
  const c2x = sourceX + dx * 0.65 + px * bow
  const c2y = sourceY + dy * 0.65 + py * bow
  return `M ${sourceX},${sourceY} C ${c1x},${c1y} ${c2x},${c2y} ${targetX},${targetY}`
}
