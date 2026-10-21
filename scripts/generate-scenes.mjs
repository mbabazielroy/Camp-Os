// Generates the illustrated camp scenes used on the public website
// (public/images/scenes/*.svg). Seeded, so output is stable between runs.
// Run with: node scripts/generate-scenes.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const W = 1600;
const H = 1000;
const OUT = new URL("../public/images/scenes/", import.meta.url);

// Brand palette (matches app/globals.css)
const C = {
  deep: "#0f2f37",
  primary: "#14586b",
  teal: "#1d6a70",
  forest: "#3c7146",
  forestDark: "#2c5a37",
  pine: "#1f4a2c",
  amber: "#d98d2b",
  glow: "#f3b97a",
  sand: "#f7d9a8",
  ember: "#e7925a",
  bark: "#5a3a26",
};

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

// A natural-looking ridge line from layered sine waves plus jitter.
function ridge(r, { base, amp, step = 20, freq = 1 }) {
  const phases = [r() * 6, r() * 6, r() * 6];
  const pts = [];
  for (let x = -step; x <= W + step; x += step) {
    const t = (x / W) * Math.PI * 2 * freq;
    const y =
      base -
      amp * (0.55 * Math.sin(t + phases[0]) + 0.3 * Math.sin(t * 2.3 + phases[1]) + 0.15 * Math.sin(t * 5.1 + phases[2])) -
      (r() - 0.5) * amp * 0.08;
    pts.push([x, y]);
  }
  return pts;
}

function ridgePath(pts, bottom = H) {
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} L${W + 40} ${bottom} L-40 ${bottom}Z`;
}

function yAt(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) {
    if (x >= pts[i][0] && x <= pts[i + 1][0]) {
      const k = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
      return pts[i][1] + k * (pts[i + 1][1] - pts[i][1]);
    }
  }
  return pts[pts.length - 1][1];
}

// A layered pine silhouette.
function pine(r, x, baseY, h) {
  const w = h * (0.32 + r() * 0.08);
  const tiers = 4;
  let d = "";
  for (let i = 0; i < tiers; i++) {
    const top = baseY - h + (h * 0.8 * i) / tiers;
    const bottom = baseY - h * 0.12 - (h * 0.8 * (tiers - 1 - i)) / tiers / 1.6;
    const tw = (w * (i + 1.4)) / (tiers + 0.4);
    const j = (r() - 0.5) * tw * 0.12;
    d += `M${f(x)} ${f(top)} L${f(x - tw / 2 + j)} ${f(bottom)} L${f(x + tw / 2 + j)} ${f(bottom)}Z`;
  }
  d += `M${f(x - h * 0.03)} ${f(baseY - h * 0.14)} h${f(h * 0.06)} V${f(baseY)} h${f(-h * 0.06)}Z`;
  return d;
}

function forest(r, pts, { count, minH, maxH, sink = 6 }) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = r() * (W + 80) - 40;
    d += pine(r, x, yAt(pts, x) + sink, minH + r() * (maxH - minH));
  }
  return d;
}

function stars(r, n, maxY) {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += `<circle cx="${f(r() * W)}" cy="${f(r() * maxY)}" r="${f(0.6 + r() * 1.6)}" fill="#fff" opacity="${f(0.3 + r() * 0.7)}"/>`;
  }
  return s;
}

const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"/>
  </filter>`;
const grainLayer = `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.18"/>`;

function svg(defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${grain}${defs}</defs>${body}${grainLayer}</svg>\n`;
}

// Sitting camper silhouette, facing the fire.
function camper(x, y, s, flip = false) {
  const t = flip ? `translate(${x} ${y}) scale(${-s} ${s})` : `translate(${x} ${y}) scale(${s})`;
  return `<g transform="${t}"><circle cx="0" cy="-58" r="11"/><path d="M-12 -44 Q 0 -50 12 -44 L 16 -12 Q 18 0 30 0 L 30 6 L -14 6 Q -18 -20 -12 -44Z"/></g>`;
}

const scenes = {
  "lake-sunset": () => {
    const r = rng(11);
    const far = ridge(r, { base: 520, amp: 70, freq: 0.8 });
    const mid = ridge(r, { base: 580, amp: 40, freq: 1.3 });
    const shore = ridge(r, { base: 620, amp: 12, freq: 2 });
    const reflect = [];
    for (let i = 0; i < 60; i++) {
      const y = 640 + r() * 340;
      const w = 40 + r() * 260 * (1 - (y - 640) / 500);
      const x = 1080 + (r() - 0.5) * (y - 560) * 1.4;
      reflect.push(`<rect x="${f(x - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(2 + r() * 3)}" rx="2" fill="${C.sand}" opacity="${f(0.15 + r() * 0.4)}"/>`);
    }
    return svg(
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5f6b"/><stop offset="0.45" stop-color="${C.glow}"/><stop offset="0.62" stop-color="${C.ember}"/></linearGradient>
       <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c6f73"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
       <radialGradient id="sun" cx="0.675" cy="0.55" r="0.35"><stop offset="0" stop-color="#fff4dc" stop-opacity="0.95"/><stop offset="0.25" stop-color="${C.sand}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.sand}" stop-opacity="0"/></radialGradient>
       <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
       <mask id="rm"><rect y="620" width="${W}" height="200" fill="url(#fade)"/></mask>`,
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <rect width="${W}" height="${H}" fill="url(#sun)"/>
       <circle cx="1080" cy="560" r="58" fill="#fff4dc"/>
       <path d="${ridgePath(far)}" fill="#6f8f86" opacity="0.75"/>
       <path d="${ridgePath(mid)}" fill="#3f6b5a"/>
       <path d="${forest(r, mid, { count: 90, minH: 30, maxH: 70 })}" fill="#355f4c"/>
       <path d="${ridgePath(shore)}" fill="${C.pine}"/>
       <path d="${forest(r, shore, { count: 120, minH: 50, maxH: 130, sink: 4 })}" fill="${C.pine}"/>
       <rect y="625" width="${W}" height="${H - 625}" fill="url(#lake)"/>
       <g mask="url(#rm)" transform="translate(0 1250) scale(1 -1)" opacity="0.55"><path d="${ridgePath(shore, 400)}" fill="${C.pine}"/></g>
       ${reflect.join("")}
       <g transform="translate(560 790)">
         <path d="M-150 0 Q -60 34 150 0 Q 120 14 0 16 Q -120 14 -150 0Z" fill="#1a1612"/>
         <path d="M-150 0 Q 0 10 150 0" stroke="${C.amber}" stroke-opacity="0.5" stroke-width="2" fill="none"/>
         <g fill="#1a1612"><circle cx="-70" cy="-48" r="11"/><path d="M-84 -36 Q -70 -42 -56 -36 L -52 0 L -88 0Z"/>
         <circle cx="60" cy="-46" r="11"/><path d="M46 -34 Q 60 -40 74 -34 L 78 0 L 42 0Z"/></g>
         <path d="M-40 -40 L -110 40" stroke="#1a1612" stroke-width="5" stroke-linecap="round"/>
         <path d="M90 -38 L 150 36" stroke="#1a1612" stroke-width="5" stroke-linecap="round"/>
         <ellipse cx="0" cy="22" rx="220" ry="6" fill="${C.sand}" opacity="0.18"/>
       </g>
       <g fill="#2a2018"><rect x="-20" y="700" width="330" height="16"/><rect x="40" y="716" width="10" height="70"/><rect x="160" y="716" width="10" height="70"/><rect x="280" y="716" width="10" height="70"/></g>`
    );
  },

  "campfire-night": () => {
    const r = rng(23);
    const hills = ridge(r, { base: 700, amp: 50, freq: 1 });
    const ground = ridge(r, { base: 820, amp: 14, freq: 1.6 });
    let sparks = "";
    for (let i = 0; i < 40; i++) {
      const y = 760 - r() * 420;
      sparks += `<circle cx="${f(800 + (r() - 0.5) * (820 - y) * 0.6)}" cy="${f(y)}" r="${f(1 + r() * 2.4)}" fill="${r() > 0.5 ? C.sand : C.amber}" opacity="${f(0.3 + r() * 0.7)}"/>`;
    }
    return svg(
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#081c22"/><stop offset="0.7" stop-color="${C.deep}"/><stop offset="1" stop-color="#18454c"/></linearGradient>
       <radialGradient id="fire" cx="0.5" cy="0.8" r="0.45"><stop offset="0" stop-color="${C.amber}" stop-opacity="0.75"/><stop offset="0.4" stop-color="${C.ember}" stop-opacity="0.25"/><stop offset="1" stop-color="${C.ember}" stop-opacity="0"/></radialGradient>`,
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       ${stars(r, 220, 620)}
       <circle cx="1280" cy="180" r="46" fill="#fff4dc" opacity="0.95"/><circle cx="1300" cy="168" r="44" fill="#081c22"/>
       <path d="${ridgePath(hills)}" fill="#12333a"/>
       <path d="${forest(r, hills, { count: 110, minH: 90, maxH: 240 })}" fill="#0b2328"/>
       <path d="${ridgePath(ground)}" fill="#0d2a26"/>
       <rect width="${W}" height="${H}" fill="url(#fire)"/>
       <ellipse cx="800" cy="850" rx="330" ry="48" fill="${C.amber}" opacity="0.22"/>
       ${sparks}
       <g fill="#0a0d0c">${camper(470, 860, 2.1)}${camper(610, 900, 2.3)}${camper(1130, 860, 2.1, true)}${camper(990, 905, 2.3, true)}</g>
       <g transform="translate(800 860)">
         <rect x="-120" y="-14" width="240" height="26" rx="13" fill="${C.bark}" transform="rotate(12)"/>
         <rect x="-120" y="-14" width="240" height="26" rx="13" fill="#4a2f1f" transform="rotate(-14)"/>
         <path d="M0 -230 C 60 -140 90 -80 60 -20 C 40 10 -40 10 -60 -20 C -90 -80 -40 -120 0 -230Z" fill="${C.ember}"/>
         <path d="M10 -170 C 50 -100 60 -60 40 -20 C 25 4 -30 4 -42 -20 C -60 -60 -20 -100 10 -170Z" fill="${C.amber}"/>
         <path d="M0 -110 C 26 -70 30 -40 18 -18 C 8 -4 -14 -4 -22 -18 C -32 -40 -14 -70 0 -110Z" fill="#fff1c9"/>
       </g>`
    );
  },

  "cabins-forest": () => {
    const r = rng(37);
    const back = ridge(r, { base: 520, amp: 40, freq: 1.1 });
    const mid = ridge(r, { base: 640, amp: 20, freq: 1.5 });
    const cabin = (x, y, s) => `
      <g transform="translate(${x} ${y}) scale(${s})">
        <path d="M-120 0 L -120 -90 L 120 -90 L 120 0Z" fill="#7a4e31"/>
        ${[...Array(6)].map((_, i) => `<rect x="-120" y="${-90 + i * 15}" width="240" height="2" fill="#5a3a26" opacity="0.6"/>`).join("")}
        <path d="M-150 -80 L 0 -190 L 150 -80Z" fill="#3b2a20"/>
        <path d="M-150 -80 L 0 -190 L 150 -80" stroke="#2a1d16" stroke-width="10" fill="none" stroke-linejoin="round"/>
        <rect x="-20" y="-70" width="40" height="70" fill="#2a1d16"/>
        <rect x="-95" y="-70" width="44" height="36" fill="${C.sand}"/><rect x="51" y="-70" width="44" height="36" fill="${C.sand}"/>
        <path d="M-73 -70 V -34 M-95 -52 H -51 M73 -70 V -34 M51 -52 H 95" stroke="#7a4e31" stroke-width="4"/>
        <rect x="-140" y="0" width="280" height="10" fill="#2a1d16"/>
      </g>`;
    return svg(
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc4c0"/><stop offset="1" stop-color="#e9efe0"/></linearGradient>
       <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f9361"/><stop offset="1" stop-color="${C.forest}"/></linearGradient>`,
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <path d="${ridgePath(back)}" fill="#7fa58c"/>
       <path d="${forest(r, back, { count: 100, minH: 80, maxH: 170 })}" fill="#5d8a6c"/>
       <path d="${ridgePath(mid)}" fill="#4c7d58"/>
       <path d="${forest(r, mid, { count: 70, minH: 160, maxH: 330 })}" fill="${C.forestDark}"/>
       <rect y="700" width="${W}" height="300" fill="url(#grass)"/>
       <path d="M640 1000 C 700 880 820 820 860 760 L 920 760 C 900 830 860 900 900 1000Z" fill="#c9b48a" opacity="0.85"/>
       ${cabin(420, 790, 1.05)}${cabin(1180, 770, 0.85)}
       <path d="${forest(r, [[-40, 1010], [W + 40, 1010]], { count: 6, minH: 380, maxH: 520 })}" fill="${C.pine}"/>`
    );
  },

  "tents-meadow": () => {
    const r = rng(41);
    const hills = ridge(r, { base: 600, amp: 60, freq: 0.9 });
    const tent = (x, y, s, lit) => `
      <g transform="translate(${x} ${y}) scale(${s})">
        <path d="M-130 0 L 0 -150 L 130 0Z" fill="${lit ? C.amber : "#b46a2a"}"/>
        <path d="M0 -150 L 130 0 L 60 0Z" fill="#000" opacity="0.18"/>
        <path d="M0 -150 L -34 0 L 34 0Z" fill="${lit ? "#fff1c9" : "#3b2a20"}"/>
        <path d="M0 -150 L 0 -175" stroke="#2a1d16" stroke-width="5"/>
      </g>`;
    let lights = "";
    const lx = (t) => 220 + t * 1160;
    const ly = (t) => 440 + Math.sin(t * Math.PI) * 90;
    for (let i = 0; i <= 26; i++) {
      const t = i / 26;
      lights += `<circle cx="${f(lx(t))}" cy="${f(ly(t))}" r="5" fill="#fff1c9"/><circle cx="${f(lx(t))}" cy="${f(ly(t))}" r="14" fill="${C.sand}" opacity="0.25"/>`;
    }
    return svg(
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e4c5c"/><stop offset="0.6" stop-color="#4f7f86"/><stop offset="1" stop-color="${C.glow}"/></linearGradient>`,
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       ${stars(r, 90, 360)}
       <path d="${ridgePath(hills)}" fill="#24504a"/>
       <path d="${forest(r, hills, { count: 120, minH: 70, maxH: 200 })}" fill="#163a35"/>
       <rect y="690" width="${W}" height="310" fill="#2e5a3a"/>
       <path d="M0 700 Q 800 660 1600 700 V 1000 H 0Z" fill="#335f3e"/>
       <path d="M${lx(0)} ${ly(0)} Q 800 ${ly(0.5) + 90} ${lx(1)} ${ly(1)}" stroke="#1a1612" stroke-width="2" fill="none"/>
       ${lights}
       <path d="M220 440 V 760 M1380 440 V 760" stroke="#2a1d16" stroke-width="8"/>
       ${tent(470, 840, 1.25, true)}${tent(860, 800, 1, false)}${tent(1180, 860, 1.35, true)}
       <ellipse cx="470" cy="850" rx="200" ry="20" fill="${C.amber}" opacity="0.2"/>
       <ellipse cx="1180" cy="870" rx="220" ry="22" fill="${C.amber}" opacity="0.2"/>`
    );
  },

  "river-morning": () => {
    const r = rng(53);
    const layers = [0, 1, 2, 3].map((i) => ridge(r, { base: 420 + i * 90, amp: 50 - i * 8, freq: 1 + i * 0.3 }));
    const tones = ["#a9c5bd", "#7fa58c", "#55836a", "#2f5f45"];
    let body = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="420" cy="300" r="70" fill="#fff8e6" opacity="0.9"/><rect width="${W}" height="${H}" fill="url(#rays)"/>`;
    layers.forEach((pts, i) => {
      body += `<path d="${ridgePath(pts)}" fill="${tones[i]}"/>`;
      body += `<path d="${forest(r, pts, { count: 70 + i * 15, minH: 40 + i * 40, maxH: 90 + i * 70 })}" fill="${tones[i]}"/>`;
      body += `<rect y="${f(pts[0][1] - 40)}" width="${W}" height="140" fill="url(#mist)"/>`;
    });
    body += `<path d="M560 760 C 720 740 980 760 1100 800 C 1250 850 1300 920 1500 1000 L 200 1000 C 420 920 380 800 560 760Z" fill="url(#river)"/>`;
    body += `<path d="M640 800 C 780 790 940 810 1040 840" stroke="#fff" stroke-opacity="0.5" stroke-width="3" fill="none"/><path d="M520 900 C 760 880 1000 900 1220 940" stroke="#fff" stroke-opacity="0.35" stroke-width="3" fill="none"/>`;
    body += `<path d="M0 1000 L 0 820 C 160 800 300 860 420 1000Z" fill="${C.pine}"/><path d="M1600 1000 L 1600 840 C 1500 830 1380 900 1320 1000Z" fill="${C.pine}"/>`;
    return svg(
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0d9"/><stop offset="1" stop-color="#f6efdc"/></linearGradient>
       <radialGradient id="rays" cx="0.26" cy="0.3" r="0.6"><stop offset="0" stop-color="#fff4d6" stop-opacity="0.7"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></radialGradient>
       <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3ea" stop-opacity="0"/><stop offset="0.5" stop-color="#eef3ea" stop-opacity="0.55"/><stop offset="1" stop-color="#eef3ea" stop-opacity="0"/></linearGradient>
       <linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc3c2"/><stop offset="1" stop-color="${C.teal}"/></linearGradient>`,
      body
    );
  },

  "forest-trail": () => {
    const r = rng(67);
    let trunks = "";
    for (let layer = 0; layer < 4; layer++) {
      const n = 14 - layer * 2;
      const tone = ["#9db8a6", "#6f927b", "#476c52", "#22402c"][layer];
      for (let i = 0; i < n; i++) {
        const x = r() * W;
        if (layer > 1 && x > 640 && x < 960) continue;
        const w = 10 + layer * 14 + r() * 10;
        trunks += `<rect x="${f(x)}" y="0" width="${f(w)}" height="${f(760 + layer * 70)}" fill="${tone}"/>`;
      }
      trunks += `<rect y="0" width="${W}" height="${H}" fill="#e9f0df" opacity="${0.18 - layer * 0.04}"/>`;
    }
    let rays = "";
    for (let i = 0; i < 6; i++) {
      const x = 500 + i * 140 + r() * 60;
      rays += `<path d="M${f(x)} 0 L ${f(x + 60)} 0 L ${f(x - 200)} 1000 L ${f(x - 320)} 1000Z" fill="#fff6dc" opacity="${f(0.08 + r() * 0.1)}"/>`;
    }
    const hiker = (x, y, s) =>
      `<g transform="translate(${x} ${y}) scale(${s})" fill="#1c241e"><circle cx="0" cy="-92" r="10"/><path d="M-10 -80 L 10 -80 L 14 -40 L 8 0 L 2 0 L 0 -36 L -4 0 L -10 0 L -14 -40Z"/><rect x="6" y="-78" width="16" height="30" rx="5" fill="${C.amber}"/></g>`;
    return svg(
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4eedc"/><stop offset="1" stop-color="#c6d9be"/></linearGradient>`,
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       ${trunks}
       <path d="M0 780 Q 800 720 1600 780 V 1000 H 0Z" fill="#3c6a45"/>
       <path d="M770 760 C 760 820 620 900 420 1000 L 1180 1000 C 980 900 860 820 830 760Z" fill="#b99c6b"/>
       ${rays}
       ${hiker(790, 800, 0.9)}${hiker(830, 830, 1.1)}
       <path d="${forest(r, [[-40, 1010], [W + 40, 1010]], { count: 5, minH: 300, maxH: 420 })}" fill="#1b3524" opacity="0.9"/>`
    );
  },
};

mkdirSync(OUT, { recursive: true });
for (const [name, draw] of Object.entries(scenes)) {
  writeFileSync(new URL(`${name}.svg`, OUT), draw());
  console.log(`wrote public/images/scenes/${name}.svg`);
}
