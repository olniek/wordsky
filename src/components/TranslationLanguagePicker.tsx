import { useId } from 'react'
import { languageOrder, type LanguageCode } from '../data/words'
import { languageLabels, strings } from '../lib/strings'
import { translationCandidates } from '../lib/translationLanguages'

type TranslationLanguagePickerProps = {
  anchor: LanguageCode
  value: LanguageCode[]
  onChange: (next: LanguageCode[]) => void
}

function sortByLanguageOrder(codes: LanguageCode[]): LanguageCode[] {
  return languageOrder.filter((c) => codes.includes(c))
}

function TranslationLanguagePicker({ anchor, value, onChange }: TranslationLanguagePickerProps) {
  const legendId = useId()
  const candidates = translationCandidates(anchor)

  const toggle = (code: LanguageCode) => {
    const isOn = value.includes(code)
    if (isOn && value.length <= 1) {
      return
    }
    const next = isOn ? value.filter((c) => c !== code) : [...value, code]
    onChange(sortByLanguageOrder(next))
  }

  return (
    <fieldset className="translation-lang-picker" aria-labelledby={legendId}>
      <legend id={legendId} className="translation-lang-picker-legend">
        {strings.landing.translationLegend}
      </legend>
      <div className="translation-lang-picker-row">
        {candidates.map((code) => {
          const checked = value.includes(code)
          const sole = checked && value.length === 1
          return (
            <button
              key={code}
              type="button"
              role="checkbox"
              aria-checked={checked}
              aria-disabled={sole}
              className={`lang-chip ${checked ? 'lang-chip-on' : ''}`}
              onClick={() => {
                if (sole) return
                toggle(code)
              }}
            >
              {languageLabels[code]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default TranslationLanguagePicker
