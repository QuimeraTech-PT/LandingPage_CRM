import { useSuspenseQuery } from "@tanstack/react-query";
import { getPipelineSummary } from "@/lib/crm.opportunities.functions";
import { getProposals } from "@/lib/crm.proposals.functions";
import { getExpiringContracts } from "@/lib/crm.contracts.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const stageLabels: Record<string, string> = {
  qualified: "Qualificadas",
  meeting: "Reunião",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Ganhas",
};

const stageColors: Record<string, string> = {
  qualified: "bg-blue-500/40",
  meeting: "bg-blue-500/60",
  proposal: "bg-cyan-500/80",
  negotiation: "bg-primary",
  won: "bg-green-500",
};

/**
 * Replaces the previous hardcoded funnel that read crm_leads.status
 * ('new', 'contacted', 'proposal', ...). Now the pipeline lives on
 * crm_opportunities, which is the single source of truth once a lead is
 * qualified — so this widget queries that instead.
 */
export function SalesPipelineWidget() {
  const { data: pipeline } = useSuspenseQuery({
    queryKey: ["crm-pipeline-summary"],
    queryFn: () => getPipelineSummary(),
  });

  const { data: proposals } = useSuspenseQuery({
    queryKey: ["crm-proposals-dashboard"],
    queryFn: () => getProposals({ data: { limit: 200 } }),
  });

  const { data: expiringContracts } = useSuspenseQuery({
    queryKey: ["crm-contracts-expiring-dashboard"],
    queryFn: () => getExpiringContracts({ data: { days: 14 } }),
  });

  const stages = ["qualified", "meeting", "proposal", "negotiation", "won"];
  const maxCount = Math.max(...stages.map((s) => pipeline.summary[s as keyof typeof pipeline.summary]?.count ?? 0), 1);

  const sentProposals = (proposals || []).filter((p) => p.status === "sent" || p.status === "viewed");
  const acceptedProposals = (proposals || []).filter((p) => p.status === "accepted");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Target className="h-24 w-24 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Pipeline de Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stages.map((stage, idx) => {
              const count = pipeline.summary[stage as keyof typeof pipeline.summary]?.count ?? 0;
              const value = pipeline.summary[stage as keyof typeof pipeline.summary]?.value ?? 0;
              const percentage = (count / maxCount) * 100;

              return (
                <motion.div
                  key={stage}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", stageColors[stage])} />
                      {stageLabels[stage]}
                    </span>
                    <span className="text-foreground">
                      {count} ·{" "}
                      {new Intl.NumberFormat("pt-PT", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }).format(value)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      className={cn("h-full transition-all duration-1000 ease-out", stageColors[stage])}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-xs text-muted-foreground">
            <span>Valor ponderado do pipeline aberto</span>
            <span className="font-bold text-primary">
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                pipeline.weightedPipelineValue,
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Propostas em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{sentProposals.length}</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                enviadas / vistas
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              {acceptedProposals.length} aceite(s)
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "backdrop-blur-sm border-white/10",
            expiringContracts.length > 0 ? "bg-yellow-500/5 border-yellow-500/20" : "bg-card/50",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  "h-4 w-4",
                  expiringContracts.length > 0 ? "text-yellow-500" : "text-primary",
                )}
              />
              Contratos a Expirar (14 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringContracts.length}</div>
            {expiringContracts.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                {expiringContracts
                  .map(
                    (c) =>
                      (c as unknown as { crm_companies: { name: string } | null }).crm_companies
                        ?.name,
                  )
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
