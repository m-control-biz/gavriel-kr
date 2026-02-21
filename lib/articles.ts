/**
 * Articles / content — CRUD and AI generation.
 */

import { prisma } from "@/lib/db";
import { generateArticleBody } from "@/lib/ai";

export async function listArticles(filter: {
  tenantId: string;
  clientId?: string | null;
  status?: string | null;
  limit?: number;
}) {
  const where = {
    tenantId: filter.tenantId,
    ...(filter.clientId ? { clientId: filter.clientId } : {}),
    ...(filter.status ? { status: filter.status } : {}),
  };
  return prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: filter.limit ?? 50,
  });
}

export async function getArticle(tenantId: string, id: string) {
  return prisma.article.findFirst({ where: { id, tenantId } });
}

export async function createArticle(data: {
  tenantId: string;
  clientId?: string | null;
  title: string;
  body?: string | null;
  aiPrompt?: string | null;
}) {
  return prisma.article.create({
    data: {
      tenantId: data.tenantId,
      clientId: data.clientId,
      title: data.title,
      body: data.body,
      aiPrompt: data.aiPrompt,
      status: "draft",
    },
  });
}

export async function updateArticle(
  tenantId: string,
  id: string,
  data: { title?: string; body?: string; status?: string }
) {
  return prisma.article.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function deleteArticle(tenantId: string, id: string) {
  return prisma.article.delete({ where: { id } });
}

export async function generateAndSaveArticle(tenantId: string, id: string): Promise<string> {
  const article = await getArticle(tenantId, id);
  if (!article) throw new Error("Article not found");
  const brief = article.aiPrompt || article.title;
  const body = await generateArticleBody(article.title, brief);
  await updateArticle(tenantId, id, { body });
  return body;
}
