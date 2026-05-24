// SVG fallback mascots — used when Bedrock is not configured
// Each returns a self-contained SVG string rendered as an img src

const BASE = {
  // Shared chibi face base — large eyes, round face, tiny body
  face: (eyeL, eyeR, mouth, extras = '', bg = '#7c3aed', bodyColor = '#a78bfa') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.4"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <!-- Background -->
  <circle cx="100" cy="100" r="98" fill="url(#bg)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  ${extras}
  <!-- Body -->
  <ellipse cx="100" cy="162" rx="28" ry="20" fill="${bodyColor}" stroke="white" stroke-width="2.5"/>
  <!-- Head -->
  <circle cx="100" cy="95" r="42" fill="#ffe4c4" stroke="white" stroke-width="3" filter="url(#glow)"/>
  <!-- Cheeks -->
  <circle cx="76" cy="105" r="9" fill="#ffb3ba" opacity="0.6"/>
  <circle cx="124" cy="105" r="9" fill="#ffb3ba" opacity="0.6"/>
  <!-- Eyes -->
  ${eyeL}${eyeR}
  <!-- Mouth -->
  ${mouth}
</svg>`,
};

// Eye helpers
const happyEye  = (cx) => `<ellipse cx="${cx}" cy="92" rx="9" ry="11" fill="#1a1a2e" stroke="white" stroke-width="1.5"/><circle cx="${cx+3}" cy="88" r="3" fill="white"/><ellipse cx="${cx}" cy="92" rx="9" ry="4" fill="#1a1a2e" transform="translate(0,4)"/>`;
const wideEye   = (cx) => `<circle cx="${cx}" cy="92" r="12" fill="white" stroke="#1a1a2e" stroke-width="2"/><circle cx="${cx}" cy="92" r="8" fill="#1a1a2e"/><circle cx="${cx+3}" cy="88" r="3" fill="white"/>`;
const sadEye    = (cx) => `<ellipse cx="${cx}" cy="94" rx="8" ry="7" fill="#1a1a2e" stroke="white" stroke-width="1.5"/><circle cx="${cx+2}" cy="91" r="2.5" fill="white"/>`;
const closedEye = (cx) => `<path d="M${cx-8},92 Q${cx},86 ${cx+8},92" stroke="#1a1a2e" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
const starEye   = (cx) => `<text x="${cx-8}" y="98" font-size="16" fill="#fbbf24">★</text>`;
const sweatEye  = (cx) => `<ellipse cx="${cx}" cy="92" rx="10" ry="12" fill="#1a1a2e" stroke="white" stroke-width="1.5"/><circle cx="${cx+3}" cy="87" r="3" fill="white"/><path d="M${cx+8},80 Q${cx+14},74 ${cx+10},68" stroke="#60a5fa" stroke-width="2" fill="none"/>`;

// Mouth helpers
const bigSmile  = `<path d="M84,110 Q100,124 116,110" stroke="#1a1a2e" stroke-width="2.5" fill="#ff8fa3" stroke-linecap="round"/>`;
const openMouth = `<ellipse cx="100" cy="113" rx="10" ry="8" fill="#1a1a2e"/><ellipse cx="100" cy="116" rx="8" ry="4" fill="#ff6b6b"/>`;
const sadMouth  = `<path d="M86,114 Q100,106 114,114" stroke="#1a1a2e" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
const smirk     = `<path d="M88,112 Q100,118 112,110" stroke="#1a1a2e" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
const tinySmile = `<path d="M92,112 Q100,118 108,112" stroke="#1a1a2e" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const zzz       = `<path d="M92,112 Q100,116 108,112" stroke="#1a1a2e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

// Extra decorations
const stars = `<text x="20" y="40" font-size="18" opacity="0.9">✨</text><text x="155" y="35" font-size="14" opacity="0.8">⭐</text><text x="165" y="160" font-size="12" opacity="0.7">✨</text>`;
const fire  = `<text x="18" y="50" font-size="20">🔥</text><text x="158" y="50" font-size="20">🔥</text>`;
const bugs  = `<text x="22" y="55" font-size="14">🐛</text><text x="158" y="60" font-size="14">🐛</text><text x="90" y="30" font-size="12">🐞</text>`;
const confetti = `<text x="20" y="38" font-size="14">🎊</text><text x="158" y="38" font-size="14">🎉</text><text x="88" y="28" font-size="12">🎊</text>`;
const shield = `<text x="155" y="155" font-size="22">🛡️</text>`;
const trophy = `<text x="155" y="45" font-size="20">🏆</text>`;
const zzzBubbles = `<text x="118" y="68" font-size="13" fill="#93c5fd" opacity="0.9">z</text><text x="130" y="55" font-size="16" fill="#93c5fd" opacity="0.8">z</text><text x="144" y="40" font-size="19" fill="#93c5fd" opacity="0.7">Z</text>`;
const medal = `<text x="148" y="155" font-size="22">🥇</text>`;
const laptop = `<text x="20" y="158" font-size="20">💻</text>`;
const gear  = `<text x="20" y="45" font-size="16">⚙️</text><text x="155" y="50" font-size="14">🔍</text>`;
const warn  = `<text x="20" y="45" font-size="18">⚠️</text><text x="155" y="45" font-size="18">🚨</text>`;
const fireworks = `<text x="18" y="38" font-size="16">🎆</text><text x="155" y="38" font-size="16">🎇</text><text x="88" y="22" font-size="14">✨</text>`;
const rain  = `<text x="30" y="40" font-size="12" opacity="0.6">💧</text><text x="60" y="30" font-size="10" opacity="0.5">💧</text><text x="130" y="35" font-size="11" opacity="0.6">💧</text><text x="100" y="170" font-size="14">💔</text>`;

export const MASCOT_SVGS = {
  level_up:      BASE.face(starEye(82), starEye(112), bigSmile, stars + `<text x="78" y="185" font-size="11" fill="white" font-weight="bold">LEVEL UP!</text>`, '#4c1d95', '#7c3aed'),
  badge_earned:  BASE.face(happyEye(82), happyEye(112), smirk, confetti + medal, '#92400e', '#f59e0b'),
  clean_code:    BASE.face(happyEye(82), happyEye(112), bigSmile, confetti + `<text x="20" y="158" font-size="16">🎉</text>`, '#064e3b', '#10b981'),
  bug_found:     BASE.face(wideEye(82), wideEye(112), openMouth, bugs, '#7c2d12', '#f97316'),
  critical_bug:  BASE.face(sweatEye(82), sweatEye(112), openMouth, warn, '#450a0a', '#ef4444'),
  streak:        BASE.face(happyEye(82), happyEye(112), bigSmile, fire, '#431407', '#f97316'),
  streak_broken: BASE.face(sadEye(82), sadEye(112), sadMouth, rain, '#1e3a5f', '#3b82f6'),
  welcome_back:  BASE.face(happyEye(82), happyEye(112), bigSmile, stars + laptop, '#134e4a', '#14b8a6'),
  analyzing:     BASE.face(happyEye(82), happyEye(112), tinySmile, gear, '#2e1065', '#8b5cf6'),
  security_alert:BASE.face(happyEye(82), happyEye(112), tinySmile, warn + shield, '#431407', '#f97316'),
  milestone:     BASE.face(starEye(82), starEye(112), bigSmile, fireworks + trophy, '#1c1917', '#fbbf24'),
  idle:          BASE.face(closedEye(82), closedEye(112), zzz, zzzBubbles, '#0f172a', '#6366f1'),
};

// Convert SVG string to data URI
export const svgToDataUri = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;

export const getMascotFallback = (type) => {
  const svg = MASCOT_SVGS[type] || MASCOT_SVGS.idle;
  return svgToDataUri(svg);
};
