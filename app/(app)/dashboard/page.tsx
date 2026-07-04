import Link from "next/link";
import { requireCamp } from "@/lib/auth";
import { createTask } from "@/app/(app)/tasks/actions";
import { addStarterPack } from "@/app/(app)/knowledge-base/actions";
import { todayISODate, tomorrowISODate, formatRelativeTime } from "@/lib/dates";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TaskItem } from "@/components/tasks/TaskItem";
import { EMAIL_URGENCY_LABELS, EMAIL_URGENCY_STYLES } from "@/lib/labels";
import {
  Mail,
  ListTodo,
  Plus,
  ArrowRight,
  Sun,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";

export const dynamic = "force-dynamic";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { supabase, campId, fullName } = await requireCamp();

  const today = todayISODate();
  const tomorrow = tomorrowISODate();

  const [
    { data: camp },
    { data: priorityTasks },
    { count: openTaskCount },
    { count: overdueCount },
    { data: pendingEmails },
    { count: pendingEmailCount },
    { count: urgentEmailCount },
    { count: kbCount },
    { count: emailEverCount },
    { data: gmailAccount },
  ] = await Promise.all([
    supabase.from("camps").select("name").eq("id", campId).maybeSingle(),
    supabase
      .from("tasks")
      .select("*")
      .eq("camp_id", campId)
      .eq("status", "open")
      .or(`due_date.lte.${today},due_date.is.null`)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("priority", { ascending: false })
      .limit(8),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("camp_id", campId)
      .eq("status", "open"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("camp_id", campId)
      .eq("status", "open")
      .lt("due_date", today),
    supabase
      .from("email_drafts")
      .select("*")
      .eq("camp_id", campId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("email_drafts")
      .select("id", { count: "exact", head: true })
      .eq("camp_id", campId)
      .eq("status", "pending"),
    supabase
      .from("email_drafts")
      .select("id", { count: "exact", head: true })
      .eq("camp_id", campId)
      .eq("status", "pending")
      .in("urgency", ["high", "urgent"]),
    supabase
      .from("knowledge_base")
      .select("id", { count: "exact", head: true })
      .eq("camp_id", campId),
    supabase
      .from("email_drafts")
      .select("id", { count: "exact", head: true })
      .eq("camp_id", campId),
    supabase.from("gmail_accounts").select("email").eq("camp_id", campId).maybeSingle(),
  ]);

  const firstName = fullName?.split(" ")?.[0];
  const now = new Date();
  const caughtUp =
    (priorityTasks?.length ?? 0) === 0 && (pendingEmails?.length ?? 0) === 0;

  // Onboarding: shown until the camp has a real name, some knowledge, and
  // has processed at least one email.
  const campNamed = Boolean(camp?.name && camp.name !== "My Camp");
  const hasKnowledge = (kbCount ?? 0) > 0;
  const processedEmail = (emailEverCount ?? 0) > 0;
  const onboarding = !(campNamed && hasKnowledge && processedEmail);

  // Rule-based morning briefing: the one thing that can't wait.
  const topUrgentEmail = pendingEmails?.find(
    (d) => d.urgency === "urgent" || d.urgency === "high"
  );
  const topOverdueTask = priorityTasks?.find(
    (t) => t.due_date && t.due_date < today
  );
  const briefingParts: string[] = [];
  if ((urgentEmailCount ?? 0) > 0) {
    briefingParts.push(
      `${urgentEmailCount} urgent email${urgentEmailCount === 1 ? "" : "s"} waiting`
    );
  } else if ((pendingEmailCount ?? 0) > 0) {
    briefingParts.push(
      `${pendingEmailCount} draft${pendingEmailCount === 1 ? "" : "s"} to review`
    );
  }
  if ((overdueCount ?? 0) > 0) {
    briefingParts.push(`${overdueCount} task${overdueCount === 1 ? "" : "s"} overdue`);
  }

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
              : briefingParts.length > 0
                ? `Today: ${briefingParts.join(" and ")}.`
                : "Here's what needs you before you head out."}
          </p>
          {(topUrgentEmail || topOverdueTask) && (
            <Link
              href={
                topUrgentEmail ? `/email-assistant/${topUrgentEmail.id}` : "/tasks"
              }
              className="mt-3 flex items-start gap-2 rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 hover:bg-white/15 transition-colors"
            >
              <Sparkles size={15} className="mt-0.5 shrink-0 text-white/90" />
              <span className="text-sm text-white/95 min-w-0">
                <span className="font-medium">Can&apos;t wait: </span>
                {topUrgentEmail
                  ? topUrgentEmail.ai_summary ||
                    `Urgent email from ${topUrgentEmail.sender_name || topUrgentEmail.sender_email || "a parent"}`
                  : topOverdueTask!.title}
              </span>
            </Link>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <LinkButton
              href="/email-assistant/new"
              size="sm"
              className="!bg-white !text-primary hover:!bg-white/90"
            >
              <Mail size={15} /> Paste an email
            </LinkButton>
            {gmailAccount && (
              <LinkButton
                href="/email-assistant"
                size="sm"
                className="!bg-white/15 !text-white border border-white/25 hover:!bg-white/25"
              >
                <ArrowRight size={15} /> Review inbox
              </LinkButton>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding checklist */}
      {onboarding && (
        <Card className="p-4 mb-5">
          <p className="font-semibold text-foreground mb-1">Set up CampFlow</p>
          <p className="text-sm text-muted mb-3">
            Three quick steps and the AI starts writing replies that sound like your camp.
          </p>
          <div className="space-y-2.5">
            <Link href="/settings" className="flex items-center gap-2.5 group">
              {campNamed ? (
                <CheckCircle2 size={19} className="text-primary shrink-0" />
              ) : (
                <Circle size={19} className="text-border shrink-0" />
              )}
              <span
                className={`text-sm ${campNamed ? "text-muted line-through" : "text-foreground group-hover:text-primary"}`}
              >
                Name your camp in Settings
              </span>
            </Link>
            <div className="flex items-center justify-between gap-2">
              <Link href="/knowledge-base" className="flex items-center gap-2.5 group min-w-0">
                {hasKnowledge ? (
                  <CheckCircle2 size={19} className="text-primary shrink-0" />
                ) : (
                  <Circle size={19} className="text-border shrink-0" />
                )}
                <span
                  className={`text-sm ${hasKnowledge ? "text-muted line-through" : "text-foreground group-hover:text-primary"}`}
                >
                  Add camp knowledge (rules, pickup times, policies)
                </span>
              </Link>
              {!hasKnowledge && (
                <form action={addStarterPack} className="shrink-0">
                  <SubmitButton pendingText="Adding..." variant="secondary">
                    Add starter pack
                  </SubmitButton>
                </form>
              )}
            </div>
            <Link href="/email-assistant/new" className="flex items-center gap-2.5 group">
              {processedEmail ? (
                <CheckCircle2 size={19} className="text-primary shrink-0" />
              ) : (
                <Circle size={19} className="text-border shrink-0" />
              )}
              <span
                className={`text-sm ${processedEmail ? "text-muted line-through" : "text-foreground group-hover:text-primary"}`}
              >
                Run your first email through the assistant
              </span>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
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

      {/* Quick add task */}
      <Card className="p-3 mb-6">
        <form action={createTask} className="flex gap-2">
          <Input
            name="title"
            placeholder="Quick task... (try the mic on your keyboard)"
            required
            className="flex-1 min-w-0"
            enterKeyHint="done"
          />
          <Select
            name="due_date"
            defaultValue={today}
            className="basis-28 grow-0 shrink-0"
            aria-label="Due date"
          >
            <option value={today}>Today</option>
            <option value={tomorrow}>Tomorrow</option>
            <option value="">No date</option>
          </Select>
          <SubmitButton pendingText="..." className="shrink-0 !px-3">
            <Plus size={18} />
          </SubmitButton>
        </form>
      </Card>

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
