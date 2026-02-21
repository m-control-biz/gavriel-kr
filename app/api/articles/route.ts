import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listArticles, createArticle } from "@/lib/articles";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().max(50000).optional(),
  aiPrompt: z.string().max(2000).optional(),
  clientId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const list = await listArticles({
    tenantId: session.tenantId,
    clientId: clientId || null,
    status: status || null,
  });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const article = await createArticle({
    tenantId: session.tenantId,
    clientId: parsed.data.clientId,
    title: parsed.data.title,
    body: parsed.data.body,
    aiPrompt: parsed.data.aiPrompt,
  });
  return NextResponse.json(article, { status: 201 });
}
