"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { analyzeAndDraftEmail, type EmailAnalysis } from "@/lib/ai/email";
import type { EmailCategory, EmailUrgency } from "@/lib/supabase/database.types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

async function fetchKnowledgeBase(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("category, title, content")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function createEmailDraft(formData: FormData) {
  const { supabase, user } = await requireUser();

  const originalEmail = String(formData.get("original_email") ?? "").trim();
  if (!originalEmail) {
    redirect("/email-assistant/new?error=" + encodeURIComponent("Paste the email text first."));
  }

  const senderName = String(formData.get("sender_name") ?? "").trim() || null;
  const senderEmail = String(formData.get("sender_email") ?? "").trim() || null;

  const knowledgeBase = await fetchKnowledgeBase(supabase);

  let analysis: EmailAnalysis;
  try {
    analysis = await analyzeAndDraftEmail({
      originalEmail,
      senderName,
      knowledgeBase,
    });
  } catch {
    redirect(
      "/email-assistant/new?error=" +
        encodeURIComponent("The AI assistant couldn't process that email. Please try again.")
    );
  }

  const { data: draft, error } = await supabase
    .from("email_drafts")
    .insert({
      user_id: user.id,
      original_email: originalEmail,
      sender_name: senderName,
      sender_email: senderEmail,
      category: analysis.category,
      urgency: analysis.urgency,
      ai_summary: analysis.summary,
      ai_draft: analysis.draft,
      edited_draft: analysis.draft,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !draft) {
    redirect(
      "/email-assistant/new?error=" + encodeURIComponent("Could not save the draft. Please try again.")
    );
  }

  revalidatePath("/email-assistant");
  revalidatePath("/dashboard");
  redirect(`/email-assistant/${draft.id}`);
}

export async function saveEmailDraft(id: string, formData: FormData) {
  const { supabase } = await requireUser();

  const editedDraft = String(formData.get("edited_draft") ?? "");
  const category = String(formData.get("category") ?? "other") as EmailCategory;
  const urgency = String(formData.get("urgency") ?? "medium") as EmailUrgency;
  const intent = String(formData.get("intent") ?? "save");

  const status = intent === "approve" ? "approved" : intent === "dismiss" ? "dismissed" : "pending";

  await supabase
    .from("email_drafts")
    .update({ edited_draft: editedDraft, category, urgency, status })
    .eq("id", id);

  revalidatePath("/email-assistant");
  revalidatePath(`/email-assistant/${id}`);
  revalidatePath("/dashboard");

  if (status !== "pending") {
    redirect("/email-assistant");
  }
}

export async function regenerateDraft(id: string, formData: FormData) {
  const { supabase } = await requireUser();

  const { data: draft } = await supabase
    .from("email_drafts")
    .select("original_email, sender_name")
    .eq("id", id)
    .maybeSingle();

  if (!draft) redirect("/email-assistant");

  const instructions = String(formData.get("instructions") ?? "").trim();
  const knowledgeBase = await fetchKnowledgeBase(supabase);

  const analysis = await analyzeAndDraftEmail({
    originalEmail: draft.original_email,
    senderName: draft.sender_name,
    knowledgeBase,
    instructions: instructions || undefined,
  });

  await supabase
    .from("email_drafts")
    .update({
      category: analysis.category,
      urgency: analysis.urgency,
      ai_summary: analysis.summary,
      ai_draft: analysis.draft,
      edited_draft: analysis.draft,
      status: "pending",
    })
    .eq("id", id);

  revalidatePath(`/email-assistant/${id}`);
}

export async function deleteEmailDraft(id: string) {
  const { supabase } = await requireUser();

  await supabase.from("email_drafts").delete().eq("id", id);

  revalidatePath("/email-assistant");
  revalidatePath("/dashboard");
  redirect("/email-assistant");
}
