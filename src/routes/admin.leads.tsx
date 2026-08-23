import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeads,
  createLead,
  updateLeadStatus,
  convertLeadToProject,
  updateLead,
} from "@/lib/crm.functions";
import {
  Users,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Trash2,
  Edit2,
  LayoutList,
  Kanban as KanbanIcon,
} from "lucide-react";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["crm_leads"]["Row"];
type LeadStatus = "new" | "contacted" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

const isLeadStatus = (value: string): value is LeadStatus =>
  ["new", "contacted", "proposal", "negotiation", "closed_won", "closed_lost"].includes(value);

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const { data: leadsData } = useSuspenseQuery({
    queryKey: ["crm-leads"],
    queryFn: () => getLeads({ data: {} }),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const leads = leadsData.items;

  const createLeadMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      setIsCreateOpen(false);
      toast.success("Lead criada com sucesso!");
    },
    onError: () => toast.error("Erro ao criar lead."),
  });

  const convertMutation = useMutation({
    mutationFn: convertLeadToProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm-projects"] });
      toast.success("Lead convertida em projeto!");
    },
    onError: () => toast.error("Erro ao converter lead."),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateLeadStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Estado atualizado!");
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: updateLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      setEditingLead(null);
      toast.success("Lead atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar lead."),
  });

  const handleCreateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLeadMutation.mutate({
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        company: formData.get("company") as string,
        estimated_value: Number(formData.get("estimated_value")),
        notes: formData.get("notes") as string,
        status: "new",
      },
    });
  };

  const handleUpdateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;
    const formData = new FormData(e.currentTarget);
    updateLeadMutation.mutate({
      data: {
        id: editingLead.id,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        company: formData.get("company") as string,
        estimated_value: Number(formData.get("estimated_value")),
        notes: formData.get("notes") as string,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      new: "default",
      contacted: "secondary",
      proposal: "secondary",
      negotiation: "secondary",
      closed_won: "outline",
      closed_lost: "destructive",
    };

    const labels: Record<string, string> = {
      new: "Novo",
      contacted: "Contactado",
      proposal: "Proposta",
      negotiation: "Negociação",
      closed_won: "Ganho",
      closed_lost: "Perdido",
    };

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Leads
          </h1>

          <div className="flex items-center bg-muted/30 rounded-lg p-1 border border-white/5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-2"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-2"
              onClick={() => setViewMode("kanban")}
            >
              <KanbanIcon className="h-4 w-4" />
              Kanban
            </Button>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 bg-card border-white/10 text-foreground">
            <form onSubmit={handleCreateLead}>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Lead</DialogTitle>
                <DialogDescription>
                  Preencha os dados da lead para registar no CRM.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: João Silva"
                    required
                    className="bg-muted/50 border-white/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="joao@empresa.com"
                      className="bg-muted/50 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+351 9xx..."
                      className="bg-muted/50 border-white/10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Nome da empresa"
                    className="bg-muted/50 border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estimated_value">Valor Estimado (€)</Label>
                  <Input
                    id="estimated_value"
                    name="estimated_value"
                    type="number"
                    placeholder="5000"
                    className="bg-muted/50 border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Detalhes sobre o pedido..."
                    className="bg-muted/50 border-white/10 min-h-25"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createLeadMutation.isPending}>
                  {createLeadMutation.isPending ? "A guardar..." : "Criar Lead"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {viewMode === "list" ? (
        <div className="grid gap-4">
          {leads?.map((lead) => (
            <Card
              key={lead.id}
              className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{lead.name}</h3>
                      {getStatusBadge(lead.status)}
                      {lead.estimated_value && Number(lead.estimated_value) > 0 && (
                        <span className="text-sm font-medium text-primary">
                          {new Intl.NumberFormat("pt-PT", {
                            style: "currency",
                            currency: "EUR",
                          }).format(Number(lead.estimated_value))}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {lead.company}
                        </div>
                      )}
                    </div>

                    {lead.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 p-3 rounded-lg border border-white/5">
                        {lead.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      defaultValue={lead.status}
                      onValueChange={(val) => {
                        if (isLeadStatus(val)) {
                          updateStatusMutation.mutate({ data: { id: lead.id, status: val } });
                        }
                      }}
                    >
                      <SelectTrigger className="w-37.5 bg-muted/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-foreground">
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="contacted">Contactado</SelectItem>
                        <SelectItem value="proposal">Proposta</SelectItem>
                        <SelectItem value="negotiation">Negociação</SelectItem>
                        <SelectItem value="closed_won">Ganho</SelectItem>
                        <SelectItem value="closed_lost">Perdido</SelectItem>
                      </SelectContent>
                    </Select>

                    {lead.status !== "closed_won" && lead.status !== "closed_lost" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-primary/20 hover:bg-primary/10"
                        onClick={() =>
                          convertMutation.mutate({
                            data: {
                              leadId: lead.id,
                              projectName: `Projeto: ${lead.name}`,
                              clientName: lead.name,
                            },
                          })
                        }

                        disabled={convertMutation.isPending}
                      >
                        <Briefcase className="h-4 w-4 text-primary" />
                        Converter
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => setEditingLead(lead)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {leads?.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Nenhuma lead encontrada.</p>
            </div>
          )}
        </div>
      ) : (
        <KanbanBoard
          columns={[
            {
              id: "new",
              title: "Novas",
              items:
                leads
                  ?.filter((l) => l.status === "new")
                  .map((l) => ({ id: l.id, title: l.name, status: l.status, data: l })) || [],
              renderItem: (item) => (
                <LeadKanbanCard
                  lead={item.data as Lead}
                  onEdit={() => setEditingLead(item.data as Lead)}
                />
              ),
            },
            {
              id: "contacted",
              title: "Contactadas",
              items:
                leads
                  ?.filter((l) => l.status === "contacted")
                  .map((l) => ({ id: l.id, title: l.name, status: l.status, data: l })) || [],
              renderItem: (item) => (
                <LeadKanbanCard
                  lead={item.data as Lead}
                  onEdit={() => setEditingLead(item.data as Lead)}
                />
              ),
            },
            {
              id: "proposal",
              title: "Proposta",
              items:
                leads
                  ?.filter((l) => l.status === "proposal")
                  .map((l) => ({ id: l.id, title: l.name, status: l.status, data: l })) || [],
              renderItem: (item) => (
                <LeadKanbanCard
                  lead={item.data as Lead}
                  onEdit={() => setEditingLead(item.data as Lead)}
                />
              ),
            },
            {
              id: "negotiation",
              title: "Negociação",
              items:
                leads
                  ?.filter((l) => l.status === "negotiation")
                  .map((l) => ({ id: l.id, title: l.name, status: l.status, data: l })) || [],
              renderItem: (item) => (
                <LeadKanbanCard
                  lead={item.data as Lead}
                  onEdit={() => setEditingLead(item.data as Lead)}
                />
              ),
            },
            {
              id: "closed_won",
              title: "Ganhas",
              items:
                leads
                  ?.filter((l) => l.status === "closed_won")
                  .map((l) => ({ id: l.id, title: l.name, status: l.status, data: l })) || [],
              renderItem: (item) => (
                <LeadKanbanCard
                  lead={item.data as Lead}
                  onEdit={() => setEditingLead(item.data as Lead)}
                />
              ),
            },
          ]}
          onDragEnd={(leadId, newStatus) => {
            if (isLeadStatus(newStatus)) {
              updateStatusMutation.mutate({ data: { id: leadId, status: newStatus } });
            }
          }}
        />
      )}

      <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="sm:max-w-106.25 bg-card border-white/10 text-foreground">
          {editingLead && (
            <form onSubmit={handleUpdateLead}>
              <DialogHeader>
                <DialogTitle>Editar Lead</DialogTitle>
                <DialogDescription>Altere os dados da lead selecionada.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome Completo</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingLead.name}
                    required
                    className="bg-muted/50 border-white/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      defaultValue={editingLead.email ?? ""}
                      className="bg-muted/50 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      defaultValue={editingLead.phone ?? ""}
                      className="bg-muted/50 border-white/10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-company">Empresa</Label>
                  <Input
                    id="edit-company"
                    name="company"
                    defaultValue={editingLead.company ?? ""}
                    className="bg-muted/50 border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-value">Valor Estimado (€)</Label>
                  <Input
                    id="edit-value"
                    name="estimated_value"
                    type="number"
                    defaultValue={editingLead.estimated_value ?? ""}
                    className="bg-muted/50 border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Notas</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    defaultValue={editingLead.notes ?? ""}
                    className="bg-muted/50 border-white/10 min-h-25"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateLeadMutation.isPending}>
                  {updateLeadMutation.isPending ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadKanbanCard({ lead, onEdit }: { lead: Lead; onEdit: () => void }) {
  return (
    <Card className="bg-card border-white/10 hover:border-primary/50 transition-colors shadow-sm select-none">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm line-clamp-1">{lead.name}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-1">
          {lead.company && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {lead.company}
            </p>
          )}
          {lead.estimated_value && (
            <p className="text-xs font-medium text-primary">
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                Number(lead.estimated_value),
              )}
            </p>
          )}
        </div>

        {lead.notes && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded">
            {lead.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
