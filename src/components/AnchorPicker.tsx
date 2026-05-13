import { useId } from 'react'
import { languageOrder, type LanguageCode } from '../data/words'
import { languageLabels, strings } from '../lib/strings'

type AnchorPickerProps = {
  value: LanguageCode
  onChange: (next: LanguageCode) => void
}

function AnchorPicker({ value, onChange }: AnchorPickerProps) {
  const id = useId()
  return (
    <label className="anchor-picker" htmlFor={id}>
      <span className="anchor-picker-label">{strings.landing.anchorLabel}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as LanguageCode)}
      >
        {languageOrder.map((code) => (
          <option key={code} value={code}>
            {languageLabels[code]}
          </option>
        ))}
      </select>
    </label>
  )
}

export default AnchorPicker
