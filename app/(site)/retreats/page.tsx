import type { Metadata } from "next";
import { ArrowRight, CalendarRange, Users, Info, Check } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/Section";
import { camp, retreats, telHref } from "@/lib/site/content";
import { CampPhoto } from "@/components/site/CampPhoto";
import { photos } from "@/lib/site/photos";

export const metadata: Metadata = {
  title: "Retreat centre",
  description: `Host your group of ${retreats.capacity.min}-${retreats.capacity.max} at Mill Stream's retreat centre in Omemee, Ontario, ${retreats.season}.`,
};

export default function RetreatsPage() {
  const facts = [
    { icon: CalendarRange, label: "Season", value: retreats.season },
    { icon: Users, label: "Group size", value: `${retreats.capacity.min}-${retreats.capacity.max} people` },
    { icon: Info, label: "Summer", value: "Reserved for camp" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Retreat centre"
        title="A peaceful place for your group to gather"
        photo={photos.bibleStudy}
        intro={`Outside of summer, Mill Stream opens its ${camp.acres} acres along the Pigeon River to churches, schools, families and ministries.`}
      />

      <Section>
        <div className="grid gap-5 sm:grid-cols-3">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <Icon className="text-forest" size={22} />
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Who comes here"
              title="Built for groups of every kind"
              intro="Accommodations, meeting space and a wide range of activities - with the river and forest just outside the door."
            />
            <CampPhoto
              photo={photos.worship}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="mt-8 aspect-[16/10] rounded-2xl shadow-card"
            />
          </div>
          <ul className="grid gap-3 self-center">
            {retreats.groups.map((g) => (
              <li key={g} className="flex items-center gap-3 rounded-xl bg-surface-muted px-5 py-4 font-medium">
                <Check size={18} className="text-forest" /> {g}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12 rounded-xl border border-warning/30 bg-warning-soft px-5 py-4 text-sm text-warning">
          {retreats.closed}
        </p>
      </Section>

      <Section className="bg-surface-muted/60">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Check dates for your group</h2>
          <p className="mt-4 text-muted">
            Tell us your group size and preferred dates, and we&apos;ll get back to you with availability and rates.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${camp.email}?subject=${encodeURIComponent("Retreat booking enquiry")}`}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
            >
              Email us <ArrowRight size={18} />
            </a>
            <a
              href={telHref(camp.phone)}
              className="inline-flex h-12 items-center rounded-xl border border-border bg-surface px-6 font-semibold hover:bg-surface-muted"
            >
              Call {camp.phone}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
