import { useId } from 'react'
import { languageOrder, type LanguageCode } from '../data/words'
import { languageLabels, strings } from '../lib/strings'

type KnownLanguagesPickerProps = {
  value: LanguageCode[]
  onChange: (next: LanguageCode[]) => void
}

function sortByLanguageOrder(codes: LanguageCode[]): LanguageCode[] {
  return languageOrder.filter((c) => codes.includes(c))
}

function KnownLanguagesPicker({ value, onChange }: KnownLanguagesPickerProps) {
  const legendId = useId()

  const toggle = (code: LanguageCode) => {
    const isOn = value.includes(code)
    const next = isOn ? value.filter((c) => c !== code) : [...value, code]
    onChange(sortByLanguageOrder(next))
  }

  return (
    <fieldset className="known-lang-picker" aria-labelledby={legendId}>
      <legend id={legendId} className="known-lang-picker-legend">
        {strings.landing.knownLegend}
      </legend>
      <p className="known-lang-picker-hint">{strings.landing.knownHint}</p>
      <div className="known-lang-picker-row">
        {languageOrder.map((code) => {
          const checked = value.includes(code)
          return (
            <button
              key={code}
              type="button"
              role="checkbox"
              aria-checked={checked}
              className={`lang-chip ${checked ? 'lang-chip-on' : ''}`}
              onClick={() => toggle(code)}
            >
              {languageLabels[code]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default KnownLanguagesPicker
