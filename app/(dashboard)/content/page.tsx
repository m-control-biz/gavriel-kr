import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listArticles } from "@/lib/articles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { AddArticleForm } from "@/components/content/add-article-form";

export default async function ContentPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const articles = await listArticles({ tenantId: session.tenantId, limit: 50 });

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content</h1>
          <p className="text-sm text-muted-foreground">Create and generate articles with AI.</p>
        </div>
        <AddArticleForm />
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 gap-4 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">No articles yet</p>
          <p className="text-sm text-muted-foreground">Create an article and use AI to generate a first draft.</p>
          <AddArticleForm />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/content/${a.id}`}
                    className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted/50"
                  >
                    <span className="font-medium">{a.title}</span>
                    <span className="text-xs text-muted-foreground capitalize">{a.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
