import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FiltersProps {
  basePath: string;
  currentStatus?: string;
  statuses: { value: string; label: string }[];
}

export function Filters({ basePath, currentStatus = "ALL", statuses }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={basePath}>
        <span
          className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            currentStatus === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Todos
        </span>
      </Link>
      {statuses.map((s) => (
        <Link key={s.value} href={`${basePath}?status=${s.value}`}>
          <span
            className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              currentStatus === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      )}
    </Card>
  );
}
