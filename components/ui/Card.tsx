export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
