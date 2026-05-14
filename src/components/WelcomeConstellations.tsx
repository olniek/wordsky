/**
 * Decorative SVG silhouettes: Orion (navigation), Gemini (duality / pairs), Lyra (arts / voice).
 * Not to scale; readable at a glance on small screens.
 */
function WelcomeConstellations() {
  return (
    <svg
      className="welcome-constellations-svg"
      aria-hidden="true"
      viewBox="0 0 900 520"
      preserveAspectRatio="xMidYMid slice"
    >
      <g
        className="welcome-constellation welcome-constellation-orion"
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
      </g>
      <g
        className="welcome-constellation welcome-constellation-gemini"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      >
        {/* Gemini — two parallel trails */}
        <path d="M 420 120 L 438 155 L 452 198 L 462 248 L 468 302" />
        <path d="M 468 108 L 486 148 L 502 192 L 514 242 L 522 296" />
        <path d="M 438 155 L 486 148" />
        <path d="M 452 198 L 502 192" />
      </g>
      <g
        className="welcome-constellation welcome-constellation-lyra"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Lyra — parallelogram + bright vertex */}
        <path d="M 720 160 L 762 178 L 748 218 L 706 200 Z" />
        <path d="M 762 178 L 788 152" />
      </g>
      <g fill="currentColor" className="welcome-constellation-stars">
        <circle cx="155" cy="198" r="2.2" />
        <circle cx="192" cy="258" r="2.8" />
        <circle cx="238" cy="195" r="2.2" />
        <circle cx="420" cy="120" r="2" />
        <circle cx="468" cy="108" r="2" />
        <circle cx="788" cy="152" r="3" />
        <circle cx="720" cy="160" r="1.8" />
      </g>
    </svg>
  )
}

export default WelcomeConstellations
