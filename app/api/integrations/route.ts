import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { listIntegrations, createIntegration } from "@/lib/integrations";
import { z } from "zod";

const createSchema = z.object({
  provider: z.string().min(1).max(50),
  externalPropertyId: z.string().max(200).optional(),
  name: z.string().max(120).optional(),
  credentials: z.record(z.string()).optional(),
});

export async function GET(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = await listIntegrations(scope.accountId);
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const integration = await createIntegration({
    accountId: scope.accountId,
    provider: parsed.data.provider,
    externalPropertyId: parsed.data.externalPropertyId,
    name: parsed.data.name,
    credentials: parsed.data.credentials,
  });
  return NextResponse.json(integration, { status: 201 });
}
