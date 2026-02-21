import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getIntegration, deleteIntegration } from "@/lib/integrations";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const integration = await getIntegration(session.tenantId, id);
  if (!integration) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { encryptedCredentials, ...safe } = integration;
  return NextResponse.json(safe);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getIntegration(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteIntegration(session.tenantId, id);
  return NextResponse.json({ ok: true });
}
