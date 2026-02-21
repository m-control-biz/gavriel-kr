import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds, canManageUsers } from "@/lib/account";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  industry: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  logo: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().max(20).optional(),
});

async function getAccountAccess(request: Request, id: string) {
  const session = await getSession();
  if (!session) return null;
  const ids = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  if (!ids.includes(id)) return null;
  const uar = await prisma.userAccountRole.findUnique({
    where: { userId_accountId: { userId: session.sub, accountId: id } },
  });
  return { session, role: (uar?.role ?? "Viewer") as Parameters<typeof canManageUsers>[0] };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAccountAccess(request, id);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUsers(access.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const account = await prisma.account.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.industry !== undefined && { industry: parsed.data.industry }),
      ...(parsed.data.timezone !== undefined && { timezone: parsed.data.timezone }),
      ...(parsed.data.logo !== undefined && { logo: parsed.data.logo || null }),
      ...(parsed.data.primaryColor !== undefined && { primaryColor: parsed.data.primaryColor }),
    },
  });
  return NextResponse.json(account);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAccountAccess(request, id);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (access.role !== "Owner") return NextResponse.json({ error: "Only Owner can delete an account" }, { status: 403 });

  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
