import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProposals,
  createProposal,
  updateProposalStatus,
  convertProposalToProject,
} from "@/lib/crm.proposals.functions";
import { getOpportunities } from "@/lib/crm.opportunities.functions";
import {
  FileText,
  Plus,
  Trash2,
  ArrowRightCircle,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/proposals")({
  component: ProposalsPage,
});

type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "negotiation"
  | "accepted"
  | "rejected"
  | "expired";

type LineItem = { description: string; quantity: number; unitPrice: number };

type ProposalRow = {
  id: string;
  title: string;
  status: ProposalStatus;
  total_value: number | null;
  valid_until: string | null;
  opportunity_id: string | null;
  company_id: string | null;
  converted_project_id: string | null;
  crm_companies: { name: string } | null;
  crm_opportunities: { name: string; status: string } | null;
};

const statusLabels: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  viewed: "Vista",
  negotiation: "Negociação",
  accepted: "Aceite",
  rejected: "Rejeitada",
  expired: "Expirada",
};

const statusColors: Record<ProposalStatus, string> = {
  draft: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  viewed: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  negotiation: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function ProposalsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [convertingProposal, setConvertingProposal] = useState<ProposalRow | null>(null);
  const [projectName, setProjectName] = useState("");

  const { data: proposals } = useSuspenseQuery({
    queryKey: ["crm-proposals"],
    queryFn: () => getProposals({ data: {} }),
  });

  const { data: opportunities } = useSuspenseQuery({
    queryKey: ["crm-opportunities-for-proposal"],
    queryFn: () => getOpportunities({ data: {} }),
  });

  const createMutation = useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-proposals"] });
      setIsCreateOpen(false);
      setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
      toast.success("Proposta criada");
    },
    onError: () => toast.error("Erro ao criar proposta"),
  });

  const statusMutation = useMutation({
    mutationFn: updateProposalStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-proposals"] });
      toast.success("Estado atualizado");
    },
  });

  const convertMutation = useMutation({
    mutationFn: convertProposalToProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["crm-projects"] });
      setConvertingProposal(null);
      setProjectName("");
      toast.success("Proposta convertida em projeto!");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Erro ao converter proposta"),
  });

  const rows = (proposals || []) as unknown as ProposalRow[];

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const opportunityId = formData.get("opportunity_id") as string;
    const opportunity = (opportunities || []).find((o) => o.id === opportunityId) as
      | { company_id: string | null; contact_id: string | null }
      | undefined;

    createMutation.mutate({
      data: {
        opportunityId: opportunityId || undefined,
        companyId: opportunity?.company_id ?? undefined,
        contactId: opportunity?.contact_id ?? undefined,
        title: formData.get("title") as string,
        validUntil: (formData.get("valid_until") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
        items: items.filter((i) => i.description.trim().length > 0),
      },
    });
  };

  const updateItem = (idx: number, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const itemsTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Propostas
          </h1>
          <p className="text-muted-foreground">
            Do orçamento à assinatura. Propostas aceites podem ser convertidas em projeto num
            clique.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <DialogHeader>
                <DialogTitle>Criar Proposta</DialogTitle>
                <DialogDescription>
                  Associe a uma oportunidade e defina as linhas de orçamento.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label>Oportunidade</Label>
                <Select name="opportunity_id">
                  <SelectTrigger className="bg-muted/20 border-white/5">
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {(opportunities || []).map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Website Institucional"
                    required
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Válida até</Label>
                  <Input
                    id="valid_until"
                    name="valid_until"
                    type="date"
                    className="bg-muted/20 border-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Linhas de Orçamento</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() =>
                      setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }])
                    }
                  >
                    <Plus className="h-3 w-3" /> Adicionar linha
                  </Button>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <Input
                        placeholder="Descrição"
                        value={item.description}
                        onChange={(e) => updateItem(idx, { description: e.target.value })}
                        className="bg-muted/20 border-white/5 flex-1"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                        className="bg-muted/20 border-white/5 w-20"
                        aria-label="Quantidade"
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })}
                        className="bg-muted/20 border-white/5 w-28"
                        aria-label="Preço unitário"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end text-sm font-bold pt-1">
                  Total:{" "}
                  {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                    itemsTotal,
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Condições, prazos de entrega..."
                  className="bg-muted/20 border-white/5"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "A criar..." : "Criar Proposta"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rows.map((proposal) => (
          <Card
            key={proposal.id}
            className="bg-card/50 border-white/10 hover:border-primary/30 transition-all"
          >
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold">{proposal.title}</h3>
                  <Badge variant="outline" className={cn("font-bold", statusColors[proposal.status])}>
                    {statusLabels[proposal.status]}
                  </Badge>
                  {proposal.converted_project_id && (
                    <Badge variant="outline" className="text-primary border-primary/20 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Convertida em projeto
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {proposal.crm_companies && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> {proposal.crm_companies.name}
                    </span>
                  )}
                  {proposal.valid_until && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Válida até{" "}
                      {new Date(proposal.valid_until).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className="text-xl font-black text-primary">
                  {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                    Number(proposal.total_value || 0),
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Select
                    value={proposal.status}
                    onValueChange={(status) =>
                      statusMutation.mutate({
                        data: { id: proposal.id, status: status as ProposalStatus },
                      })
                    }
                  >
                    <SelectTrigger className="w-40 h-8 text-xs bg-muted/20 border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {proposal.status === "accepted" && !proposal.converted_project_id && (
                    <Button
                      size="sm"
                      className="h-8 gap-2 text-xs shadow-lg shadow-primary/20"
                      onClick={() => {
                        setConvertingProposal(proposal);
                        setProjectName(proposal.title);
                      }}
                    >
                      <ArrowRightCircle className="h-3.5 w-3.5" />
                      Converter em Projeto
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Nenhuma proposta criada ainda.</p>
          </div>
        )}
      </div>

      <Dialog open={!!convertingProposal} onOpenChange={(open) => !open && setConvertingProposal(null)}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Converter Proposta em Projeto</DialogTitle>
            <DialogDescription>
              Cria um projeto novo em estado "Planeamento" ligado a esta proposta e à respetiva
              oportunidade. Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="project_name">Nome do Projeto</Label>
            <Input
              id="project_name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-muted/20 border-white/5"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConvertingProposal(null)}>
              Cancelar
            </Button>
            <Button
              disabled={convertMutation.isPending || !projectName.trim()}
              onClick={() =>
                convertingProposal &&
                convertMutation.mutate({
                  data: { proposalId: convertingProposal.id, projectName },
                })
              }
            >
              {convertMutation.isPending ? "A converter..." : "Confirmar Conversão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
