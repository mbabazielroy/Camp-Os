import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck } from "lucide-react";
import { camp, nav, telHref } from "@/lib/site/content";
import { CampBadge } from "./CampBadge";

export function SiteFooter() {
  return (
    <footer className="bg-[#0f2f37] text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4 text-white">
            <CampBadge className="h-20 w-20 shrink-0" />
            <span className="font-display text-xl font-semibold leading-snug">{camp.name}</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            A Bible-based, non-denominational camp on {camp.acres} acres along the Pigeon River. Owned
            and operated by {camp.owner}
          </p>
          <p className="mt-5 flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck size={15} className="text-glow" />
            Accredited by {camp.accreditations.join(" and ")}
          </p>
        </div>

        <div>
          <h2 className="font-script text-2xl text-glow">Explore</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
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
          <h2 className="font-script text-2xl text-glow">Find us</h2>
          <ul className="mt-3 space-y-3 text-sm">
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
