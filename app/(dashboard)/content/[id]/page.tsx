import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getArticle } from "@/lib/articles";
import { Button } from "@/components/ui/button";
import { ArticleEditor } from "@/components/content/article-editor";
import { ChevronLeft } from "lucide-react";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const article = await getArticle(session.tenantId, id);
  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/content">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Content
          </Button>
        </Link>
      </div>
      <ArticleEditor article={article} />
    </div>
  );
}
