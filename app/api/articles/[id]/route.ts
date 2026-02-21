import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getArticle, updateArticle, deleteArticle } from "@/lib/articles";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  body: z.string().max(50000).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const article = await getArticle(session.tenantId, id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await getArticle(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateArticle(session.tenantId, id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getArticle(session.tenantId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteArticle(session.tenantId, id);
  return NextResponse.json({ ok: true });
}
