import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayISODate, formatRelativeTime } from "@/lib/dates";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { TaskItem } from "@/components/tasks/TaskItem";
import { EMAIL_URGENCY_LABELS, EMAIL_URGENCY_STYLES } from "@/lib/labels";
import { Mail, ListTodo, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayISODate();

  const [{ data: priorityTasks }, { count: openTaskCount }, { data: pendingEmails }, { count: pendingEmailCount }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")
        .or(`due_date.lte.${today},due_date.is.null`)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: false })
        .limit(8),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("email_drafts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("email_drafts")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const firstName = user?.user_metadata?.full_name?.split(" ")?.[0];

  return (
    <div>
      <PageHeader
        title={firstName ? `Good day, ${firstName}` : "Today's priorities"}
        description={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-2xl font-semibold text-foreground">{openTaskCount ?? 0}</p>
          <p className="text-sm text-muted mt-0.5">Open tasks</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-semibold text-foreground">{pendingEmailCount ?? 0}</p>
          <p className="text-sm text-muted mt-0.5">Drafts to review</p>
        </Card>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <ListTodo size={18} className="text-primary" />
            Due today &amp; overdue
          </h2>
          <LinkButton href="/tasks" variant="ghost" size="sm">
            View all
          </LinkButton>
        </div>
        <Card className="px-3">
          {priorityTasks && priorityTasks.length > 0 ? (
            <div className="divide-y divide-border">
              {priorityTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="py-6">
              <EmptyState
                title="Nothing urgent"
                description="You're all caught up on tasks for today."
                action={
                  <LinkButton href="/tasks" variant="secondary" size="sm">
                    <Plus size={16} /> Add a task
                  </LinkButton>
                }
              />
            </div>
          )}
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            Drafts awaiting your approval
          </h2>
          <LinkButton href="/email-assistant" variant="ghost" size="sm">
            Open assistant
          </LinkButton>
        </div>
        <Card className="px-3">
          {pendingEmails && pendingEmails.length > 0 ? (
            <div className="divide-y divide-border">
              {pendingEmails.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/email-assistant/${draft.id}`}
                  className="flex items-center gap-3 py-3 px-1"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {draft.sender_name || draft.sender_email || "Unknown sender"}
                    </p>
                    <p className="text-sm text-muted truncate">
                      {draft.ai_summary || draft.original_email.slice(0, 80)}
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
                title="No drafts waiting"
                description="Paste in an email to get an AI-drafted reply for your approval."
                action={
                  <LinkButton href="/email-assistant" variant="secondary" size="sm">
                    <Plus size={16} /> New email
                  </LinkButton>
                }
              />
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
