import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TopicPage from './TopicPage'
import { strings } from '../../lib/strings'
import { getGuidedTopicWords, type TopicWord } from '../../data/words'

function activeAnchorHeading(): HTMLElement {
  // StudyCard renders the active word in a single <h2>. Use that as the anchor of truth.
  return screen.getByRole('heading', { level: 2 })
}

function expectAnchorWord(word: TopicWord) {
  expect(activeAnchorHeading().textContent).toContain(word.forms.EN)
}

// reactflow uses ResizeObserver during layout; happy-dom doesn't ship one.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver

function renderTopicPage(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/topic/:slug" element={<TopicPage />} />
        <Route path="*" element={<div data-testid="redirected" />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function markEveryLanguage(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: strings.topic.showTranslations }))
  // Each language row exposes its own "Got it" button until marked; loop until none remain.
  for (let safety = 0; safety < 12; safety += 1) {
    const remaining = screen.queryAllByRole('button', { name: strings.topic.gotIt })
    if (remaining.length === 0) break
    await user.click(remaining[0]!)
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('TopicPage', () => {
  it('redirects to landing for an unknown slug', () => {
    renderTopicPage('/topic/not-a-real-topic')
    expect(screen.getByTestId('redirected')).toBeTruthy()
  })

  it('renders the first guided word as a Study card', () => {
    renderTopicPage('/topic/family')
    expectAnchorWord(getGuidedTopicWords('family')[0]!)
  })

  it('advances to the next concept after marking every language and pressing Continue', async () => {
    const user = userEvent.setup()
    renderTopicPage('/topic/family')

    const [first, second] = getGuidedTopicWords('family')
    expectAnchorWord(first!)

    await markEveryLanguage(user)

    const continueBtn = screen.getByRole('button', { name: strings.topic.continueNextWord })
    expect(continueBtn.hasAttribute('disabled')).toBe(false)
    await user.click(continueBtn)

    await waitFor(() => expectAnchorWord(second!))
  })

  it('persists active step across remount via session storage', async () => {
    const user = userEvent.setup()
    const { unmount } = renderTopicPage('/topic/family')

    expect(screen.getByText(/^Step 1 of /)).toBeTruthy()

    await markEveryLanguage(user)
    await user.click(screen.getByRole('button', { name: strings.topic.continueNextWord }))

    await waitFor(() => expect(screen.getByText(/^Step 2 of /)).toBeTruthy())

    unmount()
    renderTopicPage('/topic/family')

    // After remount the user lands at least past step 1; the underlying queue
    // may reorder around already-known words, so we don't assert exact concept.
    expect(screen.queryByText(/^Step 1 of /)).toBeNull()
    expect(screen.getByText(/^Step \d+ of /).textContent).not.toMatch(/^Step 1 of /)
  })

  it('?word=<concept> deep-link starts at that concept', () => {
    const target = getGuidedTopicWords('family')[3]!
    renderTopicPage(`/topic/family?word=${encodeURIComponent(target.concept)}`)
    expectAnchorWord(target)
  })

  it('switching to Map mode lazy-loads the MapView and renders the map hint', async () => {
    const user = userEvent.setup()
    renderTopicPage('/topic/family')

    await user.click(screen.getByRole('tab', { name: strings.topic.modeMap }))

    // mapHint is rendered by the lazily-imported MapView once it resolves.
    expect(await screen.findByText(strings.topic.mapHint)).toBeTruthy()
  })

  it('review focus with no learning words shows the empty review state', () => {
    renderTopicPage('/topic/family?focus=learning')
    expect(screen.getByText(strings.topic.reviewEmptyTitle)).toBeTruthy()
  })
})
