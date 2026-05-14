// Single source of truth for UI copy. Future i18n hooks can replace this map.
export const strings = {
  welcome: {
    title: 'Wordsky',
    navTopicHub: 'Topic hub',
    lead1: 'Quick A1 vocabulary across six languages — one concept at a time.',
    lead2: 'Choose your study language and which translations you want beside it.',
    lead3: 'Then pick a topic, read the prompt, and tap Show translations when you are ready.',
    langSectionTitle: 'Languages',
    continueToTopics: 'Choose a topic',
  },
  app: {
    storageWarning:
      'We could not save your progress on this device (storage may be full or blocked). Your session still works, but progress may not persist after you close the tab.',
    storageDismiss: 'Dismiss',
    storageChipAriaLabel: 'Progress is not being saved on this device',
    updateReady: 'A new version of Words Sky is ready.',
    updateReload: 'Reload',
    updateLater: 'Later',
    errorTitle: 'Something went wrong',
    errorBody: 'Try reloading the page. If this keeps happening, clear site data for this site and try again.',
    errorReload: 'Reload page',
  },
  landing: {
    title: 'Choose a topic',
    subtitleShort: 'A1 vocabulary · 6 languages',
    anchorLabel: 'Your study language',
    translationLegend: 'Show translations in',
    knownLegend: 'Languages you know',
    knownHint:
      'Your picks drive cross-language recognition hints on our A1 words—spelling, patterns, and occasional cognate or false-friend tags from the data. This is not the same as measuring everything you can do in a language.',
    recognitionCardTitle: (langLabel: string, pct: number) =>
      `About ${pct}% of ${langLabel} A1 words you may recognise`,
    recognitionStripFootnote:
      'Automated overlap hints from this app’s A1 topic list and the languages you picked—useful for planning, not the same as “how well you speak.”',
    /** Opens a short in-app explanation (hover on desktop; tap or keyboard elsewhere). */
    recognitionHowTrigger: 'How we estimate this',
    recognitionHowPopoverTitle: 'How recognition is estimated',
    recognitionHowClose: 'Close',
    recognitionHowBody1:
      'We merge every topic into one A1 list deduplicated by concept, then score each row that has a target-language form against the same concept in the languages you marked as known: spelling similarity, regular letter-pattern rules between pairs, and author tags for cognates or false friends (false friends cap how easy a match can look). Phrases with several words are scored per word and averaged. Each word is sorted into Known, Easy, Learnable, or New; the headline percent is every word that is not New, rounded.',
    recognitionHowBody2:
      'Treat it as an automated overlap hint for this app’s shared vocabulary—helpful for seeing where you might skim ahead—not a rating of how naturally you speak or follow speech in real life.',
    recognitionCardCta: 'See breakdown',
    recognitionCardEmpty: 'Pick which languages you know',
    recognitionCardEmptyCta: 'Pick languages',
    recognitionCardBreakdown: (k: number, e: number, l: number) =>
      `Known ${k} · Easy ${e} · Learnable ${l}`,
    recognitionStripLabel: 'Words you may already know',
    cardCtaStart: 'Start',
    cardCtaContinue: 'Continue',
    cardCtaReview: 'Review',
    /** Known (got it) count vs topic size — matches UX “learned / total” wording. */
    progressLearned: (known: number, total: number) => `${known} / ${total}`,
    cardStillLearningLine: (n: number) => `${n} still learning`,
    wordSearchLabel: 'Search any word',
    wordSearchPlaceholder: 'Search any word',
    wordSearchHint:
      'Matches English, German, Portuguese, Spanish, French, or Italian. Accents optional (for example cafe matches café).',
    wordSearchEmpty: 'No matches yet. Try another spelling.',
    /** Summary line: shown on Welcome under CTA and read-only on topic hub. */
    langSummary: (anchor: string, visibleLanguageCount: number) =>
      `${anchor} · ${visibleLanguageCount} languages`,
    langPopoverTitle: 'Languages',
    langPopoverClose: 'Done',
    /** Topic hub: link back to Welcome to change anchor / translations / known languages. */
    openLanguageSetup: 'Language setup',
  },
  topic: {
    back: 'Back to topics',
    modeStudy: 'Study',
    modeMap: 'Map',
    modeLabel: 'View mode',
    legendMap: 'Lines run from your language to the same word in each other language.',
    mapHint: 'Tap a word to open Study for that word. Pinch or scroll to zoom; drag to pan.',
    mapBandStripLabel: 'Jump to a section of this topic',
    mapBandJumpLabel: (label: string) => `Jump to ${label}`,
    mapBandProgress: (known: number, total: number) => `${known} / ${total}`,
    legendUnseen: 'Dim: not marked yet for this language.',
    legendLearning: 'Outline: still learning.',
    legendKnown: 'Bright: marked as got it.',
    progressAriaLabel: 'Progress',
    /** Visible when legend is closed; pair with `legendToggleOpenAriaLabel` on the control. */
    legendToggleOpen: '?',
    legendToggleOpenAriaLabel: 'What do the lines mean?',
    legendToggleClose: 'Hide legend',
    step: (current: number, total: number) => `Step ${current} of ${total}`,
    studyHint: 'Read the word, then tap Show translations to see it in the other languages.',
    showTranslations: 'Show translations',
    stillLearning: 'Still learning',
    gotIt: 'Got it',
    /** After each language row is marked, advance the Study queue. */
    continueNextWord: 'Continue',
    upNext: (concept: string) => `Up next: ${concept}`,
    finished: 'You finished this topic.',
    finishedSubtitle: 'Switch to Map to see everything you covered, or review the ones still marked learning.',
    startOver: 'Start over',
    reviewStillLearning: 'Review still learning',
    reviewBadge: 'Review',
    reviewEmptyTitle: 'Nothing to review',
    reviewEmptyBody: "Mark a word as 'Still learning' first, then come back to review.",
    reviewFinishedTitle: 'Review done',
    reviewFinishedBody: 'Nice work. Head back to Study when you are ready.',
    reviewBackToStudy: 'Back to Study',
    reviewHeaderProgress: (step: number, total: number) => `Review ${step} of ${total}`,
    emptyTitle: "We're still building this topic",
    emptyBody: 'Try another topic while we finish.',
    speakLabel: (lang: string) => `Listen in ${lang}`,
    speakExampleLabel: (lang: string) => `Listen to example in ${lang}`,
    shortcutsHint: 'Tip: Space or Enter to show translations.',
    /** Shown under a language row that is visible but excluded from the Learned / total score. */
    referenceOnlyProgress: 'Shown for reference. Not counted in your Learned score.',
    /** Shown on a translation row when `tags` include `false-friend-L1-L2` for that pair. */
    falseFriendHint: 'Looks like a cognate, but the meaning is not the same here.',
    /** Optional Study block: extra corpus-style sentences under More detail (per study language that has data). */
    moreDetail: 'More detail',
    moreDetailHide: 'Hide detail',
    corpusSentencesLabel: 'More example sentences',
    tokenCloudLabel: 'Words that repeat in these sentences',
  },
  details: {
    close: 'Close',
    concept: 'Concept',
    related: 'Related',
    example: 'Example',
    none: 'None',
  },
} as const

export const languageLabels = {
  EN: 'English',
  DE: 'German',
  PT: 'Portuguese',
  ES: 'Spanish',
  FR: 'French',
  IT: 'Italian',
} as const
