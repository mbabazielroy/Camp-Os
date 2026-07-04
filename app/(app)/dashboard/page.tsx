import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayISODate, formatRelativeTime } from "@/lib/dates";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { TaskItem } from "@/components/tasks/TaskItem";
import { EMAIL_URGENCY_LABELS, EMAIL_URGENCY_STYLES } from "@/lib/labels";
import { Mail, ListTodo, Plus, ArrowRight, Sun } from "lucide-react";

export const dynamic = "force-dynamic";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayISODate();

  const [
    { data: priorityTasks },
    { count: openTaskCount },
    { data: pendingEmails },
    { count: pendingEmailCount },
  ] = await Promise.all([
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

  const firstName: string | undefined =
    user?.user_metadata?.full_name?.split(" ")?.[0];
  const now = new Date();
  const caughtUp =
    (priorityTasks?.length ?? 0) === 0 && (pendingEmails?.length ?? 0) === 0;

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-5 md:p-6 mb-5 shadow-card">
        <div
          className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/10"
          aria-hidden
        />
        <div
          className="absolute -right-2 top-16 h-24 w-24 rounded-full bg-white/10"
          aria-hidden
        />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-sm text-white/80">
            <Sun size={15} />
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-semibold mt-1">
            {greetingForHour(now.getHours())}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-white/80 mt-1">
            {caughtUp
              ? "All clear - go be with the campers."
              : "Here's what needs you before you head out."}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <LinkButton
              href="/email-assistant/new"
              size="sm"
              className="!bg-white !text-primary hover:!bg-white/90"
            >
              <Mail size={15} /> Paste an email
            </LinkButton>
            <LinkButton
              href="/tasks"
              size="sm"
              className="!bg-white/15 !text-white border border-white/25 hover:!bg-white/25"
            >
              <Plus size={15} /> Add a task
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/tasks" className="group">
          <Card className="p-4 transition-shadow group-hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold text-foreground">
                {openTaskCount ?? 0}
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ListTodo size={18} />
              </span>
            </div>
            <p className="text-sm text-muted mt-1 flex items-center gap-1">
              Open tasks
              <ArrowRight
                size={13}
                className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
              />
            </p>
          </Card>
        </Link>
        <Link href="/email-assistant" className="group">
          <Card className="p-4 transition-shadow group-hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold text-foreground">
                {pendingEmailCount ?? 0}
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Mail size={18} />
              </span>
            </div>
            <p className="text-sm text-muted mt-1 flex items-center gap-1">
              Drafts to review
              <ArrowRight
                size={13}
                className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
              />
            </p>
          </Card>
        </Link>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">Due today &amp; overdue</h2>
          <Link
            href="/tasks"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
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
          <h2 className="font-semibold text-foreground">
            Drafts awaiting your approval
          </h2>
          <Link
            href="/email-assistant"
            className="text-sm font-medium text-primary hover:underline"
          >
            Open assistant
          </Link>
        </div>
        <Card className="px-3">
          {pendingEmails && pendingEmails.length > 0 ? (
            <div className="divide-y divide-border">
              {pendingEmails.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/email-assistant/${draft.id}`}
                  className="flex items-center gap-3 py-3 px-1 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
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
                  <LinkButton
                    href="/email-assistant/new"
                    variant="secondary"
                    size="sm"
                  >
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
