import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { languageLabels, strings } from '../../lib/strings'
import { useAnchorLanguage } from '../../lib/anchor'
import { mapVisibleLanguageCodes } from '../../lib/graph'
import { useTranslationLanguages } from '../../lib/translationLanguages'
import { useKnownLanguages } from '../../lib/knownLanguages'
import AnchorPicker from '../language/AnchorPicker'
import KnownLanguagesPicker from '../recognition/KnownLanguagesPicker'
import TranslationLanguagePicker from '../language/TranslationLanguagePicker'
import WelcomeConstellations from './WelcomeConstellations'
import RecognitionHowPopover from '../recognition/RecognitionHowPopover'
import RecognitionStrip from '../recognition/RecognitionStrip'

function WelcomeLanding() {
  const [anchor, setAnchor] = useAnchorLanguage()
  const [translationLanguages, setTranslationLanguages] = useTranslationLanguages(anchor)
  const [knownLanguages, setKnownLanguages] = useKnownLanguages()
  const visibleCount = useMemo(
    () => mapVisibleLanguageCodes(anchor, translationLanguages).length,
    [anchor, translationLanguages],
  )

  return (
    <main className="page-shell welcome-page">
      <div className="welcome-sky" aria-hidden="true">
        <WelcomeConstellations />
      </div>
      <div className="welcome-inner">
        <nav className="welcome-top-nav" aria-label="Welcome">
          <Link className="welcome-top-brand" to="/">
            {strings.welcome.title}
          </Link>
          <Link className="welcome-top-nav-link" to="/topics">
            {strings.welcome.navTopicHub}
          </Link>
        </nav>

        <header className="welcome-header">
          <p className="welcome-eyebrow">{strings.landing.subtitleShort}</p>
          <h1 className="welcome-title">{strings.welcome.title}</h1>
          <p className="welcome-lead">{strings.welcome.lead1}</p>
          <p className="welcome-lead">{strings.welcome.lead2}</p>
          <p className="welcome-lead">{strings.welcome.lead3}</p>
        </header>

        <section className="welcome-lang-card" aria-labelledby="welcome-lang-heading">
          <h2 id="welcome-lang-heading" className="welcome-lang-card-title">
            {strings.welcome.langSectionTitle}
          </h2>
          <div className="welcome-lang-card-body">
            <AnchorPicker value={anchor} onChange={setAnchor} variant="chips" />
            <TranslationLanguagePicker
              anchor={anchor}
              value={translationLanguages}
              onChange={setTranslationLanguages}
            />
            <KnownLanguagesPicker value={knownLanguages} onChange={setKnownLanguages} />
            <div className="welcome-recognition-how">
              <RecognitionHowPopover />
            </div>
          </div>
        </section>

        <div className="welcome-recognition-wrap">
          <RecognitionStrip knownLanguages={knownLanguages} emptyCtaHash="#welcome-lang-heading" />
        </div>

        <div className="welcome-actions">
          <Link className="welcome-primary-cta" to="/topics">
            {strings.welcome.continueToTopics}
          </Link>
          <p className="welcome-lang-hint">
            {strings.landing.langSummary(languageLabels[anchor], visibleCount)}
          </p>
        </div>
      </div>
    </main>
  )
}

export default WelcomeLanding
