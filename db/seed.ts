/**
 * Seed: one tenant, admin role, one user, two clients, 30 days of metrics, sample alerts.
 * Run: npm run db:seed
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function subDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function rand(min: number, max: number, decimals = 0): number {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(decimals));
}

async function main() {
  // ——— Tenant ———
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "Default Tenant", slug: "default" },
  });

  // ——— Role ———
  const role = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "admin" } },
    update: {},
    create: { tenantId: tenant.id, name: "admin", permissions: ["*"] },
  });

  const memberRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "member" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "member",
      permissions: ["metrics:read", "reports:read", "dashboard:read"],
    },
  });

  // ——— Users ———
  const passwordHash = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@m-control.biz" } },
    update: {},
    create: { tenantId: tenant.id, email: "admin@m-control.biz", passwordHash, name: "Admin", roleId: role.id },
  });

  // ——— Clients ———
  const acme = await prisma.client.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "acme" } },
    update: {},
    create: { tenantId: tenant.id, name: "Acme Corp", slug: "acme" },
  });

  const nova = await prisma.client.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "nova" } },
    update: {},
    create: { tenantId: tenant.id, name: "Nova Brand", slug: "nova" },
  });

  // ——— 30 days of metrics ———
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Delete old seed metrics to avoid duplicates on re-run
  await prisma.metric.deleteMany({ where: { tenantId: tenant.id, source: { in: ["google_ads", "organic", "social"] } } });

  const metricRows = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const clients = [acme, nova];
    for (const client of clients) {
      const factor = client.id === acme.id ? 1 : 0.6; // Nova is smaller

      metricRows.push(
        { tenantId: tenant.id, clientId: client.id, metricType: "leads",           value: rand(10, 40) * factor,         date, source: "google_ads" },
        { tenantId: tenant.id, clientId: client.id, metricType: "cpl",             value: rand(18, 55, 2) / factor,      date, source: "google_ads" },
        { tenantId: tenant.id, clientId: client.id, metricType: "spend",           value: rand(200, 900, 2) * factor,    date, source: "google_ads" },
        { tenantId: tenant.id, clientId: client.id, metricType: "conversions",     value: rand(3, 15) * factor,          date, source: "google_ads" },
        { tenantId: tenant.id, clientId: client.id, metricType: "roas",            value: rand(1.5, 5.5, 2),             date, source: "google_ads" },
        { tenantId: tenant.id, clientId: client.id, metricType: "seo_clicks",      value: rand(80, 400) * factor,        date, source: "organic" },
        { tenantId: tenant.id, clientId: client.id, metricType: "seo_impressions", value: rand(1000, 6000) * factor,     date, source: "organic" },
        { tenantId: tenant.id, clientId: client.id, metricType: "social_followers", value: rand(500, 3000) * factor,      date, source: "social" },
        { tenantId: tenant.id, clientId: client.id, metricType: "social_engagement", value: rand(50, 400) * factor,       date, source: "social" },
        { tenantId: tenant.id, clientId: client.id, metricType: "social_reach",     value: rand(1000, 8000) * factor,     date, source: "social" },
      );
    }
  }

  await prisma.metric.createMany({ data: metricRows });

  // ——— SEO keywords (Phase 5) ———
  await prisma.seoKeyword.deleteMany({ where: { tenantId: tenant.id } });
  const keywords = ["m-control", "growth marketing", "lead generation", "cpl optimization", "roas tracking"];
  for (let i = 0; i < 14; i++) {
    const date = subDays(today, i);
    for (const kw of keywords) {
      await prisma.seoKeyword.create({
        data: {
          tenantId: tenant.id,
          clientId: acme.id,
          keyword: kw,
          impressions: rand(100, 2000),
          clicks: rand(5, 120),
          position: rand(3, 25, 2),
          date,
        },
      });
    }
  }

  // ——— Leads (Phase 6) ———
  await prisma.lead.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.lead.createMany({
    data: [
      { tenantId: tenant.id, clientId: acme.id, email: "jane@example.com", name: "Jane Doe", source: "website", status: "new" },
      { tenantId: tenant.id, clientId: acme.id, email: "bob@acme.com", name: "Bob Smith", source: "google_ads", status: "contacted" },
      { tenantId: tenant.id, clientId: nova.id, email: "alice@nova.io", name: "Alice Lee", source: "manual", status: "qualified" },
    ],
  });

  // ——— Sample alerts ———
  await prisma.alert.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.alert.createMany({
    data: [
      { tenantId: tenant.id, clientId: acme.id, type: "lead_drop", title: "Lead drop detected", message: "Leads dropped 22% vs previous week for Acme Corp.", severity: "warning" },
      { tenantId: tenant.id, clientId: nova.id, type: "roas_low", title: "ROAS below threshold", message: "Nova Brand ROAS fell below 2x this week.", severity: "critical" },
      { tenantId: tenant.id, type: "seo_opportunity", title: "SEO opportunity", message: "3 keywords climbing to page 1 — consider content refresh.", severity: "info" },
    ],
  });

  // ——— Audit ———
  await prisma.auditLog.create({
    data: { tenantId: tenant.id, userId: user.id, action: "seed.completed", resource: "system" },
  });

  console.log(`Seed done. Tenant: ${tenant.slug} | User: ${user.email} | Clients: ${acme.name}, ${nova.name} | Metrics: ${metricRows.length} rows`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
