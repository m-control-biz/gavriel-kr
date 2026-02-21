import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { getIntegration, syncGoogleAdsMetrics } from "@/lib/integrations";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const integration = await getIntegration(scope.accountId, id);
  if (!integration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (integration.provider === "google_ads") {
    const count = await syncGoogleAdsMetrics(integration.accountId, null);
    return NextResponse.json({ ok: true, metricsCreated: count });
  }

  return NextResponse.json({ error: "Sync not supported for this integration type" }, { status: 400 });
}
