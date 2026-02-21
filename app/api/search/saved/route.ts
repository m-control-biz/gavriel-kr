import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { saveSearch, getSavedSearches, deleteSavedSearch } from "@/lib/search";
import { z } from "zod";

export async function GET(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const saved = await getSavedSearches(scope.accountId, scope.userId);
  return NextResponse.json({ items: saved });
}

const saveSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().min(1).max(200),
  filters: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const saved = await saveSearch(scope.accountId, scope.userId, parsed.data.name, parsed.data.query, parsed.data.filters);
  return NextResponse.json({ ok: true, saved });
}

export async function DELETE(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteSavedSearch(id, scope.accountId);
  return NextResponse.json({ ok: true });
}
