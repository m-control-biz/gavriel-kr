import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSessionCookie();
  const url = new URL(request.url);
  const origin = process.env.NEXTAUTH_URL ?? url.origin;
  return NextResponse.redirect(new URL("/auth/login", origin));
}
