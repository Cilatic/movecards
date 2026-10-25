/* Flat, chunky older-adult figures with grey hair. Inline SVG only. */

export function SignInHero() {
  return (
    <svg viewBox="0 0 390 260" className="block h-auto w-full" role="img" aria-label="An older person stretching with arms up next to a Move Card">
      <path d="M0 0H390V215C330 200 270 235 200 248C120 262 60 240 0 230Z" className="fill-strength" />
      <path d="M255 0H390V120C340 110 300 70 255 0Z" className="fill-mustard" />
      <circle cx="40" cy="70" r="40" className="fill-none stroke-blush/40" strokeWidth="2" />
      <circle cx="40" cy="70" r="58" className="fill-none stroke-blush/25" strokeWidth="2" />
      {/* person */}
      <g>
        <rect x="122" y="115" width="34" height="90" rx="17" className="fill-balance" />
        <path d="M128 125 L102 80" className="stroke-balance" strokeWidth="14" strokeLinecap="round" />
        <path d="M150 125 L176 80" className="stroke-balance" strokeWidth="14" strokeLinecap="round" />
        <circle cx="102" cy="80" r="8" className="fill-skin" />
        <circle cx="176" cy="80" r="8" className="fill-skin" />
        <circle cx="139" cy="98" r="20" className="fill-skin" />
        <path d="M119 96a20 20 0 0 1 40 0c-8-6-32-6-40 0z" className="fill-hair" />
        <rect x="120" y="185" width="16" height="62" rx="8" className="fill-night" />
        <rect x="142" y="185" width="16" height="62" rx="8" className="fill-night" />
      </g>
      {/* card */}
      <g transform="rotate(8 280 130)">
        <rect x="230" y="60" width="100" height="140" rx="16" className="fill-background" />
        <rect x="244" y="74" width="72" height="60" rx="10" className="fill-blush" />
        <circle cx="280" cy="92" r="6" className="fill-skin" />
        <path d="M280 98v18m0 0-8 12m8-12 8 12m-18-26 10 6 10-6" className="stroke-balance fill-none" strokeWidth="4" strokeLinecap="round" />
        <rect x="244" y="146" width="44" height="7" rx="3.5" className="fill-night" />
        <rect x="296" y="170" width="8" height="8" className="fill-night" />
        <rect x="308" y="170" width="8" height="8" className="fill-night" />
        <rect x="296" y="182" width="8" height="8" className="fill-night" />
        <rect x="314" y="186" width="6" height="6" className="fill-night" />
      </g>
      <circle cx="338" cy="205" r="14" className="fill-balance" />
    </svg>
  );
}

export function MeAvatar() {
  return (
    <svg viewBox="0 0 80 70" className="h-20 w-24" aria-hidden="true">
      <circle cx="40" cy="34" r="30" className="fill-mustard" />
      <circle cx="40" cy="30" r="13" className="fill-skin" />
      <path d="M27 28a13 13 0 0 1 26 0c-6-5-20-5-26 0z" className="fill-hair" />
      <path d="M20 70a20 18 0 0 1 40 0z" className="fill-balance" />
    </svg>
  );
}

export function HelpingAvatar() {
  return (
    <svg viewBox="0 0 110 70" className="h-20 w-28" aria-hidden="true">
      <circle cx="40" cy="34" r="28" className="fill-helper-soft" />
      <circle cx="70" cy="30" r="28" className="fill-balance/50" />
      <circle cx="38" cy="34" r="11" className="fill-skin" />
      <path d="M20 70a18 16 0 0 1 36 0z" className="fill-helper" />
      <circle cx="70" cy="32" r="12" className="fill-skin" />
      <path d="M58 30a12 12 0 0 1 24 0c-6-5-18-5-24 0z" className="fill-hair" />
      <path d="M52 70a18 16 0 0 1 36 0z" className="fill-heart" />
    </svg>
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 32 28" className="h-7 w-8" aria-hidden="true">
      <rect x="1" y="4" width="16" height="22" rx="4" className="fill-mustard" transform="rotate(-8 9 15)" />
      <rect x="12" y="2" width="16" height="22" rx="4" className="fill-strength" />
    </svg>
  );
}
