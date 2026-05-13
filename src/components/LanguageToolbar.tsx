import { useEffect, useId, useRef, useState } from 'react'
import type { LanguageCode } from '../data/words'
import { mapVisibleLanguageCodes } from '../lib/graph'
import { languageLabels, strings } from '../lib/strings'
import AnchorPicker from './AnchorPicker'
import TranslationLanguagePicker from './TranslationLanguagePicker'

type LanguageToolbarProps = {
  anchor: LanguageCode
  onAnchorChange: (next: LanguageCode) => void
  translationLanguages: LanguageCode[]
  onTranslationLanguagesChange: (next: LanguageCode[]) => void
}

function LanguageToolbar({
  anchor,
  onAnchorChange,
  translationLanguages,
  onTranslationLanguagesChange,
}: LanguageToolbarProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerId = useId()
  const popoverId = useId()
  const titleId = `${triggerId}-popover-title`

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      const root = wrapRef.current
      if (!root || root.contains(event.target as Node)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const visibleLanguageCount = mapVisibleLanguageCodes(anchor, translationLanguages).length
  const summary = strings.landing.langSummary(languageLabels[anchor], visibleLanguageCount)

  return (
    <div className="language-toolbar" ref={wrapRef}>
      <button
        type="button"
        id={triggerId}
        className="language-toolbar-trigger"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        {summary}
      </button>
      {open ? (
        <div
          id={popoverId}
          className="language-toolbar-popover"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className="language-toolbar-popover-title">
            {strings.landing.langPopoverTitle}
          </h2>
          <div className="language-toolbar-popover-body">
            <AnchorPicker value={anchor} onChange={onAnchorChange} variant="chips" />
            <TranslationLanguagePicker
              anchor={anchor}
              value={translationLanguages}
              onChange={onTranslationLanguagesChange}
            />
          </div>
          <button type="button" className="language-toolbar-done" onClick={() => setOpen(false)}>
            {strings.landing.langPopoverClose}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default LanguageToolbar
