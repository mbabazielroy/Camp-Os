import { signOut } from "@/app/login/actions";
import { LogOut } from "lucide-react";

export function TopBar({ campName }: { campName: string | null }) {
  return (
    <header
      className="md:hidden sticky top-0 z-20 flex items-center justify-between bg-surface/95 backdrop-blur border-b border-border px-4"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-2.5 h-14">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-semibold">
          C
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {campName ?? "CampFlow"}
          </p>
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
        >
          <LogOut size={18} strokeWidth={2} />
        </button>
      </form>
    </header>
  );
}
