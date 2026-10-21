// Content for the public Mill Stream website. Everything a director updates each
// season - dates, prices, contact details - lives in this one file.

export const camp = {
  name: "Mill Stream Bible Camp & Retreat Centre",
  shortName: "Mill Stream",
  tagline: "Bible camp on the Pigeon River",
  founded: 1946,
  acres: 40,
  owner: "BCM International (Canada) Inc.",
  address: {
    street: "880 Old Mill Road",
    city: "Omemee",
    province: "ON",
    region: "Kawartha Lakes, near Lindsay",
  },
  phone: "705-799-6521",
  email: "info@millstream.camp",
  registrationUrl: "https://millstream.uplifterinc.com/",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=880+Old+Mill+Road+Omemee+Ontario",
  accreditations: ["Ontario Camps Association", "CCI Canada"],
  mandate: ["Reaching children", "Serving the church", "Serving families"],
};

export const season = {
  year: 2026,
  earlyBirdDeadline: "May 1, 2026",
  taxNote: "Applicable 13% HST extra.",
};

export type Program = {
  slug: string;
  name: string;
  ages: string;
  kind: "Overnight" | "Day camp" | "Specialty";
  blurb: string;
  description: string[];
  highlights: string[];
  sessions: string[];
  price?: { earlyBird: number; regular: number; unit: string };
  // Overrides the default registration button when a program registers elsewhere.
  register?: { label: string; href: string };
  accent: "forest" | "primary" | "accent";
};

export const programs: Program[] = [
  {
    slug: "beginnin-camp",
    name: "Beginnin' Camp",
    ages: "Ages 5-7",
    kind: "Overnight",
    blurb: "A gentle first taste of overnight camp - three days built for little campers.",
    description: [
      "Beginnin' Camp is a short, cozy introduction to sleeping away from home. Smaller groups, lots of counsellor attention, and a pace made for five to seven year olds.",
      "Campers sing, play, explore the property, and hear Bible stories told in a way that sticks - then head home proud of their first camp adventure.",
    ],
    highlights: ["Short 3-day session", "Extra counsellor attention", "Perfect first overnight"],
    sessions: ["July 19-21, 2026"],
    price: { earlyBird: 271, regular: 301, unit: "per session" },
    accent: "accent",
  },
  {
    slug: "day-campin",
    name: "Day Campin'",
    ages: "Ages 8-13",
    kind: "Day camp",
    blurb: "All the fun of a camp week, home for dinner every night.",
    description: [
      "Day Campin' gives campers a full week at Mill Stream - games, outdoor adventure, crafts, and chapel - with drop-off in the morning and pickup in the afternoon.",
      "It is a great way for kids to get to know camp before trying an overnight week.",
    ],
    highlights: ["Monday to Friday", "Home every evening", "Great step toward overnight camp"],
    sessions: ["July 13-17, 2026", "August 10-14, 2026"],
    price: { earlyBird: 325, regular: 355, unit: "per week" },
    accent: "primary",
  },
  {
    slug: "trekkin-camp",
    name: "Trekkin' Camp",
    ages: "Ages 8-13",
    kind: "Overnight",
    blurb: "The classic Mill Stream week: cabins, campfires, and friends for life.",
    description: [
      "Trekkin' Camp is our full overnight week. Campers live in cabins with their counsellors, explore 40 acres of field and forest along the Pigeon River, and gather around the Bible every day.",
      "Expect big games, campfire nights, cabin time, and the kind of friendships that bring kids back year after year.",
    ],
    highlights: ["Full overnight week", "Cabin life with counsellors", "Campfires and chapel"],
    sessions: [],
    price: { earlyBird: 529, regular: 559, unit: "per week (2025 rate)" },
    accent: "forest",
  },
  {
    slug: "trailblazin-camp",
    name: "Trailblazin' Camp",
    ages: "Ages 13-15",
    kind: "Overnight",
    blurb: "A week built for teens - more challenge, more responsibility, deeper conversations.",
    description: [
      "Trailblazin' Camp is designed for young teens who are ready for more. Activities step up the challenge, and Bible times leave room for real questions and honest discussion.",
      "Many Trailblazers go on to our Leadership Training Program.",
    ],
    highlights: ["Teen-only week", "Bigger challenges", "Pathway to leadership training"],
    sessions: ["August 16-21, 2026"],
    price: { earlyBird: 549, regular: 579, unit: "per week" },
    accent: "primary",
  },
  {
    slug: "handicamp",
    name: "Handi*Camp",
    ages: "Teens & young adults",
    kind: "Specialty",
    blurb: "An overnight camp for young people with special needs, with nurses on site.",
    description: [
      "Handi*Camp is a 5-day, 4-night camping experience for teenagers and young adults with physical disabilities, run by BCM International and hosted at Mill Stream.",
      "Nurses are on site to oversee medical needs, and staff can provide a 1:1 staff-to-camper ratio where needed.",
    ],
    highlights: ["5 days, 4 nights", "Nurses on site", "1:1 support available"],
    sessions: ["Late July 2026 - contact BCM for exact dates"],
    register: { label: "Ask BCM about Handi*Camp", href: "mailto:mission@bcmintl.ca" },
    accent: "forest",
  },
];

export const leadership = {
  name: "Leadership Training Program",
  eligibility: "Teens who have completed Grade 8",
  length: "One week",
  spots: 10,
  description: [
    "Our Leadership Training Program is back for summer 2026. It is a one-week program for teens who have finished Grade 8 and want to grow as leaders - in camp and in life.",
    "Participants learn what it takes to serve campers well: leading activities, caring for kids, and growing in their own faith. Spots are limited to 10, and an application is required.",
  ],
};

export const retreats = {
  season: "September to June",
  capacity: { min: 20, max: 110 },
  closed: "Closed for rentals in July and most of August while summer camp is running.",
  groups: ["Church and youth groups", "School and outdoor education trips", "Family reunions", "Ministry and staff retreats"],
};

export const faqs = [
  {
    q: "Where is Mill Stream?",
    a: "We are at 880 Old Mill Road in Omemee, Ontario - in the Kawartha Lakes near Lindsay, on 40 acres along the Pigeon River.",
  },
  {
    q: "Is Mill Stream accredited?",
    a: "Yes. Mill Stream is accredited by the Ontario Camps Association and CCI Canada (Christian Camping International).",
  },
  {
    q: "Who runs the camp?",
    a: "Mill Stream is owned and operated by BCM International (Canada) Inc. We are a Bible-based, non-denominational camp, and campers of every background are welcome.",
  },
  {
    q: "How do I get the early-bird price?",
    a: `Register before ${season.earlyBirdDeadline} to save $30 on any summer program. ${season.taxNote}`,
  },
  {
    q: "Can my group rent the camp?",
    a: "Yes - the retreat centre hosts groups of 20 to 110 people from September to June. Get in touch to check dates.",
  },
];

export const nav = [
  { href: "/summer-camps", label: "Summer camps" },
  { href: "/retreats", label: "Retreats" },
  { href: "/leadership", label: "Leadership" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function telHref(phone: string) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}
