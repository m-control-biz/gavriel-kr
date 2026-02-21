# Migration to Account-Based SaaS

This project was upgraded from tenant-only to **account-based isolation** (Account = company; UserAccountRole = per-account access).

## Schema changes

- **New:** `Account`, `UserAccountRole`
- **Integration:** now `accountId`, `provider`, `externalPropertyId`, `encryptedAccessToken` (no tenantId/type)
- **All business data:** `Metric`, `Lead`, `Alert`, `Report`, `SeoKeyword`, `Article`, `Automation`, `SavedSearch` use **accountId** (tenantId removed from these tables)
- **Client:** has both `tenantId` and `accountId`
- **User:** added `isSuperAdmin`
- **AuditLog:** added `accountId` (optional)

## One-time migration (existing DB with data)

If your database already has data with the **old** schema (tenant_id on metrics, etc.):

**Option A – Reset and reseed (recommended for dev / “clean untrue data”)**

```bash
npx prisma db push --force-reset
npm run db:seed
```

This **drops all data** and applies the new schema, then seeds with two accounts (Acme Corp, Nova Brand), one admin user (Owner of both), and clean per-account data.

**Option B – Preserve data (advanced)**

1. Add `Account` and `UserAccountRole` tables (e.g. create a custom SQL migration that adds only new tables).
2. Create one `Account` per existing tenant, create `UserAccountRole` for each user.
3. Add nullable `accountId` to all business tables, backfill from tenant → account, then make `accountId` required and drop `tenantId` from those tables.
4. Run `prisma db push` or a migration for the final state.

For most cases, **Option A** is sufficient.

## After migration

- Log in with **admin@m-control.biz** / **admin123**
- Use the **account switcher** in the top bar to switch between Acme Corp and Nova Brand
- Each account has its own metrics, leads, SEO keywords, reports, and integrations
- Add users to accounts via **Account management** (see deliverables: `/accounts`, `/accounts/[id]/users`)

## Security

- All API routes and pages scope data by **accountId** (from cookie + `UserAccountRole`)
- No account can access another account’s data
- Super Admin (user with `isSuperAdmin`) can see all accounts in the tenant
