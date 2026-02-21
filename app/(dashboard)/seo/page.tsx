import { redirect } from "next/navigation";
import { getAccountScope } from "@/lib/tenant";
import { listIntegrations } from "@/lib/integrations";
import { queryKpiSummaries } from "@/lib/metrics";
import { listSeoKeywords } from "@/lib/seo";
import { dateRangeFromParam, formatCompact } from "@/lib/date-utils";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectIntegrationBanner } from "@/components/connect-integration-banner";
import { Search } from "lucide-react";

const SEO_METRIC_TYPES = ["seo_clicks", "seo_impressions"] as const;
const LABEL: Record<string, string> = { seo_clicks: "SEO Clicks", seo_impressions: "SEO Impressions" };

export default async function SeoPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; client?: string }>;
}) {
  // #region agent log A — function entry
  console.error("[seo/page] A: function entered");
  fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seo/page:A',message:'function entered',hypothesisId:'K',timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  // #region agent log B — scope resolved
  console.error("[seo/page] B: scope resolved, accountId=" + scope.accountId);
  fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seo/page:B',message:'scope OK',data:{accountId:scope.accountId},hypothesisId:'K',timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const params = await searchParams;
  const range = params.range ?? "30d";
  const clientId = params.client ?? null;
  const { from, to } = dateRangeFromParam(range);

  let integrations: Awaited<ReturnType<typeof listIntegrations>> = [];
  let kpis: Awaited<ReturnType<typeof queryKpiSummaries>> = [];
  let keywords: Awaited<ReturnType<typeof listSeoKeywords>> = [];

  try {
    // #region agent log C — before data fetch
    console.error("[seo/page] C: starting Promise.all");
    fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seo/page:C',message:'before Promise.all',hypothesisId:'A-C',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    [integrations, kpis, keywords] = await Promise.all([
      listIntegrations(scope.accountId),
      queryKpiSummaries({
        accountId: scope.accountId,
        clientId,
        metricTypes: [...SEO_METRIC_TYPES],
        from,
        to,
      }),
      listSeoKeywords({ accountId: scope.accountId, clientId, from, to, limit: 50 }),
    ]);

    // #region agent log D — after data fetch
    console.error("[seo/page] D: Promise.all OK");
    fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seo/page:D',message:'Promise.all succeeded',data:{i:integrations.length,k:kpis.length,kw:keywords.length},hypothesisId:'A-C',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } catch(err) {
    // #region agent log E — data fetch failed
    console.error("[seo/page] E: Promise.all FAILED:", String(err));
    fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seo/page:E',message:'Promise.all FAILED',data:{error:String(err)},hypothesisId:'A-C',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }

  const hasSearchConsole = integrations.some((i) => i.provider === "gsc");

  // #region agent log F — before render
  console.error("[seo/page] F: before render, hasGsc=" + hasSearchConsole + " kpis=" + kpis.length);
  fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seo/page:F',message:'before render',data:{hasGsc:hasSearchConsole,kpis:kpis.length},hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SEO</h1>
        <p className="text-sm text-muted-foreground">
          Search performance and keyword data from Google Search Console.
        </p>
      </div>

      <ConnectIntegrationBanner
        title="Google Search Console"
        description="Connect a property to sync search queries, clicks, impressions, and keyword positions."
        connectLabel="Connect Search Console"
        href="/integrations?provider=gsc"
        connected={hasSearchConsole}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.metricType}
            title={LABEL[kpi.metricType] ?? kpi.metricType}
            value={formatCompact(kpi.current)}
            change={kpi.change}
            description={`vs prior period: ${formatCompact(kpi.previous)}`}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              {hasSearchConsole ? "No keyword data for this period yet. Sync will populate after connection." : "Connect Search Console above to sync keyword data."}
            </p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground">Keyword</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Clicks</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Impressions</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Position</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{row.keyword}</td>
                      <td className="py-3 px-4 text-right">{row.clicks}</td>
                      <td className="py-3 px-4 text-right">{row.impressions}</td>
                      <td className="py-3 px-4 text-right">{row.position.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
