interface WinnerIndicatorProps {
  winner: {
    name: string | null;
    email: string;
  } | null;
  bidCount: number;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}

export function WinnerIndicator({ winner, bidCount }: WinnerIndicatorProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Ganador actual
      </p>
      {winner ? (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-500">
            {getInitials(winner.name, winner.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {winner.name || winner.email}
            </p>
            <p className="text-xs tabular-nums text-neutral-500">
              {bidCount} {bidCount === 1 ? "puja" : "pujas"}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">Sin pujas aún</p>
      )}
    </div>
  );
}
