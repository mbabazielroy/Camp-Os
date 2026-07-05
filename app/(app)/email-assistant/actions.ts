"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCamp } from "@/lib/auth";
import { analyzeAndDraftEmail, type EmailAnalysis } from "@/lib/ai/email";
import { getGmailConnection } from "@/lib/gmail-account";
import { listInboxMessages, getMessage, createReplyDraft } from "@/lib/gmail";
import type { createClient } from "@/lib/supabase/server";
import type { EmailCategory, EmailUrgency } from "@/lib/supabase/database.types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function fetchKnowledgeBase(supabase: Supabase, campId: string) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("category, title, content")
    .eq("camp_id", campId)
    .order("updated_at", { ascending: false });
  return data ?? [];
}

function revalidateEmailViews(id?: string) {
  revalidatePath("/email-assistant");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/email-assistant/${id}`);
}

function analysisFields(analysis: EmailAnalysis) {
  return {
    category: analysis.category,
    urgency: analysis.urgency,
    ai_summary: analysis.summary,
    ai_draft: analysis.draft,
    edited_draft: analysis.draft,
    suggested_task_title: analysis.suggested_task?.title ?? null,
    suggested_task_due: analysis.suggested_task?.due_date ?? null,
  };
}

export async function createEmailDraft(formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const originalEmail = String(formData.get("original_email") ?? "").trim();
  if (!originalEmail) {
    redirect("/email-assistant/new?error=" + encodeURIComponent("Paste the email text first."));
  }

  const senderName = String(formData.get("sender_name") ?? "").trim() || null;
  const senderEmail = String(formData.get("sender_email") ?? "").trim() || null;
  const subject = String(formData.get("subject") ?? "").trim() || null;

  const knowledgeBase = await fetchKnowledgeBase(supabase, campId);

  let analysis: EmailAnalysis;
  try {
    analysis = await analyzeAndDraftEmail({
      originalEmail,
      senderName,
      subject,
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
      camp_id: campId,
      original_email: originalEmail,
      sender_name: senderName,
      sender_email: senderEmail,
      subject,
      source: "manual",
      status: "pending",
      ...analysisFields(analysis),
    })
    .select("id")
    .single();

  if (error || !draft) {
    redirect(
      "/email-assistant/new?error=" + encodeURIComponent("Could not save the draft. Please try again.")
    );
  }

  revalidateEmailViews();
  redirect(`/email-assistant/${draft.id}`);
}

export async function saveEmailDraft(id: string, formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const editedDraft = String(formData.get("edited_draft") ?? "");
  const category = String(formData.get("category") ?? "other") as EmailCategory;
  const urgency = String(formData.get("urgency") ?? "medium") as EmailUrgency;
  const intent = String(formData.get("intent") ?? "save");

  const status = intent === "approve" ? "approved" : intent === "dismiss" ? "dismissed" : "pending";

  await supabase
    .from("email_drafts")
    .update({ edited_draft: editedDraft, category, urgency, status })
    .eq("id", id)
    .eq("camp_id", campId);

  // Approving a Gmail-sourced email also files the reply into the Gmail
  // DRAFTS folder (never the outbox) so it's one tap away in Gmail itself.
  let gmailNotice: string | null = null;
  if (status === "approved") {
    const { data: draft } = await supabase
      .from("email_drafts")
      .select("source, gmail_thread_id, sender_email, subject")
      .eq("id", id)
      .eq("camp_id", campId)
      .maybeSingle();

    if (draft?.source === "gmail" && draft.gmail_thread_id && draft.sender_email) {
      try {
        const connection = await getGmailConnection(supabase, campId);
        if (connection) {
          await createReplyDraft(connection.accessToken, {
            threadId: draft.gmail_thread_id,
            to: draft.sender_email,
            subject: draft.subject ?? "",
            body: editedDraft,
          });
          gmailNotice = "Approved - the reply is waiting in your Gmail drafts folder.";
        }
      } catch {
        // Approval succeeded locally; surface the Gmail hiccup without undoing it.
        gmailNotice =
          "Approved, but saving to Gmail drafts failed - copy the reply manually or check Settings.";
      }
    }
  }

  revalidateEmailViews(id);

  if (gmailNotice) {
    redirect("/email-assistant?notice=" + encodeURIComponent(gmailNotice));
  }
  if (status !== "pending") {
    redirect("/email-assistant");
  }
}

export async function regenerateDraft(id: string, formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const { data: draft } = await supabase
    .from("email_drafts")
    .select("original_email, sender_name, subject")
    .eq("id", id)
    .eq("camp_id", campId)
    .maybeSingle();

  if (!draft) redirect("/email-assistant");

  const instructions = String(formData.get("instructions") ?? "").trim();
  const knowledgeBase = await fetchKnowledgeBase(supabase, campId);

  let analysis: EmailAnalysis;
  try {
    analysis = await analyzeAndDraftEmail({
      originalEmail: draft.original_email,
      senderName: draft.sender_name,
      subject: draft.subject,
      knowledgeBase,
      instructions: instructions || undefined,
    });
  } catch {
    redirect(
      `/email-assistant/${id}?error=` +
        encodeURIComponent(
          "The AI assistant couldn't regenerate the draft. Your current draft is unchanged - please try again."
        )
    );
  }

  await supabase
    .from("email_drafts")
    .update({ status: "pending", ...analysisFields(analysis) })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidateEmailViews(id);
  redirect(`/email-assistant/${id}`);
}

export async function deleteEmailDraft(id: string) {
  const { supabase, campId } = await requireCamp();

  await supabase.from("email_drafts").delete().eq("id", id).eq("camp_id", campId);

  revalidateEmailViews();
  redirect("/email-assistant");
}

// One-tap accept of the AI's suggested follow-up task.
export async function acceptSuggestedTask(id: string) {
  const { supabase, campId, userId } = await requireCamp();

  const { data: draft } = await supabase
    .from("email_drafts")
    .select("suggested_task_title, suggested_task_due, suggested_task_accepted")
    .eq("id", id)
    .eq("camp_id", campId)
    .maybeSingle();

  if (!draft?.suggested_task_title || draft.suggested_task_accepted) return;

  await supabase.from("tasks").insert({
    camp_id: campId,
    created_by: userId,
    title: draft.suggested_task_title,
    due_date: draft.suggested_task_due,
    priority: "medium",
    source_email_id: id,
  });

  await supabase
    .from("email_drafts")
    .update({ suggested_task_accepted: true })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidateEmailViews(id);
  revalidatePath("/tasks");
}

// Pulls recent Gmail inbox messages into the assistant, skipping anything
// already imported, and runs AI triage on each new one.
export async function syncGmailInbox() {
  const { supabase, campId } = await requireCamp();

  const connection = await getGmailConnection(supabase, campId);
  if (!connection) {
    redirect(
      "/email-assistant?error=" +
        encodeURIComponent("Connect Gmail in Settings before syncing.")
    );
  }

  let imported = 0;
  let skipped = 0;

  try {
    const messages = await listInboxMessages(connection.accessToken, 10);

    const ids = messages.map((m) => m.id);
    const { data: existing } = ids.length
      ? await supabase
          .from("email_drafts")
          .select("gmail_message_id")
          .eq("camp_id", campId)
          .in("gmail_message_id", ids)
      : { data: [] };
    const known = new Set((existing ?? []).map((e) => e.gmail_message_id));

    const knowledgeBase = await fetchKnowledgeBase(supabase, campId);

    for (const summary of messages) {
      if (known.has(summary.id)) {
        skipped++;
        continue;
      }

      const message = await getMessage(connection.accessToken, summary.id);

      // Skip messages the camp sent to itself / empty bodies.
      if (!message.bodyText.trim() || message.fromEmail === connection.email) {
        skipped++;
        continue;
      }

      let analysis: EmailAnalysis;
      try {
        analysis = await analyzeAndDraftEmail({
          originalEmail: message.bodyText,
          senderName: message.fromName,
          subject: message.subject,
          knowledgeBase,
        });
      } catch {
        continue; // Leave it for the next sync rather than failing the batch.
      }

      await supabase.from("email_drafts").insert({
        camp_id: campId,
        original_email: message.bodyText,
        sender_name: message.fromName,
        sender_email: message.fromEmail,
        subject: message.subject,
        source: "gmail",
        gmail_message_id: message.id,
        gmail_thread_id: message.threadId,
        status: "pending",
        ...analysisFields(analysis),
      });
      imported++;
    }

    await supabase
      .from("gmail_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("camp_id", campId);
  } catch {
    redirect(
      "/email-assistant?error=" +
        encodeURIComponent("Gmail sync failed partway through. Please try again.")
    );
  }

  revalidateEmailViews();
  redirect(
    "/email-assistant?notice=" +
      encodeURIComponent(
        imported > 0
          ? `Imported ${imported} new email${imported === 1 ? "" : "s"} from Gmail.`
          : skipped > 0
            ? "You're up to date - no new emails to import."
            : "No recent emails found in the inbox."
      )
  );
}
