/**
 * GET /api/integrations/connect/[provider]?feature=gsc
 *
 * Initiates OAuth flow for the given provider.
 * Protected route — middleware sets x-account-id from the active account cookie.
 * Builds a signed state JWT and redirects to the provider's OAuth consent page.
 */

import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { signOAuthState } from "@/lib/oauth/state";
import { buildGoogleAuthUrl } from "@/lib/oauth/google";
import { buildMetaAuthUrl } from "@/lib/oauth/meta";
import { buildLinkedInAuthUrl } from "@/lib/oauth/linkedin";

const APP_URL = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

function missingEnv(provider: string, vars: string) {
  const msg = `${provider} OAuth not configured yet. Add ${vars} to Vercel environment variables and redeploy. See DEPLOYMENT.md for setup steps.`;
  return NextResponse.redirect(`${APP_URL}/integrations?error=${encodeURIComponent(msg)}`);
}

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.redirect(new URL("/auth/login", APP_URL));

  const { provider } = await params;
  const url = new URL(request.url);
  const feature = url.searchParams.get("feature") ?? provider;

  const state = await signOAuthState({ accountId: scope.accountId, feature, provider });

  switch (provider) {
    case "google": {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
        return missingEnv("Google", "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
      const redirectUri = `${APP_URL}/api/auth/callback/google`;
      return NextResponse.redirect(buildGoogleAuthUrl(state, feature, redirectUri));
    }
    case "meta": {
      if (!process.env.META_APP_ID || !process.env.META_APP_SECRET)
        return missingEnv("Meta", "META_APP_ID and META_APP_SECRET");
      const redirectUri = `${APP_URL}/api/auth/callback/meta`;
      return NextResponse.redirect(buildMetaAuthUrl(state, redirectUri));
    }
    case "linkedin": {
      if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET)
        return missingEnv("LinkedIn", "LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET");
      const redirectUri = `${APP_URL}/api/auth/callback/linkedin`;
      return NextResponse.redirect(buildLinkedInAuthUrl(state, redirectUri));
    }
    default:
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  }
}
