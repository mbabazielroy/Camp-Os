// Illustrated hero scenery: layered hills, pines, a campfire glow and the river.
// Drawn in SVG so the site looks finished before real photos are dropped in.
export function Scenery({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7d9a8" />
          <stop offset="55%" stopColor="#f3b97a" />
          <stop offset="100%" stopColor="#e7925a" />
        </linearGradient>
        <linearGradient id="river" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1d6a70" />
          <stop offset="100%" stopColor="#14586b" />
        </linearGradient>
      </defs>
      <rect width="1200" height="520" fill="url(#sky)" />
      <circle cx="880" cy="190" r="70" fill="#fff4dc" opacity="0.85" />
      <path d="M0 300 Q 200 220 420 270 T 820 250 T 1200 260 V520 H0Z" fill="#7da57a" opacity="0.7" />
      <path d="M0 340 Q 260 270 520 320 T 1000 300 T 1200 310 V520 H0Z" fill="#4f8657" />
      <g fill="#2c5a37">
        {[60, 120, 175, 240, 980, 1040, 1100, 1160].map((x, i) => {
          const h = 90 + ((i * 37) % 50);
          const base = 350 + ((i * 13) % 20);
          return <path key={x} d={`M${x} ${base - h} L${x - 28} ${base} H${x + 28}Z`} />;
        })}
      </g>
      <path d="M0 380 Q 300 330 600 375 T 1200 360 V520 H0Z" fill="#3c7146" />
      <path
        d="M0 450 C 220 410 380 470 600 440 S 1000 400 1200 430 V520 H0Z"
        fill="url(#river)"
      />
      <g stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M140 470 q 30 -8 60 0" />
        <path d="M480 462 q 30 -8 60 0" />
        <path d="M820 448 q 30 -8 60 0" />
        <path d="M1040 470 q 30 -8 60 0" />
      </g>
      {/* canoe */}
      <g transform="translate(640 432)">
        <path d="M-60 0 Q 0 22 60 0 Q 0 8 -60 0Z" fill="#b3452c" />
        <line x1="-10" y1="-2" x2="18" y2="-30" stroke="#5a2d1f" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
