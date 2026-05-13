import { useId } from 'react'
import type { LanguageCode } from '../data/words'
import { languageLabels, strings } from '../lib/strings'
import { visibleStudyLanguages } from '../lib/progressLanguages'

type ProgressLanguagesPickerProps = {
  anchor: LanguageCode
  translationLanguages: LanguageCode[]
  value: LanguageCode[]
  onChange: (next: LanguageCode[]) => void
}

function ProgressLanguagesPicker({
  anchor,
  translationLanguages,
  value,
  onChange,
}: ProgressLanguagesPickerProps) {
  const legendId = useId()
  const visible = visibleStudyLanguages(anchor, translationLanguages)
  const valueSet = new Set(value)

  const toggle = (code: LanguageCode) => {
    if (valueSet.has(code)) {
      if (value.length <= 1) return
      onChange(value.filter((c) => c !== code))
    } else {
      onChange(visible.filter((c) => valueSet.has(c) || c === code))
    }
  }

  if (visible.length <= 1) {
    return null
  }

  return (
    <fieldset className="progress-lang-picker" aria-labelledby={legendId}>
      <legend id={legendId} className="progress-lang-picker-legend">
        {strings.landing.progressLangLegend}
      </legend>
      <p className="progress-lang-picker-hint">{strings.landing.progressLangHint}</p>
      <div className="progress-lang-picker-row">
        {visible.map((code) => {
          const checked = valueSet.has(code)
          const sole = checked && value.length === 1
          return (
            <label key={code} className="progress-lang-picker-option">
              <input type="checkbox" checked={checked} disabled={sole} onChange={() => toggle(code)} />
              <span>{languageLabels[code]}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default ProgressLanguagesPicker
