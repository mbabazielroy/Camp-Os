import Link from "next/link";
import { MapPin, Phone, Mail, Waves } from "lucide-react";
import { camp, nav, telHref } from "@/lib/site/content";

export function SiteFooter() {
  return (
    <footer className="bg-[#0f2f37] text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Waves size={18} />
            </span>
            <span className="font-display text-lg font-semibold">{camp.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            A Bible-based, non-denominational camp on {camp.acres} acres along the Pigeon River. Owned
            and operated by {camp.owner}
          </p>
          <p className="mt-4 text-xs text-white/50">
            Accredited by {camp.accreditations.join(" and ")}.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={camp.registrationUrl} className="hover:text-white">
                Register online
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Visit</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-white/50" />
              <a href={camp.mapUrl} className="hover:text-white">
                {camp.address.street}
                <br />
                {camp.address.city}, {camp.address.province}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-white/50" />
              <a href={telHref(camp.phone)} className="hover:text-white">
                {camp.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-white/50" />
              <a href={`mailto:${camp.email}`} className="hover:text-white">
                {camp.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} {camp.owner}
          </p>
          <Link href="/login" className="hover:text-white">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
