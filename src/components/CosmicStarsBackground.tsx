import { useMemo } from 'react'
import { STAR_COUNT } from '../lib/constants'

export function CosmicStarsBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const seed = (i * 23.5) % 100
        return {
          id: i,
          left: `${(seed * 2.91) % 100}%`,
          top: `${(seed * 6.81) % 100}%`,
          size: `${1 + (seed % 2)}px`,
          delay: `${(seed % 7) * -1}s`,
          duration: `${6 + (seed % 9)}s`,
        }
      }),
    [],
  )

  return (
    <div className="cosmic-stars" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  )
}
