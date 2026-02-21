import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { listLeads, createLead } from "@/lib/leads";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
  clientId: z.string().optional(),
});

export async function GET(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
  const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

  const result = await listLeads({
    accountId: scope.accountId,
    clientId: clientId || null,
    status: status || null,
    limit,
    offset,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lead = await createLead({
    accountId: scope.accountId,
    clientId: parsed.data.clientId,
    email: parsed.data.email,
    name: parsed.data.name,
    source: parsed.data.source,
    status: parsed.data.status,
    notes: parsed.data.notes,
  });
  return NextResponse.json(lead, { status: 201 });
}
