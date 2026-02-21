import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiCardProps = {
  title: string;
  value: string;
  change: number; // % change
  suffix?: string;
  prefix?: string;
  description?: string;
};

export function KpiCard({ title, value, change, suffix, prefix, description }: KpiCardProps) {
  const positive = change > 0;
  const neutral = change === 0;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            neutral
              ? "bg-muted text-muted-foreground"
              : positive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
          )}
        >
          {neutral ? (
            <Minus className="h-3 w-3" />
          ) : positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {neutral ? "—" : `${positive ? "+" : ""}${change.toFixed(1)}%`}
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {prefix}
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
