import { useCallback, useId, useRef, type KeyboardEvent } from 'react'

export type TabItem<T extends string> = {
  value: T
  label: string
}

type TabsProps<T extends string> = {
  items: TabItem<T>[]
  value: T
  onChange: (next: T) => void
  ariaLabel: string
  className?: string
}

export function Tabs<T extends string>({ items, value, onChange, ariaLabel, className }: TabsProps<T>) {
  const groupId = useId()
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const focusByOffset = useCallback(
    (currentIndex: number, offset: number) => {
      const nextIndex = (currentIndex + offset + items.length) % items.length
      const next = items[nextIndex]
      refs.current[next.value]?.focus()
      onChange(next.value)
    },
    [items, onChange],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusByOffset(currentIndex, 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusByOffset(currentIndex, -1)
        break
      case 'Home':
        event.preventDefault()
        focusByOffset(0, 0)
        break
      case 'End':
        event.preventDefault()
        focusByOffset(items.length - 1, 0)
        break
    }
  }

  return (
    <div className={className} role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isActive = item.value === value
        const tabId = `${groupId}-${item.value}`
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[item.value] = el
            }}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={isActive ? 'is-active' : ''}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
