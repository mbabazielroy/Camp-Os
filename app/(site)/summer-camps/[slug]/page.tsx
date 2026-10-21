import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Tag } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { ProgramCard } from "@/components/site/ProgramCard";
import { camp, programs, season, telHref } from "@/lib/site/content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  if (!program) return {};
  return { title: `${program.name} (${program.ages})`, description: program.blurb };
}

export default async function ProgramPage({ params }: Params) {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  if (!program) notFound();

  const register = program.register ?? { label: "Register online", href: camp.registrationUrl };
  const others = programs.filter((p) => p.slug !== program.slug).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={`${program.kind} · ${program.ages}`} title={program.name} intro={program.blurb} photo={program.photo}>
        <Link
          href="/summer-camps"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"
        >
          <ArrowLeft size={15} /> All summer camps
        </Link>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="space-y-5 text-lg leading-relaxed text-foreground/85">
              {program.description.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {program.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 rounded-xl bg-forest-soft p-4 text-sm font-medium text-forest">
                  <Check size={17} className="mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 font-semibold">
              <CalendarDays size={18} className="text-primary" /> {season.year} sessions
            </h2>
            {program.sessions.length ? (
              <ul className="mt-3 space-y-2">
                {program.sessions.map((s) => (
                  <li key={s} className="rounded-lg bg-surface-muted px-3 py-2 text-sm font-medium">
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">
                {`${season.year} dates are coming soon.`} Call or email us and we&apos;ll let you know.
              </p>
            )}

            {program.price && (
              <>
                <h2 className="mt-6 flex items-center gap-2 font-semibold">
                  <Tag size={18} className="text-primary" /> Fees
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Early bird (before {season.earlyBirdDeadline})</dt>
                    <dd className="font-semibold text-forest">${program.price.earlyBird}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Regular</dt>
                    <dd className="font-semibold">${program.price.regular}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted">
                  {program.price.unit}. {season.taxNote}
                </p>
              </>
            )}

            <a
              href={register.href}
              className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-white hover:bg-accent/90"
            >
              {register.label} <ArrowRight size={18} />
            </a>
            <p className="mt-4 text-center text-xs text-muted">
              Questions? Call{" "}
              <a href={telHref(camp.phone)} className="font-medium text-primary">
                {camp.phone}
              </a>
            </p>
          </aside>
        </div>
      </Section>

      <Section className="bg-surface-muted/60">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Other programs</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
        </div>
      </Section>
    </>
  );
}
