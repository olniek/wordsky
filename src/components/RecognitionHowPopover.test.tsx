import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import RecognitionHowPopover from './RecognitionHowPopover'
import { strings } from '../lib/strings'

afterEach(() => {
  cleanup()
})

describe('RecognitionHowPopover', () => {
  it('opens from keyboard and shows body text', async () => {
    const user = userEvent.setup()
    render(<RecognitionHowPopover />)
    const trigger = screen.getByRole('button', { name: strings.landing.recognitionHowTrigger })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region').textContent).toContain(strings.landing.recognitionHowBody.slice(0, 40))
    await user.keyboard('{Escape}')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes from Close control', async () => {
    const user = userEvent.setup()
    render(<RecognitionHowPopover />)
    const trigger = screen.getByRole('button', { name: strings.landing.recognitionHowTrigger })
    await user.click(trigger)
    expect(screen.getByRole('region')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: strings.landing.recognitionHowClose }))
    expect(screen.queryByRole('region')).toBeNull()
  })
})
