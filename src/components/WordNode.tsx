import { memo, type CSSProperties, type KeyboardEvent } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { MAP_EDGE_HANDLES, type WordNodeData } from '../lib/graph'

function WordNode({ data, selected }: NodeProps<WordNodeData>) {
  // Forward Enter / Space to the same click handler ReactFlow listens for.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  return (
    <div
      id={`map-node-${data.id}`}
      className={[
        'word-node',
        `word-node-${data.status}`,
        data.isAnchorLanguage ? 'word-node-anchor' : '',
        selected ? 'word-node-selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--node-color': data.color } as CSSProperties}
      role="button"
      tabIndex={0}
      aria-label={`${data.word} — ${data.language}`}
      onKeyDown={handleKeyDown}
    >
      {data.isAnchorLanguage ? (
        <>
          <Handle
            type="source"
            position={Position.Top}
            id={MAP_EDGE_HANDLES.top}
            className="word-handle"
            aria-hidden="true"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={MAP_EDGE_HANDLES.bottom}
            className="word-handle"
            aria-hidden="true"
          />
          <Handle
            type="source"
            position={Position.Left}
            id={MAP_EDGE_HANDLES.left}
            className="word-handle"
            aria-hidden="true"
          />
          <Handle
            type="source"
            position={Position.Right}
            id={MAP_EDGE_HANDLES.right}
            className="word-handle"
            aria-hidden="true"
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={MAP_EDGE_HANDLES.top}
            className="word-handle"
            aria-hidden="true"
          />
          <Handle
            type="target"
            position={Position.Bottom}
            id={MAP_EDGE_HANDLES.bottom}
            className="word-handle"
            aria-hidden="true"
          />
          <Handle
            type="target"
            position={Position.Left}
            id={MAP_EDGE_HANDLES.left}
            className="word-handle"
            aria-hidden="true"
          />
          <Handle
            type="target"
            position={Position.Right}
            id={MAP_EDGE_HANDLES.right}
            className="word-handle"
            aria-hidden="true"
          />
        </>
      )}
      <span className="word-language">{data.language}</span>
      <span className="word-label">{data.word}</span>
    </div>
  )
}

export default memo(WordNode)
