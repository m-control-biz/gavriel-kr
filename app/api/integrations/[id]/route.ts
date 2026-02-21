import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { getIntegration, deleteIntegration } from "@/lib/integrations";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const integration = await getIntegration(scope.accountId, id);
  if (!integration) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { encryptedAccessToken, encryptedRefreshToken, ...safe } = integration;
  return NextResponse.json(safe);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getIntegration(scope.accountId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteIntegration(scope.accountId, id);
  return NextResponse.json({ ok: true });
}
