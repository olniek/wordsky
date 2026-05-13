import { catCorpusExamples, catCorpusMeta } from './corpus/catCorpusExamples'
import { everydayNouns100 } from './topicEverydayNouns100'

export type LanguageCode = 'EN' | 'DE' | 'PT' | 'ES' | 'FR' | 'IT'
export type TopicSlug = 'animals' | 'family' | 'city' | 'nature' | 'everyday-nouns'

/** Authoring-only CEFR-style band; not shown in Study until product explicitly uses it. */
export const cefrHintLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CefrHintLevel = (typeof cefrHintLevels)[number]

export type Topic = {
  slug: TopicSlug
  title: string
  description: string
}

export type TopicWord = {
  concept: string
  forms: Record<LanguageCode, string>
  /**
   * Optional article (or language-appropriate determiner) shown and spoken before the lemma,
   * e.g. German gender articles on substantives.
   */
  articles?: Partial<Record<LanguageCode, string>>
  /** Map layout band: order follows `MAP_GROUP_ORDER[topic]`. */
  mapGroup: string
  difficulty?: 1 | 2 | 3
  /** Cross-cutting author hints (e.g. `false-friend-*`, `cognate-*`); optional UI later. */
  tags?: string[]
  /** A1 example sentence per language; all six required (`npm run lint:topic-data`); same meaning across languages (like `forms`). */
  examples: Record<LanguageCode, string>
  /**
   * Optional extra sentences for “More detail” in Study (1–5 strings per language key present).
   * UI uses the learner’s anchor language only when that key exists.
   */
  corpusExamples?: Partial<Record<LanguageCode, readonly string[]>>
  /** Authoring-only: corpus snapshot / license note for audits (not shown in Study). */
  corpusMeta?: { sourceId: string; licensedAs: string }
  /** Optional row-level CEFR band for audits and lint; authoring-only (see UX.md §9). */
  cefrHint?: CefrHintLevel
}

export const languageOrder: LanguageCode[] = ['EN', 'DE', 'PT', 'ES', 'FR', 'IT']

export const languageColors: Record<LanguageCode, string> = {
  EN: '#4fa3ff',
  DE: '#f5bf53',
  PT: '#53d788',
  ES: '#ff6161',
  FR: '#c78bff',
  IT: '#ff9f6e',
}

const everydayByConcept = new Map(everydayNouns100.map((row) => [row.concept, row]))

/**
 * Build a topic row from [`topicEverydayNouns100`](./topicEverydayNouns100.ts) so `forms` / `articles` / `tags`
 * stay aligned; pass target `mapGroup`, `difficulty`, etc. in `patch`.
 */
export function mirrorEveryday(concept: string, patch: Partial<TopicWord>): TopicWord {
  const base = everydayByConcept.get(concept)
  if (!base) {
    throw new Error(`mirrorEveryday: no everyday row for concept "${concept}"`)
  }
  return { ...base, ...patch }
}

/** Display order of `mapGroup` on the Map (meaning-first islands). */
export const MAP_GROUP_ORDER: Record<TopicSlug, readonly string[]> = {
  animals: ['pets', 'rodents', 'farm', 'birds', 'wild', 'water'],
  family: ['core', 'extended'],
  city: ['mobility', 'geo', 'public', 'commerce', 'home'],
  nature: ['sky', 'land', 'water', 'plants', 'weather'],
  'everyday-nouns': [
    'people',
    'body',
    'home',
    'food',
    'time',
    'place',
    'transport',
    'nature',
    'things',
    'abstract',
  ],
}

export const topics: Topic[] = [
  { slug: 'animals', title: 'Animals', description: 'Basic A1 animals you use every day.' },
  { slug: 'family', title: 'Family', description: 'Core family members and relations.' },
  { slug: 'city', title: 'City', description: 'Useful words for places in town.' },
  { slug: 'nature', title: 'Nature', description: 'Simple outdoors and weather words.' },
  {
    slug: 'everyday-nouns',
    title: 'Everyday nouns',
    description:
      'One hundred common English nouns with translations—general words you may also see in other topics.',
  },
]

export const topicWords: Record<TopicSlug, TopicWord[]> = {
  family: [
    {
      concept: 'father',
      mapGroup: 'core',
      forms: { EN: 'father', DE: 'Vater', PT: 'pai', ES: 'padre', FR: 'père', IT: 'padre' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      tags: ['family-core'],
      examples: {
        EN: 'My father cooks dinner on Sundays.',
        DE: 'Mein Vater kocht sonntags das Abendessen.',
        PT: 'O meu pai cozinha o jantar aos domingos.',
        ES: 'Mi padre cocina la cena los domingos.',
        FR: 'Mon père prépare le dîner le dimanche.',
        IT: 'Mio padre cucina la cena la domenica.',
      },
    },
    {
      concept: 'mother',
      mapGroup: 'core',
      forms: { EN: 'mother', DE: 'Mutter', PT: 'mãe', ES: 'madre', FR: 'mère', IT: 'madre' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      tags: ['family-core'],
      examples: {
        EN: 'My mother speaks three languages.',
        DE: 'Meine Mutter spricht drei Sprachen.',
        PT: 'A minha mãe fala três línguas.',
        ES: 'Mi madre habla tres idiomas.',
        FR: 'Ma mère parle trois langues.',
        IT: 'Mia madre parla tre lingue.',
      },
    },
    {
      concept: 'brother',
      mapGroup: 'core',
      forms: { EN: 'brother', DE: 'Bruder', PT: 'irmão', ES: 'hermano', FR: 'frère', IT: 'fratello' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      tags: ['family-core'],
      examples: {
        EN: 'My brother lives near the city center.',
        DE: 'Mein Bruder lebt nahe der Innenstadt.',
        PT: 'O meu irmão mora perto do centro da cidade.',
        ES: 'Mi hermano vive cerca del centro.',
        FR: 'Mon frère habite près du centre-ville.',
        IT: 'Mio fratello vive vicino al centro.',
      },
    },
    {
      concept: 'sister',
      mapGroup: 'core',
      forms: { EN: 'sister', DE: 'Schwester', PT: 'irmã', ES: 'hermana', FR: 'sœur', IT: 'sorella' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      tags: ['family-core'],
      examples: {
        EN: 'My sister studies at university.',
        DE: 'Meine Schwester studiert an der Universität.',
        PT: 'A minha irmã estuda na universidade.',
        ES: 'Mi hermana estudia en la universidad.',
        FR: 'Ma sœur étudie à l’université.',
        IT: 'Mia sorella studia all’università.',
      },
    },
    {
      concept: 'son',
      mapGroup: 'core',
      forms: { EN: 'son', DE: 'Sohn', PT: 'filho', ES: 'hijo', FR: 'fils', IT: 'figlio' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'Her son plays football after school.',
        DE: 'Ihr Sohn spielt nach der Schule Fußball.',
        PT: 'O filho dela joga futebol depois da escola.',
        ES: 'Su hijo juega al fútbol después del colegio.',
        FR: 'Son fils joue au football après l’école.',
        IT: 'Suo figlio gioca a calcio dopo scuola.',
      },
    },
    {
      concept: 'daughter',
      mapGroup: 'core',
      forms: { EN: 'daughter', DE: 'Tochter', PT: 'filha', ES: 'hija', FR: 'fille', IT: 'figlia' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'Their daughter draws very well.',
        DE: 'Ihre Tochter zeichnet sehr gut.',
        PT: 'A filha deles desenha muito bem.',
        ES: 'Su hija dibuja muy bien.',
        FR: 'Leur fille dessine très bien.',
        IT: 'Loro figlia disegna molto bene.',
      },
    },
    {
      concept: 'grandmother',
      mapGroup: 'extended',
      forms: { EN: 'grandmother', DE: 'Großmutter', PT: 'avó', ES: 'abuela', FR: 'grand-mère', IT: 'nonna' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'My grandmother tells funny stories.',
        DE: 'Meine Großmutter erzählt lustige Geschichten.',
        PT: 'A minha avó conta histórias engraçadas.',
        ES: 'Mi abuela cuenta historias graciosas.',
        FR: 'Ma grand-mère raconte des histoires drôles.',
        IT: 'Mia nonna racconta storie divertenti.',
      },
    },
    {
      concept: 'grandfather',
      mapGroup: 'extended',
      forms: { EN: 'grandfather', DE: 'Großvater', PT: 'avô', ES: 'abuelo', FR: 'grand-père', IT: 'nonno' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'My grandfather likes quiet music.',
        DE: 'Mein Großvater mag ruhige Musik.',
        PT: 'O meu avô gosta de música calma.',
        ES: 'A mi abuelo le gusta la música tranquila.',
        FR: 'Mon grand-père aime la musique calme.',
        IT: 'A mio nonno piace la musica tranquilla.',
      },
    },
    {
      concept: 'uncle',
      mapGroup: 'extended',
      forms: { EN: 'uncle', DE: 'Onkel', PT: 'tio', ES: 'tío', FR: 'oncle', IT: 'zio' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'l\'', IT: 'lo' },
      examples: {
        EN: 'My uncle lives in another city.',
        DE: 'Mein Onkel lebt in einer anderen Stadt.',
        PT: 'O meu tio mora noutra cidade.',
        ES: 'Mi tío vive en otra ciudad.',
        FR: 'Mon oncle vit dans une autre ville.',
        IT: 'Mio zio vive in un’altra città.',
      },
    },
    {
      concept: 'aunt',
      mapGroup: 'extended',
      forms: { EN: 'aunt', DE: 'Tante', PT: 'tia', ES: 'tía', FR: 'tante', IT: 'zia' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'My aunt sends us a letter every month.',
        DE: 'Meine Tante schickt uns jeden Monat einen Brief.',
        PT: 'A minha tia manda-nos uma carta todos os meses.',
        ES: 'Mi tía nos envía una carta cada mes.',
        FR: 'Ma tante nous envoie une lettre chaque mois.',
        IT: 'Mia zia ci manda una lettera ogni mese.',
      },
    },
    {
      concept: 'cousin',
      mapGroup: 'extended',
      forms: { EN: 'cousin', DE: 'Cousin', PT: 'primo', ES: 'primo', FR: 'cousin', IT: 'cugino' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'My cousin visits us in summer.',
        DE: 'Mein Cousin besucht uns im Sommer.',
        PT: 'O meu primo visita-nos no verão.',
        ES: 'Mi primo nos visita en verano.',
        FR: 'Mon cousin nous rend visite en été.',
        IT: 'Mio cugino ci visita in estate.',
      },
    },
    {
      concept: 'parents',
      mapGroup: 'core',
      forms: { EN: 'parents', DE: 'Eltern', PT: 'pais', ES: 'padres', FR: 'parents', IT: 'genitori' },
      articles: { EN: 'the', DE: 'die', PT: 'os', ES: 'los', FR: 'les', IT: 'i' },
      examples: {
        EN: 'My parents help me with homework.',
        DE: 'Meine Eltern helfen mir bei den Hausaufgaben.',
        PT: 'Os meus pais ajudam-me com os trabalhos de casa.',
        ES: 'Mis padres me ayudan con los deberes.',
        FR: 'Mes parents m’aident avec les devoirs.',
        IT: 'I miei genitori mi aiutano con i compiti.',
      },
    },
    {
      concept: 'child',
      mapGroup: 'core',
      forms: { EN: 'child', DE: 'Kind', PT: 'criança', ES: 'niño', FR: 'enfant', IT: 'bambino' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'el', FR: 'l\'', IT: 'il' },
      examples: {
        EN: 'Every child needs sleep and food.',
        DE: 'Jedes Kind braucht Schlaf und Essen.',
        PT: 'Toda a criança precisa de sono e de comida.',
        ES: 'Todo niño necesita dormir y comer.',
        FR: 'Chaque enfant a besoin de sommeil et de nourriture.',
        IT: 'Ogni bambino ha bisogno di sonno e cibo.',
      },
    },
    {
      concept: 'husband',
      mapGroup: 'core',
      forms: { EN: 'husband', DE: 'Ehemann', PT: 'marido', ES: 'esposo', FR: 'mari', IT: 'marito' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'Her husband works in a hospital.',
        DE: 'Ihr Mann arbeitet in einem Krankenhaus.',
        PT: 'O marido dela trabalha num hospital.',
        ES: 'Su esposo trabaja en un hospital.',
        FR: 'Son mari travaille à l’hôpital.',
        IT: 'Suo marito lavora in ospedale.',
      },
    },
    {
      concept: 'wife',
      mapGroup: 'core',
      forms: { EN: 'wife', DE: 'Ehefrau', PT: 'esposa', ES: 'esposa', FR: 'femme', IT: 'moglie' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'His wife teaches at a school.',
        DE: 'Seine Frau unterrichtet in einer Schule.',
        PT: 'A esposa dele ensina numa escola.',
        ES: 'Su esposa enseña en un colegio.',
        FR: 'Sa femme enseigne dans une école.',
        IT: 'Sua moglie insegna in una scuola.',
      },
    },
    mirrorEveryday('man', { mapGroup: 'core', difficulty: 1 }),
    mirrorEveryday('woman', { mapGroup: 'core', difficulty: 1 }),
    mirrorEveryday('boy', { mapGroup: 'core', difficulty: 1 }),
    mirrorEveryday('girl', { mapGroup: 'core', difficulty: 1 }),
    mirrorEveryday('baby', { mapGroup: 'core', difficulty: 1 }),
    mirrorEveryday('family', { mapGroup: 'core', difficulty: 1 }),
    mirrorEveryday('friend', { mapGroup: 'extended', difficulty: 1 }),
  ],
  animals: [
    {
      concept: 'dog',
      mapGroup: 'pets',
      forms: { EN: 'dog', DE: 'Hund', PT: 'cão', ES: 'perro', FR: 'chien', IT: 'cane' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      tags: ['animal-pet'],
      examples: {
        EN: 'The dog runs fast in the park.',
        DE: 'Der Hund rennt schnell im Park.',
        PT: 'O cão corre depressa no parque.',
        ES: 'El perro corre rápido en el parque.',
        FR: 'Le chien court vite dans le parc.',
        IT: 'Il cane corre veloce nel parco.',
      },
    },
    {
      concept: 'cat',
      mapGroup: 'pets',
      forms: { EN: 'cat', DE: 'Katze', PT: 'gato', ES: 'gato', FR: 'chat', IT: 'gatto' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      tags: ['animal-pet'],
      examples: {
        EN: 'The cat sleeps on the sofa.',
        DE: 'Die Katze schläft auf dem Sofa.',
        PT: 'O gato dorme no sofá.',
        ES: 'El gato duerme en el sofá.',
        FR: 'Le chat dort sur le canapé.',
        IT: 'Il gatto dorme sul divano.',
      },
      corpusExamples: catCorpusExamples,
      corpusMeta: catCorpusMeta,
    },
    {
      concept: 'bird',
      mapGroup: 'birds',
      forms: { EN: 'bird', DE: 'Vogel', PT: 'pássaro', ES: 'pájaro', FR: 'oiseau', IT: 'uccello' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
      difficulty: 1,
      tags: ['animal-wild'],
      examples: {
        EN: 'A bird sings in the morning.',
        DE: 'Ein Vogel singt am Morgen.',
        PT: 'Um pássaro canta de manhã.',
        ES: 'Un pájaro canta por la mañana.',
        FR: 'Un oiseau chante le matin.',
        IT: 'Un uccello canta al mattino.',
      },
    },
    {
      concept: 'fish',
      mapGroup: 'water',
      forms: { EN: 'fish', DE: 'Fisch', PT: 'peixe', ES: 'pez', FR: 'poisson', IT: 'pesce' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'The fish swims under the water.',
        DE: 'Der Fisch schwimmt im Wasser.',
        PT: 'O peixe nada debaixo de água.',
        ES: 'El pez nada bajo el agua.',
        FR: 'Le poisson nage sous l’eau.',
        IT: 'Il pesce nuota sotto l’acqua.',
      },
    },
    {
      concept: 'horse',
      mapGroup: 'farm',
      forms: { EN: 'horse', DE: 'Pferd', PT: 'cavalo', ES: 'caballo', FR: 'cheval', IT: 'cavallo' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'The horse runs in the field.',
        DE: 'Das Pferd rennt auf dem Feld.',
        PT: 'O cavalo corre no campo.',
        ES: 'El caballo corre en el campo.',
        FR: 'Le cheval court dans le champ.',
        IT: 'Il cavallo corre nel campo.',
      },
    },
    {
      concept: 'cow',
      mapGroup: 'farm',
      forms: { EN: 'cow', DE: 'Kuh', PT: 'vaca', ES: 'vaca', FR: 'vache', IT: 'mucca' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'The cow gives milk on the farm.',
        DE: 'Die Kuh gibt Milch auf dem Bauernhof.',
        PT: 'A vaca dá leite na quinta.',
        ES: 'La vaca da leche en la granja.',
        FR: 'La vache donne du lait à la ferme.',
        IT: 'La mucca dà latte in fattoria.',
      },
    },
    {
      concept: 'pig',
      mapGroup: 'farm',
      forms: { EN: 'pig', DE: 'Schwein', PT: 'porco', ES: 'cerdo', FR: 'cochon', IT: 'maiale' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'The pig eats from a trough.',
        DE: 'Das Schwein frisst aus dem Trog.',
        PT: 'O porco come de um cocho.',
        ES: 'El cerdo come del comedero.',
        FR: 'Le cochon mange dans l’auge.',
        IT: 'Il maiale mangia dalla mangiatoia.',
      },
    },
    {
      concept: 'sheep',
      mapGroup: 'farm',
      forms: { EN: 'sheep', DE: 'Schaf', PT: 'ovelha', ES: 'oveja', FR: 'mouton', IT: 'pecora' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'le', IT: 'la' },
      examples: {
        EN: 'The sheep stay together on the hill.',
        DE: 'Die Schafe bleiben zusammen am Hügel.',
        PT: 'As ovelhas ficam juntas na colina.',
        ES: 'Las ovejas se quedan juntas en la colina.',
        FR: 'Les moutons restent ensemble sur la colline.',
        IT: 'Le pecore stanno insieme sulla collina.',
      },
    },
    {
      concept: 'goat',
      mapGroup: 'farm',
      forms: { EN: 'goat', DE: 'Ziege', PT: 'cabra', ES: 'cabra', FR: 'chèvre', IT: 'capra' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'The goat climbs on the rocks.',
        DE: 'Die Ziege klettert auf den Felsen.',
        PT: 'A cabra sobe às rochas.',
        ES: 'La cabra sube a las rocas.',
        FR: 'La chèvre grimpe sur les rochers.',
        IT: 'La capra sale sulle rocce.',
      },
    },
    {
      concept: 'chicken',
      mapGroup: 'farm',
      forms: { EN: 'chicken', DE: 'Huhn', PT: 'galinha', ES: 'gallina', FR: 'poule', IT: 'gallina' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'The chicken lays an egg.',
        DE: 'Das Huhn legt ein Ei.',
        PT: 'A galinha põe um ovo.',
        ES: 'La gallina pone un huevo.',
        FR: 'La poule pond un œuf.',
        IT: 'La gallina fa un uovo.',
      },
    },
    {
      concept: 'duck',
      mapGroup: 'farm',
      forms: { EN: 'duck', DE: 'Ente', PT: 'pato', ES: 'pato', FR: 'canard', IT: 'anatra' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'le', IT: 'l\'' },
      examples: {
        EN: 'The duck swims in the lake.',
        DE: 'Die Ente schwimmt im See.',
        PT: 'O pato nada no lago.',
        ES: 'El pato nada en el lago.',
        FR: 'Le canard nage dans le lac.',
        IT: 'L’anatra nuota nel lago.',
      },
    },
    {
      concept: 'rabbit',
      mapGroup: 'pets',
      forms: { EN: 'rabbit', DE: 'Kaninchen', PT: 'coelho', ES: 'conejo', FR: 'lapin', IT: 'coniglio' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'The rabbit hides in the grass.',
        DE: 'Das Kaninchen versteckt sich im Gras.',
        PT: 'O coelho esconde-se na relva.',
        ES: 'El conejo se esconde en la hierba.',
        FR: 'Le lapin se cache dans l’herbe.',
        IT: 'Il coniglio si nasconde nell’erba.',
      },
    },
    {
      concept: 'mouse',
      mapGroup: 'rodents',
      forms: { EN: 'mouse', DE: 'Maus', PT: 'camundongo', ES: 'ratón', FR: 'souris', IT: 'topo' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'la', IT: 'il' },
      examples: {
        EN: 'A mouse runs along the wall.',
        DE: 'Eine Maus rennt an der Wand entlang.',
        PT: 'Um camundongo corre ao longo da parede.',
        ES: 'Un ratón corre a lo largo de la pared.',
        FR: 'Une souris court le long du mur.',
        IT: 'Un topo corre lungo la parete.',
      },
    },
    {
      concept: 'rat',
      mapGroup: 'rodents',
      forms: { EN: 'rat', DE: 'Ratte', PT: 'ratazana', ES: 'rata', FR: 'rat', IT: 'ratto' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'le', IT: 'il' },
      examples: {
        EN: 'We never see a rat in this house.',
        DE: 'Wir sehen nie eine Ratte in diesem Haus.',
        PT: 'Nunca vemos uma ratazana nesta casa.',
        ES: 'Nunca vemos una rata en esta casa.',
        FR: 'Nous ne voyons jamais de rat dans cette maison.',
        IT: 'Non vediamo mai un ratto in questa casa.',
      },
    },
    {
      concept: 'bear',
      mapGroup: 'wild',
      forms: { EN: 'bear', DE: 'Bär', PT: 'urso', ES: 'oso', FR: 'ours', IT: 'orso' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
      examples: {
        EN: 'The bear lives in the forest.',
        DE: 'Der Bär lebt im Wald.',
        PT: 'O urso vive na floresta.',
        ES: 'El oso vive en el bosque.',
        FR: 'L’ours vit dans la forêt.',
        IT: 'L’orso vive nella foresta.',
      },
    },
    {
      concept: 'wolf',
      mapGroup: 'wild',
      forms: { EN: 'wolf', DE: 'Wolf', PT: 'lobo', ES: 'lobo', FR: 'loup', IT: 'lupo' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'The wolf howls at night.',
        DE: 'Der Wolf heult nachts.',
        PT: 'O lobo uiva à noite.',
        ES: 'El lobo aúlla por la noche.',
        FR: 'Le loup hurle la nuit.',
        IT: 'Il lupo ulula di notte.',
      },
    },
  ],
  city: [
    {
      concept: 'street',
      mapGroup: 'mobility',
      forms: { EN: 'street', DE: 'Straße', PT: 'rua', ES: 'calle', FR: 'rue', IT: 'strada' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      tags: ['city-navigation'],
      examples: {
        EN: 'Turn left on this street.',
        DE: 'Biegen Sie in dieser Straße nach links ab.',
        PT: 'Vire à esquerda nesta rua.',
        ES: 'Gire a la izquierda en esta calle.',
        FR: 'Tournez à gauche dans cette rue.',
        IT: 'Giri a sinistra in questa strada.',
      },
    },
    {
      concept: 'station',
      mapGroup: 'mobility',
      forms: { EN: 'station', DE: 'Bahnhof', PT: 'estação', ES: 'estación', FR: 'gare', IT: 'stazione' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      tags: ['city-transport'],
      examples: {
        EN: 'The train station is nearby.',
        DE: 'Der Bahnhof ist in der Nähe.',
        PT: 'A estação de trem fica perto.',
        ES: 'La estación de tren está cerca.',
        FR: 'La gare est tout près.',
        IT: 'La stazione è vicina.',
      },
    },
    {
      concept: 'market',
      mapGroup: 'commerce',
      forms: { EN: 'market', DE: 'Markt', PT: 'mercado', ES: 'mercado', FR: 'marché', IT: 'mercato' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      tags: ['city-shopping'],
      examples: {
        EN: 'We buy fruit at the market.',
        DE: 'Wir kaufen Obst auf dem Markt.',
        PT: 'Compramos fruta no mercado.',
        ES: 'Compramos fruta en el mercado.',
        FR: 'Nous achetons des fruits au marché.',
        IT: 'Compriamo frutta al mercato.',
      },
    },
    {
      concept: 'school',
      mapGroup: 'public',
      forms: { EN: 'school', DE: 'Schule', PT: 'escola', ES: 'escuela', FR: 'école', IT: 'scuola' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'l\'', IT: 'la' },
      examples: {
        EN: 'The school is next to the park.',
        DE: 'Die Schule liegt neben dem Park.',
        PT: 'A escola fica ao lado do parque.',
        ES: 'La escuela está al lado del parque.',
        FR: 'L’école est à côté du parc.',
        IT: 'La scuola è accanto al parco.',
      },
    },
    {
      concept: 'house',
      mapGroup: 'home',
      forms: { EN: 'house', DE: 'Haus', PT: 'casa', ES: 'casa', FR: 'maison', IT: 'casa' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'Their house has a red door.',
        DE: 'Ihr Haus hat eine rote Tür.',
        PT: 'A casa deles tem uma porta vermelha.',
        ES: 'Su casa tiene una puerta roja.',
        FR: 'Leur maison a une porte rouge.',
        IT: 'La loro casa ha una porta rossa.',
      },
    },
    {
      concept: 'building',
      mapGroup: 'home',
      forms: { EN: 'building', DE: 'Gebäude', PT: 'prédio', ES: 'edificio', FR: 'immeuble', IT: 'edificio' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
      examples: {
        EN: 'That building is very old.',
        DE: 'Dieses Gebäude ist sehr alt.',
        PT: 'Aquele prédio é muito antigo.',
        ES: 'Ese edificio es muy antiguo.',
        FR: 'Ce bâtiment est très ancien.',
        IT: 'Quell’edificio è molto vecchio.',
      },
    },
    {
      concept: 'park',
      mapGroup: 'public',
      forms: { EN: 'park', DE: 'Park', PT: 'parque', ES: 'parque', FR: 'parc', IT: 'parco' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'We sit on a bench in the park.',
        DE: 'Wir sitzen auf einer Bank im Park.',
        PT: 'Sentamo-nos num banco no parque.',
        ES: 'Nos sentamos en un banco del parque.',
        FR: 'Nous nous asseyons sur un banc dans le parc.',
        IT: 'Ci sediamo su una panchina al parco.',
      },
    },
    {
      concept: 'square',
      mapGroup: 'public',
      forms: { EN: 'square', DE: 'Platz', PT: 'praça', ES: 'plaza', FR: 'place', IT: 'piazza' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'The café is on the main square.',
        DE: 'Das Café liegt am Hauptplatz.',
        PT: 'O café fica na praça principal.',
        ES: 'El café está en la plaza principal.',
        FR: 'Le café est sur la place principale.',
        IT: 'Il bar è sulla piazza principale.',
      },
    },
    {
      concept: 'bridge',
      mapGroup: 'mobility',
      forms: { EN: 'bridge', DE: 'Brücke', PT: 'ponte', ES: 'puente', FR: 'pont', IT: 'ponte' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'The bridge crosses the river.',
        DE: 'Die Brücke führt über den Fluss.',
        PT: 'A ponte atravessa o rio.',
        ES: 'El puente cruza el río.',
        FR: 'Le pont traverse la rivière.',
        IT: 'Il ponte attraversa il fiume.',
      },
    },
    {
      concept: 'hospital',
      mapGroup: 'public',
      forms: { EN: 'hospital', DE: 'Krankenhaus', PT: 'hospital', ES: 'hospital', FR: 'hôpital', IT: 'ospedale' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
      examples: {
        EN: 'Doctors work in the hospital.',
        DE: 'Ärzte arbeiten im Krankenhaus.',
        PT: 'Os médicos trabalham no hospital.',
        ES: 'Los médicos trabajan en el hospital.',
        FR: 'Les médecins travaillent à l’hôpital.',
        IT: 'I medici lavorano in ospedale.',
      },
    },
    {
      concept: 'pharmacy',
      mapGroup: 'commerce',
      forms: { EN: 'pharmacy', DE: 'Apotheke', PT: 'farmácia', ES: 'farmacia', FR: 'pharmacie', IT: 'farmacia' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'You can buy medicine at the pharmacy.',
        DE: 'In der Apotheke können Sie Medikamente kaufen.',
        PT: 'Pode comprar medicamentos na farmácia.',
        ES: 'Puede comprar medicinas en la farmacia.',
        FR: 'Vous pouvez acheter des médicaments à la pharmacie.',
        IT: 'Può comprare medicine in farmacia.',
      },
    },
    {
      concept: 'bank',
      mapGroup: 'commerce',
      forms: { EN: 'bank', DE: 'Bank', PT: 'banco', ES: 'banco', FR: 'banque', IT: 'banca' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'la', IT: 'la' },
      examples: {
        EN: 'I need money from the bank.',
        DE: 'Ich brauche Geld von der Bank.',
        PT: 'Preciso de dinheiro no banco.',
        ES: 'Necesito dinero en el banco.',
        FR: 'J’ai besoin d’argent à la banque.',
        IT: 'Mi servono soldi in banca.',
      },
    },
    {
      concept: 'library',
      mapGroup: 'public',
      forms: { EN: 'library', DE: 'Bibliothek', PT: 'biblioteca', ES: 'biblioteca', FR: 'bibliothèque', IT: 'biblioteca' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      examples: {
        EN: 'The library is quiet on Sunday.',
        DE: 'Die Bibliothek ist sonntags ruhig.',
        PT: 'A biblioteca é calma ao domingo.',
        ES: 'La biblioteca está tranquila el domingo.',
        FR: 'La bibliothèque est calme le dimanche.',
        IT: 'La biblioteca è silenziosa la domenica.',
      },
    },
    {
      concept: 'restaurant',
      mapGroup: 'commerce',
      forms: {
        EN: 'restaurant',
        DE: 'Restaurant',
        PT: 'restaurante',
        ES: 'restaurante',
        FR: 'restaurant',
        IT: 'ristorante',
      },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      examples: {
        EN: 'We eat dinner at a small restaurant.',
        DE: 'Wir essen zu Abend in einem kleinen Restaurant.',
        PT: 'Jantamos num restaurante pequeno.',
        ES: 'Cenamos en un restaurante pequeño.',
        FR: 'Nous dînons dans un petit restaurant.',
        IT: 'Ceniamo in un piccolo ristorante.',
      },
    },
    {
      concept: 'hotel',
      mapGroup: 'commerce',
      forms: { EN: 'hotel', DE: 'Hotel', PT: 'hotel', ES: 'hotel', FR: 'hôtel', IT: 'hotel' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
      examples: {
        EN: 'The hotel is near the station.',
        DE: 'Das Hotel liegt nahe dem Bahnhof.',
        PT: 'O hotel fica perto da estação.',
        ES: 'El hotel está cerca de la estación.',
        FR: 'L’hôtel est près de la gare.',
        IT: 'L’hotel è vicino alla stazione.',
      },
    },
    mirrorEveryday('country', { mapGroup: 'geo', difficulty: 1 }),
    mirrorEveryday('city', { mapGroup: 'geo', difficulty: 1 }),
    mirrorEveryday('town', { mapGroup: 'geo', difficulty: 1 }),
    mirrorEveryday('place', { mapGroup: 'geo', difficulty: 1 }),
    mirrorEveryday('shop', { mapGroup: 'commerce', difficulty: 1 }),
    mirrorEveryday('car', { mapGroup: 'mobility', difficulty: 1 }),
    mirrorEveryday('bus', { mapGroup: 'mobility', difficulty: 1 }),
    mirrorEveryday('train', { mapGroup: 'mobility', difficulty: 1 }),
    mirrorEveryday('bike', { mapGroup: 'mobility', difficulty: 1 }),
    mirrorEveryday('plane', { mapGroup: 'mobility', difficulty: 1 }),
  ],
  nature: [
    {
      concept: 'tree',
      mapGroup: 'plants',
      forms: { EN: 'tree', DE: 'Baum', PT: 'árvore', ES: 'árbol', FR: 'arbre', IT: 'albero' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'el', FR: 'l\'', IT: 'l\'' },
      difficulty: 1,
      tags: ['nature-outdoor'],
      examples: {
        EN: 'That tree is very tall.',
        DE: 'Dieser Baum ist sehr hoch.',
        PT: 'Aquela árvore é muito alta.',
        ES: 'Ese árbol es muy alto.',
        FR: 'Cet arbre est très grand.',
        IT: 'Quell’albero è molto alto.',
      },
    },
    {
      concept: 'river',
      mapGroup: 'water',
      forms: { EN: 'river', DE: 'Fluss', PT: 'rio', ES: 'río', FR: 'rivière', IT: 'fiume' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'la', IT: 'il' },
      difficulty: 1,
      tags: ['nature-water'],
      examples: {
        EN: 'The river flows to the sea.',
        DE: 'Der Fluss fließt ins Meer.',
        PT: 'O rio vai para o mar.',
        ES: 'El río va al mar.',
        FR: 'La rivière va jusqu’à la mer.',
        IT: 'Il fiume va al mare.',
      },
    },
    {
      concept: 'mountain',
      mapGroup: 'land',
      forms: { EN: 'mountain', DE: 'Berg', PT: 'montanha', ES: 'montaña', FR: 'montagne', IT: 'montagna' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      tags: ['nature-landscape'],
      examples: {
        EN: 'We can see the mountain from here.',
        DE: 'Von hier aus sehen wir den Berg.',
        PT: 'Daqui vemos a montanha.',
        ES: 'Desde aquí vemos la montaña.',
        FR: 'On voit la montagne d’ici.',
        IT: 'Da qui vediamo la montagna.',
      },
    },
    {
      concept: 'sun',
      mapGroup: 'sky',
      forms: { EN: 'sun', DE: 'Sonne', PT: 'sol', ES: 'sol', FR: 'soleil', IT: 'sole' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      examples: {
        EN: 'The sun rises in the east.',
        DE: 'Die Sonne geht im Osten auf.',
        PT: 'O sol nasce a leste.',
        ES: 'El sol sale por el este.',
        FR: 'Le soleil se lève à l’est.',
        IT: 'Il sole sorge a est.',
      },
    },
    {
      concept: 'moon',
      mapGroup: 'sky',
      forms: { EN: 'moon', DE: 'Mond', PT: 'lua', ES: 'luna', FR: 'lune', IT: 'luna' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      examples: {
        EN: 'The moon looks small tonight.',
        DE: 'Der Mond sieht heute Nacht klein aus.',
        PT: 'A lua parece pequena esta noite.',
        ES: 'La luna se ve pequeña esta noche.',
        FR: 'La lune paraît petite ce soir.',
        IT: 'La luna sembra piccola stanotte.',
      },
    },
    {
      concept: 'star',
      mapGroup: 'sky',
      forms: { EN: 'star', DE: 'Stern', PT: 'estrela', ES: 'estrella', FR: 'étoile', IT: 'stella' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'l\'', IT: 'la' },
      difficulty: 1,
      examples: {
        EN: 'One bright star shines above us.',
        DE: 'Ein heller Stern leuchtet über uns.',
        PT: 'Uma estrela brilhante brilha sobre nós.',
        ES: 'Una estrella brillante brilla sobre nosotros.',
        FR: 'Une étoile brillante brille au-dessus de nous.',
        IT: 'Una stella luminosa brilla sopra di noi.',
      },
    },
    {
      concept: 'sky',
      mapGroup: 'sky',
      forms: { EN: 'sky', DE: 'Himmel', PT: 'céu', ES: 'cielo', FR: 'ciel', IT: 'cielo' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      examples: {
        EN: 'Birds fly high in the sky.',
        DE: 'Vögel fliegen hoch am Himmel.',
        PT: 'Os pássaros voam alto no céu.',
        ES: 'Los pájaros vuelan alto en el cielo.',
        FR: 'Les oiseaux volent haut dans le ciel.',
        IT: 'Gli uccelli volano in alto nel cielo.',
      },
    },
    {
      concept: 'sea',
      mapGroup: 'water',
      forms: { EN: 'sea', DE: 'Meer', PT: 'mar', ES: 'mar', FR: 'mer', IT: 'mare' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'la', IT: 'il' },
      difficulty: 1,
      tags: ['nature-water'],
      examples: {
        EN: 'The sea is cold in winter.',
        DE: 'Das Meer ist im Winter kalt.',
        PT: 'O mar está frio no inverno.',
        ES: 'El mar está frío en invierno.',
        FR: 'La mer est froide en hiver.',
        IT: 'Il mare è freddo in inverno.',
      },
    },
    {
      concept: 'lake',
      mapGroup: 'water',
      forms: { EN: 'lake', DE: 'See', PT: 'lago', ES: 'lago', FR: 'lac', IT: 'lago' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      tags: ['nature-water'],
      examples: {
        EN: 'We swim in the lake in summer.',
        DE: 'Wir schwimmen im Sommer im See.',
        PT: 'Nadamos no lago no verão.',
        ES: 'Nadamos en el lago en verano.',
        FR: 'Nous nageons dans le lac en été.',
        IT: 'Nuotiamo nel lago in estate.',
      },
    },
    {
      concept: 'forest',
      mapGroup: 'land',
      forms: { EN: 'forest', DE: 'Wald', PT: 'floresta', ES: 'bosque', FR: 'forêt', IT: 'foresta' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'el', FR: 'la', IT: 'la' },
      difficulty: 1,
      tags: ['nature-landscape'],
      examples: {
        EN: 'Deer live quietly in the forest.',
        DE: 'Rehe leben ruhig im Wald.',
        PT: 'Os veados vivem calmamente na floresta.',
        ES: 'Los ciervos viven tranquilos en el bosque.',
        FR: 'Les cerfs vivent tranquillement dans la forêt.',
        IT: 'I cervi vivono tranquilli nella foresta.',
      },
    },
    {
      concept: 'flower',
      mapGroup: 'plants',
      forms: { EN: 'flower', DE: 'Blume', PT: 'flor', ES: 'flor', FR: 'fleur', IT: 'fiore' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'il' },
      difficulty: 1,
      tags: ['nature-outdoor'],
      examples: {
        EN: 'A yellow flower grows by the path.',
        DE: 'Eine gelbe Blume wächst am Weg.',
        PT: 'Uma flor amarela cresce junto ao caminho.',
        ES: 'Una flor amarilla crece junto al camino.',
        FR: 'Une fleur jaune pousse près du chemin.',
        IT: 'Un fiore giallo cresce vicino al sentiero.',
      },
    },
    {
      concept: 'grass',
      mapGroup: 'plants',
      forms: { EN: 'grass', DE: 'Gras', PT: 'grama', ES: 'hierba', FR: 'herbe', IT: 'erba' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'l\'', IT: 'l\'' },
      difficulty: 1,
      tags: ['nature-outdoor'],
      examples: {
        EN: 'The grass is green after rain.',
        DE: 'Das Gras ist nach dem Regen grün.',
        PT: 'A grama fica verde depois da chuva.',
        ES: 'La hierba está verde después de la lluvia.',
        FR: 'L’herbe est verte après la pluie.',
        IT: 'L’erba è verde dopo la pioggia.',
      },
    },
    {
      concept: 'stone',
      mapGroup: 'land',
      forms: { EN: 'stone', DE: 'Stein', PT: 'pedra', ES: 'piedra', FR: 'pierre', IT: 'pietra' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      tags: ['nature-landscape'],
      examples: {
        EN: 'He sits on a flat stone.',
        DE: 'Er sitzt auf einem flachen Stein.',
        PT: 'Ele senta-se numa pedra plana.',
        ES: 'Él se sienta en una piedra plana.',
        FR: 'Il s’assoit sur une pierre plate.',
        IT: 'Si siede su una pietra piatta.',
      },
    },
    {
      concept: 'rain',
      mapGroup: 'weather',
      forms: { EN: 'rain', DE: 'Regen', PT: 'chuva', ES: 'lluvia', FR: 'pluie', IT: 'pioggia' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
      difficulty: 1,
      examples: {
        EN: 'Heavy rain falls in spring.',
        DE: 'Im Frühling fällt starker Regen.',
        PT: 'Cai muita chuva na primavera.',
        ES: 'Llueve mucho en primavera.',
        FR: 'Il tombe beaucoup de pluie au printemps.',
        IT: 'Piove molto in primavera.',
      },
    },
    {
      concept: 'wind',
      mapGroup: 'weather',
      forms: { EN: 'wind', DE: 'Wind', PT: 'vento', ES: 'viento', FR: 'vent', IT: 'vento' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
      difficulty: 1,
      examples: {
        EN: 'The wind moves the clouds.',
        DE: 'Der Wind bewegt die Wolken.',
        PT: 'O vento move as nuvens.',
        ES: 'El viento mueve las nubes.',
        FR: 'Le vent déplace les nuages.',
        IT: 'Il vento muove le nuvole.',
      },
    },
  ],
  'everyday-nouns': everydayNouns100,
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug)
}

/**
 * Within one difficulty band, round-robin one word at a time from each `mapGroup`
 * in `MAP_GROUP_ORDER` so Study does not mass many same-band items in a row.
 */
function interleaveByMapGroup(topic: TopicSlug, rows: TopicWord[]): TopicWord[] {
  if (rows.length === 0) return []
  const order = MAP_GROUP_ORDER[topic]
  const rank = new Map(order.map((g, i) => [g, i]))
  const byGroup = new Map<string, TopicWord[]>()
  for (const row of rows) {
    const list = byGroup.get(row.mapGroup)
    if (list) list.push(row)
    else byGroup.set(row.mapGroup, [row])
  }
  for (const list of byGroup.values()) {
    list.sort((a, b) => a.concept.localeCompare(b.concept))
  }
  const groupKeys = [...byGroup.keys()].sort((ga, gb) => {
    const ra = rank.get(ga)
    const rb = rank.get(gb)
    if (ra !== undefined && rb !== undefined && ra !== rb) return ra - rb
    if (ra !== undefined && rb === undefined) return -1
    if (ra === undefined && rb !== undefined) return 1
    return ga.localeCompare(gb)
  })
  const out: TopicWord[] = []
  let round = 0
  let progress = true
  while (progress) {
    progress = false
    for (const g of groupKeys) {
      const list = byGroup.get(g)!
      if (round < list.length) {
        out.push(list[round])
        progress = true
      }
    }
    round += 1
  }
  return out
}

/** Study / queue order: ascending difficulty, then mapGroup round-robin (see `interleaveByMapGroup`). */
export function getGuidedTopicWords(topic: TopicSlug): TopicWord[] {
  const rows = topicWords[topic]
  const byDifficulty = new Map<number, TopicWord[]>()
  for (const row of rows) {
    const d = row.difficulty ?? 2
    const list = byDifficulty.get(d)
    if (list) list.push(row)
    else byDifficulty.set(d, [row])
  }
  const levels = [...byDifficulty.keys()].sort((a, b) => a - b)
  const out: TopicWord[] = []
  for (const d of levels) {
    out.push(...interleaveByMapGroup(topic, byDifficulty.get(d)!))
  }
  return out
}

export function getTopicWordByConcept(topic: TopicSlug, concept: string): TopicWord | undefined {
  return topicWords[topic].find((row) => row.concept === concept)
}
