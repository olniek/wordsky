import { describe, expect, it } from 'vitest'
import { applyPatterns, hasPatternsFor } from './patterns'

describe('applyPatterns', () => {
  it('always includes the input string', () => {
    expect(applyPatterns('hello', 'EN-PT')).toContain('hello')
  })

  it('transforms -tion → -ção for EN-PT', () => {
    expect(applyPatterns('information', 'EN-PT')).toContain('informação')
  })

  it('transforms -tion → -ción for EN-ES', () => {
    expect(applyPatterns('information', 'EN-ES')).toContain('información')
  })

  it('transforms ph → f', () => {
    expect(applyPatterns('philosophy', 'EN-IT')).toContain('filosofy')
  })

  it('transforms -dade → -dad for PT-ES', () => {
    expect(applyPatterns('cidade', 'PT-ES')).toContain('cidad')
  })

  it('reverses rules when only the opposite pair is defined', () => {
    // PT-ES has -ade → -idad. Reverse should map -idad → -ade.
    const reversed = applyPatterns('ciudad', 'ES-PT')
    expect(reversed.some((s) => s.endsWith('ade'))).toBe(true)
  })

  it('hasPatternsFor reports both directions', () => {
    expect(hasPatternsFor('EN-PT')).toBe(true)
    expect(hasPatternsFor('PT-EN')).toBe(true)
    expect(hasPatternsFor('PT-ES')).toBe(true)
    expect(hasPatternsFor('ES-PT')).toBe(true)
  })
})
