import { type Edge, type Node } from 'reactflow'
import {
  MAP_GROUP_ORDER,
  getGuidedTopicWords,
  languageColors,
  languageOrder,
  topicWords,
  type TopicWord,
  type LanguageCode,
  type TopicSlug,
} from '../data/words'
import { clusterOffsetsForVisible } from './clusterLayout'
import { displayWordForm } from './wordForm'
import {
  CLUSTER_BAND_LABEL_OFFSET_X,
  CLUSTER_BAND_LABEL_OFFSET_Y,
  CLUSTER_COLUMNS,
  CLUSTER_COL_WIDTH,
  CLUSTER_GROUP_GAP_Y,
  CLUSTER_ORIGIN_X,
  CLUSTER_ORIGIN_Y,
  CLUSTER_ROW_HEIGHT,
  CLUSTER_ZIGZAG_OFFSET,
} from './constants'

export type EdgeKind = 'direct'

export type WordStatusFlag = 'unseen' | 'learning' | 'known'

export type WordNodeData = {
  id: string
  word: string
  concept: string
  language: LanguageCode
  related: string[]
  color: string
  status: WordStatusFlag
  /** True for the node matching the learner's study-language anchor — centered on the Map cluster. */
  isAnchorLanguage: boolean
}

export type BandLabelNodeData = {
  kind: 'bandLabel'
  /** Raw `mapGroup` id from topic data. */
  groupId: string
  /** Humanized label shown on the canvas (e.g. `pets` → `Pets`). */
  label: string
  /** Count of concepts in this band, useful for future progress chips. */
  count: number
}

export type HubEdgeData = {
  kind: 'direct'
  /** Target language for this edge — drives stroke color in the custom edge. */
  targetLanguage: LanguageCode
  /** Concept id, so focus mode can dim non-focused edges. */
  concept: string
}

export type BandMeta = {
  groupId: string
  label: string
  count: number
  /** Topic-coordinates center of the band (canvas units, before viewport). */
  centerX: number
  centerY: number
  /** Y coordinate of the top of the first row in this band (canvas units). */
  topY: number
}

export type TopicGraph = {
  nodes: Node<WordNodeData | BandLabelNodeData>[]
  edges: Edge<HubEdgeData>[]
  bands: BandMeta[]
}

export type BuildTopicGraphOptions = {
  focusConcept?: string
  neighborsPerSide?: number
  getStatus?: (concept: string, lang: LanguageCode) => WordStatusFlag
  /** Hub for translation edges; defaults to EN for callers that omit it (e.g. tests). */
  anchorLanguage?: LanguageCode
  /**
   * When set, only these languages (after normalization) appear on the Map.
   * When omitted, all `languageOrder` codes are shown.
   */
  visibleLanguages?: LanguageCode[]
}

/** Canonical-order list for the Map: anchor plus any valid codes from `picked`. */
export function mapVisibleLanguageCodes(anchor: LanguageCode, picked: LanguageCode[]): LanguageCode[] {
  return languageOrder.filter((c) => c === anchor || picked.includes(c))
}

function resolveGraphVisibleLanguages(
  anchor: LanguageCode,
  visibleLanguages: LanguageCode[] | undefined,
): LanguageCode[] {
  if (visibleLanguages === undefined) {
    return [...languageOrder]
  }
  const valid = new Set(languageOrder.filter((c) => visibleLanguages.includes(c)))
  valid.add(anchor)
  return languageOrder.filter((c) => valid.has(c))
}

const pairKey = (a: string, b: string) => [a, b].sort().join('::')

/** React Flow `Handle` ids on `WordNode`: hub uses matching `sourceHandle`, satellites use `targetHandle`. */
export const MAP_EDGE_HANDLES = {
  top: 'map-edge-top',
  bottom: 'map-edge-bottom',
  left: 'map-edge-left',
  right: 'map-edge-right',
} as const

/**
 * Given hub→satellite offset in cluster space (same units as `clusterOffsetsForVisible`),
 * pick the side of each box that faces the other so edges run outside the cards, not through labels.
 */
export function mapEdgeHandlesForOffset(dx: number, dy: number): {
  sourceHandle: string
  targetHandle: string
} {
  const pickPort = (vx: number, vy: number): string => {
    if (Math.abs(vy) >= Math.abs(vx)) {
      return vy < 0 ? MAP_EDGE_HANDLES.top : MAP_EDGE_HANDLES.bottom
    }
    return vx < 0 ? MAP_EDGE_HANDLES.left : MAP_EDGE_HANDLES.right
  }
  return {
    sourceHandle: pickPort(dx, dy),
    targetHandle: pickPort(-dx, -dy),
  }
}

function createHubEdge(
  source: string,
  target: string,
  id: string,
  concept: string,
  targetLanguage: LanguageCode,
  handles: { sourceHandle: string; targetHandle: string },
): Edge<HubEdgeData> {
  return {
    id,
    source,
    target,
    sourceHandle: handles.sourceHandle,
    targetHandle: handles.targetHandle,
    type: 'hubEdge',
    animated: false,
    data: { kind: 'direct', targetLanguage, concept },
  }
}

/** Turn a `mapGroup` id (e.g. `farm`, `everyday-nouns`) into a learner-facing label. */
export function humanizeMapGroup(groupId: string): string {
  if (!groupId) return ''
  return groupId
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildNodeId(concept: string, lang: LanguageCode): string {
  return `${concept}-${lang.toLowerCase()}`
}

function sortRowsByMapGroup(topic: TopicSlug, rows: TopicWord[]): TopicWord[] {
  const order = MAP_GROUP_ORDER[topic]
  const rank = (g: string) => {
    const i = order.indexOf(g)
    return i === -1 ? 999 : i
  }
  return [...rows].sort((a, b) => {
    const d = rank(a.mapGroup) - rank(b.mapGroup)
    if (d !== 0) return d
    return a.concept.localeCompare(b.concept)
  })
}

type TopicPlacements = {
  placements: { row: TopicWord; centerX: number; centerY: number }[]
  bands: BandMeta[]
}

/** Lay out concept clusters in vertical bands: tight grid inside each `mapGroup`, gap between groups. */
function layoutTopicPlacements(sortedRows: TopicWord[]): TopicPlacements {
  const blocks: TopicWord[][] = []
  let current: TopicWord[] = []
  let lastGroup: string | null = null
  for (const row of sortedRows) {
    if (lastGroup !== null && row.mapGroup !== lastGroup) {
      blocks.push(current)
      current = []
    }
    current.push(row)
    lastGroup = row.mapGroup
  }
  if (current.length) blocks.push(current)

  let cursorY = CLUSTER_ORIGIN_Y
  const placements: { row: TopicWord; centerX: number; centerY: number }[] = []
  const bands: BandMeta[] = []

  for (const block of blocks) {
    const blockTopY = cursorY
    const rowsUsed = Math.ceil(block.length / CLUSTER_COLUMNS)
    const colsUsed = Math.min(CLUSTER_COLUMNS, block.length)
    for (let idx = 0; idx < block.length; idx += 1) {
      const col = idx % CLUSTER_COLUMNS
      const rowInBlock = Math.floor(idx / CLUSTER_COLUMNS)
      const centerX =
        CLUSTER_ORIGIN_X + col * CLUSTER_COL_WIDTH + (rowInBlock % 2 ? CLUSTER_ZIGZAG_OFFSET : 0)
      const centerY = cursorY + rowInBlock * CLUSTER_ROW_HEIGHT
      placements.push({ row: block[idx], centerX, centerY })
    }

    const groupId = block[0]?.mapGroup ?? ''
    const bandCenterX = CLUSTER_ORIGIN_X + ((colsUsed - 1) * CLUSTER_COL_WIDTH) / 2
    const bandCenterY = blockTopY + ((rowsUsed - 1) * CLUSTER_ROW_HEIGHT) / 2
    bands.push({
      groupId,
      label: humanizeMapGroup(groupId),
      count: block.length,
      centerX: bandCenterX,
      centerY: bandCenterY,
      topY: blockTopY,
    })

    cursorY += rowsUsed * CLUSTER_ROW_HEIGHT + CLUSTER_GROUP_GAP_Y
  }

  return { placements, bands }
}

function bandLabelNodeId(groupId: string): string {
  return `band-label-${groupId}`
}

function createBandLabelNode(
  band: BandMeta,
): Node<BandLabelNodeData> {
  return {
    id: bandLabelNodeId(band.groupId),
    type: 'bandLabel',
    position: {
      x: CLUSTER_ORIGIN_X - CLUSTER_BAND_LABEL_OFFSET_X,
      y: band.topY - CLUSTER_BAND_LABEL_OFFSET_Y,
    },
    data: {
      kind: 'bandLabel',
      groupId: band.groupId,
      label: band.label,
      count: band.count,
    },
    draggable: false,
    selectable: false,
    focusable: false,
  }
}

function buildClusterNodesAt(
  row: TopicWord,
  centerX: number,
  centerY: number,
  getStatusForLang: (lang: LanguageCode) => WordStatusFlag,
  anchor: LanguageCode,
  visible: LanguageCode[],
): Node<WordNodeData>[] {
  const offsets = clusterOffsetsForVisible(anchor, visible)
  return visible.map((lang) => {
    const offset = offsets[lang]
    const id = buildNodeId(row.concept, lang)
    return {
      id,
      type: 'wordNode',
      position: { x: centerX + offset.x, y: centerY + offset.y },
      data: {
        id,
        word: displayWordForm(row, lang),
        concept: row.concept,
        language: lang,
        related: visible.filter((code) => code !== lang).map((code) => displayWordForm(row, code)),
        color: languageColors[lang],
        status: getStatusForLang(lang),
        isAnchorLanguage: lang === anchor,
      },
    }
  })
}

export function buildTopicGraph(topic: TopicSlug, options: BuildTopicGraphOptions = {}): TopicGraph {
  const { focusConcept, neighborsPerSide = 1, getStatus, anchorLanguage = 'EN', visibleLanguages } = options
  const rows = selectRows(topic, focusConcept, neighborsPerSide)
  if (rows.length === 0) return { nodes: [], edges: [], bands: [] }

  const sorted = sortRowsByMapGroup(topic, rows)
  const { placements, bands } = layoutTopicPlacements(sorted)
  const visible = resolveGraphVisibleLanguages(anchorLanguage, visibleLanguages)

  const nodes: Node<WordNodeData | BandLabelNodeData>[] = []
  const edges: Edge<HubEdgeData>[] = []
  const seen = new Set<string>()

  for (const band of bands) {
    nodes.push(createBandLabelNode(band))
  }

  const addEdge = (
    source: string,
    target: string,
    concept: string,
    targetLanguage: LanguageCode,
    handles: { sourceHandle: string; targetHandle: string },
  ) => {
    const id = `direct::${pairKey(source, target)}`
    if (seen.has(id)) return
    seen.add(id)
    edges.push(createHubEdge(source, target, id, concept, targetLanguage, handles))
  }

  const offsets = clusterOffsetsForVisible(anchorLanguage, visible)
  for (const { row, centerX, centerY } of placements) {
    nodes.push(
      ...buildClusterNodesAt(
        row,
        centerX,
        centerY,
        (lang) => getStatus?.(row.concept, lang) ?? 'unseen',
        anchorLanguage,
        visible,
      ),
    )
    const hubId = buildNodeId(row.concept, anchorLanguage)
    for (const lang of visible) {
      if (lang === anchorLanguage) continue
      const { x, y } = offsets[lang]
      addEdge(hubId, buildNodeId(row.concept, lang), row.concept, lang, mapEdgeHandlesForOffset(x, y))
    }
  }

  return { nodes, edges, bands }
}

function selectRows(topic: TopicSlug, focusConcept: string | undefined, neighborsPerSide: number): TopicWord[] {
  const all = sortRowsByMapGroup(topic, topicWords[topic])
  if (!focusConcept) return all
  const ordered = getGuidedTopicWords(topic)
  const idx = ordered.findIndex((row) => row.concept === focusConcept)
  if (idx < 0) return []
  const start = Math.max(0, idx - neighborsPerSide)
  const end = Math.min(ordered.length - 1, idx + neighborsPerSide)
  const slice = ordered.slice(start, end + 1)
  return sortRowsByMapGroup(topic, slice)
}
