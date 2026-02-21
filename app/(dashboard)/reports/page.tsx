import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountScope } from "@/lib/tenant";
import { listReports } from "@/lib/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileBarChart2, Share2 } from "lucide-react";

const DATE_RANGE_LABEL: Record<string, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  custom: "Custom",
};

export default async function ReportsPage() {
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const reports = await listReports(scope.accountId);

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Build, share, and export performance reports.
          </p>
        </div>
        <Link href="/reports/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" /> New report
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 gap-4 text-center">
          <FileBarChart2 className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No reports yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first report to start tracking metrics.
            </p>
          </div>
          <Link href="/reports/new">
            <Button variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" /> New report
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`} className="block group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                    {report.name}
                  </CardTitle>
                  {report.shareToken && (
                    <span title="Shared">
                      <Share2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {report.metricTypes.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {DATE_RANGE_LABEL[report.dateRange] ?? report.dateRange} &middot;{" "}
                    <span className="capitalize">{report.breakdown}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(report.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
