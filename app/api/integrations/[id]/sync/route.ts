import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getIntegration, syncGoogleAdsMetrics } from "@/lib/integrations";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const integration = await getIntegration(session.tenantId, id);
  if (!integration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (integration.type === "google_ads") {
    const count = await syncGoogleAdsMetrics(session.tenantId, integration.clientId);
    return NextResponse.json({ ok: true, metricsCreated: count });
  }

  return NextResponse.json({ error: "Sync not supported for this integration type" }, { status: 400 });
}
