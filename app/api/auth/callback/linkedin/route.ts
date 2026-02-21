/**
 * GET /api/auth/callback/linkedin
 *
 * LinkedIn OAuth 2.0 callback (public route).
 */

import { NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/oauth/state";
import { exchangeLinkedInCode, getLinkedInProfile } from "@/lib/oauth/linkedin";
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
  if (!state || state.provider !== "linkedin") {
    return NextResponse.redirect(`${APP_URL}/integrations?error=invalid_state`);
  }

  const redirectUri = `${APP_URL}/api/auth/callback/linkedin`;

  try {
    const tokens = await exchangeLinkedInCode(code, redirectUri);
    const profile = await getLinkedInProfile(tokens.access_token);
    const name = [profile?.localizedFirstName, profile?.localizedLastName].filter(Boolean).join(" ") || "LinkedIn Account";

    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    await upsertIntegration({
      accountId: state.accountId,
      provider: "linkedin_social",
      name,
      accessToken: tokens.access_token,
      tokenExpiry,
    });

    return NextResponse.redirect(`${APP_URL}/integrations?provider=linkedin_social&connected=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth error";
    console.error("[callback/linkedin]", message);
    return NextResponse.redirect(`${APP_URL}/integrations?error=${encodeURIComponent(message)}`);
  }
}
