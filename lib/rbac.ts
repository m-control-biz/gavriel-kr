/**
 * Role permission guard.
 * Check session permissions before allowing actions.
 */

import type { SessionPayload } from "@/lib/auth";

const ADMIN_ROLE = "admin";

/** Check if user has a specific permission (e.g. "metrics:read", "reports:write"). */
export function hasPermission(session: SessionPayload | null, permission: string): boolean {
  if (!session) return false;
  if (session.role === ADMIN_ROLE || session.permissions?.includes("*")) return true;
  return Boolean(session.permissions?.includes(permission));
}

/** Check if user has any of the given permissions. */
export function hasAnyPermission(session: SessionPayload | null, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(session, p));
}

/** Require permission or throw. Use in server actions / API routes. */
export function requirePermission(session: SessionPayload | null, permission: string): void {
  if (!hasPermission(session, permission)) {
    throw new Error("Forbidden: missing permission " + permission);
  }
}
