import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { getIntegration, updateIntegrationMetadata } from "@/lib/integrations";

/**
 * POST /api/integrations/[id]/check
 *
 * Performs a real connectivity check for the integration:
 * - Pings the stored property URL with a HEAD request.
 * - Updates metadataJson.connectionStatus to "ok" or "error".
 * - Returns the new status.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const integration = await getIntegration(scope.accountId, id);
  if (!integration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = integration.externalPropertyId;
  const checkedAt = new Date().toISOString();

  if (!url) {
    const meta = { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: "No property URL configured." };
    await updateIntegrationMetadata(scope.accountId, id, meta);
    return NextResponse.json({ ok: false, ...meta });
  }

  try {
    const target = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(target, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    const ok = res.status < 500;
    const meta = ok
      ? { connectionStatus: "ok" as const, lastCheckedAt: checkedAt, lastError: null }
      : { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: `HTTP ${res.status}` };

    await updateIntegrationMetadata(scope.accountId, id, meta);
    return NextResponse.json({ ok, ...meta });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unreachable";
    const meta = { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: message };
    await updateIntegrationMetadata(scope.accountId, id, meta);
    return NextResponse.json({ ok: false, ...meta });
  }
}
