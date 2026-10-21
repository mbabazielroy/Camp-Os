import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Program } from "@/lib/site/content";
import { CampPhoto } from "./CampPhoto";

const accentStyles: Record<Program["accent"], string> = {
  forest: "bg-forest-soft text-forest",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-[#9a5a12]",
};

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      href={`/summer-camps/${program.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative">
        <CampPhoto
          photo={program.photo}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${accentStyles[program.accent]}`}>
          {program.ages}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-[#0f2f37]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {program.kind}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{program.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{program.blurb}</p>
        <div className="mt-6 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div className="text-sm">
            <p className="flex items-center gap-1.5 text-muted">
              <CalendarDays size={14} />
              {program.sessions[0] ?? "Dates coming soon"}
            </p>
            {program.price && (
              <p className="mt-1 font-semibold">
                From ${program.price.earlyBird}
              </p>
            )}
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-white">
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
