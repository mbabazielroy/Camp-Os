"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

// Submit button for destructive forms - asks for confirmation before submitting.
export function ConfirmButton({
  children,
  confirmMessage,
  variant = "danger",
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  confirmMessage: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "Deleting..." : children}
    </Button>
  );
}
