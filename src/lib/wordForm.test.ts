import { describe, expect, it } from 'vitest'
import { displayWordForm } from './wordForm'
import type { TopicWord } from '../data/words'

const baseWord: TopicWord = {
  concept: 'tree',
  mapGroup: 'plants',
  forms: { EN: 'tree', DE: 'Baum', PT: 'árvore', ES: 'árbol', FR: 'arbre', IT: 'albero' },
}

describe('displayWordForm', () => {
  it('returns the bare lemma when no article is set', () => {
    expect(displayWordForm(baseWord, 'DE')).toBe('Baum')
  })

  it('prefixes a trimmed article for each language that has one', () => {
    const word: TopicWord = {
      ...baseWord,
      forms: { ...baseWord.forms, FR: 'chat' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'el', FR: 'le', IT: 'il' },
    }
    expect(displayWordForm(word, 'EN')).toBe('the tree')
    expect(displayWordForm(word, 'DE')).toBe('der Baum')
    expect(displayWordForm(word, 'PT')).toBe('a árvore')
    expect(displayWordForm(word, 'ES')).toBe('el árbol')
    expect(displayWordForm(word, 'FR')).toBe('le chat')
    expect(displayWordForm(word, 'IT')).toBe('il albero')
  })

  it("joins apostrophe-ending articles with the lemma without a space", () => {
    const word: TopicWord = {
      ...baseWord,
      articles: { FR: "l'" },
    }
    expect(displayWordForm(word, 'FR')).toBe("l'arbre")
  })

  it('ignores whitespace-only article entries', () => {
    const word: TopicWord = {
      ...baseWord,
      articles: { DE: '  ' },
    }
    expect(displayWordForm(word, 'DE')).toBe('Baum')
  })
})
