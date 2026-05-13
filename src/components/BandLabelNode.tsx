import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import type { BandLabelNodeData } from '../lib/graph'

function BandLabelNode({ data }: NodeProps<BandLabelNodeData>) {
  return (
    <div className="map-band-label" aria-hidden="true">
      <span className="map-band-label-tick" />
      <span className="map-band-label-text">{data.label}</span>
    </div>
  )
}

export default memo(BandLabelNode)
