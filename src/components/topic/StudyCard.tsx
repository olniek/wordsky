import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { languageColors, type LanguageCode, type TopicWord } from '../../data/words'
import {
  anchorEchoesTranslationLemma,
  lemmaAffinityByLanguage,
  type LemmaAffinity,
} from '../../lib/crossLangLemmaAffinity'
import type { WordStatus } from '../../lib/progress'
import { languageLabels, strings } from '../../lib/strings'
import { displayWordForm } from '../../lib/wordForm'
import { buildSentenceTokenCloud } from '../../lib/sentenceTokenCloud'
import { isSpeechSupported, speak } from '../../lib/speech'

function anchorPhaseExample(word: TopicWord, anchor: LanguageCode): string | undefined {
  const ex = word.examples
  if (!ex) return undefined
  return ex[anchor]?.trim() || undefined
}

function translationPhaseExample(word: TopicWord, code: LanguageCode): string | undefined {
  return word.examples?.[code]?.trim() || undefined
}

function corpusLinesForLanguage(word: TopicWord, code: LanguageCode): readonly string[] | undefined {
  const lines = word.corpusExamples?.[code]
  if (!lines?.length) return undefined
  return lines
}

function PerLanguageMarkRow({
  langLabel,
  status,
  canInteract,
  onMark,
}: {
  langLabel: string
  status: WordStatus
  canInteract: boolean
  onMark: (next: WordStatus) => void
}) {
  if (!canInteract) {
    if (status === 'unseen') return null
    return (
      <p className="study-lang-marked" aria-label={langLabel}>
        {status === 'known' ? strings.topic.gotIt : strings.topic.stillLearning}
      </p>
    )
  }
  if (status !== 'unseen') {
    return (
      <p className="study-lang-marked" aria-label={langLabel}>
        {status === 'known' ? strings.topic.gotIt : strings.topic.stillLearning}
      </p>
    )
  }
  return (
    <div className="study-lang-mark-actions">
      <button
        type="button"
        className="study-secondary study-lang-mark-btn"
        onClick={() => onMark('learning')}
      >
        {strings.topic.stillLearning}
      </button>
      <button type="button" className="study-primary study-lang-mark-btn" onClick={() => onMark('known')}>
        {strings.topic.gotIt}
      </button>
    </div>
  )
}

type StudyCardProps = {
  word: TopicWord
  anchor: LanguageCode
  /** Non-anchor languages to list after reveal (never empty; normalized by caller). */
  translationLanguages: LanguageCode[]
  /** Anchor plus translations in canonical map order (same languages as the Map cluster). */
  studyLanguageOrder: LanguageCode[]
  /** Subset of `studyLanguageOrder` that counts for Continue and progress; defaults to full order. */
  progressLanguageOrder?: LanguageCode[]
  step: number
  total: number
  nextConceptLabel?: string
  getLanguageStatus: (code: LanguageCode) => WordStatus
  onLanguageStatus: (code: LanguageCode, status: WordStatus) => void
  /** Study mode: advance after every language has been marked. Omitted in map-only sheet mode. */
  onContinueToNext?: () => void
  /** Map sheet: only this language row is markable (matches the tapped node). */
  singleMarkLanguage?: LanguageCode
}

function StudyCard({
  word,
  anchor,
  translationLanguages,
  studyLanguageOrder,
  progressLanguageOrder,
  step,
  total,
  nextConceptLabel,
  getLanguageStatus,
  onLanguageStatus,
  onContinueToNext,
  singleMarkLanguage,
}: StudyCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const audioSupported = useMemo(() => isSpeechSupported(), [])

  const langsForProgress = useMemo(
    () => progressLanguageOrder ?? studyLanguageOrder,
    [progressLanguageOrder, studyLanguageOrder],
  )

  const mapSheetMode = singleMarkLanguage !== undefined

  const rowReferenceOnly = useCallback(
    (lang: LanguageCode) =>
      !langsForProgress.includes(lang) && !(mapSheetMode && singleMarkLanguage === lang),
    [langsForProgress, mapSheetMode, singleMarkLanguage],
  )

  const lemmaAffinity = useMemo(
    () => lemmaAffinityByLanguage(word, anchor, translationLanguages),
    [word, anchor, translationLanguages],
  )

  const anchorEchoesTranslation = useMemo(
    () => anchorEchoesTranslationLemma(word, anchor, translationLanguages),
    [word, anchor, translationLanguages],
  )

  const translationRowClass = (tier: LemmaAffinity | undefined): string => {
    if (tier === 'same') return 'study-translation-lemma-same'
    if (tier === 'similar') return 'study-translation-lemma-similar'
    if (tier === 'caution') return 'study-translation-lemma-caution'
    return ''
  }
  const anchorExample = useMemo(() => anchorPhaseExample(word, anchor), [word, anchor])

  const orderedCorpusLanguages = useMemo(
    () =>
      studyLanguageOrder.filter((code) => {
        const list = word.corpusExamples?.[code]
        return Array.isArray(list) && list.length > 0
      }),
    [word, studyLanguageOrder],
  )

  const hasCorpusDetail = orderedCorpusLanguages.length > 0

  const anchorCorpusLines = useMemo(() => corpusLinesForLanguage(word, anchor), [word, anchor])

  const tokenCloud = useMemo(() => {
    if (!anchorCorpusLines?.length) return []
    return buildSentenceTokenCloud([...anchorCorpusLines], anchor, {
      excludeLemmaForms: [word.forms[anchor]],
    })
  }, [anchorCorpusLines, anchor, word.forms])

  const allLanguagesMarked = useMemo(
    () => langsForProgress.every((code) => getLanguageStatus(code) !== 'unseen'),
    [getLanguageStatus, langsForProgress],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return
      }
      if (!revealed) {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          setRevealed(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed])

  return (
    <article className="study-card" aria-live="polite">
      <p className="study-step">{strings.topic.step(step, total)}</p>

      <div
        className="study-anchor-panel"
        style={{ '--anchor-lang-color': languageColors[anchor] } as CSSProperties}
      >
        <div className="study-prompt">
          <span className="study-anchor-tag" style={{ color: languageColors[anchor] }}>
            {languageLabels[anchor]}
          </span>
          <h2
            className={[
              'study-word',
              anchorEchoesTranslation ? 'study-word-lemma-echo' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {displayWordForm(word, anchor)}
          </h2>
          {audioSupported && (
            <button
              type="button"
              className="speak-button speak-button-prompt"
              onClick={() => speak(displayWordForm(word, anchor), anchor)}
              aria-label={strings.topic.speakLabel(languageLabels[anchor])}
              title={strings.topic.speakLabel(languageLabels[anchor])}
            >
              <span aria-hidden="true">♪</span>
            </button>
          )}
        </div>

        {anchorExample && (
          <div className="study-example-row">
            <p className="study-example">
              <span className="visually-hidden">{strings.details.example}: </span>
              {anchorExample}
            </p>
            {audioSupported && (
              <button
                type="button"
                className="speak-button speak-button-example"
                onClick={() => speak(anchorExample, anchor)}
                aria-label={strings.topic.speakExampleLabel(languageLabels[anchor])}
                title={strings.topic.speakExampleLabel(languageLabels[anchor])}
              >
                <span aria-hidden="true">♪</span>
              </button>
            )}
          </div>
        )}

        {hasCorpusDetail ? (
          <div className="study-corpus-block">
            <button
              type="button"
              className="study-secondary study-corpus-toggle"
              aria-expanded={detailOpen}
              aria-controls="study-corpus-detail"
              id="study-corpus-toggle"
              onClick={() => setDetailOpen((o) => !o)}
            >
              {detailOpen ? strings.topic.moreDetailHide : strings.topic.moreDetail}
            </button>
            {detailOpen ? (
              <div className="study-corpus-detail" id="study-corpus-detail" role="region" aria-labelledby="study-corpus-toggle">
                <p className="study-corpus-detail-heading">{strings.topic.corpusSentencesLabel}</p>
                {orderedCorpusLanguages.map((code) => {
                  const lines = corpusLinesForLanguage(word, code)
                  if (!lines?.length) return null
                  const showLangLabel = orderedCorpusLanguages.length > 1
                  return (
                    <div
                      key={code}
                      className="study-corpus-lang-block"
                      style={{ '--lang-color': languageColors[code] } as CSSProperties}
                    >
                      {showLangLabel ? (
                        <p className="study-corpus-lang-label">{languageLabels[code]}</p>
                      ) : null}
                      <ol className="study-corpus-sentence-list">
                        {lines.map((line, i) => (
                          <li key={i} className="study-corpus-sentence-item">
                            <span className="study-corpus-sentence-text">{line}</span>
                            {audioSupported && (
                              <button
                                type="button"
                                className="speak-button speak-button-example study-corpus-sentence-speak"
                                onClick={() => speak(line, code)}
                                aria-label={strings.topic.speakExampleLabel(languageLabels[code])}
                                title={strings.topic.speakExampleLabel(languageLabels[code])}
                              >
                                <span aria-hidden="true">♪</span>
                              </button>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )
                })}
                {tokenCloud.length > 0 ? (
                  <div className="study-token-cloud-wrap">
                    <p className="study-corpus-detail-heading">{strings.topic.tokenCloudLabel}</p>
                    <p className="study-token-cloud" aria-label={strings.topic.tokenCloudLabel}>
                      {tokenCloud.map((e) => (
                        <span
                          key={e.token}
                          className="study-token-cloud-item"
                          style={
                            {
                              '--tw': String(0.82 + 0.58 * e.weight),
                            } as CSSProperties
                          }
                        >
                          {e.token}
                        </span>
                      ))}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {revealed ? (
          <div className="study-anchor-mark-slot">
            {rowReferenceOnly(anchor) ? (
              <p className="study-lang-reference-note">{strings.topic.referenceOnlyProgress}</p>
            ) : (
              <PerLanguageMarkRow
                langLabel={languageLabels[anchor]}
                status={getLanguageStatus(anchor)}
                canInteract={!mapSheetMode || singleMarkLanguage === anchor}
                onMark={(next) => onLanguageStatus(anchor, next)}
              />
            )}
          </div>
        ) : null}
      </div>

      {revealed ? (
        <>
          <ul id="study-translations-list" className="study-translations" aria-label="Translations">
            {translationLanguages.map((code) => {
              const lineExample = translationPhaseExample(word, code)
              return (
                <li
                  key={code}
                  className={translationRowClass(lemmaAffinity[code])}
                  style={{ '--lang-color': languageColors[code] } as CSSProperties}
                  aria-label={`${languageLabels[code]}: ${displayWordForm(word, code)}`}
                >
                  <span className="study-translation-tag">{languageLabels[code]}</span>
                  <span className="study-translation-word">{displayWordForm(word, code)}</span>
                  {audioSupported && (
                    <button
                      type="button"
                      className="speak-button"
                      onClick={() => speak(displayWordForm(word, code), code)}
                      aria-label={strings.topic.speakLabel(languageLabels[code])}
                      title={strings.topic.speakLabel(languageLabels[code])}
                    >
                      <span aria-hidden="true">♪</span>
                    </button>
                  )}
                  {lineExample && (
                    <div className="study-translation-example-row">
                      <p className="study-translation-example">
                        <span className="visually-hidden">{strings.details.example}: </span>
                        {lineExample}
                      </p>
                      {audioSupported && (
                        <button
                          type="button"
                          className="speak-button speak-button-example"
                          onClick={() => speak(lineExample, code)}
                          aria-label={strings.topic.speakExampleLabel(languageLabels[code])}
                          title={strings.topic.speakExampleLabel(languageLabels[code])}
                        >
                          <span aria-hidden="true">♪</span>
                        </button>
                      )}
                    </div>
                  )}
                  {lemmaAffinity[code] === 'caution' && (
                    <p className="study-translation-caution">{strings.topic.falseFriendHint}</p>
                  )}
                  <div className="study-translation-mark-slot">
                    {rowReferenceOnly(code) ? (
                      <p className="study-lang-reference-note">{strings.topic.referenceOnlyProgress}</p>
                    ) : (
                      <PerLanguageMarkRow
                        langLabel={languageLabels[code]}
                        status={getLanguageStatus(code)}
                        canInteract={!mapSheetMode || singleMarkLanguage === code}
                        onMark={(next) => onLanguageStatus(code, next)}
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {!mapSheetMode && onContinueToNext ? (
            <>
              <div className="study-actions study-actions-single">
                <button
                  type="button"
                  className="study-primary"
                  disabled={!allLanguagesMarked}
                  onClick={onContinueToNext}
                >
                  {strings.topic.continueNextWord}
                </button>
              </div>
              <p className="study-shortcut-hint">{strings.topic.shortcutsHint}</p>
              {nextConceptLabel && <p className="study-up-next">{strings.topic.upNext(nextConceptLabel)}</p>}
            </>
          ) : null}
        </>
      ) : (
        <>
          <p id="study-card-hint" className="study-hint">
            {strings.topic.studyHint}
          </p>
          <div className="study-actions study-actions-single">
            <button
              type="button"
              className="study-primary"
              onClick={() => setRevealed(true)}
              aria-describedby="study-card-hint"
            >
              {strings.topic.showTranslations}
            </button>
          </div>
        </>
      )}
    </article>
  )
}

export default StudyCard
