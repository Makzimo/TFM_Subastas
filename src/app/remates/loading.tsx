import { CardSkeleton } from "@/components/ui/skeleton";

export default function RematesLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-800 mb-2" />
        <div className="h-4 w-96 animate-pulse rounded bg-neutral-800 mb-8" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
