import { memo } from 'react'
import { BaseEdge, type EdgeProps } from 'reactflow'
import { languageColors } from '../data/words'
import type { HubEdgeData } from '../lib/graph'
import { hubEdgePath } from '../lib/hubEdgePath'

function HubEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style,
}: EdgeProps<HubEdgeData>) {
  const targetLang = data?.targetLanguage
  const baseColor = targetLang ? languageColors[targetLang] : '#c78bff'
  const path = hubEdgePath(sourceX, sourceY, targetX, targetY)
  const dimmed = style?.opacity != null && Number(style.opacity) < 0.6

  return (
    <g className={`hub-edge ${dimmed ? 'hub-edge-dimmed' : ''}`}>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: baseColor,
          strokeWidth: 1.75,
          strokeOpacity: 0.78,
          fill: 'none',
          /* Softer glow so it stays visually behind cards without bleeding over labels. */
          filter: `drop-shadow(0 0 4px ${baseColor}44)`,
          ...style,
        }}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={3.5}
        fill={baseColor}
        stroke="rgba(8, 13, 30, 0.85)"
        strokeWidth={1}
        opacity={style?.opacity != null ? Number(style.opacity) : 0.92}
      />
    </g>
  )
}

export default memo(HubEdge)
