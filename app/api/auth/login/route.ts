import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const { email, password } = bodySchema.parse(raw);

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: true, role: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSession({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role?.name,
      permissions: user.role?.permissions ?? [],
    });

    await setSessionCookie(token);

    await auditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: "auth.login",
      resource: "user",
      resourceId: user.id,
      ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const err = e as Error & { code?: string; meta?: unknown };
    const msg = err?.message ?? String(e);
    console.error("[auth/login] 500", msg, "code:", err?.code, "meta:", JSON.stringify(err?.meta));
    return NextResponse.json(
      { error: "Sign in failed", debug: msg, code: err?.code },
      { status: 500 }
    );
  }
}
