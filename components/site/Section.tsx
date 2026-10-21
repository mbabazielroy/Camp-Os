import { CampPhoto } from "./CampPhoto";
import type { Photo } from "@/lib/site/photos";

export function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-16 sm:px-6 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>}
    </div>
  );
}

// Banner for interior pages: title over a camp photo washed in the stream
// gradient, with a wave edge.
export function PageHero({
  eyebrow,
  title,
  intro,
  photo,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  photo?: Photo;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden bg-stream text-white">
      {photo ? (
        <>
          <CampPhoto photo={photo} priority className="absolute inset-0 -z-20" />
          <div className="absolute inset-0 -z-10 bg-stream opacity-80 mix-blend-multiply" aria-hidden />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0f2f37]/70 to-transparent" aria-hidden />
        </>
      ) : (
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" aria-hidden />
      )}
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{intro}</p>}
        {children}
      </div>
      <svg
        className="absolute -bottom-px left-0 block h-10 w-full text-background"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 20 Q 150 0 300 20 T 600 20 T 900 20 T 1200 20 V40 H0Z" fill="currentColor" />
      </svg>
    </div>
  );
}
