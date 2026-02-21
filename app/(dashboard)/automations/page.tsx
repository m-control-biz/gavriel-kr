import { redirect } from "next/navigation";
import { getAccountScope } from "@/lib/tenant";
import { listAutomations } from "@/lib/automations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomationsList } from "@/components/automations/automations-list";
import { AddAutomationForm } from "@/components/automations/add-automation-form";
import { Zap } from "lucide-react";

export default async function AutomationsPage() {
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const automations = await listAutomations(scope.accountId);

  return (
    <div className="space-y-6 py-6 px-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
        <p className="text-sm text-muted-foreground">
          Rules that run when events happen (e.g. new lead → create alert).
        </p>
      </div>

      <AddAutomationForm />

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Zap className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <AutomationsList initialList={automations} />
        </CardContent>
      </Card>
    </div>
  );
}
