import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getCRMStats } from '@/lib/crm.functions';
import { LayoutDashboard, Users, Briefcase, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useSuspenseQuery({
    queryKey: ['crm-stats'],
    queryFn: () => getCRMStats(),
  });

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          CRM QuimeraTech
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">Novos contactos do site</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Em desenvolvimento</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">Faturado até ao momento</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">€</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(stats.profit)}</div>
            <p className="text-xs text-muted-foreground">Após despesas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle>Pipeline de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground italic border border-dashed border-white/10 rounded-lg">
              Gráfico de funil em desenvolvimento...
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle>Últimas Leads</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <p className="text-sm text-muted-foreground">A carregar leads recentes...</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
