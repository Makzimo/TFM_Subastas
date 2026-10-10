import { StatCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function PostorDashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
        <div className="h-4 w-80 animate-pulse rounded bg-neutral-800" />
      </div>

      <section>
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-800 mb-4" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section>
        <div className="h-5 w-44 animate-pulse rounded bg-neutral-800 mb-4" />
        <TableSkeleton rows={5} columns={3} />
      </section>
    </div>
  );
}
