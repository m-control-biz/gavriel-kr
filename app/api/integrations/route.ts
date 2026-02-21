import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listIntegrations, createIntegration } from "@/lib/integrations";
import { z } from "zod";

const createSchema = z.object({
  type: z.string().min(1).max(50),
  name: z.string().min(1).max(120),
  clientId: z.string().optional(),
  credentials: z.record(z.string()),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = await listIntegrations(session.tenantId);
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const integration = await createIntegration({
    tenantId: session.tenantId,
    clientId: parsed.data.clientId,
    type: parsed.data.type,
    name: parsed.data.name,
    credentials: parsed.data.credentials,
  });
  return NextResponse.json(integration, { status: 201 });
}
