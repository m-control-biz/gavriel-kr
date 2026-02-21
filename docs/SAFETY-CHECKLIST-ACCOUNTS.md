# Safety checklist — Account-based SaaS

- [ ] **No account can access another account's data** — All queries filter by `accountId` from `getAccountScope()` / `getAccountScopeFromRequest()`. `UserAccountRole` limits which accounts a user can see.
- [ ] **Super Admin override** — Only when `session.isSuperAdmin` is true can a user see all accounts in the tenant; implemented via `getAccessibleAccountIds(..., isSuperAdmin)`.
- [ ] **Tokens encrypted per account** — Integrations store `encryptedAccessToken` (and optional refresh) per account; decryption uses app-level `ENCRYPTION_KEY`.
- [ ] **All API routes validate account access** — Routes use `getAccountScopeFromRequest(request)` and use `scope.accountId` for all data access.
- [ ] **All queries include account_id** — Metrics, leads, alerts, reports, SEO keywords, articles, automations, saved searches, and integrations are scoped by `accountId`.
- [ ] **Audit logs include account_id** — `auditLog()` accepts optional `accountId`; set it when the action is account-scoped.
- [ ] **Middleware forwards account cookie** — Cookie `m_control_account` is forwarded as `x-account-id` for server resolution of active account.
- [ ] **Reporting and search scoped by account** — Reports and global search use `accountId` from scope.

## Database migration

Applying the new schema to an **existing** database with data requires either:

1. **Reset (dev / “clean untrue data”)**  
   Run manually (Prisma may block from automation):  
   `npx prisma db push --force-reset`  
   then `npm run db:seed`.  
   **All existing data will be permanently deleted.**

2. **Custom migration**  
   Add `Account` and `UserAccountRole`, add nullable `accountId` to business tables, backfill from tenant → one account per tenant, then make `accountId` required and remove `tenantId` from those tables. See `docs/MIGRATION-ACCOUNTS.md`.

After migration, run `npm run db:seed` so at least one tenant, two accounts, and one admin user (Owner of both accounts) exist.
