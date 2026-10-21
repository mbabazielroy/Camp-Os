import type { Metadata } from "next";
import { ArrowRight, GraduationCap, Clock, Users } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { camp, leadership, season } from "@/lib/site/content";
import { photos } from "@/lib/site/photos";

export const metadata: Metadata = {
  title: "Leadership training",
  description: "A one-week leadership training program at Mill Stream for teens who have completed Grade 8.",
};

export default function LeadershipPage() {
  const facts = [
    { icon: GraduationCap, label: "Who", value: leadership.eligibility },
    { icon: Clock, label: "Length", value: leadership.length },
    { icon: Users, label: "Spots", value: `Limited to ${leadership.spots}` },
  ];

  return (
    <>
      <PageHero
        eyebrow={`Summer ${season.year}`}
        title={leadership.name}
        photo={photos.hiking}
        intro="For teens who loved being campers and are ready to learn what it takes to lead."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-foreground/85">
            {leadership.description.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <Icon size={20} className="mt-0.5 shrink-0 text-forest" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
                  <p className="font-semibold">{value}</p>
                </div>
              </div>
            ))}
            <a
              href={`mailto:${camp.email}?subject=${encodeURIComponent("Leadership Training application")}`}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-white hover:bg-accent/90"
            >
              Request an application <ArrowRight size={18} />
            </a>
          </aside>
        </div>
      </Section>
    </>
  );
}
