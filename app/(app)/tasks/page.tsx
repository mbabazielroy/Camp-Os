import { createClient } from "@/lib/supabase/server";
import { createTask } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TASK_PRIORITY_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createClient();

  const [{ data: openTasks }, { data: doneTasks }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("status", "open")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("priority", { ascending: false }),
    supabase
      .from("tasks")
      .select("*")
      .eq("status", "done")
      .order("updated_at", { ascending: false })
      .limit(15),
  ]);

  return (
    <div>
      <PageHeader
        title="Tasks &amp; reminders"
        description="Keep track of everything that needs your attention."
      />

      <Card className="p-4 mb-6">
        <form action={createTask} className="space-y-3">
          <div>
            <Label htmlFor="title">New task</Label>
            <Input id="title" name="title" placeholder="e.g. Call Cabin 4 parent back" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" name="priority" defaultValue="medium">
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Add task
          </Button>
        </form>
      </Card>

      <section className="mb-8">
        <h2 className="font-semibold text-foreground mb-2">Open</h2>
        <Card className="px-3">
          {openTasks && openTasks.length > 0 ? (
            <div className="divide-y divide-border">
              {openTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="py-6">
              <EmptyState title="No open tasks" description="Add one above to get started." />
            </div>
          )}
        </Card>
      </section>

      {doneTasks && doneTasks.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-2">Recently completed</h2>
          <Card className="px-3">
            <div className="divide-y divide-border">
              {doneTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
