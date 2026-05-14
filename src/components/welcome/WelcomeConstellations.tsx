/**
 * Decorative SVG silhouettes: Orion, Lyra, Cygnus carry a soft glow; Gemini + Cassiopeia stay faint backdrop.
 * Not to scale; readable at a glance on small screens.
 */
function WelcomeConstellations() {
  return (
    <svg
      className="welcome-constellations-svg"
      aria-hidden="true"
      viewBox="0 0 900 560"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter
          id="welcome-star-glow"
          x="-120%"
          y="-120%"
          width="340%"
          height="340%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Cassiopeia — W silhouette (muted) */}
      <g
        className="welcome-constellation welcome-constellation-cassiopeia welcome-constellation-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 42 108 L 68 132 L 94 96 L 122 124 L 152 82" />
        <g fill="currentColor" stroke="none" opacity="0.55">
          <circle cx="42" cy="108" r="1.4" />
          <circle cx="94" cy="96" r="1.5" />
          <circle cx="152" cy="82" r="1.4" />
        </g>
      </g>
      <g
        className="welcome-constellation welcome-constellation-orion welcome-constellation-glow"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Orion — belt and shoulders */}
        <path d="M 120 280 L 145 268 L 168 262 L 192 258 L 218 262 L 242 272" />
        <path d="M 168 262 L 162 232 L 155 198" />
        <path d="M 218 262 L 228 228 L 238 195" />
        <path d="M 192 258 L 188 298 L 184 332" />
        <g fill="currentColor" className="welcome-constellation-star-dots" filter="url(#welcome-star-glow)">
          <circle cx="155" cy="198" r="2.2" />
          <circle cx="192" cy="258" r="2.8" />
          <circle cx="238" cy="195" r="2.2" />
          <circle cx="168" cy="262" r="1.9" />
          <circle cx="218" cy="262" r="1.9" />
        </g>
      </g>
      <g
        className="welcome-constellation welcome-constellation-gemini welcome-constellation-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
      >
        {/* Gemini — two parallel trails (low contrast) */}
        <path d="M 420 120 L 438 155 L 452 198 L 462 248 L 468 302" />
        <path d="M 468 108 L 486 148 L 502 192 L 514 242 L 522 296" />
        <path d="M 438 155 L 486 148" />
        <path d="M 452 198 L 502 192" />
      </g>
      {/* Cygnus — cross + bright tail (glow) */}
      <g
        className="welcome-constellation welcome-constellation-cygnus welcome-constellation-glow"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 248 388 L 278 362 L 312 348 L 348 358 L 382 372" />
        <path d="M 312 348 L 308 318 L 304 288" />
        <path d="M 312 348 L 318 402 L 324 448" />
        <g fill="currentColor" className="welcome-constellation-star-dots" filter="url(#welcome-star-glow)">
          <circle cx="304" cy="288" r="2" />
          <circle cx="312" cy="348" r="2.6" />
          <circle cx="382" cy="372" r="2.1" />
        </g>
      </g>
      <g
        className="welcome-constellation welcome-constellation-lyra welcome-constellation-glow"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Lyra — parallelogram + bright vertex */}
        <path d="M 720 160 L 762 178 L 748 218 L 706 200 Z" />
        <path d="M 762 178 L 788 152" />
        <g fill="currentColor" className="welcome-constellation-star-dots" filter="url(#welcome-star-glow)">
          <circle cx="720" cy="160" r="1.8" />
          <circle cx="788" cy="152" r="3" />
          <circle cx="748" cy="218" r="1.7" />
        </g>
      </g>
    </svg>
  )
}

export default WelcomeConstellations
