import { useCallback, useEffect, useState } from 'react'
import type { TopicSlug } from '../data/words'
import { readJSON, writeJSON } from './storage'

type SessionShape = {
  lastTopic?: TopicSlug
  indices: Partial<Record<TopicSlug, number>>
}

const KEY = 'wordssky.session.v1'
const EMPTY: SessionShape = { indices: {} }

function load(): SessionShape {
  const stored = readJSON<SessionShape>(KEY, EMPTY)
  if (!stored || typeof stored !== 'object' || !stored.indices) return EMPTY
  return stored
}

const listeners = new Set<(next: SessionShape) => void>()

function broadcast(next: SessionShape) {
  writeJSON(KEY, next)
  listeners.forEach((fn) => fn(next))
}

export function useSession() {
  const [snapshot, setSnapshot] = useState<SessionShape>(load)

  useEffect(() => {
    const onChange = (next: SessionShape) => setSnapshot(next)
    listeners.add(onChange)
    return () => {
      listeners.delete(onChange)
    }
  }, [])

  const setLastTopic = useCallback((slug: TopicSlug) => {
    const current = load()
    if (current.lastTopic === slug) return
    broadcast({ ...current, lastTopic: slug })
  }, [])

  const setTopicIndex = useCallback((slug: TopicSlug, index: number) => {
    const current = load()
    if (current.indices[slug] === index) return
    broadcast({ ...current, indices: { ...current.indices, [slug]: index } })
  }, [])

  const getTopicIndex = useCallback(
    (slug: TopicSlug): number => snapshot.indices[slug] ?? 0,
    [snapshot],
  )

  return { lastTopic: snapshot.lastTopic, getTopicIndex, setTopicIndex, setLastTopic }
}
