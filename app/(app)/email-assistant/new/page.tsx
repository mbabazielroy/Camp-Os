import { createEmailDraft } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function NewEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div>
      <PageHeader
        title="New email"
        description="Paste in the email you received. The AI will suggest a category, urgency, and a draft reply for you to review."
      />

      {params.error && (
        <p className="mb-4 rounded-lg bg-danger-soft text-danger text-sm px-3 py-2">
          {params.error}
        </p>
      )}

      <Card className="p-4">
        <form action={createEmailDraft} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sender_name">Sender name</Label>
              <Input id="sender_name" name="sender_name" placeholder="Jordan Parker" />
            </div>
            <div>
              <Label htmlFor="sender_email">Sender email</Label>
              <Input
                id="sender_email"
                name="sender_email"
                type="email"
                placeholder="jordan@example.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input id="subject" name="subject" placeholder="Early pickup Friday" />
          </div>
          <div>
            <Label htmlFor="original_email">Email text</Label>
            <Textarea
              id="original_email"
              name="original_email"
              rows={10}
              placeholder="Paste the full email here..."
              required
            />
          </div>
          <SubmitButton pendingText="Reading email..." className="w-full sm:w-auto">
            Categorize &amp; draft reply
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
