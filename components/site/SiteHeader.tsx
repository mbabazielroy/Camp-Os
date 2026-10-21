"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Waves } from "lucide-react";
import { camp, nav } from "@/lib/site/content";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stream text-white shadow-sm">
            <Waves size={18} strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight">{camp.shortName}</span>
            <span className="block text-[11px] uppercase tracking-[0.14em] text-muted">Bible Camp</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-foreground/80 hover:text-foreground hover:bg-surface-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={camp.registrationUrl}
            className="hidden h-10 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90 sm:inline-flex"
          >
            Register
          </a>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground hover:bg-surface-muted md:hidden"
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
        <nav id="mobile-nav" className="border-t border-border bg-background px-4 pb-5 pt-2 md:hidden" aria-label="Main">
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
            className="mt-3 flex h-12 items-center justify-center rounded-xl bg-accent text-base font-semibold text-white"
          >
            Register for camp
          </a>
        </nav>
      )}
    </header>
  );
}
