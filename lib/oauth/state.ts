/**
 * Short-lived OAuth state JWT.
 * Signed with JWT_SECRET, expires in 10 minutes.
 * Used to securely pass accountId + feature through OAuth redirect round-trip.
 */

import { SignJWT, jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/auth";

export type OAuthState = {
  accountId: string;
  feature: string;   // "gsc" | "google_analytics" | "google_ads" | "meta_social" | "linkedin_social"
  provider: string;  // "google" | "meta" | "linkedin"
};

export async function signOAuthState(state: OAuthState): Promise<string> {
  const secret = await getJwtSecret();
  return new SignJWT({ ...state })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);
}

export async function verifyOAuthState(token: string): Promise<OAuthState | null> {
  try {
    const secret = await getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    const { accountId, feature, provider } = payload as Record<string, unknown>;
    if (typeof accountId !== "string" || typeof feature !== "string" || typeof provider !== "string") return null;
    return { accountId, feature, provider };
  } catch {
    return null;
  }
}
