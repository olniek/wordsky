import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { languageOrder, type LanguageCode } from '../../data/words'
import { summarize } from '../../lib/recognition'
import { languageLabels, strings } from '../../lib/strings'
import RecognitionHowPopover from './RecognitionHowPopover'

type RecognitionStripProps = {
  knownLanguages: LanguageCode[]
  /** When set, empty-state CTA uses this in-page anchor instead of linking home (e.g. on Welcome). */
  emptyCtaHash?: string
}

function RecognitionStrip({ knownLanguages, emptyCtaHash }: RecognitionStripProps) {
  const cards = useMemo(() => {
    if (knownLanguages.length === 0) return []
    const targets = languageOrder.filter((c) => !knownLanguages.includes(c))
    return targets.map((target) => {
      const s = summarize(target, knownLanguages)
      return {
        target,
        pct: s.recognitionPercent,
        known: s.byLevel.known,
        easy: s.byLevel.easy,
        learnable: s.byLevel.learnable,
        total: s.totalWords,
      }
    })
  }, [knownLanguages])

  if (knownLanguages.length === 0) {
    return (
      <section
        className="recognition-strip recognition-strip-empty"
        aria-label={strings.landing.recognitionStripLabel}
      >
        <p>{strings.landing.recognitionCardEmpty}</p>
        {emptyCtaHash ? (
          <a className="recognition-strip-empty-cta" href={emptyCtaHash}>
            {strings.landing.recognitionCardEmptyCta}
          </a>
        ) : (
          <Link className="recognition-strip-empty-cta" to="/">
            {strings.landing.recognitionCardEmptyCta}
          </Link>
        )}
      </section>
    )
  }

  if (cards.length === 0) return null

  return (
    <section className="recognition-strip" aria-label={strings.landing.recognitionStripLabel}>
      <ul className="recognition-strip-row">
        {cards.map((card) => (
          <li key={card.target}>
            <Link className="recognition-card" to={`/recognize/${card.target}`}>
              <div className="recognition-card-head">
                <span className="recognition-card-target">{languageLabels[card.target]}</span>
                <span className="recognition-card-pct">{card.pct}%</span>
              </div>
              <div className="recognition-card-bar" aria-hidden="true">
                <span className="recognition-card-bar-fill" style={{ width: `${card.pct}%` }} />
              </div>
              <p className="recognition-card-meta">
                {strings.landing.recognitionCardBreakdown(card.known, card.easy, card.learnable)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="recognition-strip-footnote-wrap">
        <p className="recognition-strip-footnote">{strings.landing.recognitionStripFootnote}</p>
        <RecognitionHowPopover />
      </div>
    </section>
  )
}

export default RecognitionStrip
