import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateAndSaveArticle } from "@/lib/articles";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await generateAndSaveArticle(session.tenantId, id);
    return NextResponse.json({ body });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
