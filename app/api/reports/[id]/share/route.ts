import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getReport, generateShareToken, revokeShareToken } from "@/lib/reports";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getReport(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const report = await generateShareToken(session.tenantId, id, 30);
  return NextResponse.json({ shareToken: report.shareToken, shareExpiry: report.shareExpiry });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getReport(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await revokeShareToken(session.tenantId, id);
  return NextResponse.json({ ok: true });
}
