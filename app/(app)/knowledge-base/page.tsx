import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createKnowledgeEntry } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { KNOWLEDGE_CATEGORY_LABELS } from "@/lib/labels";
import type { KnowledgeCategory } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER: KnowledgeCategory[] = [
  "pickup_times",
  "rules",
  "packing_list",
  "policy",
  "other",
];

export default async function KnowledgeBasePage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("knowledge_base")
    .select("*")
    .order("title", { ascending: true });

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: (entries ?? []).filter((e) => e.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        description="The facts the AI is allowed to use when drafting replies - rules, pickup times, packing lists, and policies."
      />

      <Card className="p-4 mb-6">
        <form action={createKnowledgeEntry} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g. Weekday pickup window" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" defaultValue="pickup_times">
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
            <Textarea
              id="content"
              name="content"
              rows={4}
              placeholder="Write it exactly as you'd want it explained to a parent."
              required
            />
          </div>
          <SubmitButton pendingText="Saving..." className="w-full sm:w-auto">
            Add entry
          </SubmitButton>
        </form>
      </Card>

      {grouped.length === 0 ? (
        <Card>
          <EmptyState
            title="Your knowledge base is empty"
            description="Add pickup times, packing lists, and camp policies above so the AI can draft accurate replies."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ category, items }) => (
            <section key={category}>
              <h2 className="font-semibold text-foreground mb-2">
                {KNOWLEDGE_CATEGORY_LABELS[category]}
              </h2>
              <Card className="px-3">
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/knowledge-base/${item.id}`}
                      className="block py-3 px-1"
                    >
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted line-clamp-2 mt-0.5">{item.content}</p>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
