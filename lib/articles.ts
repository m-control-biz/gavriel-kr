/**
 * Articles / content — CRUD and AI generation.
 */

import { prisma } from "@/lib/db";
import { generateArticleBody } from "@/lib/ai";

export async function listArticles(filter: {
  accountId: string;
  clientId?: string | null;
  status?: string | null;
  limit?: number;
}) {
  const where = {
    accountId: filter.accountId,
    ...(filter.clientId ? { clientId: filter.clientId } : {}),
    ...(filter.status ? { status: filter.status } : {}),
  };
  return prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: filter.limit ?? 50,
  });
}

export async function getArticle(accountId: string, id: string) {
  return prisma.article.findFirst({ where: { id, accountId } });
}

export async function createArticle(data: {
  accountId: string;
  clientId?: string | null;
  title: string;
  body?: string | null;
  aiPrompt?: string | null;
}) {
  return prisma.article.create({
    data: {
      accountId: data.accountId,
      clientId: data.clientId,
      title: data.title,
      body: data.body,
      aiPrompt: data.aiPrompt,
      status: "draft",
    },
  });
}

export async function updateArticle(
  accountId: string,
  id: string,
  data: { title?: string; body?: string; status?: string }
) {
  return prisma.article.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function deleteArticle(accountId: string, id: string) {
  return prisma.article.delete({ where: { id } });
}

export async function generateAndSaveArticle(accountId: string, id: string): Promise<string> {
  const article = await getArticle(accountId, id);
  if (!article) throw new Error("Article not found");
  const brief = article.aiPrompt || article.title;
  const body = await generateArticleBody(article.title, brief);
  await updateArticle(accountId, id, { body });
  return body;
}
