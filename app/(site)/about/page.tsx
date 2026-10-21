import type { Metadata } from "next";
import { Heart, Church, Home, ShieldCheck } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/Section";
import { camp } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "About",
  description: `${camp.name} has served children and families from the Pigeon River in Omemee, Ontario since ${camp.founded}.`,
};

const mandateIcons = [Heart, Church, Home];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Mill Stream"
        title={`Serving kids and families since ${camp.founded}`}
        intro={`${camp.name} is a Bible-based, non-denominational camp on ${camp.acres} acres along the Pigeon River in ${camp.address.city}, Ontario.`}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg leading-relaxed text-foreground/85">
            <p>
              For generations, Mill Stream has been a place where children discover the outdoors, make
              lifelong friends, and hear the good news of Jesus in a way they can understand.
            </p>
            <p>
              The camp is owned and operated by {camp.owner} Alongside our summer programs, we run a
              year-round retreat centre and host Handi*Camp, an overnight camp for young people with special
              needs.
            </p>
          </div>
          <div className="rounded-2xl bg-stream p-8 text-white shadow-card">
            <ShieldCheck size={28} />
            <h2 className="mt-4 font-display text-2xl font-semibold">Accredited camp</h2>
            <p className="mt-3 leading-relaxed text-white/85">
              Mill Stream is accredited by the {camp.accreditations.join(" and ")}, meeting recognized standards
              for safety, staffing and program quality.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-surface-muted/60">
        <SectionHeading center eyebrow="Our mandate" title="Why we do what we do" />
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {camp.mandate.map((m, i) => {
            const Icon = mandateIcons[i];
            return (
              <div key={m} className="rounded-2xl bg-surface p-8 text-center shadow-card">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-soft text-forest">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{m}</h3>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
