import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Reporting engine</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Phase 4 will add report templates, custom builder, and exports.</p>
        </CardContent>
      </Card>
    </div>
  );
}
