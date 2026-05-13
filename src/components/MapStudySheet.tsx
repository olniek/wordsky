import type { KeyboardEvent, RefObject } from 'react'
import StudyCard from './StudyCard'
import type { LanguageCode, TopicWord } from '../data/words'
import type { WordStatus } from '../lib/progress'
import { strings } from '../lib/strings'

type MapStudySheetProps = {
  sheetRef: RefObject<HTMLElement | null>
  word: TopicWord
  anchor: LanguageCode
  translationLanguages: LanguageCode[]
  studyLanguageOrder: LanguageCode[]
  progressLanguageOrder: LanguageCode[]
  /** Language of the Map node that opened this sheet (only this row is markable). */
  singleMarkLanguage: LanguageCode
  step: number
  total: number
  nextConceptLabel?: string
  onClose: () => void
  getLanguageStatus: (code: LanguageCode) => WordStatus
  onLanguageStatus: (code: LanguageCode, status: WordStatus) => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

export function MapStudySheet({
  sheetRef,
  word,
  anchor,
  translationLanguages,
  studyLanguageOrder,
  progressLanguageOrder,
  singleMarkLanguage,
  step,
  total,
  nextConceptLabel,
  onClose,
  getLanguageStatus,
  onLanguageStatus,
  onKeyDown,
}: MapStudySheetProps) {
  return (
    <aside
      ref={sheetRef}
      className="details-panel map-study-sheet"
      aria-label={strings.topic.modeStudy}
      onKeyDown={onKeyDown}
    >
      <button type="button" className="close-details" onClick={onClose}>
        <span aria-hidden="true">×</span> {strings.details.close}
      </button>
      <StudyCard
        key={`${word.concept}-${singleMarkLanguage}`}
        word={word}
        anchor={anchor}
        translationLanguages={translationLanguages}
        studyLanguageOrder={studyLanguageOrder}
        progressLanguageOrder={progressLanguageOrder}
        step={step}
        total={total}
        nextConceptLabel={nextConceptLabel}
        getLanguageStatus={getLanguageStatus}
        onLanguageStatus={onLanguageStatus}
        singleMarkLanguage={singleMarkLanguage}
      />
    </aside>
  )
}
