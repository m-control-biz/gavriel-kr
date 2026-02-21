/**
 * Account-based access control.
 * All business data is scoped by account_id. Users get access via UserAccountRole.
 */

import { prisma } from "@/lib/db";

export type AccountRole = "Owner" | "Admin" | "Editor" | "Viewer";

const ROLES_ORDER: AccountRole[] = ["Owner", "Admin", "Editor", "Viewer"];

export type AccountScope = {
  accountId: string;
  role: AccountRole;
  tenantId: string;
  userId: string;
};

/** Get accounts the user can access (via UserAccountRole). Super Admin gets all in tenant. */
export async function getAccessibleAccountIds(
  userId: string,
  tenantId: string,
  isSuperAdmin: boolean
): Promise<string[]> {
  if (isSuperAdmin) {
    const accounts = await prisma.account.findMany({
      where: { tenantId },
      select: { id: true },
    });
    return accounts.map((a) => a.id);
  }
  const roles = await prisma.userAccountRole.findMany({
    where: { userId },
    select: { accountId: true },
  });
  return roles.map((r) => r.accountId);
}

/** Resolve active account: from header/query or first accessible. Validate membership. */
export async function requireAccountScope(
  userId: string,
  tenantId: string,
  accountIdFromRequest: string | null,
  isSuperAdmin: boolean
): Promise<AccountScope> {
  const accessible = await getAccessibleAccountIds(userId, tenantId, isSuperAdmin);
  if (accessible.length === 0) {
    throw new Error("No accounts assigned. Contact your admin.");
  }
  const accountId = accountIdFromRequest && accessible.includes(accountIdFromRequest)
    ? accountIdFromRequest
    : accessible[0];

  const uar = await prisma.userAccountRole.findUnique({
    where: { userId_accountId: { userId, accountId } },
  });
  const role = (uar?.role as AccountRole) ?? (isSuperAdmin ? "Admin" : "Viewer");

  return { accountId, role, tenantId, userId };
}

export function canManageUsers(role: AccountRole): boolean {
  return role === "Owner" || role === "Admin";
}

export function canManageIntegrations(role: AccountRole): boolean {
  return role === "Owner" || role === "Admin";
}

export function canManageBranding(role: AccountRole): boolean {
  return role === "Owner" || role === "Admin";
}

export function canWrite(role: AccountRole): boolean {
  return role === "Owner" || role === "Admin" || role === "Editor";
}

export function canRead(role: AccountRole): boolean {
  return true;
}

export function isOwner(role: AccountRole): boolean {
  return role === "Owner";
}
