"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/people/campers", label: "Campers" },
  { href: "/people/guardians", label: "Guardians" },
  { href: "/people/staff", label: "Staff" },
  { href: "/people/groups", label: "Groups" },
];

export function PeopleTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 mb-5 border-b border-border overflow-x-auto">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
