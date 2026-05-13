import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { topics, topicWords } from '../data/words'
import {
  countConceptsAggregateLearning,
  countKnownFormsForTopic,
  topicAllFormsKnown,
  useProgress,
} from '../lib/progress'
import { strings } from '../lib/strings'
import LanguageToolbar from './LanguageToolbar'
import WordSearch from './WordSearch'
import { useAnchorLanguage } from '../lib/anchor'
import { mapVisibleLanguageCodes } from '../lib/graph'
import { useTranslationLanguages } from '../lib/translationLanguages'
import { useSession } from '../lib/session'

function TopicLanding() {
  const [anchor, setAnchor] = useAnchorLanguage()
  const [translationLanguages, setTranslationLanguages] = useTranslationLanguages(anchor)
  const progressLanguages = useMemo(
    () => mapVisibleLanguageCodes(anchor, translationLanguages),
    [anchor, translationLanguages],
  )
  const { snapshot } = useProgress()
  const { lastTopic, setLastTopic } = useSession()

  return (
    <main className="page-shell">
      <section className="landing-intro" aria-label={strings.landing.title}>
        <div className="landing-intro-head">
          <div className="landing-intro-copy">
            <h1>{strings.landing.title}</h1>
            <p>{strings.landing.subtitleShort}</p>
          </div>
          <LanguageToolbar
            anchor={anchor}
            onAnchorChange={setAnchor}
            translationLanguages={translationLanguages}
            onTranslationLanguagesChange={setTranslationLanguages}
          />
        </div>
        <WordSearch anchor={anchor} />
      </section>

      <section className="topic-grid">
        {topics.map((topic) => {
          const total = topicWords[topic.slug].length
          const totalForms = total * progressLanguages.length
          const knownForms = countKnownFormsForTopic(snapshot, topic.slug, progressLanguages)
          const learningConcepts = countConceptsAggregateLearning(snapshot, topic.slug, progressLanguages)
          const started = knownForms > 0 || learningConcepts > 0
          const isReview = topicAllFormsKnown(snapshot, topic.slug, progressLanguages) && totalForms > 0
          const cta = isReview
            ? strings.landing.cardCtaReview
            : started
              ? strings.landing.cardCtaContinue
              : strings.landing.cardCtaStart
          const isLast = lastTopic === topic.slug
          const focusReview = isReview && learningConcepts > 0
          const to = focusReview ? `/topic/${topic.slug}?focus=learning` : `/topic/${topic.slug}`
          const pct = totalForms > 0 ? Math.round((knownForms / totalForms) * 100) : 0
          const ctaTone = isReview ? 'review' : started ? 'continue' : 'start'

          return (
            <Link
              key={topic.slug}
              className={`topic-card ${isLast ? 'topic-card-resume' : ''}`}
              to={to}
              onClick={() => setLastTopic(topic.slug)}
            >
              <div className="topic-card-head">
                <h2>{topic.title}</h2>
                <span className={`topic-card-cta topic-card-cta-${ctaTone}`}>{cta}</span>
              </div>
              <div className="topic-card-progress" aria-hidden="true">
                <div className="topic-card-progress-bar">
                  <span className="topic-card-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <p className="topic-card-meta">
                <span>{strings.landing.progressLearned(knownForms, totalForms)}</span>
                {learningConcepts > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{strings.landing.cardStillLearningLine(learningConcepts)}</span>
                  </>
                ) : null}
              </p>
            </Link>
          )
        })}
      </section>
    </main>
  )
}

export default TopicLanding
