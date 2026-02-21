/**
 * Meta (Facebook + Instagram) OAuth 2.0 helpers.
 * Uses Meta's Graph API v18.
 */

const META_AUTH_URL = "https://www.facebook.com/v18.0/dialog/oauth";
const META_TOKEN_URL = "https://graph.facebook.com/v18.0/oauth/access_token";

const META_SCOPE = "pages_read_engagement,instagram_basic,ads_read,business_management,public_profile,email";

export function buildMetaAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: META_SCOPE,
    state,
    response_type: "code",
  });
  return `${META_AUTH_URL}?${params}`;
}

type MetaTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
};

export async function exchangeMetaCode(code: string, redirectUri: string): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${META_TOKEN_URL}?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta token exchange failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Get Meta user info to use as integration name. */
export async function getMetaUserInfo(accessToken: string): Promise<{ id: string; name?: string; email?: string } | null> {
  const res = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
  if (!res.ok) return null;
  return res.json();
}

export async function checkMetaConnection(accessToken: string): Promise<{ ok: boolean; detail?: string }> {
  const info = await getMetaUserInfo(accessToken);
  if (info?.id) return { ok: true };
  return { ok: false, detail: "Meta token invalid or expired" };
}
