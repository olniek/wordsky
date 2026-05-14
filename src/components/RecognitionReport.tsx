import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { languageOrder, type LanguageCode } from '../data/words'
import { useKnownLanguages } from '../lib/knownLanguages'
import { summarize, type RecognitionLevel, type WordRecognition } from '../lib/recognition'
import { languageLabels, strings } from '../lib/strings'
import RecognitionHowPopover from './RecognitionHowPopover'

const LEVEL_ORDER: RecognitionLevel[] = ['known', 'easy', 'learnable', 'new']

const LEVEL_LABELS: Record<RecognitionLevel, string> = {
  known: 'Known',
  easy: 'Easy',
  learnable: 'Learnable',
  new: 'New',
}

const LEVEL_HINTS: Record<RecognitionLevel, string> = {
  known: 'Same spelling (or very close) in the bridge language — still an estimate.',
  easy: 'You would probably spot this on first read.',
  learnable: 'Close to something you already know.',
  new: 'No clear bridge — best to study fresh.',
}

const RULE_LABELS: Record<WordRecognition['matchedRule'], string> = {
  identical: 'identical',
  'cognate-tag': 'cognate',
  pattern: 'pattern',
  fuzzy: 'similar',
  'false-friend-cap': 'false friend',
  none: '—',
}

function isLanguageCode(value: string | undefined): value is LanguageCode {
  return !!value && (languageOrder as readonly string[]).includes(value)
}

function RecognitionReport() {
  const { target } = useParams<{ target: string }>()
  const [knownLanguages] = useKnownLanguages()
  const [activeLevel, setActiveLevel] = useState<RecognitionLevel>('known')
  const validTarget = isLanguageCode(target) ? target : null

  const summary = useMemo(
    () => (validTarget ? summarize(validTarget, knownLanguages) : null),
    [validTarget, knownLanguages],
  )

  if (!validTarget) {
    return <Navigate to="/topics" replace />
  }

  if (knownLanguages.length === 0 || !summary) {
    return (
      <main className="page-shell">
        <Link to="/topics" className="recognition-back">← {strings.topic.back}</Link>
        <section className="recognition-empty">
          <h1>{strings.landing.recognitionCardEmpty}</h1>
          <p>{strings.landing.knownHint}</p>
        </section>
      </main>
    )
  }

  const targetLabel = languageLabels[validTarget]
  const wordsForLevel = summary.words.filter((w) => w.level === activeLevel)

  return (
    <main className="page-shell">
      <Link to="/topics" className="recognition-back">← {strings.topic.back}</Link>
      <section className="recognition-report">
        <header className="recognition-report-head">
          <h1>{strings.landing.recognitionCardTitle(targetLabel, summary.recognitionPercent)}</h1>
          <p className="recognition-report-sub">
            {knownLanguages.map((c) => languageLabels[c]).join(', ')} → {targetLabel} ·{' '}
            {summary.totalWords} A1 words
          </p>
          <div className="recognition-report-disclaimer-wrap">
            <p className="recognition-report-disclaimer">{strings.landing.recognitionStripFootnote}</p>
            <RecognitionHowPopover />
          </div>
        </header>

        <div className="recognition-report-ring" role="img" aria-label={`${summary.recognitionPercent} percent`}>
          <div
            className="recognition-report-ring-dial"
            style={{ '--pct': summary.recognitionPercent } as React.CSSProperties}
          >
            <span className="recognition-report-ring-num">{summary.recognitionPercent}%</span>
          </div>
        </div>

        <div className="recognition-report-bars" role="tablist" aria-label="Recognition levels">
          {LEVEL_ORDER.map((level) => {
            const count = summary.byLevel[level]
            const pct = summary.totalWords > 0 ? (count / summary.totalWords) * 100 : 0
            return (
              <button
                key={level}
                type="button"
                role="tab"
                aria-selected={activeLevel === level}
                className={`recognition-bar recognition-bar-${level} ${
                  activeLevel === level ? 'recognition-bar-active' : ''
                }`}
                onClick={() => setActiveLevel(level)}
              >
                <span className="recognition-bar-label">{LEVEL_LABELS[level]}</span>
                <span className="recognition-bar-count">{count}</span>
                <span className="recognition-bar-track" aria-hidden="true">
                  <span className="recognition-bar-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="recognition-bar-hint">{LEVEL_HINTS[level]}</span>
              </button>
            )
          })}
        </div>

        <section className="recognition-words">
          <h2 className="recognition-words-title">
            {LEVEL_LABELS[activeLevel]} · {wordsForLevel.length}
          </h2>
          {wordsForLevel.length === 0 ? (
            <p className="recognition-words-empty">No words in this bucket.</p>
          ) : (
            <ul className="recognition-word-list">
              {wordsForLevel.slice(0, 100).map((w) => (
                <li key={w.concept} className="recognition-word">
                  <span className="recognition-word-target">{w.targetForm}</span>
                  {w.matchedForm && w.matchedVia && w.matchedVia !== validTarget ? (
                    <span className="recognition-word-bridge">
                      ↔ <span className="recognition-word-known">{w.matchedForm}</span>{' '}
                      <span className="recognition-word-lang">({languageLabels[w.matchedVia]})</span>
                    </span>
                  ) : null}
                  <span className={`recognition-word-rule recognition-word-rule-${w.matchedRule}`}>
                    {RULE_LABELS[w.matchedRule]} · {w.score}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default RecognitionReport
