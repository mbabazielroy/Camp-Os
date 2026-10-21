// A deterministic stand-in for the AI, used when no OpenAI key is set so the
// email assistant can still be demonstrated end to end. It applies the same
// rule the real prompt does: only state what the knowledge base supports.

import type { EmailCategory, EmailUrgency } from "@/lib/supabase/database.types";
import type { EmailAnalysis, KnowledgeSnippet } from "./email";

const CATEGORY_HINTS: { category: EmailCategory; words: string[] }[] = [
  { category: "pickup", words: ["pickup", "pick up", "pick-up", "drop off", "dropoff", "collect", "early"] },
  { category: "medical", words: ["medication", "medicine", "allergy", "allergies", "epipen", "inhaler", "nurse", "sick", "ill", "injury", "fever"] },
  { category: "behavior", words: ["behaviour", "behavior", "homesick", "bully", "fight", "upset", "crying", "discipline"] },
  { category: "billing", words: ["invoice", "payment", "refund", "deposit", "fee", "charge", "receipt", "cost", "price"] },
  { category: "logistics", words: ["bus", "packing", "pack", "what to bring", "schedule", "transport", "trip", "overnight", "laundry"] },
];

const URGENT_WORDS = ["urgent", "emergency", "asap", "immediately", "right away", "hospital"];
const SOON_WORDS = ["today", "tonight", "tomorrow", "this morning", "this afternoon"];

function categorize(text: string): EmailCategory {
  const lower = text.toLowerCase();
  for (const { category, words } of CATEGORY_HINTS) {
    if (words.some((word) => lower.includes(word))) return category;
  }
  return "general";
}

function gradeUrgency(text: string, category: EmailCategory): EmailUrgency {
  const lower = text.toLowerCase();
  if (URGENT_WORDS.some((w) => lower.includes(w))) return "urgent";
  if (category === "medical") return "high";
  if (SOON_WORDS.some((w) => lower.includes(w))) return "high";
  if (category === "pickup" || category === "billing") return "medium";
  return "low";
}

function firstSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const body = cleaned.replace(/^(hi|hello|hey|good morning|good afternoon|dear)[^.!?]*[.,!?]\s*/i, "");
  const sentence = body.split(/(?<=[.!?])\s/)[0] ?? body;
  return sentence.length > 150 ? `${sentence.slice(0, 147)}...` : sentence;
}

/** Knowledge base entries whose wording overlaps the email. */
function relevantEntries(text: string, knowledgeBase: KnowledgeSnippet[]): KnowledgeSnippet[] {
  const lower = text.toLowerCase();
  const words = new Set(
    lower
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4)
  );

  return knowledgeBase
    .map((entry) => {
      const haystack = `${entry.title} ${entry.content}`.toLowerCase();
      let score = 0;
      for (const word of words) if (haystack.includes(word)) score++;
      return { entry, score };
    })
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ entry }) => entry);
}

function greetingName(senderName?: string | null): string {
  const first = senderName?.trim().split(/\s+/)[0];
  return first ? `Hi ${first},` : "Hello,";
}

function suggestTask(text: string, category: EmailCategory, senderName?: string | null): EmailAnalysis["suggested_task"] {
  const lower = text.toLowerCase();
  const who = senderName?.trim().split(/\s+/)[0] ?? "the sender";

  if (category === "pickup") {
    return { title: `Tell the cabin staff about ${who}'s pickup change`, due_date: null };
  }
  if (category === "medical") {
    return { title: `Check the camp nurse has what she needs for ${who}'s request`, due_date: null };
  }
  if (category === "billing") {
    return { title: `Check the office records before replying to ${who}`, due_date: null };
  }
  if (lower.includes("confirm") || lower.includes("let me know") || lower.includes("get back")) {
    return { title: `Follow up with ${who}`, due_date: null };
  }
  return null;
}

export function analyzeOffline(input: {
  originalEmail: string;
  senderName?: string | null;
  subject?: string | null;
  knowledgeBase: KnowledgeSnippet[];
  instructions?: string;
}): EmailAnalysis {
  const text = `${input.subject ?? ""} ${input.originalEmail}`;
  const category = categorize(text);
  const urgency = gradeUrgency(text, category);
  const matches = relevantEntries(text, input.knowledgeBase);

  const paragraphs: string[] = [greetingName(input.senderName)];
  paragraphs.push("Thank you for getting in touch.");

  if (matches.length > 0) {
    paragraphs.push(
      ...matches.map((entry) => entry.content.split(/(?<=[.!?])\s/).slice(0, 2).join(" "))
    );
  } else {
    paragraphs.push(
      "I want to make sure I give you the right details rather than guess, so let me confirm the specifics and come back to you shortly."
    );
  }

  if (input.instructions) {
    paragraphs.push(input.instructions.trim());
  }

  paragraphs.push("Warmly,\nThe Camp Office");

  return {
    category,
    urgency,
    summary: firstSentence(input.originalEmail),
    draft: paragraphs.join("\n\n"),
    suggested_task: suggestTask(text, category, input.senderName),
  };
}
