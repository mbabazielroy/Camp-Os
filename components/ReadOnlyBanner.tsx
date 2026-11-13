import Link from "next/link";
import { Lock } from "lucide-react";

// Shown on every page once the trial has ended without an active
// subscription. Nothing is deleted; changes are refused until they subscribe.
export function ReadOnlyBanner() {
  return (
    <div className="bg-warning-soft border-b border-warning/20 px-4 py-2 text-center">
      <p className="text-xs text-foreground">
        <Lock size={12} className="inline-block mr-1.5 -mt-0.5 text-warning" />
        <strong className="font-semibold">Read-only</strong> - your free trial has ended. Your
        data is safe.{" "}
        <Link href="/settings/billing" className="font-medium text-primary hover:underline">
          Subscribe to keep making changes
        </Link>
      </p>
    </div>
  );
}
