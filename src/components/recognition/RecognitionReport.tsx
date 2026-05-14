import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { languageOrder, type LanguageCode } from '../../data/words'
import { useKnownLanguages } from '../../lib/knownLanguages'
import { summarize, type RecognitionLevel, type WordRecognition } from '../../lib/recognition'
import { languageLabels, strings } from '../../lib/strings'
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

type RecognitionLevelRadiosProps = {
  activeLevel: RecognitionLevel
  onLevelChange: (level: RecognitionLevel) => void
  byLevel: Record<RecognitionLevel, number>
  totalWords: number
  wordsRegionId: string
}

/** One-of-many level filter: radiogroup + roving tabindex + arrow keys (APG-aligned). */
function RecognitionLevelRadios({
  activeLevel,
  onLevelChange,
  byLevel,
  totalWords,
  wordsRegionId,
}: RecognitionLevelRadiosProps) {
  const groupId = useId()
  const refs = useRef<Partial<Record<RecognitionLevel, HTMLButtonElement | null>>>({})

  const focusByOffset = useCallback(
    (currentIndex: number, offset: number) => {
      const len = LEVEL_ORDER.length
      const nextIndex = (currentIndex + offset + len) % len
      const next = LEVEL_ORDER[nextIndex]
      refs.current[next]?.focus()
      onLevelChange(next)
    },
    [onLevelChange],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusByOffset(currentIndex, 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusByOffset(currentIndex, -1)
        break
      case 'Home':
        event.preventDefault()
        focusByOffset(0, 0)
        break
      case 'End':
        event.preventDefault()
        focusByOffset(LEVEL_ORDER.length - 1, 0)
        break
      default:
        break
    }
  }

  return (
    <div className="recognition-report-bars" role="radiogroup" aria-label={strings.landing.recognitionLevelsGroupAria}>
      {LEVEL_ORDER.map((level, index) => {
        const count = byLevel[level]
        const pct = totalWords > 0 ? (count / totalWords) * 100 : 0
        const selected = activeLevel === level
        return (
          <button
            key={level}
            ref={(el) => {
              refs.current[level] = el
            }}
            id={`${groupId}-${level}`}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-controls={wordsRegionId}
            tabIndex={selected ? 0 : -1}
            className={`recognition-bar recognition-bar-${level} ${selected ? 'recognition-bar-active' : ''}`}
            onClick={() => onLevelChange(level)}
            onKeyDown={(e) => handleKeyDown(e, index)}
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
  )
}

function RecognitionReport() {
  const { target } = useParams<{ target: string }>()
  const [knownLanguages] = useKnownLanguages()
  const [activeLevel, setActiveLevel] = useState<RecognitionLevel>('known')
  const wordsRegionId = useId()
  const wordsHeadingId = useId()
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

        <RecognitionLevelRadios
          activeLevel={activeLevel}
          onLevelChange={setActiveLevel}
          byLevel={summary.byLevel}
          totalWords={summary.totalWords}
          wordsRegionId={wordsRegionId}
        />

        <section
          id={wordsRegionId}
          className="recognition-words"
          role="region"
          aria-labelledby={wordsHeadingId}
        >
          <h2 id={wordsHeadingId} className="recognition-words-title">
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
