export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function ListPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-6" />
      <Skeleton className="h-44 w-full mb-6 rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}
