/**
 * Middleware: tenant + auth enforcement.
 * All routes except /auth/* are protected.
 * Redirects unauthenticated users to /auth/login.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "m_control_session";
const JWT_ISSUER = "m-control";
const JWT_AUDIENCE = "m-control-app";

const PUBLIC_PREFIXES = ["/auth", "/api/auth"];
const STATIC_PREFIXES = ["/_next", "/favicon", "/robots.txt", "/sitemap"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

async function getJwtSecret(): Promise<Uint8Array> {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return new TextEncoder().encode("fallback-dev-secret-min-32-chars");
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    // Optional: redirect logged-in users away from /auth/login
    if (pathname.startsWith("/auth/login")) {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        try {
          const secret = await getJwtSecret();
          await jwtVerify(token, secret, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch {
          // invalid token, allow access to login
        }
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = await getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    const tenantId = (payload as { tenantId?: string }).tenantId;
    const res = NextResponse.next();
    if (tenantId) {
      res.headers.set("x-tenant-id", tenantId);
      res.headers.set("x-user-id", (payload as { sub?: string }).sub ?? "");
    }
    return res;
  } catch {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
