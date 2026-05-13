import { everydayNouns100 } from './topicEverydayNouns100'

export type LanguageCode = 'EN' | 'DE' | 'PT' | 'ES' | 'FR' | 'IT'
export type TopicSlug = 'animals' | 'family' | 'city' | 'nature' | 'everyday-nouns'

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
  /** Optional A1 example sentence per language (same meaning across languages when fully filled). */
  examples?: Partial<Record<LanguageCode, string>>
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
    },
    {
      concept: 'daughter',
      mapGroup: 'core',
      forms: { EN: 'daughter', DE: 'Tochter', PT: 'filha', ES: 'hija', FR: 'fille', IT: 'figlia' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'grandmother',
      mapGroup: 'extended',
      forms: { EN: 'grandmother', DE: 'Großmutter', PT: 'avó', ES: 'abuela', FR: 'grand-mère', IT: 'nonna' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'grandfather',
      mapGroup: 'extended',
      forms: { EN: 'grandfather', DE: 'Großvater', PT: 'avô', ES: 'abuelo', FR: 'grand-père', IT: 'nonno' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'uncle',
      mapGroup: 'extended',
      forms: { EN: 'uncle', DE: 'Onkel', PT: 'tio', ES: 'tío', FR: 'oncle', IT: 'zio' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'l\'', IT: 'lo' },
    },
    {
      concept: 'aunt',
      mapGroup: 'extended',
      forms: { EN: 'aunt', DE: 'Tante', PT: 'tia', ES: 'tía', FR: 'tante', IT: 'zia' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'cousin',
      mapGroup: 'extended',
      forms: { EN: 'cousin', DE: 'Cousin', PT: 'primo', ES: 'primo', FR: 'cousin', IT: 'cugino' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'parents',
      mapGroup: 'core',
      forms: { EN: 'parents', DE: 'Eltern', PT: 'pais', ES: 'padres', FR: 'parents', IT: 'genitori' },
      articles: { EN: 'the', DE: 'die', PT: 'os', ES: 'los', FR: 'les', IT: 'i' },
    },
    {
      concept: 'child',
      mapGroup: 'core',
      forms: { EN: 'child', DE: 'Kind', PT: 'criança', ES: 'niño', FR: 'enfant', IT: 'bambino' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'el', FR: 'l\'', IT: 'il' },
    },
    {
      concept: 'husband',
      mapGroup: 'core',
      forms: { EN: 'husband', DE: 'Ehemann', PT: 'marido', ES: 'esposo', FR: 'mari', IT: 'marito' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'wife',
      mapGroup: 'core',
      forms: { EN: 'wife', DE: 'Ehefrau', PT: 'esposa', ES: 'esposa', FR: 'femme', IT: 'moglie' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
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
    },
    {
      concept: 'horse',
      mapGroup: 'farm',
      forms: { EN: 'horse', DE: 'Pferd', PT: 'cavalo', ES: 'caballo', FR: 'cheval', IT: 'cavallo' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'cow',
      mapGroup: 'farm',
      forms: { EN: 'cow', DE: 'Kuh', PT: 'vaca', ES: 'vaca', FR: 'vache', IT: 'mucca' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'pig',
      mapGroup: 'farm',
      forms: { EN: 'pig', DE: 'Schwein', PT: 'porco', ES: 'cerdo', FR: 'cochon', IT: 'maiale' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'sheep',
      mapGroup: 'farm',
      forms: { EN: 'sheep', DE: 'Schaf', PT: 'ovelha', ES: 'oveja', FR: 'mouton', IT: 'pecora' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'le', IT: 'la' },
    },
    {
      concept: 'goat',
      mapGroup: 'farm',
      forms: { EN: 'goat', DE: 'Ziege', PT: 'cabra', ES: 'cabra', FR: 'chèvre', IT: 'capra' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'chicken',
      mapGroup: 'farm',
      forms: { EN: 'chicken', DE: 'Huhn', PT: 'galinha', ES: 'gallina', FR: 'poule', IT: 'gallina' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'duck',
      mapGroup: 'farm',
      forms: { EN: 'duck', DE: 'Ente', PT: 'pato', ES: 'pato', FR: 'canard', IT: 'anatra' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'le', IT: 'l\'' },
    },
    {
      concept: 'rabbit',
      mapGroup: 'pets',
      forms: { EN: 'rabbit', DE: 'Kaninchen', PT: 'coelho', ES: 'conejo', FR: 'lapin', IT: 'coniglio' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'mouse',
      mapGroup: 'rodents',
      forms: { EN: 'mouse', DE: 'Maus', PT: 'camundongo', ES: 'ratón', FR: 'souris', IT: 'topo' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'la', IT: 'il' },
    },
    {
      concept: 'rat',
      mapGroup: 'rodents',
      forms: { EN: 'rat', DE: 'Ratte', PT: 'ratazana', ES: 'rata', FR: 'rat', IT: 'ratto' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'le', IT: 'il' },
    },
    {
      concept: 'bear',
      mapGroup: 'wild',
      forms: { EN: 'bear', DE: 'Bär', PT: 'urso', ES: 'oso', FR: 'ours', IT: 'orso' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
    },
    {
      concept: 'wolf',
      mapGroup: 'wild',
      forms: { EN: 'wolf', DE: 'Wolf', PT: 'lobo', ES: 'lobo', FR: 'loup', IT: 'lupo' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
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
    },
    {
      concept: 'house',
      mapGroup: 'home',
      forms: { EN: 'house', DE: 'Haus', PT: 'casa', ES: 'casa', FR: 'maison', IT: 'casa' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'building',
      mapGroup: 'home',
      forms: { EN: 'building', DE: 'Gebäude', PT: 'prédio', ES: 'edificio', FR: 'immeuble', IT: 'edificio' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
    },
    {
      concept: 'park',
      mapGroup: 'public',
      forms: { EN: 'park', DE: 'Park', PT: 'parque', ES: 'parque', FR: 'parc', IT: 'parco' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'square',
      mapGroup: 'public',
      forms: { EN: 'square', DE: 'Platz', PT: 'praça', ES: 'plaza', FR: 'place', IT: 'piazza' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'bridge',
      mapGroup: 'mobility',
      forms: { EN: 'bridge', DE: 'Brücke', PT: 'ponte', ES: 'puente', FR: 'pont', IT: 'ponte' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'hospital',
      mapGroup: 'public',
      forms: { EN: 'hospital', DE: 'Krankenhaus', PT: 'hospital', ES: 'hospital', FR: 'hôpital', IT: 'ospedale' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
    },
    {
      concept: 'pharmacy',
      mapGroup: 'commerce',
      forms: { EN: 'pharmacy', DE: 'Apotheke', PT: 'farmácia', ES: 'farmacia', FR: 'pharmacie', IT: 'farmacia' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'bank',
      mapGroup: 'commerce',
      forms: { EN: 'bank', DE: 'Bank', PT: 'banco', ES: 'banco', FR: 'banque', IT: 'banca' },
      articles: { EN: 'the', DE: 'die', PT: 'o', ES: 'el', FR: 'la', IT: 'la' },
    },
    {
      concept: 'library',
      mapGroup: 'public',
      forms: { EN: 'library', DE: 'Bibliothek', PT: 'biblioteca', ES: 'biblioteca', FR: 'bibliothèque', IT: 'biblioteca' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
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
    },
    {
      concept: 'hotel',
      mapGroup: 'commerce',
      forms: { EN: 'hotel', DE: 'Hotel', PT: 'hotel', ES: 'hotel', FR: 'hôtel', IT: 'hotel' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'l\'', IT: 'l\'' },
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
    },
    {
      concept: 'moon',
      mapGroup: 'sky',
      forms: { EN: 'moon', DE: 'Mond', PT: 'lua', ES: 'luna', FR: 'lune', IT: 'luna' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'star',
      mapGroup: 'sky',
      forms: { EN: 'star', DE: 'Stern', PT: 'estrela', ES: 'estrella', FR: 'étoile', IT: 'stella' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'l\'', IT: 'la' },
    },
    {
      concept: 'sky',
      mapGroup: 'sky',
      forms: { EN: 'sky', DE: 'Himmel', PT: 'céu', ES: 'cielo', FR: 'ciel', IT: 'cielo' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'sea',
      mapGroup: 'water',
      forms: { EN: 'sea', DE: 'Meer', PT: 'mar', ES: 'mar', FR: 'mer', IT: 'mare' },
      articles: { EN: 'the', DE: 'das', PT: 'o', ES: 'el', FR: 'la', IT: 'il' },
    },
    {
      concept: 'lake',
      mapGroup: 'water',
      forms: { EN: 'lake', DE: 'See', PT: 'lago', ES: 'lago', FR: 'lac', IT: 'lago' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
    },
    {
      concept: 'forest',
      mapGroup: 'land',
      forms: { EN: 'forest', DE: 'Wald', PT: 'floresta', ES: 'bosque', FR: 'forêt', IT: 'foresta' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'el', FR: 'la', IT: 'la' },
    },
    {
      concept: 'flower',
      mapGroup: 'plants',
      forms: { EN: 'flower', DE: 'Blume', PT: 'flor', ES: 'flor', FR: 'fleur', IT: 'fiore' },
      articles: { EN: 'the', DE: 'die', PT: 'a', ES: 'la', FR: 'la', IT: 'il' },
    },
    {
      concept: 'grass',
      mapGroup: 'plants',
      forms: { EN: 'grass', DE: 'Gras', PT: 'grama', ES: 'hierba', FR: 'herbe', IT: 'erba' },
      articles: { EN: 'the', DE: 'das', PT: 'a', ES: 'la', FR: 'l\'', IT: 'l\'' },
    },
    {
      concept: 'stone',
      mapGroup: 'land',
      forms: { EN: 'stone', DE: 'Stein', PT: 'pedra', ES: 'piedra', FR: 'pierre', IT: 'pietra' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'rain',
      mapGroup: 'weather',
      forms: { EN: 'rain', DE: 'Regen', PT: 'chuva', ES: 'lluvia', FR: 'pluie', IT: 'pioggia' },
      articles: { EN: 'the', DE: 'der', PT: 'a', ES: 'la', FR: 'la', IT: 'la' },
    },
    {
      concept: 'wind',
      mapGroup: 'weather',
      forms: { EN: 'wind', DE: 'Wind', PT: 'vento', ES: 'viento', FR: 'vent', IT: 'vento' },
      articles: { EN: 'the', DE: 'der', PT: 'o', ES: 'el', FR: 'le', IT: 'il' },
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
