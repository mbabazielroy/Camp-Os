import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Program } from "@/lib/site/content";

const accentStyles: Record<Program["accent"], string> = {
  forest: "bg-forest-soft text-forest",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-[#9a5a12]",
};

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      href={`/summer-camps/${program.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accentStyles[program.accent]}`}>
          {program.ages}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted">{program.kind}</span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{program.name}</h3>
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
    </Link>
  );
}
