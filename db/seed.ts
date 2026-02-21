/**
 * Seed: Account-based. One tenant, two accounts, one admin user (Owner of both), clean per-account data.
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
    update: { isSuperAdmin: false },
    create: {
      tenantId: tenant.id,
      email: "admin@m-control.biz",
      passwordHash,
      name: "Admin",
      roleId: role.id,
      isSuperAdmin: false,
    },
  });

  // ——— Accounts (one per company; each has its own data) ———
  const acmeAccount = await prisma.account.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Acme Corp" } },
    update: { industry: "Technology", timezone: "America/New_York" },
    create: {
      tenantId: tenant.id,
      name: "Acme Corp",
      industry: "Technology",
      timezone: "America/New_York",
    },
  });

  const novaAccount = await prisma.account.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Nova Brand" } },
    update: { industry: "Marketing", timezone: "UTC" },
    create: {
      tenantId: tenant.id,
      name: "Nova Brand",
      industry: "Marketing",
      timezone: "UTC",
    },
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
  const acmeClient = await prisma.client.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "acme" } },
    update: { accountId: acmeAccount.id },
    create: { tenantId: tenant.id, accountId: acmeAccount.id, name: "Acme Corp", slug: "acme" },
  });

  const novaClient = await prisma.client.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "nova" } },
    update: { accountId: novaAccount.id },
    create: { tenantId: tenant.id, accountId: novaAccount.id, name: "Nova Brand", slug: "nova" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ——— Metrics (per account; clean, realistic) ———
  await prisma.metric.deleteMany({ where: { accountId: { in: [acmeAccount.id, novaAccount.id] } } });
  const metricRows: { accountId: string; clientId: string; metricType: string; value: number; date: Date; source: string }[] = [];
  for (const [account, client, factor] of [
    [acmeAccount, acmeClient, 1] as const,
    [novaAccount, novaClient, 0.6] as const,
  ]) {
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      metricRows.push(
        { accountId: account.id, clientId: client.id, metricType: "leads", value: rand(10, 40) * factor, date, source: "google_ads" },
        { accountId: account.id, clientId: client.id, metricType: "cpl", value: rand(18, 55, 2) / factor, date, source: "google_ads" },
        { accountId: account.id, clientId: client.id, metricType: "spend", value: rand(200, 900, 2) * factor, date, source: "google_ads" },
        { accountId: account.id, clientId: client.id, metricType: "conversions", value: rand(3, 15) * factor, date, source: "google_ads" },
        { accountId: account.id, clientId: client.id, metricType: "roas", value: rand(1.5, 5.5, 2), date, source: "google_ads" },
        { accountId: account.id, clientId: client.id, metricType: "seo_clicks", value: rand(80, 400) * factor, date, source: "organic" },
        { accountId: account.id, clientId: client.id, metricType: "seo_impressions", value: rand(1000, 6000) * factor, date, source: "organic" },
        { accountId: account.id, clientId: client.id, metricType: "social_followers", value: rand(500, 3000) * factor, date, source: "social" },
        { accountId: account.id, clientId: client.id, metricType: "social_engagement", value: rand(50, 400) * factor, date, source: "social" },
        { accountId: account.id, clientId: client.id, metricType: "social_reach", value: rand(1000, 8000) * factor, date, source: "social" }
      );
    }
  }
  await prisma.metric.createMany({ data: metricRows });

  // ——— SEO keywords (per account) ———
  await prisma.seoKeyword.deleteMany({ where: { accountId: { in: [acmeAccount.id, novaAccount.id] } } });
  const keywords = ["growth marketing", "lead generation", "cpl optimization", "roas tracking"];
  for (const account of [acmeAccount, novaAccount]) {
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      for (const kw of keywords) {
        await prisma.seoKeyword.create({
          data: {
            accountId: account.id,
            clientId: account.id === acmeAccount.id ? acmeClient.id : novaClient.id,
            keyword: kw,
            impressions: rand(100, 1500),
            clicks: rand(5, 100),
            position: rand(3, 22, 2),
            date,
          },
        });
      }
    }
  }

  // ——— Leads (per account) ———
  await prisma.lead.deleteMany({ where: { accountId: { in: [acmeAccount.id, novaAccount.id] } } });
  await prisma.lead.createMany({
    data: [
      { accountId: acmeAccount.id, clientId: acmeClient.id, email: "jane@example.com", name: "Jane Doe", source: "website", status: "new" },
      { accountId: acmeAccount.id, clientId: acmeClient.id, email: "bob@acme.com", name: "Bob Smith", source: "google_ads", status: "contacted" },
      { accountId: novaAccount.id, clientId: novaClient.id, email: "alice@nova.io", name: "Alice Lee", source: "manual", status: "qualified" },
    ],
  });

  // ——— Alerts (per account) ———
  await prisma.alert.deleteMany({ where: { accountId: { in: [acmeAccount.id, novaAccount.id] } } });
  await prisma.alert.createMany({
    data: [
      { accountId: acmeAccount.id, clientId: acmeClient.id, type: "lead_drop", title: "Lead drop detected", message: "Leads dropped vs previous week.", severity: "warning" },
      { accountId: novaAccount.id, clientId: novaClient.id, type: "roas_low", title: "ROAS below threshold", message: "ROAS fell below 2x this week.", severity: "critical" },
      { accountId: acmeAccount.id, type: "seo_opportunity", title: "SEO opportunity", message: "Keywords climbing to page 1.", severity: "info" },
    ],
  });

  // ——— Articles (per account) ———
  await prisma.article.deleteMany({ where: { accountId: { in: [acmeAccount.id, novaAccount.id] } } });
  await prisma.article.createMany({
    data: [
      { accountId: acmeAccount.id, clientId: acmeClient.id, title: "Getting started with growth marketing", body: "Use AI to generate.", status: "draft", aiPrompt: "Intro to growth marketing" },
      { accountId: acmeAccount.id, clientId: acmeClient.id, title: "ROAS best practices", status: "draft", aiPrompt: "How to improve ROAS" },
      { accountId: novaAccount.id, clientId: novaClient.id, title: "Lead gen tips", status: "published", body: "Short published article." },
    ],
  });

  // ——— Automations (per account) ———
  await prisma.automation.deleteMany({ where: { accountId: { in: [acmeAccount.id, novaAccount.id] } } });
  await prisma.automation.createMany({
    data: [
      { accountId: acmeAccount.id, name: "New lead alert", trigger: "lead_created", triggerConfig: {}, action: "create_alert", actionConfig: { title: "New lead", message: "A new lead was added." }, isActive: true },
      { accountId: novaAccount.id, name: "Low ROAS warning", trigger: "metric_threshold", triggerConfig: { metricType: "roas", operator: "<", value: 2 }, action: "create_alert", actionConfig: { title: "ROAS below 2x", message: "ROAS dropped below threshold." }, isActive: true },
    ],
  });

  // ——— Audit ———
  await prisma.auditLog.create({
    data: { tenantId: tenant.id, accountId: acmeAccount.id, userId: user.id, action: "seed.completed", resource: "system" },
  });

  console.log(`Seed done. Tenant: ${tenant.slug} | User: ${user.email} | Accounts: ${acmeAccount.name}, ${novaAccount.name} | Metrics: ${metricRows.length} rows`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
