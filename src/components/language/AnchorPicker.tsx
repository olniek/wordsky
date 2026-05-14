import { useId } from 'react'
import { languageOrder, type LanguageCode } from '../../data/words'
import { languageLabels, strings } from '../../lib/strings'

type AnchorPickerProps = {
  value: LanguageCode
  onChange: (next: LanguageCode) => void
  /**
   * `select` (default) renders the inline labelled `<select>` used by older surfaces;
   * `chips` renders a chip row for use inside the Landing language popover.
   */
  variant?: 'select' | 'chips'
}

function AnchorPicker({ value, onChange, variant = 'select' }: AnchorPickerProps) {
  const id = useId()

  if (variant === 'chips') {
    const groupId = `${id}-group`
    return (
      <div className="anchor-picker anchor-picker-chips" role="group" aria-labelledby={groupId}>
        <span id={groupId} className="anchor-picker-label">
          {strings.landing.anchorLabel}
        </span>
        <div className="anchor-picker-chips-row">
          {languageOrder.map((code) => {
            const selected = code === value
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`lang-chip ${selected ? 'lang-chip-on' : ''}`}
                onClick={() => onChange(code)}
              >
                {languageLabels[code]}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

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
