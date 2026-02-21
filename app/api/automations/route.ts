import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { listAutomations, createAutomation } from "@/lib/automations";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  trigger: z.string().min(1).max(80),
  triggerConfig: z.record(z.unknown()).optional(),
  action: z.string().min(1).max(80),
  actionConfig: z.record(z.unknown()).optional(),
});

export async function GET(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = await listAutomations(scope.accountId);
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const automation = await createAutomation({
    accountId: scope.accountId,
    name: parsed.data.name,
    trigger: parsed.data.trigger,
    triggerConfig: parsed.data.triggerConfig ?? null,
    action: parsed.data.action,
    actionConfig: parsed.data.actionConfig ?? null,
  });
  return NextResponse.json(automation, { status: 201 });
}
