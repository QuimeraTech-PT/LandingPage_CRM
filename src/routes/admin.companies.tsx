import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Users,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { getCompanies, createCompany } from "@/lib/crm.companies.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/companies")({
  component: CompaniesPage,
});

function CompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const handleCreateCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      data: {
        name: formData.get("name") as string,
        nif: formData.get("nif") as string,
        website: formData.get("website") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        sector: formData.get("sector") as string,
        size: formData.get("size") as string,
      },
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          Gestão de Empresas
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Diretório B2B e relações corporativas da QuimeraTech.
        </p>
      </header>

      <div className="flex items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar empresas..."
              className="pl-10 bg-muted/20 border-white/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 border-white/5">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-10 px-6 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 sm:max-w-150">
            <form onSubmit={handleCreateCompany} className="space-y-4 py-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Registar Empresa</DialogTitle>
                <DialogDescription>
                  Insira os dados fiscais e de contacto da organização.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Acme Corp"
                    required
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    name="nif"
                    placeholder="500..."
                    className="bg-muted/20 border-white/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Geral</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="geral@empresa.com"
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+351..."
                    className="bg-muted/20 border-white/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor</Label>
                  <Input
                    id="sector"
                    name="sector"
                    placeholder="Tecnologia, Retalho..."
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Tamanho (Colaboradores)</Label>
                  <Select name="size">
                    <SelectTrigger className="bg-muted/20 border-white/5">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201+">201+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://..."
                  className="bg-muted/20 border-white/5"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "A criar..." : "Confirmar Registo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies?.map((company) => (
          <Card
            key={company.id}
            className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building2 className="h-20 w-20 text-primary" />
            </div>

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold border-white/10"
                >
                  {company.status || "Prospective"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                {company.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                {company.nif || "NIF não registado"}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {company.website && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3 text-primary/70" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary truncate"
                    >
                      {company.website.replace("https://", "")}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 text-primary/70" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}
                {company.sector && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3 text-primary/70" />
                    <span>
                      {company.sector} • {company.size || "Tamanho N/A"}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[10px] uppercase font-bold h-8 gap-2 border-white/5"
                >
                  <Users className="h-3 w-3" /> Contactos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[10px] uppercase font-bold h-8 gap-2 border-white/5"
                >
                  <TrendingUp className="h-3 w-3" /> Projetos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {companies?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-2xl bg-card/20">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold">Nenhuma empresa encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Comece por registar a sua primeira relação B2B.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
