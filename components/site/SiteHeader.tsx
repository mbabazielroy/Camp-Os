"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { camp, nav, telHref } from "@/lib/site/content";
import { CampBadge } from "./CampBadge";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* Utility bar */}
      <div className="hidden bg-[#0f2f37] text-xs text-white/75 sm:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-glow" />
            {camp.address.street}, {camp.address.city}, {camp.address.province}
          </span>
          <span className="flex items-center gap-5">
            <a href={telHref(camp.phone)} className="flex items-center gap-1.5 hover:text-white">
              <Phone size={13} className="text-glow" /> {camp.phone}
            </a>
            <a href={`mailto:${camp.email}`} className="flex items-center gap-1.5 hover:text-white">
              <Mail size={13} className="text-glow" /> {camp.email}
            </a>
          </span>
        </div>
      </div>

      <div className="border-b border-border/70 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <CampBadge className="h-12 w-12 drop-shadow-sm" />
            <span className="leading-tight">
              <span className="block font-display text-xl font-semibold tracking-tight">{camp.shortName}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-forest">
                Bible Camp &amp; Retreat Centre
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-3 py-2 text-[15px] font-medium transition-colors ${
                    active ? "text-primary" : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={camp.registrationUrl}
              className="hidden h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90 sm:inline-flex"
            >
              Register now
            </a>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-surface-muted lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-nav" className="border-t border-border bg-surface px-4 pb-5 pt-2 lg:hidden" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-surface-muted"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={camp.registrationUrl}
              className="mt-3 flex h-12 items-center justify-center rounded-full bg-accent text-base font-semibold text-white"
            >
              Register for camp
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
