import { Badge } from "@/components/ui/badge";

interface GuaranteeStatusProps {
  isPaid: boolean | null;
  compact?: boolean;
}

export function GuaranteeStatus({ isPaid, compact = false }: GuaranteeStatusProps) {
  if (isPaid === null) {
    return (
      <Badge variant="outline" className={compact ? "text-xs" : ""}>
        Sin garantía
      </Badge>
    );
  }

  return isPaid ? (
    <Badge variant="default" className={compact ? "text-xs" : ""}>
      Garantía pagada
    </Badge>
  ) : (
    <Badge variant="secondary" className={compact ? "text-xs" : ""}>
      Garantía pendiente
    </Badge>
  );
}
