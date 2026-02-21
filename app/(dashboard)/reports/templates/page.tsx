import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportTemplatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Report templates</h1>
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Phase 4: report templates and custom report builder.</p>
        </CardContent>
      </Card>
    </div>
  );
}
