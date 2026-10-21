import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/Section";
import { ProgramCard } from "@/components/site/ProgramCard";
import { camp, programs, season } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "Summer camps",
  description: "Overnight and day camps for ages 5-15 at Mill Stream Bible Camp in Omemee, Ontario.",
};

export default function SummerCampsPage() {
  const priced = programs.filter((p) => p.price);

  return (
    <>
      <PageHero
        eyebrow={`Summer ${season.year}`}
        title="Summer camps"
        intro="Overnight and day camps for ages 5-15, plus Handi*Camp for young people with special needs. Every program is built around fun, friendship and the Bible."
      >
        <a
          href={camp.registrationUrl}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 font-semibold text-white shadow-lg hover:bg-accent/90"
        >
          Register online <ArrowRight size={18} />
        </a>
      </PageHero>

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
        </div>
      </Section>

      <Section className="bg-surface-muted/60">
        <SectionHeading
          eyebrow="Dates & fees"
          title="Compare programs"
          intro={`Early-bird pricing applies to registrations before ${season.earlyBirdDeadline}. ${season.taxNote}`}
        />
        <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Program</th>
                <th className="px-5 py-3.5 font-semibold">Ages</th>
                <th className="px-5 py-3.5 font-semibold">Sessions</th>
                <th className="px-5 py-3.5 font-semibold">Early bird</th>
                <th className="px-5 py-3.5 font-semibold">Regular</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {priced.map((p) => (
                <tr key={p.slug}>
                  <td className="px-5 py-4 font-semibold">
                    <Link href={`/summer-camps/${p.slug}`} className="hover:text-primary">
                      {p.name}
                    </Link>
                    <span className="block text-xs font-normal text-muted">{p.kind}</span>
                  </td>
                  <td className="px-5 py-4">{p.ages}</td>
                  <td className="px-5 py-4">
                    {p.sessions.length ? p.sessions.join(", ") : <span className="text-muted">Coming soon</span>}
                  </td>
                  <td className="px-5 py-4 font-semibold text-forest">${p.price!.earlyBird}</td>
                  <td className="px-5 py-4">
                    ${p.price!.regular}
                    <span className="block text-xs text-muted">{p.price!.unit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
