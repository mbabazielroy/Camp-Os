"use client";

import { useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

function RegenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      <Sparkles size={16} />
      {pending ? "Regenerating..." : "Regenerate with AI"}
    </Button>
  );
}

export function RegenerateForm({
  regenerateAction,
}: {
  regenerateAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={regenerateAction} className="space-y-2">
      <Textarea
        name="instructions"
        placeholder="Optional: tell the AI what to change (e.g. 'mention early pickup needs a form')"
        rows={2}
      />
      <RegenerateButton />
    </form>
  );
}
