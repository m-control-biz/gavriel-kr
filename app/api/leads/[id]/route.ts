import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLead, updateLead, deleteLead } from "@/lib/leads";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getLead(session.tenantId, id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await getLead(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateLead(session.tenantId, id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getLead(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteLead(session.tenantId, id);
  return NextResponse.json({ ok: true });
}
