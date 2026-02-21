/**
 * Tenant + Account scoping.
 * All business data is scoped by account_id. Use getAccountScope() in services.
 */

import { getSession } from "@/lib/auth";
import { requireAccountScope, type AccountScope } from "@/lib/account";
import { headers } from "next/headers";

export type TenantScope = {
  tenantId: string;
  accountId: string;
  clientId?: string | null;
  role?: string;
};

/** Resolve session and account scope (use in server components / API). Reads x-account-id from headers (set by middleware from cookie). */
export async function getAccountScope(): Promise<AccountScope | null> {
  const session = await getSession();
  if (!session) return null;
  const h = await headers();
  const accountIdFromRequest = h.get("x-account-id");
  try {
    return await requireAccountScope(
      session.sub,
      session.tenantId,
      accountIdFromRequest,
      session.isSuperAdmin ?? false
    );
  } catch {
    return null;
  }
}

/** For API routes that receive Request: pass accountId from header or body. */
export async function getAccountScopeFromRequest(request: Request): Promise<AccountScope | null> {
  const session = await getSession();
  if (!session) return null;
  const accountId = request.headers.get("x-account-id") ?? new URL(request.url).searchParams.get("account");
  try {
    return await requireAccountScope(
      session.sub,
      session.tenantId,
      accountId,
      session.isSuperAdmin ?? false
    );
  } catch {
    return null;
  }
}

export function getTenantScope(tenantId: string, accountId: string, clientId?: string | null): TenantScope {
  return { tenantId, accountId, clientId: clientId ?? null };
}

export function requireTenantId(tenantId: string | null | undefined): asserts tenantId is string {
  if (!tenantId || typeof tenantId !== "string") {
    throw new Error("Tenant context required");
  }
}
