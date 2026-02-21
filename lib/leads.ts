/**
 * Leads module — CRUD and list with filters.
 */

import { prisma } from "@/lib/db";

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export async function listLeads(filter: {
  tenantId: string;
  clientId?: string | null;
  status?: string | null;
  limit?: number;
  offset?: number;
}) {
  const where = {
    tenantId: filter.tenantId,
    ...(filter.clientId ? { clientId: filter.clientId } : {}),
    ...(filter.status ? { status: filter.status } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filter.limit ?? 50,
      skip: filter.offset ?? 0,
    }),
    prisma.lead.count({ where }),
  ]);
  return { items, total };
}

export async function getLead(tenantId: string, id: string) {
  return prisma.lead.findFirst({ where: { id, tenantId } });
}

export async function createLead(data: {
  tenantId: string;
  clientId?: string | null;
  email: string;
  name?: string | null;
  source?: string | null;
  status?: string;
  notes?: string | null;
}) {
  return prisma.lead.create({
    data: {
      tenantId: data.tenantId,
      clientId: data.clientId,
      email: data.email,
      name: data.name,
      source: data.source ?? "manual",
      status: data.status ?? "new",
      notes: data.notes,
    },
  });
}

export async function updateLead(
  tenantId: string,
  id: string,
  data: { name?: string; source?: string; status?: string; notes?: string }
) {
  return prisma.lead.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function deleteLead(tenantId: string, id: string) {
  return prisma.lead.delete({ where: { id } });
}
