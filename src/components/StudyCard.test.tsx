import { useState } from 'react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudyCard from './StudyCard'
import { topicWords } from '../data/words'
import type { WordStatus } from '../lib/progress'
import { strings } from '../lib/strings'

const sampleWord = topicWords.family[0]!

afterEach(() => {
  cleanup()
})

describe('StudyCard', () => {
  it('after reveal, marks each language then Continue calls onContinueToNext', async () => {
    const user = userEvent.setup()
    const onContinueToNext = vi.fn()

    function Harness() {
      const [statuses, setStatuses] = useState<Record<string, WordStatus>>({
        EN: 'unseen',
        DE: 'unseen',
        PT: 'unseen',
      })
      return (
        <StudyCard
          word={sampleWord}
          anchor="EN"
          translationLanguages={['DE', 'PT']}
          studyLanguageOrder={['EN', 'DE', 'PT']}
          step={1}
          total={5}
          getLanguageStatus={(code) => statuses[code] ?? 'unseen'}
          onLanguageStatus={(code, status) => setStatuses((prev) => ({ ...prev, [code]: status }))}
          onContinueToNext={onContinueToNext}
        />
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: strings.topic.showTranslations }))

    for (let i = 0; i < 3; i += 1) {
      const gotItButtons = screen.getAllByRole('button', { name: strings.topic.gotIt })
      await user.click(gotItButtons[0]!)
    }

    const continueBtn = screen.getByRole('button', { name: strings.topic.continueNextWord })
    expect(continueBtn.hasAttribute('disabled')).toBe(false)
    await user.click(continueBtn)
    expect(onContinueToNext).toHaveBeenCalledTimes(1)
  })

  it('Continue stays disabled until every study language is marked', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [statuses, setStatuses] = useState<Record<string, WordStatus>>({
        EN: 'unseen',
        DE: 'unseen',
      })
      return (
        <StudyCard
          word={sampleWord}
          anchor="EN"
          translationLanguages={['DE']}
          studyLanguageOrder={['EN', 'DE']}
          step={1}
          total={3}
          getLanguageStatus={(code) => statuses[code] ?? 'unseen'}
          onLanguageStatus={(code, status) => setStatuses((prev) => ({ ...prev, [code]: status }))}
          onContinueToNext={vi.fn()}
        />
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: strings.topic.showTranslations }))
    const continueBtn = () => screen.getByRole('button', { name: strings.topic.continueNextWord })
    expect(continueBtn().hasAttribute('disabled')).toBe(true)

    await user.click(screen.getAllByRole('button', { name: strings.topic.gotIt })[0]!)
    expect(continueBtn().hasAttribute('disabled')).toBe(true)

    await user.click(screen.getByRole('button', { name: strings.topic.gotIt }))
    expect(continueBtn().hasAttribute('disabled')).toBe(false)
  })

  it('with progressLanguageOrder subset, Continue enables after only those rows are marked', async () => {
    const user = userEvent.setup()
    const onContinueToNext = vi.fn()

    function Harness() {
      const [statuses, setStatuses] = useState<Record<string, WordStatus>>({
        EN: 'unseen',
        DE: 'unseen',
        PT: 'unseen',
      })
      return (
        <StudyCard
          word={sampleWord}
          anchor="EN"
          translationLanguages={['DE', 'PT']}
          studyLanguageOrder={['EN', 'DE', 'PT']}
          progressLanguageOrder={['PT']}
          step={1}
          total={5}
          getLanguageStatus={(code) => statuses[code] ?? 'unseen'}
          onLanguageStatus={(code, status) => setStatuses((prev) => ({ ...prev, [code]: status }))}
          onContinueToNext={onContinueToNext}
        />
      )
    }

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: strings.topic.showTranslations }))

    expect(screen.getAllByText(strings.topic.referenceOnlyProgress).length).toBeGreaterThanOrEqual(2)

    await user.click(screen.getAllByRole('button', { name: strings.topic.gotIt })[0]!)

    const continueBtn = screen.getByRole('button', { name: strings.topic.continueNextWord })
    expect(continueBtn.hasAttribute('disabled')).toBe(false)
    await user.click(continueBtn)
    expect(onContinueToNext).toHaveBeenCalledTimes(1)
  })
})
