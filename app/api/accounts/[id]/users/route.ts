import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds, canManageUsers } from "@/lib/account";
import { prisma } from "@/lib/db";
import { z } from "zod";

const addSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Owner", "Admin", "Editor", "Viewer"]),
});

async function requireAccess(session: Awaited<ReturnType<typeof getSession>>, id: string) {
  if (!session) return null;
  const ids = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  if (!ids.includes(id)) return null;
  const uar = await prisma.userAccountRole.findUnique({
    where: { userId_accountId: { userId: session.sub, accountId: id } },
  });
  return (uar?.role ?? "Viewer") as "Owner" | "Admin" | "Editor" | "Viewer";
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const role = await requireAccess(session, id);
  if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRoles = await prisma.userAccountRole.findMany({
    where: { accountId: id },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(userRoles);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const myRole = await requireAccess(session, id);
  if (!myRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUsers(myRole)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: session!.tenantId, email: parsed.data.email } },
  });
  if (!user) return NextResponse.json({ error: "No user found with that email in this workspace" }, { status: 404 });

  const uar = await prisma.userAccountRole.upsert({
    where: { userId_accountId: { userId: user.id, accountId: id } },
    create: { userId: user.id, accountId: id, role: parsed.data.role },
    update: { role: parsed.data.role },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  return NextResponse.json(uar, { status: 201 });
}
