import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContracts,
  createContract,
  updateContractStatus,
  getExpiringContracts,
} from "@/lib/crm.contracts.functions";
import { getCompanies } from "@/lib/crm.companies.functions";
import { FileCheck, Plus, AlertTriangle, Building2, Calendar, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

export const Route = createFileRoute("/admin/contracts")({
  component: ContractsPage,
});

type ContractStatus = "draft" | "sent" | "signed" | "active" | "expired" | "cancelled";

type ContractRow = {
  id: string;
  contract_number: string | null;
  status: ContractStatus;
  type: string | null;
  value: number | null;
  start_date: string | null;
  end_date: string | null;
  crm_companies: { name: string } | null;
  crm_projects: { name: string } | null;
};

const statusLabels: Record<ContractStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  signed: "Assinado",
  active: "Ativo",
  expired: "Expirado",
  cancelled: "Cancelado",
};

const statusColors: Record<ContractStatus, string> = {
  draft: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  signed: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  expired: "bg-red-500/10 text-red-500 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function ContractsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: contracts } = useSuspenseQuery({
    queryKey: ["crm-contracts"],
    queryFn: () => getContracts({ data: {} }),
  });

  const { data: expiring } = useSuspenseQuery({
    queryKey: ["crm-contracts-expiring"],
    queryFn: () => getExpiringContracts({ data: { days: 14 } }),
  });

  const { data: companies } = useSuspenseQuery({
    queryKey: ["crm-companies"],
    queryFn: () => getCompanies({ data: {} }),
  });

  const createMutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["crm-contracts-expiring"] });
      setIsCreateOpen(false);
      toast.success("Contrato criado");
    },
    onError: () => toast.error("Erro ao criar contrato"),
  });

  const statusMutation = useMutation({
    mutationFn: updateContractStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["crm-contracts-expiring"] });
      toast.success("Estado atualizado");
    },
  });

  const rows = (contracts || []) as unknown as ContractRow[];
  const expiringRows = (expiring || []) as unknown as ContractRow[];

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      data: {
        companyId: formData.get("company_id") as string,
        contractNumber: (formData.get("contract_number") as string) || undefined,
        type: (formData.get("type") as string) || undefined,
        value: formData.get("value") ? Number(formData.get("value")) : undefined,
        startDate: (formData.get("start_date") as string) || undefined,
        endDate: (formData.get("end_date") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
      },
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-primary" />
            Contratos
          </h1>
          <p className="text-muted-foreground">
            Alertas de expiração são gerados automaticamente (verificação horária em background).
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 sm:max-w-125">
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <DialogHeader>
                <DialogTitle>Registar Contrato</DialogTitle>
                <DialogDescription>Associe o contrato a um cliente existente.</DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label>Cliente / Empresa</Label>
                <Select name="company_id" required>
                  <SelectTrigger className="bg-muted/20 border-white/5">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {(companies || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_number">Número</Label>
                  <Input
                    id="contract_number"
                    name="contract_number"
                    placeholder="CT-2026-001"
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Input
                    id="type"
                    name="type"
                    placeholder="Manutenção, Desenvolvimento..."
                    className="bg-muted/20 border-white/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Início</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fim</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    className="bg-muted/20 border-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor (€)</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  className="bg-muted/20 border-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" className="bg-muted/20 border-white/5" />
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "A registar..." : "Registar Contrato"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {expiringRows.length > 0 && (
        <Alert variant="destructive" className="border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">
            {expiringRows.length} contrato(s) a expirar nos próximos 14 dias
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {expiringRows.map((c) => c.crm_companies?.name || c.contract_number).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {rows.map((contract) => (
          <Card
            key={contract.id}
            className="bg-card/50 border-white/10 hover:border-primary/30 transition-all"
          >
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold">
                    {contract.contract_number || `Contrato ${contract.id.slice(0, 8)}`}
                  </h3>
                  <Badge variant="outline" className={cn("font-bold", statusColors[contract.status])}>
                    {statusLabels[contract.status]}
                  </Badge>
                  {contract.type && (
                    <Badge variant="outline" className="text-[10px] border-white/10">
                      {contract.type}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {contract.crm_companies && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> {contract.crm_companies.name}
                    </span>
                  )}
                  {contract.end_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Termina em{" "}
                      {new Date(contract.end_date).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                  {contract.value != null && (
                    <span className="flex items-center gap-1">
                      <Euro className="h-3.5 w-3.5" />
                      {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                        Number(contract.value),
                      )}
                    </span>
                  )}
                </div>
              </div>

              <Select
                value={contract.status}
                onValueChange={(status) =>
                  statusMutation.mutate({ data: { id: contract.id, status: status as ContractStatus } })
                }
              >
                <SelectTrigger className="w-40 h-8 text-xs bg-muted/20 border-white/5 shrink-0">
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
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Nenhum contrato registado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
