import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountScope } from "@/lib/tenant";
import { listLeads } from "@/lib/leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { AddLeadForm } from "@/components/leads/add-lead-form";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string }>;
}) {
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const params = await searchParams;
  const { items: leads, total } = await listLeads({
    accountId: scope.accountId,
    clientId: params.client ?? null,
    status: params.status ?? null,
    limit: 100,
  });

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">Manage and qualify leads.</p>
        </div>
        <AddLeadForm />
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 gap-4 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">No leads yet</p>
          <p className="text-sm text-muted-foreground">Add your first lead to get started.</p>
          <AddLeadForm />
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {(["new", "contacted", "qualified", "won", "lost"] as const).map((s) => (
              <Link key={s} href={params.status === s ? "/leads" : `/leads?status=${s}`}>
                <Button variant={params.status === s ? "default" : "outline"} size="sm">
                  {STATUS_LABEL[s]}
                </Button>
              </Link>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">All leads ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Name</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Email</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Source</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="py-3 px-4 text-right font-medium text-muted-foreground">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{lead.name ?? "—"}</td>
                        <td className="py-3 px-4">{lead.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">{lead.source ?? "—"}</td>
                        <td className="py-3 px-4">
                          <LeadStatusBadge status={lead.status} leadId={lead.id} />
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
