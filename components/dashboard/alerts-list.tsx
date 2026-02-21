import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AlertItem = {
  id: string;
  title: string;
  message: string | null;
  severity: string;
  createdAt: string;
};

const icons = {
  info: Info,
  warning: AlertTriangle,
  critical: XCircle,
};

const colors: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-amber-500",
  critical: "text-red-500",
};

export function AlertsList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts for this period.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert) => {
              const Icon = icons[alert.severity as keyof typeof icons] ?? Info;
              return (
                <li key={alert.id} className="flex items-start gap-3">
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      colors[alert.severity] ?? "text-muted-foreground"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{alert.title}</p>
                    {alert.message && (
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
