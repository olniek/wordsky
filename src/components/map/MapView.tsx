import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import ReactFlow, {
  Background,
  Controls,
  getRectOfNodes,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  getTopicWordByConcept,
  topicWords,
  type LanguageCode,
  type TopicSlug,
  type TopicWord,
} from '../../data/words'
import WordNode from './WordNode'
import BandLabelNode from './BandLabelNode'
import HubEdge from './HubEdge'
import { MapStudySheet } from './MapStudySheet'
import { MapBandStrip } from './MapBandStrip'
import {
  conceptStudyAggregateStatus,
  type StoredProgressV3,
  type WordStatus,
} from '../../lib/progress'
import {
  buildTopicGraph,
  type BandLabelNodeData,
  type BandMeta,
  type HubEdgeData,
  type WordNodeData,
} from '../../lib/graph'
import {
  FLOW_FIT_DURATION_MS,
  FLOW_FIT_MAX_ZOOM,
  FLOW_FIT_PADDING,
  FLOW_MAX_ZOOM,
  FLOW_MIN_ZOOM,
} from '../../lib/constants'
import { strings } from '../../lib/strings'

type AnyNodeData = WordNodeData | BandLabelNodeData

const nodeTypes: NodeTypes = {
  wordNode: WordNode,
  bandLabel: BandLabelNode,
}

const edgeTypes: EdgeTypes = {
  hubEdge: HubEdge,
}

function isWordNode(node: Node<AnyNodeData>): node is Node<WordNodeData> {
  return node.type === 'wordNode'
}

type MapViewProps = {
  topicSlug: TopicSlug
  anchor: LanguageCode
  translationLanguages: LanguageCode[]
  progressLanguages: LanguageCode[]
  mapVisibleLanguages: LanguageCode[]
  guidedWords: TopicWord[]
  snapshot: StoredProgressV3
  getLanguageStatus: (topic: TopicSlug, concept: string, lang: LanguageCode) => WordStatus
  setLanguageStatus: (
    topic: TopicSlug,
    concept: string,
    lang: LanguageCode,
    status: WordStatus,
  ) => void
}

export default function MapView({
  topicSlug,
  anchor,
  translationLanguages,
  progressLanguages,
  mapVisibleLanguages,
  guidedWords,
  snapshot,
  getLanguageStatus,
  setLanguageStatus,
}: MapViewProps) {
  const [mapSheetTarget, setMapSheetTarget] = useState<{
    concept: string
    language: LanguageCode
  } | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [focusedConcept, setFocusedConcept] = useState<string | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const mapStudySheetRef = useRef<HTMLElement | null>(null)
  const lastOpenedMapNodeIdRef = useRef<string | null>(null)

  const progressLanguageSet = useMemo(() => new Set(progressLanguages), [progressLanguages])

  const graph = useMemo(() => {
    return buildTopicGraph(topicSlug, {
      getStatus: (concept, lang) => {
        const raw = getLanguageStatus(topicSlug, concept, lang)
        if (!progressLanguageSet.has(lang)) {
          if (raw === 'learning') return 'learning'
          return 'known'
        }
        return raw
      },
      anchorLanguage: anchor,
      visibleLanguages: mapVisibleLanguages,
    })
  }, [anchor, getLanguageStatus, mapVisibleLanguages, progressLanguageSet, topicSlug])

  const displayed = useMemo(() => {
    if (focusedConcept == null) {
      return { nodes: graph.nodes, edges: graph.edges }
    }
    const isMatch = (concept: string | undefined) =>
      concept != null && concept === focusedConcept
    const focusedNodes: Node<AnyNodeData>[] = graph.nodes.map((node) => {
      if (node.type === 'wordNode') {
        const data = node.data as WordNodeData
        const isFocused = isMatch(data.concept)
        const cls = ['rf-focus-target', isFocused ? 'rf-focused' : 'rf-dimmed'].join(' ')
        return { ...node, className: cls }
      }
      return { ...node, className: 'rf-dimmed' }
    })
    const focusedEdges: Edge<HubEdgeData>[] = graph.edges.map((edge) => {
      const concept = edge.data?.concept
      const focused = isMatch(concept)
      return {
        ...edge,
        style: { ...(edge.style ?? {}), opacity: focused ? 1 : 0.15 },
      }
    })
    return { nodes: focusedNodes, edges: focusedEdges }
  }, [graph, focusedConcept])

  const [nodes, setNodes, onNodesChange] = useNodesState(displayed.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(displayed.edges)
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

  useEffect(() => {
    setNodes(displayed.nodes)
    setEdges(displayed.edges)
  }, [displayed, setEdges, setNodes])

  const bandsWithProgress = useMemo(() => {
    const rows = topicWords[topicSlug]
    const knownByGroup = new Map<string, number>()
    for (const w of rows) {
      if (
        conceptStudyAggregateStatus(snapshot, topicSlug, w.concept, progressLanguages) === 'known'
      ) {
        knownByGroup.set(w.mapGroup, (knownByGroup.get(w.mapGroup) ?? 0) + 1)
      }
    }
    return graph.bands.map((band) => ({
      ...band,
      knownCount: knownByGroup.get(band.groupId) ?? 0,
    }))
  }, [graph.bands, progressLanguages, snapshot, topicSlug])

  // Refit viewport on mount and when nodes change.
  useEffect(() => {
    if (!rfInstance || nodes.length === 0) return
    const handle = window.requestAnimationFrame(() => {
      const container = document.querySelector<HTMLElement>('.flow-map-stage')
      if (!container) return
      const overlay = document.querySelector<HTMLElement>('.topic-header')
      const overlayRect = overlay?.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const overlayBottomOverlap = overlayRect
        ? Math.max(0, overlayRect.bottom - containerRect.top + 16)
        : 0
      const visibleWidth = containerRect.width
      const visibleHeight = Math.max(160, containerRect.height - overlayBottomOverlap)
      const bounds = getRectOfNodes(nodes)
      const pad = 1 - FLOW_FIT_PADDING
      const zoom = Math.min(
        FLOW_FIT_MAX_ZOOM,
        (visibleWidth * pad) / Math.max(bounds.width, 1),
        (visibleHeight * pad) / Math.max(bounds.height, 1),
      )
      const cx = bounds.x + bounds.width / 2
      const cy = bounds.y + bounds.height / 2
      rfInstance.setViewport(
        {
          x: visibleWidth / 2 - cx * zoom,
          y: overlayBottomOverlap + visibleHeight / 2 - cy * zoom,
          zoom,
        },
        { duration: FLOW_FIT_DURATION_MS },
      )
    })
    return () => window.cancelAnimationFrame(handle)
  }, [nodes, rfInstance])

  const handleNodeClick = (_event: MouseEvent, node: Node<AnyNodeData>) => {
    if (!isWordNode(node)) return
    lastOpenedMapNodeIdRef.current = node.id
    setMapSheetTarget({ concept: node.data.concept, language: node.data.language })
    setFocusedConcept(node.data.concept)
    setActiveGroupId(null)
  }

  const handlePaneClick = () => {
    setMapSheetTarget(null)
    setFocusedConcept(null)
  }

  const handleJumpToBand = useCallback(
    (band: BandMeta) => {
      if (!rfInstance) return
      const container = document.querySelector<HTMLElement>('.flow-map-stage')
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const visibleWidth = containerRect.width
      const visibleHeight = Math.max(160, containerRect.height)
      const currentZoom = rfInstance.getZoom()
      const zoom = Math.min(FLOW_FIT_MAX_ZOOM, Math.max(currentZoom, 0.7))
      rfInstance.setViewport(
        {
          x: visibleWidth / 2 - band.centerX * zoom,
          y: visibleHeight / 2 - band.centerY * zoom,
          zoom,
        },
        { duration: FLOW_FIT_DURATION_MS },
      )
      setActiveGroupId(band.groupId)
      setFocusedConcept(null)
      setMapSheetTarget(null)
    },
    [rfInstance],
  )

  const trapMapSheetTabKey = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return
    const root = mapStudySheetRef.current
    if (!root) return
    const focusables = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled])'))
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement
    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    } else if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    }
  }, [])

  const mapSheetWord = mapSheetTarget
    ? getTopicWordByConcept(topicSlug, mapSheetTarget.concept)
    : undefined
  const mapSheetOpen = Boolean(mapSheetWord)

  useLayoutEffect(() => {
    if (!mapSheetOpen) {
      const nodeId = lastOpenedMapNodeIdRef.current
      lastOpenedMapNodeIdRef.current = null
      if (nodeId) {
        requestAnimationFrame(() => {
          const el = document.getElementById(`map-node-${nodeId}`)
          if (el instanceof HTMLElement) el.focus()
        })
      }
      return
    }
    requestAnimationFrame(() => {
      mapStudySheetRef.current?.querySelector<HTMLButtonElement>('.close-details')?.focus()
    })
  }, [mapSheetOpen])

  const handleMapSheetLanguageStatus = (lang: LanguageCode, status: WordStatus) => {
    if (!mapSheetTarget) return
    setLanguageStatus(topicSlug, mapSheetTarget.concept, lang, status)
    setMapSheetTarget(null)
  }

  const mapSheetGuidedIndex = mapSheetTarget
    ? guidedWords.findIndex((w) => w.concept === mapSheetTarget.concept)
    : -1
  const mapSheetStep = mapSheetGuidedIndex >= 0 ? mapSheetGuidedIndex + 1 : 1
  const mapSheetNextConcept =
    mapSheetGuidedIndex >= 0 && mapSheetGuidedIndex + 1 < guidedWords.length
      ? guidedWords[mapSheetGuidedIndex + 1]?.concept
      : undefined

  return (
    <>
      <div className="flow-container">
        {nodes.length > 0 ? (
          <>
            <p className="map-context-hint">{strings.topic.mapHint}</p>
            <MapBandStrip
              bands={bandsWithProgress}
              activeGroupId={activeGroupId}
              onJumpToBand={handleJumpToBand}
            />
            <div className="flow-map-stage">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                onInit={setRfInstance}
                fitView
                fitViewOptions={{ padding: FLOW_FIT_PADDING, maxZoom: FLOW_FIT_MAX_ZOOM }}
                minZoom={FLOW_MIN_ZOOM}
                maxZoom={FLOW_MAX_ZOOM}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                className="universe-flow"
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable
                panOnDrag
              >
                <Background color="rgba(169, 178, 255, 0.18)" gap={40} size={1.3} />
                <Controls showInteractive={false} />
              </ReactFlow>
              <div className="map-legend">
                <button
                  type="button"
                  className="map-legend-toggle"
                  aria-expanded={legendOpen}
                  aria-label={legendOpen ? undefined : strings.topic.legendToggleOpenAriaLabel}
                  onClick={() => setLegendOpen((v) => !v)}
                >
                  {legendOpen ? strings.topic.legendToggleClose : strings.topic.legendToggleOpen}
                </button>
                {legendOpen && (
                  <ul className="map-legend-list">
                    <li>
                      <span className="legend-swatch legend-swatch-direct" aria-hidden="true" />
                      {strings.topic.legendMap}
                    </li>
                    <li>
                      <span className="legend-swatch legend-swatch-unseen" aria-hidden="true" />
                      {strings.topic.legendUnseen}
                    </li>
                    <li>
                      <span className="legend-swatch legend-swatch-learning" aria-hidden="true" />
                      {strings.topic.legendLearning}
                    </li>
                    <li>
                      <span className="legend-swatch legend-swatch-known" aria-hidden="true" />
                      {strings.topic.legendKnown}
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="graph-empty-state">
            <h2>{strings.topic.emptyTitle}</h2>
            <p>{strings.topic.emptyBody}</p>
          </div>
        )}
      </div>

      {mapSheetWord && mapSheetTarget ? (
        <MapStudySheet
          sheetRef={mapStudySheetRef}
          word={mapSheetWord}
          anchor={anchor}
          translationLanguages={translationLanguages}
          studyLanguageOrder={mapVisibleLanguages}
          progressLanguageOrder={progressLanguages}
          singleMarkLanguage={mapSheetTarget.language}
          step={mapSheetStep}
          total={guidedWords.length}
          nextConceptLabel={mapSheetNextConcept}
          onClose={() => {
            setMapSheetTarget(null)
            setFocusedConcept(null)
          }}
          getLanguageStatus={(code) =>
            getLanguageStatus(topicSlug, mapSheetTarget.concept, code)
          }
          onLanguageStatus={handleMapSheetLanguageStatus}
          onKeyDown={trapMapSheetTabKey}
        />
      ) : null}
    </>
  )
}
