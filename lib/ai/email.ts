import { getOpenAIClient } from "@/lib/openai";
import type { EmailCategory, EmailUrgency } from "@/lib/supabase/database.types";

export interface KnowledgeSnippet {
  category: string;
  title: string;
  content: string;
}

export interface SuggestedTask {
  title: string;
  due_date: string | null;
}

export interface EmailAnalysis {
  category: EmailCategory;
  urgency: EmailUrgency;
  summary: string;
  draft: string;
  suggested_task: SuggestedTask | null;
}

const EMAIL_CATEGORIES: EmailCategory[] = [
  "pickup",
  "medical",
  "behavior",
  "billing",
  "logistics",
  "general",
  "other",
];

const EMAIL_URGENCIES: EmailUrgency[] = ["low", "medium", "high", "urgent"];

const SYSTEM_PROMPT = `You are an administrative assistant to a summer camp director. \
You triage incoming parent/guardian emails and draft calm, warm, professional replies. \
Ground every factual claim (dates, times, prices, rules) only in the camp knowledge base \
provided to you. If the knowledge base doesn't cover something the email asks about, say \
so plainly in the draft and note that the director will confirm - never invent camp-specific \
facts. You never send anything yourself; you only prepare a draft for a human to review, \
edit, and send. Keep the tone reassuring and concise, suitable for a busy parent.

Also decide whether replying is enough, or whether the email creates a follow-up action \
someone at camp must actually do (e.g. "tell Cabin 4 about the early pickup", "check the \
med form arrived", "update the authorized pickup list"). If so, propose one short, \
actionable task. If a specific date is mentioned, set the task's due date (YYYY-MM-DD); \
otherwise leave it null. If no follow-up beyond the reply is needed, return null for the task.`;

function buildKnowledgeBaseText(snippets: KnowledgeSnippet[]): string {
  if (snippets.length === 0) {
    return "(No knowledge base entries have been added yet.)";
  }
  return snippets
    .map((s) => `[${s.category}] ${s.title}\n${s.content}`)
    .join("\n\n")
    .slice(0, 12000);
}

export async function analyzeAndDraftEmail(input: {
  originalEmail: string;
  senderName?: string | null;
  subject?: string | null;
  knowledgeBase: KnowledgeSnippet[];
  instructions?: string;
}): Promise<EmailAnalysis> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const today = new Date().toISOString().slice(0, 10);

  const userMessage = [
    `TODAY'S DATE: ${today}`,
    `CAMP KNOWLEDGE BASE:\n${buildKnowledgeBaseText(input.knowledgeBase)}`,
    input.senderName ? `SENDER NAME: ${input.senderName}` : null,
    input.subject ? `SUBJECT: ${input.subject}` : null,
    `INCOMING EMAIL:\n${input.originalEmail.slice(0, 15000)}`,
    input.instructions
      ? `ADDITIONAL INSTRUCTIONS FROM THE DIRECTOR:\n${input.instructions.slice(0, 2000)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "email_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            category: { type: "string", enum: EMAIL_CATEGORIES },
            urgency: { type: "string", enum: EMAIL_URGENCIES },
            summary: {
              type: "string",
              description:
                "One short sentence (max ~150 characters) summarizing what the sender needs.",
            },
            draft: {
              type: "string",
              description:
                "A complete, ready-to-edit reply email, signed generically (e.g. 'The Camp Office').",
            },
            suggested_task: {
              anyOf: [
                {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: {
                      type: "string",
                      description:
                        "Short imperative task for camp staff, e.g. 'Tell Cabin 4 about Maya's 3pm Friday pickup'.",
                    },
                    due_date: {
                      anyOf: [{ type: "string" }, { type: "null" }],
                      description: "YYYY-MM-DD if a date applies, else null.",
                    },
                  },
                  required: ["title", "due_date"],
                },
                { type: "null" },
              ],
              description: "A follow-up action beyond replying, or null if none is needed.",
            },
          },
          required: ["category", "urgency", "summary", "draft", "suggested_task"],
        },
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("The AI did not return a response.");
  }

  const parsed = JSON.parse(raw) as EmailAnalysis;

  // Guard against a malformed due date sneaking through.
  if (parsed.suggested_task?.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.suggested_task.due_date)) {
    parsed.suggested_task.due_date = null;
  }

  return parsed;
}
