import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  User,
  Building2,
  Briefcase,
} from "lucide-react";
import { getTickets, createTicket, updateTicketStatus } from "@/lib/crm.support.functions";
import { getCompanies } from "@/lib/crm.companies.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export const Route = createFileRoute("/admin/support")({
  component: SupportPage,
});

function SupportPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState({ search: "", status: "all" });

  const { data: tickets } = useSuspenseQuery({
    queryKey: ["crm-tickets"],
    queryFn: () => getTickets({ data: {} }),
  });

  const { data: companies } = useSuspenseQuery({
    queryKey: ["crm-companies"],
    queryFn: () => getCompanies({ data: {} }),
  });

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tickets"] });
      setIsCreateOpen(false);
      toast.success("Ticket criado com sucesso");
    },
    onError: () => toast.error("Erro ao criar ticket"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tickets"] });
      toast.success("Estado do ticket atualizado");
    },
  });

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const priority = formData.get("priority");
    const normalizedPriority =
      priority === "low" || priority === "medium" || priority === "high" || priority === "urgent"
        ? priority
        : "medium";

    createMutation.mutate({
      data: {
        company_id: formData.get("company_id") as string,
        subject: formData.get("subject") as string,
        description: formData.get("description") as string,
        priority: normalizedPriority,
      },
    });
  };

  type TicketStatus = "open" | "in_progress" | "waiting_client" | "resolved" | "closed";

  type TicketFilterItem = {
    id: string;
    ticket_number?: string | number | null;
    subject: string;
    description?: string | null;
    status: TicketStatus;
    priority: string;
    created_at?: string | Date | null;
    crm_companies?: {
      name?: string | null;
    } | null;
    crm_projects?: {
      name?: string | null;
    } | null;
  };

  type CompanyOption = {
    id: string;
    name: string;
  };

  const companyOptions = (companies as CompanyOption[] | undefined) ?? [];

  const filteredTickets = (tickets as TicketFilterItem[] | undefined)?.filter((ticket) => {
    const normalizedSearch = filter.search.toLowerCase();
    const ticketSubject = ticket.subject?.toLowerCase() ?? "";
    const companyName = ticket.crm_companies?.name?.toLowerCase() ?? "";

    const matchesSearch =
      ticketSubject.includes(normalizedSearch) || companyName.includes(normalizedSearch);
    const matchesStatus = filter.status === "all" || ticket.status === filter.status;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      waiting_client: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      resolved: "bg-green-500/10 text-green-500 border-green-500/20",
      closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    const labels: Record<string, string> = {
      open: "Aberto",
      in_progress: "Em Progresso",
      waiting_client: "Aguarda Cliente",
      resolved: "Resolvido",
      closed: "Fechado",
    };
    return (
      <Badge variant="outline" className={cn("font-bold capitalize", styles[status])}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-slate-500/10 text-slate-500",
      medium: "bg-blue-500/10 text-blue-500",
      high: "bg-orange-500/10 text-orange-500",
      urgent: "bg-red-500/10 text-red-500 animate-pulse",
    };
    return (
      <Badge variant="outline" className={cn("text-[10px] uppercase font-black", styles[priority])}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary" />
            Suporte ao Cliente
          </h1>
          <p className="text-muted-foreground">Gestão de tickets e assistência técnica.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 sm:max-w-125">
            <form onSubmit={handleCreateTicket} className="space-y-4 py-4">
              <DialogHeader>
                <DialogTitle>Abrir Pedido de Suporte</DialogTitle>
                <DialogDescription>Registe um novo ticket para acompanhamento.</DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label>Cliente / Empresa</Label>
                <Select name="company_id" required>
                  <SelectTrigger className="bg-muted/20 border-white/5">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {companyOptions.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assunto</Label>
                <Input
                  name="subject"
                  placeholder="Breve resumo do problema"
                  required
                  className="bg-muted/20 border-white/5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger className="bg-muted/20 border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição Detalhada</Label>
                <Textarea
                  name="description"
                  placeholder="Explique a situação..."
                  className="bg-muted/20 border-white/5 min-h-30"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "A processar..." : "Criar Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar tickets ou clientes..."
            className="pl-10 bg-muted/10 border-white/5 focus:border-primary/50 transition-all"
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <Select
          value={filter.status}
          onValueChange={(val) => setFilter((prev) => ({ ...prev, status: val }))}
        >
          <SelectTrigger className="w-50 bg-muted/10 border-white/5">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card border-white/10">
            <SelectItem value="all">Todos os Estados</SelectItem>
            <SelectItem value="open">Abertos</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="waiting_client">Aguarda Cliente</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
            <SelectItem value="closed">Fechados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredTickets?.length === 0 ? (
          <Card className="bg-card/40 border-dashed border-white/10 py-20 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold">Nenhum ticket encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou crie um novo pedido.
            </p>
          </Card>
        ) : (
          filteredTickets?.map((ticket) => (
            <Card
              key={ticket.id}
              className="bg-card/50 border-white/10 hover:border-primary/30 transition-all group overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            #{ticket.ticket_number || ticket.id.slice(0, 8)}
                          </span>
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {ticket.subject}
                        </h3>
                      </div>
                      <Select
                        value={ticket.status}
                        onValueChange={(status) =>
                          updateStatusMutation.mutate({
                            data: { id: ticket.id, status: status as TicketStatus },
                          })
                        }
                      >
                        <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent focus:ring-0">
                          {getStatusBadge(ticket.status)}
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10">
                          <SelectItem value="open">Aberto</SelectItem>
                          <SelectItem value="in_progress">Em Progresso</SelectItem>
                          <SelectItem value="waiting_client">Aguarda Cliente</SelectItem>
                          <SelectItem value="resolved">Resolvido</SelectItem>
                          <SelectItem value="closed">Fechado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {ticket.description || "Sem descrição adicional."}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        {ticket.crm_companies?.name}
                      </div>
                      {ticket.crm_projects && (
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5 text-cyan-500" />
                          {ticket.crm_projects.name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground ml-auto">
                        <Clock className="h-3.5 w-3.5" />
                        Criado em{" "}
                        {ticket.created_at
                          ? format(new Date(ticket.created_at), "dd MMM yyyy", { locale: pt })
                          : "Data indisponível"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
