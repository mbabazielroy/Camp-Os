"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { signOut } from "@/app/login/actions";
import { LogOut } from "lucide-react";

export function Sidebar({
  campName,
  email,
}: {
  campName: string | null;
  email: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface md:h-screen md:sticky md:top-0">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-semibold">
            C
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">CampFlow</p>
            <p className="text-xs text-muted leading-tight">{campName ?? "Admin"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 h-11 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-soft text-primary"
                  : "text-foreground hover:bg-surface-muted"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-2 border-t border-border">
        <p className="px-3 pt-3 pb-1 text-xs text-muted truncate">{email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 h-10 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            <LogOut size={17} strokeWidth={2} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
