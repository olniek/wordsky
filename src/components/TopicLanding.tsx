import { Link } from 'react-router-dom'
import { topics, topicWords } from '../data/words'
import {
  countConceptsAggregateLearning,
  countKnownFormsForTopic,
  topicAllFormsKnown,
  useProgress,
} from '../lib/progress'
import { strings } from '../lib/strings'
import AnchorPicker from './AnchorPicker'
import TranslationLanguagePicker from './TranslationLanguagePicker'
import WordSearch from './WordSearch'
import { useAnchorLanguage } from '../lib/anchor'
import { useTranslationLanguages } from '../lib/translationLanguages'
import { useProgressLanguages } from '../lib/progressLanguages'
import { useSession } from '../lib/session'
import ProgressLanguagesPicker from './ProgressLanguagesPicker'

function TopicLanding() {
  const [anchor, setAnchor] = useAnchorLanguage()
  const [translationLanguages, setTranslationLanguages] = useTranslationLanguages(anchor)
  const [progressLanguages, setProgressLanguages] = useProgressLanguages(anchor, translationLanguages)
  const { snapshot } = useProgress()
  const { lastTopic, setLastTopic } = useSession()

  return (
    <main className="page-shell">
      <section className="landing-intro" aria-label={strings.landing.title}>
        <p className="hero-kicker">{strings.landing.kicker}</p>
        <div className="landing-intro-body">
          <div className="landing-intro-copy">
            <h1>{strings.landing.title}</h1>
            <p>{strings.landing.subtitle}</p>
          </div>
          <div className="landing-intro-controls">
            <AnchorPicker value={anchor} onChange={setAnchor} />
            <TranslationLanguagePicker
              anchor={anchor}
              value={translationLanguages}
              onChange={setTranslationLanguages}
            />
            <ProgressLanguagesPicker
              anchor={anchor}
              translationLanguages={translationLanguages}
              value={progressLanguages}
              onChange={setProgressLanguages}
            />
          </div>
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

          return (
            <Link
              key={topic.slug}
              className={`topic-card ${isLast ? 'topic-card-resume' : ''}`}
              to={to}
              onClick={() => setLastTopic(topic.slug)}
            >
              <p className="topic-card-kicker">{strings.landing.progressLearned(knownForms, totalForms)}</p>
              {learningConcepts > 0 ? (
                <p className="topic-card-learning">
                  {strings.landing.cardStillLearningLine(learningConcepts)}
                </p>
              ) : null}
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
              <span>{cta}</span>
            </Link>
          )
        })}
      </section>
    </main>
  )
}

export default TopicLanding
