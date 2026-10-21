import type { Metadata } from "next";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { camp, telHref } from "@/lib/site/content";
import { photos } from "@/lib/site/photos";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${camp.name}: ${camp.address.street}, ${camp.address.city}, Ontario. ${camp.phone}.`,
};

export default function ContactPage() {
  const items = [
    {
      icon: MapPin,
      label: "Visit",
      value: `${camp.address.street}, ${camp.address.city}, ${camp.address.province}`,
      sub: camp.address.region,
      href: camp.mapUrl,
      cta: "Get directions",
    },
    { icon: Phone, label: "Call", value: camp.phone, href: telHref(camp.phone), cta: "Call the office" },
    { icon: Mail, label: "Email", value: camp.email, href: `mailto:${camp.email}`, cta: "Send an email" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk camp"
        photo={photos.canoe}
        intro="Questions about registration, a retreat booking, or working with us this summer? We'd love to hear from you."
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map(({ icon: Icon, label, value, sub, href, cta }) => (
            <a
              key={label}
              href={href}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon size={20} />
              </span>
              <p className="mt-5 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
              <p className="mt-1 break-words text-lg font-semibold">{value}</p>
              {sub && <p className="text-sm text-muted">{sub}</p>}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary">
                {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
