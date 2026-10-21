import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CampPhoto } from "./CampPhoto";
import { Treeline } from "./Treeline";
import { camp } from "@/lib/site/content";
import { photos } from "@/lib/site/photos";

// The closing invitation shown above the footer on every page.
export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden text-white">
      <CampPhoto photo={photos.campfire} sizes="100vw" className="absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 bg-[#0f2f37]/75" aria-hidden />
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-20 text-center sm:px-6 sm:pb-36 sm:pt-28">
        <p className="font-script text-3xl text-glow sm:text-4xl">See you by the fire</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Save your camper&apos;s spot this summer
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">
          Overnight and day camps for ages 5-15, on {camp.acres} acres along the Pigeon River.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={camp.registrationUrl}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-white shadow-lg transition-colors hover:bg-accent/90"
          >
            Register for camp <ArrowRight size={18} />
          </a>
          <Link
            href="/retreats"
            className="inline-flex h-12 items-center rounded-full border border-white/40 px-7 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Book a retreat
          </Link>
        </div>
      </div>
      <Treeline className="absolute -bottom-px left-0 h-12 text-[#0f2f37] sm:h-16" />
    </section>
  );
}
