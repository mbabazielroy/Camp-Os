import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateTask, deleteTask } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { TASK_PRIORITY_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: task } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();

  if (!task) notFound();

  const updateWithId = updateTask.bind(null, task.id);
  const deleteWithId = deleteTask.bind(null, task.id);

  return (
    <div>
      <PageHeader title="Edit task" />

      <Card className="p-4">
        <form action={updateWithId} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={task.title} required />
          </div>
          <div>
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task.description ?? ""}
              placeholder="Any extra detail worth remembering"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="due_date">Due date</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                defaultValue={task.due_date ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" name="priority" defaultValue={task.priority}>
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>

      <form action={deleteWithId} className="mt-4">
        <Button type="submit" variant="danger" size="sm">
          Delete task
        </Button>
      </form>
    </div>
  );
}
