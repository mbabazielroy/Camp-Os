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
  Tent,
  Compass,
  Trophy,
  Palette,
  CalendarRange,
  Check,
} from "lucide-react";
import { CampPhoto } from "@/components/site/CampPhoto";
import { CampBadge } from "@/components/site/CampBadge";
import { Treeline } from "@/components/site/Treeline";
import { ProgramCard } from "@/components/site/ProgramCard";
import { Section, SectionHeading, Eyebrow } from "@/components/site/Section";
import { camp, programs, retreats, faqs, season, telHref } from "@/lib/site/content";
import { photos } from "@/lib/site/photos";

const gallery = [
  { photo: photos.waterfront, caption: "Waterfront", className: "col-span-2 row-span-2" },
  { photo: photos.campfire, caption: "Campfire nights", className: "" },
  { photo: photos.games, caption: "Big field games", className: "" },
  { photo: photos.crafts, caption: "Crafts & creativity", className: "" },
  { photo: photos.friends, caption: "Friends for life", className: "" },
];

const pillars = [
  { icon: BookOpen, title: "Bible-centred", body: "Time in God's Word every day, taught so kids understand and remember." },
  { icon: ShieldCheck, title: "Accredited & safe", body: `Accredited by the ${camp.accreditations.join(" and ")}.` },
  { icon: Trees, title: `${camp.acres} acres outdoors`, body: "Fields, forest and the Pigeon River - room to run and unplug." },
  { icon: Users, title: "Counsellors who care", body: "Small cabin groups led by counsellors who know every camper by name." },
];

const activities = [
  { icon: Flame, label: "Campfires" },
  { icon: Compass, label: "Outdoor adventure" },
  { icon: Trophy, label: "Big field games" },
  { icon: BookOpen, label: "Chapel & Bible time" },
  { icon: Tent, label: "Cabin life" },
  { icon: Palette, label: "Crafts & creativity" },
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
      <div className="relative isolate overflow-hidden text-white">
        <CampPhoto photo={photos.waterfront} priority className="absolute inset-0 -z-20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0f2f37]/50 via-[#0f2f37]/30 to-[#0f2f37]/80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0f2f37]/70 via-[#0f2f37]/20 to-transparent" />
        <div className="mx-auto grid min-h-[min(46rem,88vh)] max-w-6xl items-center gap-10 px-4 pb-32 pt-20 sm:px-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-script text-2xl text-glow sm:text-3xl">Summer camp &amp; retreats on the Pigeon River</p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.04] tracking-tight sm:text-7xl">
              Where summer meets the{" "}
              <span className="relative inline-block">
                stream.
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent sm:-bottom-3 sm:h-4"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path d="M2 8 Q 25 2 50 7 T 100 7 T 150 6 T 198 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
              Bible-based summer camps for ages 5-15 and a year-round retreat centre, on {camp.acres} acres
              in Omemee, Ontario.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={camp.registrationUrl}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent/90"
              >
                Register for camp <ArrowRight size={18} />
              </a>
              <Link
                href="/retreats"
                className="inline-flex items-center rounded-full border border-white/50 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Plan a retreat
              </Link>
            </div>
          </div>
          <CampBadge className="hidden h-52 w-52 -rotate-6 drop-shadow-2xl lg:block" />
        </div>
        <Treeline className="absolute -bottom-px left-0 h-14 text-background sm:h-20" />
      </div>

      {/* Quick facts */}
      <div className="relative z-10 mx-auto -mt-6 max-w-5xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-card md:grid-cols-4">
          {[
            ["Ages", "5-15"],
            ["Acres", String(camp.acres)],
            ["Since", String(camp.founded)],
            ["Retreat groups", `${retreats.capacity.min}-${retreats.capacity.max}`],
          ].map(([label, value], i) => (
            <div
              key={label}
              className={`flex flex-col-reverse px-4 py-5 text-center ${i % 2 ? "border-l border-border" : ""} ${i >= 2 ? "border-t border-border md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
            >
              <dt className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{label}</dt>
              <dd className="font-display text-3xl font-semibold text-primary sm:text-4xl">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Welcome */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Welcome to camp"
              title="A place to unplug, make friends and grow in faith"
              intro={`Since ${camp.founded}, Mill Stream has welcomed children and families to the banks of the Pigeon River. Our mandate is simple: ${camp.mandate.join(", ").toLowerCase()}.`}
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {pillars.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-soft text-forest">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative pb-16 sm:pb-20 sm:pr-16">
            <CampPhoto
              photo={photos.hiking}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="aspect-[4/5] rounded-3xl shadow-card-hover sm:aspect-[5/4]"
            />
            <CampPhoto
              photo={photos.canoe}
              sizes="(min-width: 1024px) 22vw, 50vw"
              className="absolute bottom-0 right-0 aspect-square w-1/2 rounded-3xl border-[6px] border-surface shadow-card-hover"
            />
            <div className="absolute -left-2 top-6 -rotate-3 rounded-xl bg-accent px-4 py-1.5 font-script text-2xl font-semibold text-white shadow-lg">
              Est. {camp.founded}
            </div>
          </div>
        </div>
      </Section>

      {/* Programs */}
      <Section className="bg-surface-muted/70">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={`Summer ${season.year}`}
            title="A camp for every age and stage"
            intro={`From a first overnight at five to leadership training for teens. Register before ${season.earlyBirdDeadline} for early-bird pricing.`}
          />
          <Link
            href="/summer-camps"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Compare dates &amp; fees <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
          <Link
            href="/leadership"
            className="group relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <CampPhoto photo={photos.woods} sizes="(min-width: 1024px) 33vw, 100vw" className="absolute inset-0 -z-20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0f2f37] via-[#0f2f37]/70 to-[#0f2f37]/20" />
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Completed Grade 8</span>
            <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">Leadership Training</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              A one-week program for teens ready to serve. Limited to 10 participants.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-glow">
              Learn more <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </Section>

      {/* Activities */}
      <div className="relative bg-forest text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <Eyebrow light>What campers do</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Every day is an adventure</h2>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {activities.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-3 rounded-2xl bg-white/[0.07] px-3 py-6 text-center ring-1 ring-white/10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0f2f37]/40 text-glow ring-2 ring-glow/40">
                  <Icon size={24} />
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gallery */}
      <Section>
        <SectionHeading
          center
          eyebrow="Life at Mill Stream"
          title="Days you'll hear about all year"
          intro="Paddling the river, games in the big field, cabin chats and campfire songs - camp is where kids slow down, step outside and make friends who last."
        />
        <div className="mt-12 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[230px] sm:grid-cols-4 sm:gap-4">
          {gallery.map(({ photo, caption, className }) => (
            <figure key={caption} className={`group relative overflow-hidden rounded-2xl ${className}`}>
              <CampPhoto
                photo={photo}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0f2f37]/85 to-transparent p-4 pt-10 font-script text-2xl font-semibold text-white">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* A day at camp */}
      <Section className="pt-0 sm:pt-0">
        <div className="grid gap-12 rounded-3xl bg-surface p-6 shadow-card sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <CampPhoto
            photo={photos.smores}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/3] rounded-2xl lg:aspect-[4/5]"
          />
          <div>
            <SectionHeading
              eyebrow="A day at camp"
              title="Sunrise to campfire"
              intro="Every week has its own surprises, but a typical overnight day follows a rhythm campers quickly come to love."
            />
            <ol className="relative mt-8 space-y-5 border-l-2 border-dashed border-border pl-8">
              {day.map(({ icon: Icon, time, body }) => (
                <li key={time} className="relative">
                  <span className="absolute -left-[3.05rem] flex h-9 w-9 items-center justify-center rounded-full border-4 border-surface bg-primary text-white">
                    <Icon size={15} />
                  </span>
                  <p className="font-semibold">{time}</p>
                  <p className="mt-0.5 text-sm text-muted">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* Retreats */}
      <Section className="bg-surface-muted/70">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <CampPhoto
              photo={photos.bibleStudy}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/3] rounded-3xl shadow-card-hover"
            />
            <div className="absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 shadow-card-hover">
              <CalendarRange className="text-forest" size={22} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">Retreat season</p>
                <p className="font-semibold">{retreats.season}</p>
              </div>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Retreat centre"
              title="Bring your group to the river"
              intro={`Outside of summer, Mill Stream hosts groups of ${retreats.capacity.min} to ${retreats.capacity.max} people - with accommodations, meeting space and the forest just outside the door.`}
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {retreats.groups.map((g) => (
                <li key={g} className="flex items-center gap-2.5 text-sm font-medium">
                  <Check size={17} className="shrink-0 text-forest" /> {g}
                </li>
              ))}
            </ul>
            <Link
              href="/retreats"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Plan a retreat <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </Section>

      {/* FAQ + contact */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeading eyebrow="Questions" title="Good to know" />
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface shadow-card">
              {faqs.map((f) => (
                <details key={f.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-lg text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">We&apos;d love to hear from you</h2>
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
