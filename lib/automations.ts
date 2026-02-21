/**
 * Automations — rules engine. Trigger + action with JSON config.
 * Execution is stubbed; extend with real triggers (e.g. on lead create) and actions (alert, email).
 */

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function listAutomations(tenantId: string) {
  return prisma.automation.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAutomation(tenantId: string, id: string) {
  return prisma.automation.findFirst({ where: { id, tenantId } });
}

export async function createAutomation(data: {
  tenantId: string;
  name: string;
  trigger: string;
  triggerConfig?: Record<string, unknown> | null;
  action: string;
  actionConfig?: Record<string, unknown> | null;
}) {
  return prisma.automation.create({
    data: {
      tenantId: data.tenantId,
      name: data.name,
      trigger: data.trigger,
      triggerConfig: data.triggerConfig as Prisma.InputJsonValue ?? undefined,
      action: data.action,
      actionConfig: data.actionConfig as Prisma.InputJsonValue ?? undefined,
      isActive: true,
    },
  });
}

export async function updateAutomation(
  tenantId: string,
  id: string,
  data: { name?: string; trigger?: string; triggerConfig?: Record<string, unknown>; action?: string; actionConfig?: Record<string, unknown>; isActive?: boolean }
) {
  const payload: { name?: string; trigger?: string; triggerConfig?: Prisma.InputJsonValue; action?: string; actionConfig?: Prisma.InputJsonValue; isActive?: boolean } = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.trigger !== undefined) payload.trigger = data.trigger;
  if (data.triggerConfig !== undefined) payload.triggerConfig = data.triggerConfig as Prisma.InputJsonValue;
  if (data.action !== undefined) payload.action = data.action;
  if (data.actionConfig !== undefined) payload.actionConfig = data.actionConfig as Prisma.InputJsonValue;
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  return prisma.automation.update({ where: { id }, data: payload });
}

export async function deleteAutomation(tenantId: string, id: string) {
  return prisma.automation.delete({ where: { id } });
}

/** Stub: run automation (e.g. create_alert). Real impl would evaluate trigger and run action. */
export async function runAutomation(tenantId: string, id: string): Promise<{ ok: boolean; message: string }> {
  const automation = await getAutomation(tenantId, id);
  if (!automation || !automation.isActive) return { ok: false, message: "Automation not found or inactive" };
  if (automation.action === "create_alert") {
    const config = (automation.actionConfig as { title?: string; message?: string }) ?? {};
    await prisma.alert.create({
      data: {
        tenantId,
        type: "automation",
        title: config.title ?? automation.name,
        message: config.message ?? "Triggered manually",
        severity: "info",
      },
    });
    return { ok: true, message: "Alert created" };
  }
  return { ok: true, message: "Run completed (no-op)" };
}
