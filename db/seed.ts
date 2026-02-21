/**
 * Seed: one tenant, admin role, one user, one client.
 * Run: npm run db:seed (after db:push or migrate).
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "Default Tenant",
      slug: "default",
    },
  });

  const role = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "admin" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "admin",
      permissions: ["*"],
    },
  });

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
    },
  });

  const client = await prisma.client.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "acme" },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Acme Corp",
      slug: "acme",
    },
  });

  // Optional: sample metric for Phase 2 readiness
  await prisma.metric.createMany({
    data: [
      {
        tenantId: tenant.id,
        clientId: client.id,
        metricType: "leads",
        value: 42,
        date: new Date(),
        source: "seed",
      },
      {
        tenantId: tenant.id,
        clientId: client.id,
        metricType: "spend",
        value: 1200.5,
        date: new Date(),
        source: "seed",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      action: "seed.completed",
      resource: "system",
    },
  });

  console.log("Seed done. Tenant:", tenant.slug, "| User:", user.email, "| Client:", client.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
