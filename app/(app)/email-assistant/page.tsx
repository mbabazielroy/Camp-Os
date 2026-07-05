import Link from "next/link";
import { requireCamp } from "@/lib/auth";
import { syncGmailInbox } from "./actions";
import { formatRelativeTime } from "@/lib/dates";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { EMAIL_URGENCY_LABELS, EMAIL_URGENCY_STYLES } from "@/lib/labels";
import { Plus, Check, X, RefreshCw, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmailAssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const { supabase, campId } = await requireCamp();

  const [{ data: pending }, { data: history }, { data: gmailAccount }] = await Promise.all([
    supabase
      .from("email_drafts")
      .select("*")
      .eq("camp_id", campId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("email_drafts")
      .select("*")
      .eq("camp_id", campId)
      .neq("status", "pending")
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("gmail_accounts")
      .select("email, last_synced_at")
      .eq("camp_id", campId)
      .maybeSingle(),
  ]);

  return (
    <div>
      <PageHeader
        title="Email assistant"
        description="AI triage and draft replies. Nothing ever sends without your approval."
        action={
          <LinkButton href="/email-assistant/new" size="sm">
            <Plus size={16} /> New
          </LinkButton>
        }
      />

      {notice && (
        <p className="mb-4 rounded-lg bg-primary-soft text-primary text-sm px-3 py-2">{notice}</p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-danger-soft text-danger text-sm px-3 py-2">{error}</p>
      )}

      {gmailAccount ? (
        <Card className="p-4 mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Mail size={15} className="text-primary" /> {gmailAccount.email}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {gmailAccount.last_synced_at
                ? `Last synced ${formatRelativeTime(gmailAccount.last_synced_at)}`
                : "Never synced"}
            </p>
          </div>
          <form action={syncGmailInbox}>
            <SubmitButton pendingText="Syncing..." variant="secondary">
              <RefreshCw size={15} /> Sync inbox
            </SubmitButton>
          </form>
        </Card>
      ) : (
        <p className="mb-6 text-sm text-muted">
          Tip: connect Gmail in{" "}
          <Link href="/settings" className="text-primary font-medium hover:underline">
            Settings
          </Link>{" "}
          to pull your inbox in automatically - no more copy and paste.
        </p>
      )}

      <section className="mb-8">
        <h2 className="font-semibold text-foreground mb-2">Awaiting your review</h2>
        <Card className="px-3">
          {pending && pending.length > 0 ? (
            <div className="divide-y divide-border">
              {pending.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/email-assistant/${draft.id}`}
                  className="flex items-center gap-3 py-3 px-1"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {draft.sender_name || draft.sender_email || "Unknown sender"}
                      {draft.source === "gmail" && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                          Gmail
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted truncate">
                      {draft.ai_summary || draft.subject || draft.original_email.slice(0, 80)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {draft.urgency && (
                      <Badge className={EMAIL_URGENCY_STYLES[draft.urgency]}>
                        {EMAIL_URGENCY_LABELS[draft.urgency]}
                      </Badge>
                    )}
                    <span className="text-xs text-muted">
                      {formatRelativeTime(draft.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-6">
              <EmptyState
                title="Inbox zero"
                description="No drafts waiting for your review."
                action={
                  <LinkButton href="/email-assistant/new" variant="secondary" size="sm">
                    <Plus size={16} /> Paste an email
                  </LinkButton>
                }
              />
            </div>
          )}
        </Card>
      </section>

      {history && history.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-2">History</h2>
          <Card className="px-3">
            <div className="divide-y divide-border">
              {history.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/email-assistant/${draft.id}`}
                  className="flex items-center gap-3 py-3 px-1"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      draft.status === "approved"
                        ? "bg-primary-soft text-primary"
                        : "bg-surface-muted text-muted"
                    }`}
                  >
                    {draft.status === "approved" ? <Check size={14} /> : <X size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {draft.sender_name || draft.sender_email || "Unknown sender"}
                    </p>
                    <p className="text-sm text-muted truncate">
                      {draft.ai_summary || draft.subject || draft.original_email.slice(0, 80)}
                    </p>
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {formatRelativeTime(draft.updated_at)}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
