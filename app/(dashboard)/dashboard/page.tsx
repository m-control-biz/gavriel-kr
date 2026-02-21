import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Phase 2 will add KPI cards, charts, and period comparison.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Foundation is ready. Use the client switcher and global search (UI) above. Metrics and charts come in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
