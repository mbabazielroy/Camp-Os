import type { KnowledgeCategory } from "@/lib/supabase/database.types";

export interface KnowledgeStarter {
  category: KnowledgeCategory;
  title: string;
  content: string;
}

// Starter templates for a new camp's knowledge base. Deliberately written
// with [PLACEHOLDERS] so directors edit them into their real policies -
// the AI is instructed to only state facts found here, so accuracy matters.
export const KB_STARTERS: KnowledgeStarter[] = [
  {
    category: "pickup_times",
    title: "Daily drop-off and pickup times",
    content:
      "Drop-off is from [8:00-8:45 AM] at [the main lodge]. Pickup is from [4:30-5:30 PM] at [the same location]. Please stay in your car in the pickup line; a staff member will bring your camper to you. Late pickups after [5:30 PM] incur a fee of [$1 per minute].",
  },
  {
    category: "pickup_times",
    title: "Early pickup procedure",
    content:
      "If you need to pick up your camper early, email or call the camp office at least [2 hours] in advance. Early pickups require a signed release form at the office, and campers can only be released to adults listed on the authorized pickup list. Please bring photo ID.",
  },
  {
    category: "pickup_times",
    title: "Authorized pickup list changes",
    content:
      "To add or remove someone from your camper's authorized pickup list, email the office from the address we have on file with the person's full name and relationship to the camper. Changes take effect the next camp day. We cannot accept changes over the phone.",
  },
  {
    category: "packing_list",
    title: "Daily packing list",
    content:
      "Every day campers should bring: refillable water bottle, sunscreen (applied before arrival), hat, closed-toe shoes, swimsuit and towel, a change of clothes, and a nut-free lunch unless enrolled in the lunch program. Please label everything with your camper's name.",
  },
  {
    category: "packing_list",
    title: "Overnight trip packing list",
    content:
      "For overnight trips campers need: sleeping bag, pillow, flashlight or headlamp, toiletries, two changes of clothes, warm layer for evenings, rain jacket, and any medication in its original container handed directly to the camp nurse. No electronics, please.",
  },
  {
    category: "policy",
    title: "Medication policy",
    content:
      "All medication (including over-the-counter) must be checked in with the camp nurse in its original container, labeled with the camper's name, along with a completed medication authorization form. Campers may not keep medication with them, except physician-authorized inhalers and epinephrine auto-injectors.",
  },
  {
    category: "policy",
    title: "Illness and when to keep your camper home",
    content:
      "Please keep your camper home if they have had a fever, vomiting, or diarrhea within the last [24 hours]. If a camper becomes ill at camp, we will call you for pickup within [1 hour]. Missed days due to illness [are / are not] eligible for credit - see the refund policy.",
  },
  {
    category: "policy",
    title: "Refund and cancellation policy",
    content:
      "Cancellations more than [2 weeks] before the session start receive a full refund minus a [$50] deposit. Cancellations within [2 weeks] receive a [50%] refund. No refunds after the session begins, except for documented medical reasons, which are credited to a future session.",
  },
  {
    category: "rules",
    title: "Phones and electronics",
    content:
      "Camp is a screen-free environment. Phones, tablets, smart watches, and gaming devices must stay home. If a camper needs to reach a parent, the office phone is always available. Devices seen at camp are held at the office for pickup at the end of the day.",
  },
  {
    category: "rules",
    title: "Behavior expectations",
    content:
      "We expect campers to be kind, follow staff instructions, and stay with their group. Our discipline approach: first a conversation with the counselor, then a check-in with the director, then a call home. Physical aggression, bullying, or leaving the group area may result in immediate parent pickup and possible dismissal without refund.",
  },
];
