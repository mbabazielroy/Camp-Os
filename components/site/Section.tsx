import { CampPhoto } from "./CampPhoto";
import { Treeline } from "./Treeline";
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

// Handwritten section label, like a note pinned to the camp noticeboard.
export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`font-script text-2xl font-semibold leading-none sm:text-[1.7rem] ${light ? "text-glow" : "text-forest"}`}>
      {children}
    </p>
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
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.6rem] sm:leading-[1.15]">{title}</h2>
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
      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 sm:px-6 sm:pb-36 sm:pt-28">
        {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{intro}</p>}
        {children}
      </div>
      <Treeline className="absolute -bottom-px left-0 h-10 text-background sm:h-14" />
    </div>
  );
}
