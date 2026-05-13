import type { Node } from 'reactflow'
import { describe, expect, it } from 'vitest'
import { MAP_GROUP_ORDER, languageOrder, topicWords, type TopicSlug } from '../data/words'
import {
  buildTopicGraph,
  humanizeMapGroup,
  mapEdgeHandlesForOffset,
  mapVisibleLanguageCodes,
  MAP_EDGE_HANDLES,
  type BandLabelNodeData,
  type WordNodeData,
} from './graph'

function buildNodeId(concept: string, lang: string) {
  return `${concept}-${lang.toLowerCase()}`
}

function wordNodesOf(
  nodes: ReturnType<typeof buildTopicGraph>['nodes'],
): Node<WordNodeData>[] {
  return nodes.filter((n): n is Node<WordNodeData> => n.type === 'wordNode')
}

function bandLabelNodesOf(
  nodes: ReturnType<typeof buildTopicGraph>['nodes'],
): Node<BandLabelNodeData>[] {
  return nodes.filter((n): n is Node<BandLabelNodeData> => n.type === 'bandLabel')
}

describe('buildTopicGraph', () => {
  it('creates one word node per language per word for a topic (band labels are separate)', () => {
    const slug: TopicSlug = 'family'
    const { nodes } = buildTopicGraph(slug)
    const expected = topicWords[slug].length * languageOrder.length
    expect(wordNodesOf(nodes)).toHaveLength(expected)
  })

  it('creates one word node per language per word for the large everyday-nouns topic', () => {
    const slug: TopicSlug = 'everyday-nouns'
    const { nodes } = buildTopicGraph(slug)
    expect(wordNodesOf(nodes)).toHaveLength(topicWords[slug].length * languageOrder.length)
  })

  it('adds hub-to-L2 direct edges from the anchor language only for the same concept', () => {
    const { edges, nodes } = buildTopicGraph('family')
    const fatherEn = buildNodeId('father', 'EN')
    const fatherDe = buildNodeId('father', 'DE')
    const motherEn = buildNodeId('mother', 'EN')

    const enToDeFather = edges.find(
      (e) =>
        (e.source === fatherEn && e.target === fatherDe) ||
        (e.source === fatherDe && e.target === fatherEn),
    )
    expect(enToDeFather).toBeDefined()
    expect(enToDeFather?.sourceHandle).toBeDefined()
    expect(enToDeFather?.targetHandle).toBeDefined()
    expect(enToDeFather?.data?.kind).toBe('direct')
    expect(enToDeFather?.data?.concept).toBe('father')
    expect(['EN', 'DE']).toContain(enToDeFather?.data?.targetLanguage)
    expect(enToDeFather?.type).toBe('hubEdge')

    const crossConcept = edges.some(
      (e) =>
        (e.source === fatherEn && e.target === motherEn) ||
        (e.source === motherEn && e.target === fatherEn),
    )
    expect(crossConcept).toBe(false)

    expect(wordNodesOf(nodes).every((n) => n.type === 'wordNode')).toBe(true)
  })

  it('uses anchor language as graph hub when set', () => {
    const { edges } = buildTopicGraph('family', { anchorLanguage: 'DE' })
    const fatherDe = buildNodeId('father', 'DE')
    const fatherEn = buildNodeId('father', 'EN')
    const fatherFr = buildNodeId('father', 'FR')

    const deToEn = edges.find(
      (e) =>
        (e.source === fatherDe && e.target === fatherEn) ||
        (e.source === fatherEn && e.target === fatherDe),
    )
    expect(deToEn).toBeDefined()

    const enToFr = edges.find(
      (e) =>
        (e.source === fatherEn && e.target === fatherFr) ||
        (e.source === fatherFr && e.target === fatherEn),
    )
    expect(enToFr).toBeUndefined()
  })

  it('marks anchor language on node data', () => {
    const { nodes } = buildTopicGraph('family', { anchorLanguage: 'FR' })
    const wordNodes = wordNodesOf(nodes)
    const fatherFr = wordNodes.find((n) => n.id === buildNodeId('father', 'FR'))
    expect(fatherFr?.data.isAnchorLanguage).toBe(true)
    const fatherEn = wordNodes.find((n) => n.id === buildNodeId('father', 'EN'))
    expect(fatherEn?.data.isAnchorLanguage).toBe(false)
  })

  it('passes getStatus into node data per language', () => {
    const { nodes } = buildTopicGraph('family', {
      getStatus: (concept, lang) =>
        concept === 'father' && lang === 'ES' ? 'known' : 'unseen',
    })
    const wordNodes = wordNodesOf(nodes)
    const fatherEs = wordNodes.find((n) => n.id === buildNodeId('father', 'ES'))
    expect(fatherEs?.data.status).toBe('known')
    const fatherEn = wordNodes.find((n) => n.id === buildNodeId('father', 'EN'))
    expect(fatherEn?.data.status).toBe('unseen')
    const motherNodes = wordNodes.filter((n) => n.data.concept === 'mother')
    expect(motherNodes.every((n) => n.data.status === 'unseen')).toBe(true)
  })

  it('returns empty graph for unknown focus concept', () => {
    const out = buildTopicGraph('family', { focusConcept: '__no_such_concept__', neighborsPerSide: 1 })
    expect(out.nodes).toHaveLength(0)
    expect(out.edges).toHaveLength(0)
  })

  it('limits rows when focusConcept and neighborsPerSide are set', () => {
    const concepts = topicWords.family.map((w) => w.concept)
    expect(concepts.includes('mother')).toBe(true)
    const { nodes } = buildTopicGraph('family', { focusConcept: 'mother', neighborsPerSide: 0 })
    const wordNodes = wordNodesOf(nodes)
    expect(wordNodes.length).toBe(languageOrder.length)
    const seenConcepts = new Set(
      wordNodes.map((n) => (n.data as { concept: string }).concept),
    )
    expect(seenConcepts).toEqual(new Set(['mother']))
  })

  it('with visibleLanguages, creates only those word nodes per concept and hub edges among them', () => {
    const { nodes, edges } = buildTopicGraph('family', {
      anchorLanguage: 'EN',
      visibleLanguages: ['EN', 'FR'],
    })
    expect(wordNodesOf(nodes)).toHaveLength(topicWords.family.length * 2)
    expect(nodes.some((n) => n.id === buildNodeId('father', 'DE'))).toBe(false)
    expect(nodes.some((n) => n.id === buildNodeId('father', 'EN'))).toBe(true)
    expect(nodes.some((n) => n.id === buildNodeId('father', 'FR'))).toBe(true)

    const fatherEn = buildNodeId('father', 'EN')
    const fatherFr = buildNodeId('father', 'FR')
    const enToFr = edges.find(
      (e) =>
        (e.source === fatherEn && e.target === fatherFr) ||
        (e.source === fatherFr && e.target === fatherEn),
    )
    expect(enToFr).toBeDefined()
    expect(enToFr?.data?.targetLanguage).toBe('FR')
    expect(edges).toHaveLength(topicWords.family.length)
  })

  it('mapVisibleLanguageCodes keeps canonical order', () => {
    expect(mapVisibleLanguageCodes('EN', ['FR', 'DE'])).toEqual(['EN', 'DE', 'FR'])
  })

  it('emits one non-interactive band label node per contiguous mapGroup', () => {
    const { nodes, bands } = buildTopicGraph('family')
    const bandLabels = bandLabelNodesOf(nodes)
    expect(bandLabels).toHaveLength(2)
    expect(bandLabels.every((n) => n.selectable === false)).toBe(true)
    expect(bandLabels.every((n) => n.draggable === false)).toBe(true)
    expect(bandLabels.map((n) => n.data.groupId)).toEqual(['core', 'extended'])
    expect(bands.map((b) => b.groupId)).toEqual(['core', 'extended'])
    expect(bands[0].label).toBe('Core')
    expect(bands[1].label).toBe('Extended')
  })

  it('band metadata follows MAP_GROUP_ORDER for a topic', () => {
    const slug: TopicSlug = 'animals'
    const { bands } = buildTopicGraph(slug)
    const expected = MAP_GROUP_ORDER[slug].filter((id) =>
      topicWords[slug].some((w) => w.mapGroup === id),
    )
    expect(bands.map((b) => b.groupId)).toEqual([...expected])
    for (const band of bands) {
      const concepts = topicWords[slug].filter((w) => w.mapGroup === band.groupId)
      expect(band.count).toBe(concepts.length)
      expect(band.label).toBe(humanizeMapGroup(band.groupId))
    }
  })

  it('humanizeMapGroup turns kebab/underscore ids into Title Case', () => {
    expect(humanizeMapGroup('pets')).toBe('Pets')
    expect(humanizeMapGroup('false-friend-en-de')).toBe('False Friend En De')
    expect(humanizeMapGroup('rodents_and_pests')).toBe('Rodents And Pests')
    expect(humanizeMapGroup('')).toBe('')
  })
})

describe('mapEdgeHandlesForOffset', () => {
  it('uses top source and bottom target when the satellite sits above the hub', () => {
    expect(mapEdgeHandlesForOffset(0, -40)).toEqual({
      sourceHandle: MAP_EDGE_HANDLES.top,
      targetHandle: MAP_EDGE_HANDLES.bottom,
    })
  })

  it('uses left source and right target when the satellite sits to the left', () => {
    expect(mapEdgeHandlesForOffset(-50, 0)).toEqual({
      sourceHandle: MAP_EDGE_HANDLES.left,
      targetHandle: MAP_EDGE_HANDLES.right,
    })
  })
})
