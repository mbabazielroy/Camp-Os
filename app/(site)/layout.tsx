import type { Metadata } from "next";
import { Caveat, Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaBand } from "@/components/site/CtaBand";
import { camp } from "@/lib/site/content";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${camp.name} | Omemee, Ontario`,
    template: `%s | ${camp.shortName} Camp`,
  },
  description:
    "Bible-based summer camps for ages 5-15 and a year-round retreat centre on 40 acres along the Pigeon River in Omemee, Ontario.",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${caveat.variable} paper flex min-h-screen flex-col`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <CtaBand />
      <SiteFooter />
    </div>
  );
}
