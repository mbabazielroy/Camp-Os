"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Textarea, Select, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/email/CopyButton";
import {
  EMAIL_CATEGORY_LABELS,
  EMAIL_URGENCY_LABELS,
} from "@/lib/labels";
import type { EmailCategory, EmailUrgency } from "@/lib/supabase/database.types";

function SubmitButton({
  intent,
  variant,
  children,
}: {
  intent: "save" | "approve" | "dismiss";
  variant: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" name="intent" value={intent} variant={variant} disabled={pending}>
      {children}
    </Button>
  );
}

export function EmailDraftEditor({
  initialDraft,
  initialCategory,
  initialUrgency,
  saveAction,
}: {
  initialDraft: string;
  initialCategory: EmailCategory;
  initialUrgency: EmailUrgency;
  saveAction: (formData: FormData) => void | Promise<void>;
}) {
  const [text, setText] = useState(initialDraft);

  return (
    <form action={saveAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={initialCategory}>
            {Object.entries(EMAIL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="urgency">Urgency</Label>
          <Select id="urgency" name="urgency" defaultValue={initialUrgency}>
            {Object.entries(EMAIL_URGENCY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="edited_draft">Draft reply</Label>
          <CopyButton text={text} />
        </div>
        <Textarea
          id="edited_draft"
          name="edited_draft"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
        />
        <p className="text-xs text-muted mt-1.5">
          This is only a draft. Nothing is sent automatically - copy it into your email client
          once you&apos;re happy with it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <SubmitButton intent="approve" variant="primary">
          Approve draft
        </SubmitButton>
        <SubmitButton intent="save" variant="secondary">
          Save changes
        </SubmitButton>
        <SubmitButton intent="dismiss" variant="danger">
          Dismiss
        </SubmitButton>
      </div>
    </form>
  );
}
