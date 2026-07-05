import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateKnowledgeEntry, deleteKnowledgeEntry } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { KNOWLEDGE_CATEGORY_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function KnowledgeEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!entry) notFound();

  const updateWithId = updateKnowledgeEntry.bind(null, entry.id);
  const deleteWithId = deleteKnowledgeEntry.bind(null, entry.id);

  return (
    <div>
      <PageHeader title="Edit entry" />

      <Card className="p-4">
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={entry.title} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" defaultValue={entry.category}>
                {Object.entries(KNOWLEDGE_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="content">Details</Label>
            <Textarea id="content" name="content" rows={6} defaultValue={entry.content} required />
          </div>
          <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
        </form>
      </Card>

      <form action={deleteWithId} className="mt-4">
        <ConfirmButton confirmMessage="Delete this knowledge base entry? The AI will no longer be able to use it when drafting replies.">
          Delete entry
        </ConfirmButton>
      </form>
    </div>
  );
}
