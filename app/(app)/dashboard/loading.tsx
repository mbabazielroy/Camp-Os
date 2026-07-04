import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-28 w-full rounded-2xl mb-5" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-5 w-44 mb-2" />
      <Skeleton className="h-48 w-full rounded-2xl mb-8" />
      <Skeleton className="h-5 w-56 mb-2" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
