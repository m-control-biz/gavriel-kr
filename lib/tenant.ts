/**
 * Tenant scoping helper.
 * All queries for business data MUST use tenantId from session/context.
 * Extension: use getTenantScope() in services to build filtered queries.
 */

export type TenantScope = {
  tenantId: string;
  clientId?: string | null;
};

export function getTenantScope(tenantId: string, clientId?: string | null): TenantScope {
  return { tenantId, clientId: clientId ?? null };
}

/** Assert tenantId is present (use after auth middleware). */
export function requireTenantId(tenantId: string | null | undefined): asserts tenantId is string {
  if (!tenantId || typeof tenantId !== "string") {
    throw new Error("Tenant context required");
  }
}
