import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { strings } from '../../lib/strings'

/**
 * Short “how recognition works” copy: hover opens on fine pointers when the pointer
 * stays inside the wrapper; tap / Enter toggles pin; Escape and outside click clear pin.
 */
function RecognitionHowPopover() {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const titleId = useId()
  const [hoverInside, setHoverInside] = useState(false)
  const [pinned, setPinned] = useState(false)

  const open = hoverInside || pinned

  const dismissAll = useCallback(() => {
    setPinned(false)
    setHoverInside(false)
    requestAnimationFrame(() => {
      if (rootRef.current?.matches(':hover')) setHoverInside(true)
    })
  }, [])

  useEffect(() => {
    if (!pinned) return
    const onDocPointerDown = (e: PointerEvent) => {
      const el = rootRef.current
      if (!el?.contains(e.target as Node)) dismissAll()
    }
    document.addEventListener('pointerdown', onDocPointerDown, true)
    return () => document.removeEventListener('pointerdown', onDocPointerDown, true)
  }, [pinned, dismissAll])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        dismissAll()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, dismissAll])

  return (
    <div
      ref={rootRef}
      className="recognition-how-root"
      onMouseEnter={() => setHoverInside(true)}
      onMouseLeave={() => setHoverInside(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className="recognition-how-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setPinned((p) => !p)}
      >
        {strings.landing.recognitionHowTrigger}
      </button>
      {open ? (
        <div
          id={panelId}
          className="recognition-how-panel"
          role="region"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className="visually-hidden">
            {strings.landing.recognitionHowPopoverTitle}
          </h2>
          <p className="recognition-how-panel-body">{strings.landing.recognitionHowBody1}</p>
          <p className="recognition-how-panel-body">{strings.landing.recognitionHowBody2}</p>
          <button type="button" className="recognition-how-close" onClick={dismissAll}>
            {strings.landing.recognitionHowClose}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default RecognitionHowPopover
