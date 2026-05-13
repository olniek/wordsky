import type { LanguageCode } from '../words'

/** Three parallel A1 sentences per language for `concept: cat` (editorial, corpus-style selection). */
export const catCorpusExamples: Partial<Record<LanguageCode, readonly string[]>> = {
  EN: [
    'I have a cat at home.',
    'The cat likes to sit in the sun.',
    'My cat is very small.',
  ],
  DE: [
    'Ich habe zu Hause eine Katze.',
    'Die Katze sitzt gern in der Sonne.',
    'Meine Katze ist sehr klein.',
  ],
  PT: [
    'Tenho um gato em casa.',
    'O gato gosta de ficar ao sol.',
    'O meu gato é muito pequeno.',
  ],
  ES: [
    'Tengo un gato en casa.',
    'Al gato le gusta sentarse al sol.',
    'Mi gato es muy pequeño.',
  ],
  FR: [
    "J'ai un chat à la maison.",
    "Le chat aime s'asseoir au soleil.",
    'Mon chat est très petit.',
  ],
  IT: [
    'Ho un gatto a casa.',
    'Al gatto piace sedersi al sole.',
    'Il mio gatto è molto piccolo.',
  ],
}

export const catCorpusMeta = {
  sourceId: 'editorial-v1',
  licensedAs: 'CC BY 4.0 (project-authored teaching text)',
} as const
