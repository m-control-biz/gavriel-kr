import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { getReport, generateShareToken, revokeShareToken } from "@/lib/reports";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getReport(scope.accountId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const report = await generateShareToken(scope.accountId, id, 30);
  return NextResponse.json({ shareToken: report.shareToken, shareExpiry: report.shareExpiry });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getReport(scope.accountId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await revokeShareToken(scope.accountId, id);
  return NextResponse.json({ ok: true });
}
