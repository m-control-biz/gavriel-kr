/**
 * Search abstraction layer — PostgreSQL full-text search.
 * Tenant-scoped. Covers current modules: Alerts, Clients.
 * Stubs prepared for: Leads (Ph6), Reports (Ph4), Posts (Ph8), Articles (Ph9), Campaigns (Ph7).
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SearchModule =
  | "alerts"
  | "clients"
  | "metrics"
  // future modules (stubs):
  | "leads"
  | "reports"
  | "posts"
  | "articles"
  | "campaigns";

export type SearchFilter = {
  tenantId: string;
  query: string;
  modules?: SearchModule[];
  dateFrom?: Date | null;
  dateTo?: Date | null;
  source?: string | null;
};

export type SearchResultItem = {
  id: string;
  module: SearchModule;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  url: string;
  createdAt?: string | null;
};

export type SearchResults = {
  items: SearchResultItem[];
  total: number;
};

const ALL_MODULES: SearchModule[] = ["alerts", "clients", "metrics"];

export async function search(filter: SearchFilter): Promise<SearchResults> {
  if (!filter.query || filter.query.trim().length < 1) {
    return { items: [], total: 0 };
  }

  const modules = filter.modules?.length ? filter.modules : ALL_MODULES;
  const term = filter.query.trim().toLowerCase();
  const results: SearchResultItem[] = [];

  await Promise.all(
    modules.map(async (mod) => {
      const items = await searchModule(mod, term, filter);
      results.push(...items);
    })
  );

  // Sort: exact matches first, then by module
  results.sort((a, b) => {
    const aExact = a.title.toLowerCase().includes(term) ? 0 : 1;
    const bExact = b.title.toLowerCase().includes(term) ? 0 : 1;
    return aExact - bExact;
  });

  return { items: results, total: results.length };
}

async function searchModule(
  mod: SearchModule,
  term: string,
  filter: SearchFilter
): Promise<SearchResultItem[]> {
  switch (mod) {
    case "alerts":
      return searchAlerts(term, filter);
    case "clients":
      return searchClients(term, filter);
    case "metrics":
      return searchMetrics(term, filter);
    // future module stubs — return empty until their phases are built
    case "leads":
    case "reports":
    case "posts":
    case "articles":
    case "campaigns":
      return [];
    default:
      return [];
  }
}

// ——— Module implementations ———

async function searchAlerts(term: string, filter: SearchFilter): Promise<SearchResultItem[]> {
  const rows = await prisma.alert.findMany({
    where: {
      tenantId: filter.tenantId,
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { message: { contains: term, mode: "insensitive" } },
        { type: { contains: term, mode: "insensitive" } },
      ],
      ...(filter.dateFrom ? { createdAt: { gte: filter.dateFrom } } : {}),
      ...(filter.dateTo ? { createdAt: { lte: filter.dateTo } } : {}),
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    module: "alerts" as const,
    title: r.title,
    subtitle: r.message ?? undefined,
    meta: r.severity,
    url: "/dashboard",
    createdAt: r.createdAt.toISOString(),
  }));
}

async function searchClients(term: string, filter: SearchFilter): Promise<SearchResultItem[]> {
  const rows = await prisma.client.findMany({
    where: {
      tenantId: filter.tenantId,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
      ],
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    module: "clients" as const,
    title: r.name,
    subtitle: r.slug,
    meta: "Client",
    url: `/dashboard?client=${r.id}`,
    createdAt: r.createdAt.toISOString(),
  }));
}

async function searchMetrics(term: string, filter: SearchFilter): Promise<SearchResultItem[]> {
  const rows = await prisma.metric.findMany({
    where: {
      tenantId: filter.tenantId,
      OR: [
        { metricType: { contains: term, mode: "insensitive" } },
        { source: { contains: term, mode: "insensitive" } },
      ],
      ...(filter.dateFrom ? { date: { gte: filter.dateFrom } } : {}),
      ...(filter.dateTo ? { date: { lte: filter.dateTo } } : {}),
      ...(filter.source ? { source: filter.source } : {}),
    },
    distinct: ["metricType"],
    take: 5,
    orderBy: { date: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    module: "metrics" as const,
    title: r.metricType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: r.source ? `Source: ${r.source}` : undefined,
    meta: `${Number(r.value).toFixed(1)}`,
    url: `/dashboard`,
    createdAt: r.date.toISOString(),
  }));
}

// ——— Saved searches ———

export async function saveSearch(
  tenantId: string,
  userId: string,
  name: string,
  query: string,
  filters?: Record<string, unknown>
) {
  return prisma.savedSearch.create({
    data: { tenantId, userId, name, query, filters: filters == null ? undefined : (filters as Prisma.InputJsonValue) },
  });
}

export async function getSavedSearches(tenantId: string, userId: string) {
  return prisma.savedSearch.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function deleteSavedSearch(id: string, tenantId: string) {
  return prisma.savedSearch.deleteMany({ where: { id, tenantId } });
}
