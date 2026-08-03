interface WinnerIndicatorProps {
  winner: {
    name: string | null;
    email: string;
  } | null;
  bidCount: number;
}

export function WinnerIndicator({ winner, bidCount }: WinnerIndicatorProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
        Ganador actual
      </h3>
      {winner ? (
        <div>
          <p className="text-lg font-bold text-green-600">
            {winner.name || winner.email}
          </p>
          <p className="text-sm text-muted-foreground">
            {bidCount} {bidCount === 1 ? "puja" : "pujas"} realizadas
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground">Sin pujas aún</p>
      )}
    </div>
  );
}
