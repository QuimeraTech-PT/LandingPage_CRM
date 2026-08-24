import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanies, createCompany } from "@/lib/crm.functions";
import { Building2, Plus, Search, Globe, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/companies")({
  component: CompaniesPage,
});

function CompaniesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: companies } = useSuspenseQuery({
    queryKey: ["crm-companies", search],
    queryFn: () => getCompanies({ data: { search } }),
  });

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-companies"] });
      setIsCreateOpen(false);
      toast.success("Empresa criada com sucesso!");
    },
    onError: () => toast.error("Erro ao criar empresa."),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      data: {
        name: formData.get("name") as string,
        nif: formData.get("nif") as string,
        website: formData.get("website") as string,
        sector: formData.get("sector") as string,
      },
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          Base de Empresas
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Gestão centralizada de parceiros e clientes B2B.</p>
      </header>

      <div className="flex items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar empresas..."
            className="pl-9 bg-muted/20 border-white/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 sm:max-w-[425px]">
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Registar Empresa</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required className="bg-muted/20 border-white/5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input id="nif" name="nif" className="bg-muted/20 border-white/5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" placeholder="https://..." className="bg-muted/20 border-white/5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Setor</Label>
                <Input id="sector" name="sector" className="bg-muted/20 border-white/5" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "A criar..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies?.map((company) => (
          <Card key={company.id} className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-all group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{company.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary/70" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {company.nif && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary/70" />
                    NIF: {company.nif}
                  </div>
                )}
                {company.sector && (
                  <div className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-white/5">
                    {company.sector}
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/5 flex gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs">Ver Detalhes</Button>
                <Button variant="outline" size="sm" className="w-full text-xs">Contactos</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
