import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Trees,
  Users,
  Flame,
  Sun,
  Utensils,
  Moon,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Scenery } from "@/components/site/Scenery";
import { ProgramCard } from "@/components/site/ProgramCard";
import { Section, SectionHeading, Eyebrow } from "@/components/site/Section";
import { camp, programs, retreats, faqs, season, telHref } from "@/lib/site/content";

const pillars = [
  {
    icon: BookOpen,
    title: "Bible-centred",
    body: "Every day includes time in God's Word, taught in a way kids understand and remember.",
  },
  {
    icon: ShieldCheck,
    title: "Accredited & safe",
    body: `Accredited by the ${camp.accreditations.join(" and ")}, with screened, trained staff.`,
  },
  {
    icon: Trees,
    title: `${camp.acres} acres outdoors`,
    body: "Fields, forest and the Pigeon River - room to run, explore and unplug.",
  },
  {
    icon: Users,
    title: "Counsellors who care",
    body: "Small cabin groups led by counsellors who know every camper by name.",
  },
];

const day = [
  { icon: Sun, time: "Morning", body: "Wake-up, breakfast together, and cabin devotions." },
  { icon: BookOpen, time: "Mid-morning", body: "Bible time and chapel - songs, stories and real questions." },
  { icon: Utensils, time: "Afternoon", body: "Lunch, then activities, big games and time outdoors." },
  { icon: Flame, time: "Evening", body: "Campfire, skits and the evening program." },
  { icon: Moon, time: "Lights out", body: "Cabin chats with counsellors before bed." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative isolate overflow-hidden">
        <Scenery className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0f2f37]/55 via-[#0f2f37]/25 to-[#0f2f37]/70" />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 text-white sm:px-6 sm:pb-24">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur">
            {`Since ${camp.founded} · Omemee, Ontario`}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Where summer meets the stream.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
            Bible-based summer camps for ages 5-15 and a year-round retreat centre, on {camp.acres}{" "}
            acres along the Pigeon River.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={camp.registrationUrl}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent/90"
            >
              Register for camp <ArrowRight size={18} />
            </a>
            <Link
              href="/summer-camps"
              className="inline-flex h-12 items-center rounded-xl bg-white/15 px-6 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              Explore programs
            </Link>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="border-b border-border bg-surface">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 md:grid-cols-4">
          {[
            ["Ages", "5-15"],
            ["Acres", String(camp.acres)],
            ["Serving families since", String(camp.founded)],
            ["Retreat groups", `${retreats.capacity.min}-${retreats.capacity.max}`],
          ].map(([label, value]) => (
            <div key={label} className="py-6 text-center">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt>
              <dd className="mt-1 font-display text-3xl font-semibold text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Programs */}
      <Section>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={`Summer ${season.year}`}
            title="A camp for every age and stage"
            intro={`From a first overnight at five to leadership training for teens. Register before ${season.earlyBirdDeadline} for early-bird pricing.`}
          />
          <Link
            href="/summer-camps"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Compare all programs <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
          <Link
            href="/leadership"
            className="group flex flex-col justify-between rounded-2xl bg-stream p-6 text-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Completed Grade 8</span>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">Leadership Training</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                A one-week program for teens ready to serve. Limited to 10 participants.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
              Learn more <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </Section>

      {/* Why Mill Stream */}
      <Section className="bg-surface-muted/60">
        <SectionHeading
          center
          eyebrow="Why families choose us"
          title="Faith, friendship and the great outdoors"
          intro={`Our mandate is simple: ${camp.mandate.join(", ").toLowerCase()}.`}
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-surface p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-soft text-forest">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* A day at camp */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <SectionHeading
            eyebrow="A day at camp"
            title="Sunrise to campfire"
            intro="Every week has its own surprises, but a typical overnight day follows a rhythm campers quickly come to love."
          />
          <ol className="relative space-y-6 border-l-2 border-dashed border-border pl-8">
            {day.map(({ icon: Icon, time, body }) => (
              <li key={time} className="relative">
                <span className="absolute -left-[3.05rem] flex h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-primary text-white">
                  <Icon size={15} />
                </span>
                <p className="font-semibold">{time}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Retreats */}
      <Section className="pt-0 sm:pt-0">
        <div className="relative overflow-hidden rounded-3xl bg-[#0f2f37] p-8 text-white sm:p-14">
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-forest/40" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Retreat centre</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Bring your group to the river
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-white/80">
                From {retreats.season}, Mill Stream hosts church groups, schools, families and ministries of{" "}
                {retreats.capacity.min} to {retreats.capacity.max} people.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/retreats"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-[#0f2f37] hover:bg-white/90"
              >
                Plan a retreat <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ + contact */}
      <Section className="bg-surface-muted/60">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeading eyebrow="Questions" title="Good to know" />
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
              {faqs.map((f) => (
                <details key={f.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <span className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">We&apos;d love to hear from you</h2>
            <ul className="mt-8 space-y-4">
              <li>
                <a href={camp.mapUrl} className="flex gap-4 rounded-2xl bg-surface p-5 shadow-card hover:shadow-card-hover">
                  <MapPin className="shrink-0 text-forest" />
                  <span>
                    <span className="block font-semibold">{camp.address.street}</span>
                    <span className="text-sm text-muted">
                      {camp.address.city}, {camp.address.province} &middot; {camp.address.region}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a href={telHref(camp.phone)} className="flex gap-4 rounded-2xl bg-surface p-5 shadow-card hover:shadow-card-hover">
                  <Phone className="shrink-0 text-forest" />
                  <span className="font-semibold">{camp.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${camp.email}`} className="flex gap-4 rounded-2xl bg-surface p-5 shadow-card hover:shadow-card-hover">
                  <Mail className="shrink-0 text-forest" />
                  <span className="font-semibold">{camp.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
