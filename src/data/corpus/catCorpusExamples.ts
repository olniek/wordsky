import type { LanguageCode } from '../words'

/** Five parallel A1 sentences per language for `concept: cat` (editorial, corpus-style selection). */
export const catCorpusExamples: Partial<Record<LanguageCode, readonly string[]>> = {
  EN: [
    'I have a cat at home.',
    'The cat likes to sit in the sun.',
    'My cat is very small.',
    'The cat ran across the garden.',
    'She feeds the cat every morning.',
  ],
  DE: [
    'Ich habe zu Hause eine Katze.',
    'Die Katze sitzt gern in der Sonne.',
    'Meine Katze ist sehr klein.',
    'Die Katze rannte durch den Garten.',
    'Sie füttert die Katze jeden Morgen.',
  ],
  PT: [
    'Tenho um gato em casa.',
    'O gato gosta de ficar ao sol.',
    'O meu gato é muito pequeno.',
    'O gato correu pelo jardim.',
    'Ela alimenta o gato todas as manhãs.',
  ],
  ES: [
    'Tengo un gato en casa.',
    'Al gato le gusta sentarse al sol.',
    'Mi gato es muy pequeño.',
    'El gato corrió por el jardín.',
    'Ella le da de comer al gato cada mañana.',
  ],
  FR: [
    "J'ai un chat à la maison.",
    "Le chat aime s'asseoir au soleil.",
    'Mon chat est très petit.',
    'Le chat a traversé le jardin en courant.',
    'Elle donne à manger au chat chaque matin.',
  ],
  IT: [
    'Ho un gatto a casa.',
    'Al gatto piace sedersi al sole.',
    'Il mio gatto è molto piccolo.',
    'Il gatto ha attraversato il giardino di corsa.',
    'Lei dà da mangiare al gatto ogni mattina.',
  ],
}

export const catCorpusMeta = {
  sourceId: 'editorial-v1',
  licensedAs: 'CC BY 4.0 (project-authored teaching text)',
} as const
