import { StatCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-800" />
        <div className="h-4 w-96 animate-pulse rounded bg-neutral-800" />
      </div>

      <section>
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-800 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-800" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
        </div>
        <TableSkeleton rows={3} columns={4} />
      </section>
    </div>
  );
}
