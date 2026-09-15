import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOpportunities,
  updateOpportunityStatus,
  getPipelineSummary,
} from "@/lib/crm.opportunities.functions";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { Target, Building2, TrendingUp, Layers, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/opportunities")({
  component: OpportunitiesPage,
});

type OpportunityStatus = "qualified" | "meeting" | "proposal" | "negotiation" | "won" | "lost";

const isOpportunityStatus = (value: string): value is OpportunityStatus =>
  ["qualified", "meeting", "proposal", "negotiation", "won", "lost"].includes(value);

type OpportunityRow = {
  id: string;
  name: string;
  status: OpportunityStatus;
  estimated_value: number | null;
  probability: number | null;
  priority: string | null;
  crm_companies: { name: string } | null;
  crm_contacts: { name: string; email: string | null } | null;
};

const columnLabels: Record<OpportunityStatus, string> = {
  qualified: "Qualificada",
  meeting: "Reunião",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Ganha",
  lost: "Perdida",
};

function OpportunitiesPage() {
  const queryClient = useQueryClient();
  const [losingOpp, setLosingOpp] = useState<OpportunityRow | null>(null);
  const [lostReason, setLostReason] = useState("");

  const { data: opportunities } = useSuspenseQuery({
    queryKey: ["crm-opportunities"],
    queryFn: () => getOpportunities({ data: {} }),
  });

  const { data: pipeline } = useSuspenseQuery({
    queryKey: ["crm-pipeline-summary"],
    queryFn: () => getPipelineSummary(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateOpportunityStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["crm-pipeline-summary"] });
      toast.success("Estado atualizado");
    },
    onError: () => toast.error("Erro ao atualizar oportunidade"),
  });

  const opps = (opportunities || []) as unknown as OpportunityRow[];

  const handleDragEnd = (oppId: string, newStatus: string) => {
    if (!isOpportunityStatus(newStatus)) return;
    if (newStatus === "lost") {
      const opp = opps.find((o) => o.id === oppId);
      if (opp) {
        setLosingOpp(opp);
        return;
      }
    }
    updateStatusMutation.mutate({ data: { id: oppId, status: newStatus } });
  };

  const confirmLost = () => {
    if (!losingOpp) return;
    updateStatusMutation.mutate({
      data: { id: losingOpp.id, status: "lost", lostReason: lostReason || undefined },
    });
    setLosingOpp(null);
    setLostReason("");
  };

  const columns: OpportunityStatus[] = [
    "qualified",
    "meeting",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          Pipeline de Oportunidades
        </h1>
        <p className="text-muted-foreground">
          Leads qualificados em progressão até fecho. Estados WON/LOST atualizam o cliente e o
          histórico automaticamente.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/40 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Oportunidades Abertas
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipeline.openCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Ponderado do Pipeline
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                pipeline.weightedPipelineValue,
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">valor × probabilidade</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Fecho (Ganhas)
            </CardTitle>
            <Target className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipeline.summary.won.count + pipeline.summary.lost.count > 0
                ? Math.round(
                    (pipeline.summary.won.count /
                      (pipeline.summary.won.count + pipeline.summary.lost.count)) *
                      100,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <KanbanBoard
        columns={columns.map((status) => ({
          id: status,
          title: `${columnLabels[status]} (${pipeline.summary[status]?.count ?? 0})`,
          items: opps
            .filter((o) => o.status === status)
            .map((o) => ({ id: o.id, title: o.name, status: o.status, data: o })),
          renderItem: (item) => <OpportunityCard opportunity={item.data as OpportunityRow} />,
        }))}
        onDragEnd={handleDragEnd}
      />

      <Dialog open={!!losingOpp} onOpenChange={(open) => !open && setLosingOpp(null)}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Marcar como Perdida
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Porque motivo perdemos <span className="text-foreground font-medium">{losingOpp?.name}</span>?
            </p>
            <Textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="Ex: preço, timing, escolheu concorrente..."
              className="bg-muted/20 border-white/5"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setLosingOpp(null)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={confirmLost}
            >
              Confirmar Perda
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: OpportunityRow }) {
  const priorityColors: Record<string, string> = {
    high: "bg-red-500/10 text-red-500",
    medium: "bg-yellow-500/10 text-yellow-500",
    low: "bg-slate-500/10 text-slate-500",
  };

  return (
    <Card className="bg-card border-white/10 hover:border-primary/50 transition-colors shadow-sm select-none">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-sm line-clamp-2">{opportunity.name}</h4>
          {opportunity.priority && (
            <Badge
              variant="outline"
              className={`text-[9px] uppercase font-bold shrink-0 ${priorityColors[opportunity.priority] ?? ""}`}
            >
              {opportunity.priority}
            </Badge>
          )}
        </div>

        {opportunity.crm_companies && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {opportunity.crm_companies.name}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-sm font-bold text-primary">
            {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
              Number(opportunity.estimated_value || 0),
            )}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {opportunity.probability ?? 0}% prob.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
