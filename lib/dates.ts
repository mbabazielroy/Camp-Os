export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function tomorrowISODate() {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
}

export function formatDueDate(dueDate: string | null): {
  label: string;
  overdue: boolean;
} {
  if (!dueDate) return { label: "No due date", overdue: false };

  const today = todayISODate();
  const diffDays = Math.round(
    (new Date(dueDate + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) /
      86_400_000
  );

  if (diffDays === 0) return { label: "Due today", overdue: false };
  if (diffDays === 1) return { label: "Due tomorrow", overdue: false };
  if (diffDays === -1) return { label: "1 day overdue", overdue: true };
  if (diffDays < 0) return { label: `${Math.abs(diffDays)} days overdue`, overdue: true };
  if (diffDays <= 6) {
    const weekday = new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
    });
    return { label: `Due ${weekday}`, overdue: false };
  }

  const formatted = new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { label: `Due ${formatted}`, overdue: false };
}

export function formatRelativeTime(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
