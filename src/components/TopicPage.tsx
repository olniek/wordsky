import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import {
  getTopicBySlug,
  getTopicWordByConcept,
  type LanguageCode,
  type TopicSlug,
} from '../data/words'
import { buildStudyQueue } from '../lib/queue'
import { Tabs } from './Tabs'
import StudyCard from './StudyCard'
import { CosmicStarsBackground } from './CosmicStarsBackground'
import { useAnchorLanguage } from '../lib/anchor'
import { useTranslationLanguages } from '../lib/translationLanguages'
import {
  conceptStudyAggregateStatus,
  conceptStudyAggregateUpdatedAt,
  type WordStatus,
  useProgress,
} from '../lib/progress'
import { useSession } from '../lib/session'
import { mapVisibleLanguageCodes } from '../lib/graph'
import { strings } from '../lib/strings'
import { useTopicStudyQueue } from '../hooks/useTopicStudyQueue'

const MapView = lazy(() => import('./MapView'))

type ViewMode = 'study' | 'map'

const MODE_TABS = [
  { value: 'study' as const, label: strings.topic.modeStudy },
  { value: 'map' as const, label: strings.topic.modeMap },
]

function TopicPage() {
  const { slug = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const focus = searchParams.get('focus')
  const wordTarget = searchParams.get('word')
  const isReviewFocus = focus === 'learning'
  const topic = getTopicBySlug(slug) ?? null
  const [anchor] = useAnchorLanguage()
  const [translationLanguages] = useTranslationLanguages(anchor)
  const progressLanguages = useMemo(
    () => mapVisibleLanguageCodes(anchor, translationLanguages),
    [anchor, translationLanguages],
  )
  const { snapshot, getLanguageStatus, setLanguageStatus } = useProgress()
  const { getTopicIndex, setTopicIndex, setLastTopic } = useSession()

  const getAggregateStatus = useCallback(
    (slug: TopicSlug, concept: string) =>
      conceptStudyAggregateStatus(snapshot, slug, concept, progressLanguages),
    [progressLanguages, snapshot],
  )

  const getAggregateUpdatedAt = useCallback(
    (slug: TopicSlug, concept: string) =>
      conceptStudyAggregateUpdatedAt(snapshot, slug, concept, progressLanguages),
    [progressLanguages, snapshot],
  )

  const { allGuidedWords, guidedWords, learningCount } = useTopicStudyQueue(
    topic,
    isReviewFocus,
    getAggregateStatus,
    getAggregateUpdatedAt,
  )
  const [mode, setMode] = useState<ViewMode>('study')
  const [activeConceptIndex, setActiveConceptIndex] = useState(0)

  // Reset transient UI when the topic (or focus mode) changes.
  // Normal flow: restore the last word index. Review flow: always start at 0.
  // Multiple setState calls are intentional here: this is a one-shot "navigate"
  // reset, not a synchronisation effect. React batches them in one render.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!topic) return
    setLastTopic(topic.slug)
    setMode('study')
    if (isReviewFocus) {
      setActiveConceptIndex(0)
      return
    }
    const stored = getTopicIndex(topic.slug)
    setActiveConceptIndex(Math.min(stored, Math.max(0, allGuidedWords.length - 1)))
  }, [topic?.slug, isReviewFocus])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Deep-link from landing search: `/topic/:slug?word=<concept>`.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!topic || isReviewFocus || !wordTarget) return
    if (!getTopicWordByConcept(topic.slug, wordTarget)) return
    const queue = buildStudyQueue(topic.slug, getAggregateStatus, getAggregateUpdatedAt)
    const idx = queue.findIndex((w) => w.concept === wordTarget)
    if (idx >= 0) setActiveConceptIndex(idx)
  }, [topic?.slug, isReviewFocus, wordTarget])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Persist the active concept index for this topic — but only in the normal Study flow.
  // Review is a side-quest and shouldn't overwrite where the user was learning.
  useEffect(() => {
    if (!topic || isReviewFocus) return
    setTopicIndex(topic.slug, activeConceptIndex)
  }, [activeConceptIndex, isReviewFocus, setTopicIndex, topic])

  const advance = () => {
    setActiveConceptIndex((current) => Math.min(current + 1, guidedWords.length))
  }

  const handleStudyLanguageStatus = (lang: LanguageCode, status: WordStatus) => {
    if (!topic) return
    const concept = guidedWords[activeConceptIndex]?.concept
    if (concept) setLanguageStatus(topic.slug, concept, lang, status)
  }

  const startReview = () => {
    setSearchParams({ focus: 'learning' })
  }

  const exitReview = () => {
    setSearchParams({})
  }

  const knownCount = useMemo(() => {
    if (!topic) return 0
    let n = 0
    for (const w of allGuidedWords) {
      for (const lang of progressLanguages) {
        if (getLanguageStatus(topic.slug, w.concept, lang) === 'known') {
          n += 1
        }
      }
    }
    return n
  }, [allGuidedWords, getLanguageStatus, progressLanguages, topic])

  const knownTotalForms = useMemo(
    () => allGuidedWords.length * progressLanguages.length,
    [allGuidedWords.length, progressLanguages.length],
  )

  if (!topic) {
    return <Navigate to="/" replace />
  }

  const activeConceptMeta = guidedWords[activeConceptIndex]
  const nextConcept = guidedWords[activeConceptIndex + 1]?.concept
  const isStudyFinished = activeConceptIndex >= guidedWords.length

  return (
    <main className="topic-graph-shell">
      <CosmicStarsBackground />

      <header className="topic-header">
        <Link className="back-link" to="/" aria-label={strings.topic.back}>
          <span aria-hidden="true">←</span>
          <span className="back-link-title">{topic.title}</span>
        </Link>
        {isReviewFocus && (
          <span className="review-badge" aria-label={strings.topic.reviewBadge}>
            {strings.topic.reviewBadge}
          </span>
        )}
        <Tabs
          className="mode-toggle"
          items={MODE_TABS}
          value={mode}
          onChange={(next) => setMode(next)}
          ariaLabel={strings.topic.modeLabel}
        />
        <span className="topic-progress" aria-label={strings.topic.progressAriaLabel}>
          {isReviewFocus
            ? guidedWords.length > 0
              ? strings.topic.reviewHeaderProgress(activeConceptIndex + 1, guidedWords.length)
              : strings.topic.reviewBadge
            : strings.landing.progressLearned(knownCount, knownTotalForms)}
        </span>
      </header>

      {mode === 'study' ? (
        <div className="study-stage">
          {isReviewFocus && guidedWords.length === 0 ? (
            <div className="study-finished">
              <h2>{strings.topic.reviewEmptyTitle}</h2>
              <p>{strings.topic.reviewEmptyBody}</p>
              <div className="study-actions study-actions-single">
                <button type="button" className="study-primary" onClick={exitReview}>
                  {strings.topic.reviewBackToStudy}
                </button>
              </div>
            </div>
          ) : isStudyFinished ? (
            <div className="study-finished">
              <h2>{isReviewFocus ? strings.topic.reviewFinishedTitle : strings.topic.finished}</h2>
              <p>
                {isReviewFocus ? strings.topic.reviewFinishedBody : strings.topic.finishedSubtitle}
              </p>
              <div className="study-actions">
                {isReviewFocus ? (
                  <button type="button" className="study-primary" onClick={exitReview}>
                    {strings.topic.reviewBackToStudy}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="study-secondary"
                      onClick={() => setActiveConceptIndex(0)}
                    >
                      {strings.topic.startOver}
                    </button>
                    {learningCount > 0 ? (
                      <button type="button" className="study-primary" onClick={startReview}>
                        {strings.topic.reviewStillLearning}
                      </button>
                    ) : (
                      <button type="button" className="study-primary" onClick={() => setMode('map')}>
                        {strings.topic.modeMap}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : activeConceptMeta ? (
            <StudyCard
              key={activeConceptMeta.concept}
              word={activeConceptMeta}
              anchor={anchor}
              translationLanguages={translationLanguages}
              studyLanguageOrder={progressLanguages}
              progressLanguageOrder={progressLanguages}
              step={activeConceptIndex + 1}
              total={guidedWords.length}
              nextConceptLabel={nextConcept}
              getLanguageStatus={(code) => getLanguageStatus(topic.slug, activeConceptMeta.concept, code)}
              onLanguageStatus={handleStudyLanguageStatus}
              onContinueToNext={advance}
            />
          ) : (
            <div className="graph-empty-state">
              <h2>{strings.topic.emptyTitle}</h2>
              <p>{strings.topic.emptyBody}</p>
            </div>
          )}
        </div>
      ) : (
        <Suspense fallback={<div className="flow-container" aria-busy="true" />}>
          <MapView
            topicSlug={topic.slug}
            anchor={anchor}
            translationLanguages={translationLanguages}
            progressLanguages={progressLanguages}
            mapVisibleLanguages={progressLanguages}
            guidedWords={guidedWords}
            snapshot={snapshot}
            getLanguageStatus={getLanguageStatus}
            setLanguageStatus={setLanguageStatus}
          />
        </Suspense>
      )}
    </main>
  )
}

export default TopicPage
