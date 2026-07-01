import Link from "next/link";
import { Check } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { toggleTaskStatus } from "@/app/(app)/tasks/actions";
import { formatDueDate } from "@/lib/dates";
import { Badge } from "@/components/ui/Badge";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_STYLES } from "@/lib/labels";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export function TaskItem({ task, linkToEdit = true }: { task: Task; linkToEdit?: boolean }) {
  const due = formatDueDate(task.due_date);
  const nextStatus = task.status === "done" ? "open" : "done";
  const isDone = task.status === "done";

  const Title = (
    <p
      className={`font-medium text-foreground truncate ${isDone ? "line-through text-muted" : ""}`}
    >
      {task.title}
    </p>
  );

  return (
    <div className="flex items-center gap-3 py-3 px-1">
      <form action={toggleTaskStatus.bind(null, task.id, nextStatus)}>
        <button
          type="submit"
          aria-label={isDone ? "Mark as open" : "Mark as done"}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isDone
              ? "bg-primary border-primary text-white"
              : "border-border text-transparent hover:border-primary"
          }`}
        >
          <Check size={14} strokeWidth={3} />
        </button>
      </form>

      <div className="flex-1 min-w-0">
        {linkToEdit ? (
          <Link href={`/tasks/${task.id}`} className="block">
            {Title}
          </Link>
        ) : (
          Title
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs ${due.overdue ? "text-danger font-medium" : "text-muted"}`}>
            {due.label}
          </span>
          {task.priority !== "medium" && (
            <Badge className={TASK_PRIORITY_STYLES[task.priority]}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
