import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { strings } from '../../lib/strings'
import RecognitionReport from './RecognitionReport'

/** Accessible name prefix for the word list region when the "New" bucket is selected. */
const LEVEL_NEW_HEADING_PREFIX = /^New ·/

vi.mock('../../lib/knownLanguages', () => ({
  useKnownLanguages: () => [['EN'], vi.fn()],
}))

afterEach(() => {
  cleanup()
})

function renderReport(target = 'PT') {
  return render(
    <MemoryRouter initialEntries={[`/recognize/${target}`]}>
      <Routes>
        <Route path="/recognize/:target" element={<RecognitionReport />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RecognitionReport', () => {
  it('exposes level filters as a radiogroup with roving focus and arrow keys', async () => {
    const user = userEvent.setup()
    renderReport()
    const group = screen.getByRole('radiogroup', { name: strings.landing.recognitionLevelsGroupAria })
    const radios = within(group).getAllByRole('radio')
    expect(radios).toHaveLength(4)
    const [known, easy, learnable, newRadio] = radios
    expect(known.getAttribute('aria-checked')).toBe('true')
    expect(known.getAttribute('tabIndex')).toBe('0')
    expect(easy.getAttribute('tabIndex')).toBe('-1')

    known.focus()
    await user.keyboard('{ArrowDown}')
    expect(easy).toBe(document.activeElement)
    expect(easy.getAttribute('aria-checked')).toBe('true')
    expect(known.getAttribute('aria-checked')).toBe('false')

    await user.keyboard('{ArrowDown}')
    expect(learnable).toBe(document.activeElement)
    expect(learnable.getAttribute('aria-checked')).toBe('true')

    await user.keyboard('{Home}')
    expect(known).toBe(document.activeElement)
    expect(known.getAttribute('aria-checked')).toBe('true')

    await user.keyboard('{End}')
    expect(newRadio).toBe(document.activeElement)
    expect(newRadio.getAttribute('aria-checked')).toBe('true')

    const region = screen.getByRole('region', { name: LEVEL_NEW_HEADING_PREFIX })
    expect(newRadio.getAttribute('aria-controls')).toBe(region.id)
  })
})
