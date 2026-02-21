/**
 * LinkedIn OAuth 2.0 helpers.
 * Uses LinkedIn API v2.
 */

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";

const LINKEDIN_SCOPE = "r_basicprofile r_emailaddress r_organization_social rw_ads";

export function buildLinkedInAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: redirectUri,
    state,
    scope: LINKEDIN_SCOPE,
  });
  return `${LINKEDIN_AUTH_URL}?${params}`;
}

type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
};

export async function exchangeLinkedInCode(code: string, redirectUri: string): Promise<LinkedInTokenResponse> {
  const res = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn token exchange failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Get LinkedIn basic profile. */
export async function getLinkedInProfile(accessToken: string): Promise<{ localizedFirstName?: string; localizedLastName?: string } | null> {
  const res = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function checkLinkedInConnection(accessToken: string): Promise<{ ok: boolean; detail?: string }> {
  const profile = await getLinkedInProfile(accessToken);
  if (profile?.localizedFirstName || profile?.localizedLastName) return { ok: true };
  return { ok: false, detail: "LinkedIn token invalid or expired" };
}
