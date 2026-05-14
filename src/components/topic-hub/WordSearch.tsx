import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { topics } from '../../data/words'
import type { LanguageCode } from '../../data/words'
import { searchVocabulary } from '../../lib/wordSearch'
import { languageLabels, strings } from '../../lib/strings'

const topicTitle = (slug: string) => topics.find((t) => t.slug === slug)?.title ?? slug

function formatMapSubgroupLabel(raw: string): string {
  return raw
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(' ')
}

type Props = {
  anchor: LanguageCode
}

function WordSearch({ anchor }: Props) {
  const [query, setQuery] = useState('')

  const hits = useMemo(() => searchVocabulary(query, 24), [query])

  return (
    <section className="word-search" aria-label={strings.landing.wordSearchLabel}>
      <div className="word-search-inner">
        <label htmlFor="word-search-input" className="visually-hidden">
          {strings.landing.wordSearchLabel}
        </label>
        <div className="word-search-field">
          <span className="word-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="word-search-input"
            className="word-search-input"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            placeholder={strings.landing.wordSearchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query.trim() ? (
          hits.length === 0 ? (
            <p className="word-search-empty" role="status">
              {strings.landing.wordSearchEmpty}
            </p>
          ) : (
            <ul className="word-search-results">
              {hits.map((hit) => {
                const title = topicTitle(hit.topicSlug)
                const primary = hit.word.forms[anchor]
                const to = `/topic/${hit.topicSlug}?word=${encodeURIComponent(hit.concept)}`
                return (
                  <li key={`${hit.topicSlug}-${hit.concept}`}>
                    <Link className="word-search-hit" to={to}>
                      <span className="word-search-hit-primary">{primary}</span>
                      <span className="word-search-hit-meta">
                        {title}
                        <span className="word-search-hit-subgroup">
                          {' · '}
                          {formatMapSubgroupLabel(hit.word.mapGroup)}
                        </span>
                        {hit.matchedLanguages.length > 0 ? (
                          <span className="word-search-hit-langs">
                            {' '}
                            ·{' '}
                            {hit.matchedLanguages.map((l) => languageLabels[l]).join(', ')}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )
        ) : null}
      </div>
    </section>
  )
}

export default WordSearch
