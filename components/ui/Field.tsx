import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-xl border border-border bg-surface px-3 h-11 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${fieldBase} ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`${fieldBase} h-auto min-h-28 py-2.5 resize-y ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...props }, ref) => (
  <select ref={ref} className={`${fieldBase} pr-8 ${className}`} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground mb-1.5 block">
      {children}
    </label>
  );
}
