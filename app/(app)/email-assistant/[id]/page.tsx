import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveEmailDraft, regenerateDraft, deleteEmailDraft } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmailDraftEditor } from "@/components/email/EmailDraftEditor";
import { RegenerateForm } from "@/components/email/RegenerateForm";
import { EMAIL_URGENCY_LABELS, EMAIL_URGENCY_STYLES } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function EmailDraftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: draft } = await supabase
    .from("email_drafts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!draft) notFound();

  const saveWithId = saveEmailDraft.bind(null, draft.id);
  const regenerateWithId = regenerateDraft.bind(null, draft.id);
  const deleteWithId = deleteEmailDraft.bind(null, draft.id);

  return (
    <div>
      <PageHeader
        title={draft.sender_name || draft.sender_email || "Email"}
        description={draft.sender_email ?? undefined}
        action={
          draft.status !== "pending" ? (
            <Badge
              className={
                draft.status === "approved"
                  ? "bg-primary-soft text-primary"
                  : "bg-surface-muted text-muted"
              }
            >
              {draft.status === "approved" ? "Approved" : "Dismissed"}
            </Badge>
          ) : draft.urgency ? (
            <Badge className={EMAIL_URGENCY_STYLES[draft.urgency]}>
              {EMAIL_URGENCY_LABELS[draft.urgency]}
            </Badge>
          ) : undefined
        }
      />

      <Card className="p-4 mb-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Original email
        </p>
        <p className="text-sm text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
          {draft.original_email}
        </p>
      </Card>

      {draft.status === "pending" ? (
        <>
          <Card className="p-4 mb-4">
            <EmailDraftEditor
              initialDraft={draft.edited_draft ?? draft.ai_draft ?? ""}
              initialCategory={draft.category ?? "other"}
              initialUrgency={draft.urgency ?? "medium"}
              saveAction={saveWithId}
            />
          </Card>

          <Card className="p-4 mb-4">
            <p className="text-sm font-medium text-foreground mb-2">Not quite right?</p>
            <RegenerateForm regenerateAction={regenerateWithId} />
          </Card>
        </>
      ) : (
        <Card className="p-4 mb-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Final reply
          </p>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {draft.edited_draft ?? draft.ai_draft}
          </p>
        </Card>
      )}

      <form action={deleteWithId}>
        <Button type="submit" variant="ghost" size="sm" className="text-danger">
          Delete
        </Button>
      </form>
    </div>
  );
}
