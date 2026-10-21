import { camp } from "@/lib/site/content";

// A round camp-patch emblem: the camp name set around a ring, with pines and
// the stream in the middle.
export function CampBadge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`${camp.name}, est. ${camp.founded}`}>
      <defs>
        <path id="badge-top" d="M 30 100 A 70 70 0 0 1 170 100" />
        <path id="badge-bottom" d="M 22 100 A 78 78 0 0 0 178 100" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="#0f2f37" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#d98d2b" strokeWidth="2" />
      <circle cx="100" cy="100" r="56" fill="#14586b" />
      <text fill="#fdfefd" fontSize="15" fontWeight="700" letterSpacing="3.5" fontFamily="var(--font-geist-sans), sans-serif">
        <textPath href="#badge-top" startOffset="50%" textAnchor="middle">
          MILL STREAM
        </textPath>
      </text>
      <text fill="#f3b97a" fontSize="11" fontWeight="600" letterSpacing="2.5" fontFamily="var(--font-geist-sans), sans-serif">
        <textPath href="#badge-bottom" startOffset="50%" textAnchor="middle">
          BIBLE CAMP · OMEMEE, ON
        </textPath>
      </text>
      <circle cx="26" cy="100" r="3" fill="#d98d2b" />
      <circle cx="174" cy="100" r="3" fill="#d98d2b" />
      <g fill="#3c7146">
        <path d="M100 58 L 82 98 H 118Z" />
        <path d="M78 72 L 64 102 H 92Z" />
        <path d="M122 72 L 108 102 H 136Z" />
      </g>
      <path d="M58 112 Q 72 104 86 112 T 114 112 T 142 112" stroke="#fdfefd" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M62 124 Q 76 116 90 124 T 118 124 T 138 124" stroke="#f3b97a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="100" y="146" textAnchor="middle" fill="#fdfefd" fontSize="12" fontWeight="700" letterSpacing="2" fontFamily="var(--font-geist-sans), sans-serif">
        EST. {camp.founded}
      </text>
    </svg>
  );
}
