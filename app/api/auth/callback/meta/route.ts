/**
 * GET /api/auth/callback/meta
 *
 * Meta OAuth 2.0 callback (public route).
 */

import { NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/oauth/state";
import { exchangeMetaCode, getMetaUserInfo } from "@/lib/oauth/meta";
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
  if (!state || state.provider !== "meta") {
    return NextResponse.redirect(`${APP_URL}/integrations?error=invalid_state`);
  }

  const redirectUri = `${APP_URL}/api/auth/callback/meta`;

  try {
    const tokens = await exchangeMetaCode(code, redirectUri);
    const userInfo = await getMetaUserInfo(tokens.access_token);
    const name = userInfo?.name ?? userInfo?.email ?? "Meta Account";

    const tokenExpiry = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null;

    await upsertIntegration({
      accountId: state.accountId,
      provider: "meta_social",
      name,
      accessToken: tokens.access_token,
      tokenExpiry,
    });

    return NextResponse.redirect(`${APP_URL}/integrations?provider=meta_social&connected=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth error";
    console.error("[callback/meta]", message);
    return NextResponse.redirect(`${APP_URL}/integrations?error=${encodeURIComponent(message)}`);
  }
}
