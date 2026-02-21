/**
 * POST /api/integrations/[id]/check
 *
 * Verifies the integration is still working:
 * - If real OAuth tokens are stored: calls the provider's API to verify
 * - If token is expired and a refresh token exists: refreshes first
 * - If no OAuth tokens (legacy): pings the property URL
 * - Writes connectionStatus back to metadataJson
 */

import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { getIntegration, updateIntegrationMetadata } from "@/lib/integrations";
import { decryptToken, encryptToken } from "@/lib/tokens";
import { refreshGoogleToken, checkGoogleToken } from "@/lib/oauth/google";
import { checkMetaConnection } from "@/lib/oauth/meta";
import { checkLinkedInConnection } from "@/lib/oauth/linkedin";
import { prisma } from "@/lib/db";

const GOOGLE_PROVIDERS = new Set(["gsc", "google_analytics", "google_ads"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const integration = await getIntegration(scope.accountId, id);
  if (!integration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checkedAt = new Date().toISOString();

  // Legacy: no real OAuth tokens stored — ping the property URL
  if (!integration.encryptedAccessToken) {
    const url = integration.externalPropertyId;
    if (!url) {
      const meta = { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: "No credentials. Please reconnect via OAuth." };
      await updateIntegrationMetadata(scope.accountId, id, meta);
      return NextResponse.json({ ok: false, ...meta });
    }
    try {
      const target = url.startsWith("http") ? url : `https://${url}`;
      const res = await fetch(target, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
      const ok = res.status < 500;
      const meta = ok
        ? { connectionStatus: "ok" as const, lastCheckedAt: checkedAt, lastError: null }
        : { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: `HTTP ${res.status}` };
      await updateIntegrationMetadata(scope.accountId, id, meta);
      return NextResponse.json({ ok, ...meta });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unreachable";
      const meta = { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: message };
      await updateIntegrationMetadata(scope.accountId, id, meta);
      return NextResponse.json({ ok: false, ...meta });
    }
  }

  // Decrypt stored access token
  let accessToken: string;
  try {
    accessToken = decryptToken(integration.encryptedAccessToken);
  } catch {
    const meta = { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: "Credentials corrupted. Please reconnect." };
    await updateIntegrationMetadata(scope.accountId, id, meta);
    return NextResponse.json({ ok: false, ...meta });
  }

  // If token is expired and we have a refresh token, refresh it (Google only)
  if (integration.tokenExpiry && new Date(integration.tokenExpiry) <= new Date()) {
    if (GOOGLE_PROVIDERS.has(integration.provider) && integration.encryptedRefreshToken) {
      try {
        const refreshToken = decryptToken(integration.encryptedRefreshToken);
        const refreshed = await refreshGoogleToken(refreshToken);
        accessToken = refreshed.access_token;
        const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000);
        await prisma.integration.update({
          where: { id },
          data: { encryptedAccessToken: encryptToken(accessToken), tokenExpiry: newExpiry },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Token refresh failed. Please reconnect.";
        const meta = { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: message };
        await updateIntegrationMetadata(scope.accountId, id, meta);
        return NextResponse.json({ ok: false, ...meta });
      }
    }
  }

  // Call the provider's API to verify the token
  let result: { ok: boolean; detail?: string };
  try {
    if (GOOGLE_PROVIDERS.has(integration.provider)) {
      result = await checkGoogleToken(accessToken);
    } else if (integration.provider === "meta_social") {
      result = await checkMetaConnection(accessToken);
    } else if (integration.provider === "linkedin_social") {
      result = await checkLinkedInConnection(accessToken);
    } else {
      result = { ok: false, detail: "Unknown provider" };
    }
  } catch (err) {
    result = { ok: false, detail: err instanceof Error ? err.message : "API check failed" };
  }

  const meta = result.ok
    ? { connectionStatus: "ok" as const, lastCheckedAt: checkedAt, lastError: null }
    : { connectionStatus: "error" as const, lastCheckedAt: checkedAt, lastError: result.detail ?? "Check failed" };

  await updateIntegrationMetadata(scope.accountId, id, meta);
  return NextResponse.json({ ok: result.ok, ...meta });
}
