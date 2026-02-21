import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveSearch, getSavedSearches, deleteSavedSearch } from "@/lib/search";
import { z } from "zod";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const saved = await getSavedSearches(session.tenantId, session.sub);
  return NextResponse.json({ items: saved });
}

const saveSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().min(1).max(200),
  filters: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const saved = await saveSearch(session.tenantId, session.sub, parsed.data.name, parsed.data.query, parsed.data.filters);
  return NextResponse.json({ ok: true, saved });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteSavedSearch(id, session.tenantId);
  return NextResponse.json({ ok: true });
}
