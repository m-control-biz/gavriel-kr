/**
 * GET /api/auth/callback/google
 *
 * Google OAuth 2.0 callback (public route — Google redirects here after consent).
 * Verifies state JWT, exchanges code for tokens, upserts the Integration record.
 */

import { NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/oauth/state";
import { exchangeGoogleCode, getGoogleUserInfo } from "@/lib/oauth/google";
import { upsertIntegration } from "@/lib/integrations";

const APP_URL = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateToken = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=${encodeURIComponent(error)}`);
  }

  if (!code || !stateToken) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=missing_params`);
  }

  const state = await verifyOAuthState(stateToken);
  if (!state || state.provider !== "google") {
    return NextResponse.redirect(`${APP_URL}/integrations?error=invalid_state`);
  }

  const redirectUri = `${APP_URL}/api/auth/callback/google`;

  try {
    const tokens = await exchangeGoogleCode(code, redirectUri);
    const userInfo = await getGoogleUserInfo(tokens.access_token);
    const name = userInfo?.name ?? userInfo?.email ?? "Google Account";

    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    await upsertIntegration({
      accountId: state.accountId,
      provider: state.feature,
      name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      tokenExpiry,
    });

    return NextResponse.redirect(`${APP_URL}/integrations?provider=${state.feature}&connected=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth error";
    console.error("[callback/google]", message);
    return NextResponse.redirect(`${APP_URL}/integrations?error=${encodeURIComponent(message)}`);
  }
}
