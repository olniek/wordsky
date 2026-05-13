import type { BandMeta } from '../lib/graph'
import { strings } from '../lib/strings'

type BandWithProgress = BandMeta & {
  knownCount: number
}

type MapBandStripProps = {
  bands: BandWithProgress[]
  activeGroupId: string | null
  onJumpToBand: (band: BandMeta) => void
}

export function MapBandStrip({ bands, activeGroupId, onJumpToBand }: MapBandStripProps) {
  if (bands.length <= 1) return null
  return (
    <nav
      className="map-band-strip"
      aria-label={strings.topic.mapBandStripLabel}
    >
      <ul className="map-band-strip-list">
        {bands.map((band) => {
          const isActive = band.groupId === activeGroupId
          return (
            <li key={band.groupId}>
              <button
                type="button"
                className={['map-band-chip', isActive ? 'map-band-chip-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-current={isActive ? 'true' : undefined}
                aria-label={strings.topic.mapBandJumpLabel(band.label)}
                onClick={() => onJumpToBand(band)}
              >
                <span className="map-band-chip-label">{band.label}</span>
                <span className="map-band-chip-count" aria-hidden="true">
                  {strings.topic.mapBandProgress(band.knownCount, band.count)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
