import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAutomation, updateAutomation, deleteAutomation } from "@/lib/automations";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  trigger: z.string().min(1).max(80).optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  action: z.string().min(1).max(80).optional(),
  actionConfig: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const automation = await getAutomation(session.tenantId, id);
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(automation);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await getAutomation(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateAutomation(session.tenantId, id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getAutomation(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteAutomation(session.tenantId, id);
  return NextResponse.json({ ok: true });
}
