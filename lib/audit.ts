/**
 * Audit logger — log critical actions for compliance and debugging.
 * All writes go through tenant-scoped AuditLog.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AuditInput = {
  tenantId: string;
  userId?: string | null;
  action: string;
  resource?: string | null;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
};

export async function auditLog(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      action: input.action,
      resource: input.resource ?? null,
      resourceId: input.resourceId ?? null,
      details: input.details == null ? undefined : (input.details as Prisma.InputJsonValue),
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}
