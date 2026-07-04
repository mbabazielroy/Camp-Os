import { Search } from "lucide-react";

// GET form - submits ?q= to the current page, server filters the list.
export function SearchBox({
  placeholder,
  defaultValue,
}: {
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <form method="GET" className="relative mb-4">
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface pl-10 pr-3 h-11 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
    </form>
  );
}
