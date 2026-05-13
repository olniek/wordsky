/**
 * Fold Latin-script text for case- and accent-insensitive comparison (EU learner content).
 * Used by vocabulary search and lemma affinity. Treats ß as ss for matching.
 */
export function latinFoldForSearch(input: string): string {
  const trimmed = input.trim().normalize('NFC')
  const stripped = trimmed.normalize('NFD').replace(/\p{M}/gu, '')
  return stripped.toLowerCase().replace(/\u00df/g, 'ss')
}
