// A pine-forest silhouette used as the edge between sections. The path is built
// once from a seeded random sequence, so it's identical on server and client.
function buildTreeline(seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  let d = "M0 60 ";
  let x = 0;
  while (x < 1200) {
    const w = 14 + rand() * 22;
    const h = 18 + rand() * 38;
    const base = 60 - rand() * 6;
    d += `L${x.toFixed(1)} ${base.toFixed(1)} L${(x + w / 2).toFixed(1)} ${(base - h).toFixed(1)} L${(x + w).toFixed(1)} ${base.toFixed(1)} `;
    x += w * (0.55 + rand() * 0.35);
  }
  return `${d}L1200 60 L1200 80 L0 80Z`;
}

const paths = [buildTreeline(7), buildTreeline(19)];

export function Treeline({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      className={`block w-full ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden
    >
      <path d={paths[1]} fill="currentColor" opacity="0.45" transform="translate(-30 6)" />
      <path d={paths[0]} fill="currentColor" />
    </svg>
  );
}
