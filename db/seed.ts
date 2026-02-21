/**
 * Seed: structural data only — no fake metrics, leads, or alerts.
 * Metrics come exclusively from real integrations (Google Ads, Analytics, etc).
 * Run: npm run db:seed
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ——— Tenant (platform) ———
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "Default Tenant", slug: "default" },
  });

  // ——— Role (legacy tenant-level) ———
  const role = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "admin" } },
    update: {},
    create: { tenantId: tenant.id, name: "admin", permissions: ["*"] },
  });

  // ——— User ———
  const passwordHash = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@m-control.biz" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@m-control.biz",
      passwordHash,
      name: "Admin",
      roleId: role.id,
      isSuperAdmin: false,
    },
  });

  // ——— Accounts ———
  const acmeAccount = await prisma.account.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Acme Corp" } },
    update: {},
    create: { tenantId: tenant.id, name: "Acme Corp", industry: "Technology", timezone: "America/New_York" },
  });

  const novaAccount = await prisma.account.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Nova Brand" } },
    update: {},
    create: { tenantId: tenant.id, name: "Nova Brand", industry: "Marketing", timezone: "UTC" },
  });

  // ——— UserAccountRole: admin is Owner of both accounts ———
  await prisma.userAccountRole.upsert({
    where: { userId_accountId: { userId: user.id, accountId: acmeAccount.id } },
    update: { role: "Owner" },
    create: { userId: user.id, accountId: acmeAccount.id, role: "Owner" },
  });
  await prisma.userAccountRole.upsert({
    where: { userId_accountId: { userId: user.id, accountId: novaAccount.id } },
    update: { role: "Owner" },
    create: { userId: user.id, accountId: novaAccount.id, role: "Owner" },
  });

  // ——— Clients (per account) ———
  await prisma.client.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "acme" } },
    update: { accountId: acmeAccount.id },
    create: { tenantId: tenant.id, accountId: acmeAccount.id, name: "Acme Corp", slug: "acme" },
  });
  await prisma.client.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "nova" } },
    update: { accountId: novaAccount.id },
    create: { tenantId: tenant.id, accountId: novaAccount.id, name: "Nova Brand", slug: "nova" },
  });

  // ——— Audit ———
  await prisma.auditLog.create({
    data: { tenantId: tenant.id, accountId: acmeAccount.id, userId: user.id, action: "seed.completed", resource: "system" },
  });

  console.log(`Seed done. Tenant: ${tenant.slug} | User: ${user.email} | Accounts: ${acmeAccount.name}, ${novaAccount.name}`);
  console.log("No metrics seeded — connect a real integration to start seeing data.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
