/**
 * Google OAuth 2.0 helpers.
 * One OAuth app covers: Search Console (gsc), Google Analytics (google_analytics), Google Ads (google_ads).
 * Scopes differ per feature; all use the same client credentials.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const SCOPES: Record<string, string> = {
  gsc: "https://www.googleapis.com/auth/webmasters.readonly openid email profile",
  google_analytics: "https://www.googleapis.com/auth/analytics.readonly openid email profile",
  google_ads: "https://www.googleapis.com/auth/adwords openid email profile",
};

export function buildGoogleAuthUrl(state: string, feature: string, redirectUri: string): string {
  const scope = SCOPES[feature] ?? SCOPES.gsc;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params}`;
}

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token refresh failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Get basic profile info (works for any valid Google OAuth token). */
export async function getGoogleUserInfo(accessToken: string): Promise<{ email: string; name?: string } | null> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Verify token is valid by calling userinfo endpoint. */
export async function checkGoogleToken(accessToken: string): Promise<{ ok: boolean; detail?: string }> {
  const info = await getGoogleUserInfo(accessToken);
  if (info?.email) return { ok: true };
  return { ok: false, detail: "Token invalid or expired" };
}
