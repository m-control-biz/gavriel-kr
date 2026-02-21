import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listSeoKeywords } from "@/lib/seo";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client") ?? undefined;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

  const keywords = await listSeoKeywords({
    tenantId: session.tenantId,
    clientId: clientId || null,
    from,
    to,
    limit,
  });
  return NextResponse.json(keywords);
}
