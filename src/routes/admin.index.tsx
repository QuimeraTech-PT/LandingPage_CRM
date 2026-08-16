import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getCRMStats, getLeads, getActivityLogs } from '@/lib/crm.functions';
import { LayoutDashboard, Users, Briefcase, TrendingUp, Wallet, ArrowRight, History, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useSuspenseQuery({
    queryKey: ['crm-stats'],
    queryFn: () => getCRMStats(),
  });

  const { data: leads } = useSuspenseQuery({
    queryKey: ['crm-leads'],
    queryFn: () => getLeads(),
  });

  const { data: logs } = useSuspenseQuery({
    queryKey: ['crm-activity-logs'],
    queryFn: () => getActivityLogs({ data: { limit: 50 } }),
  });

  const recentLeads = Array.isArray(leads) ? leads.slice(0, 5) : [];
  const recentLogs = Array.isArray(logs) ? logs.slice(0, 6) : [];

  const funnelData = Array.isArray(leads) ? leads.reduce((acc: any, lead: any) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {}) : {};

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
            <div className="space-y-4">
              {['new', 'contacted', 'proposal', 'negotiation', 'closed_won'].map((status) => {
                const count = funnelData[status] || 0;
                const total = Array.isArray(leads) ? leads.length : 1;
                const percentage = (count / total) * 100;
                const labels: any = { new: 'Novas', contacted: 'Contactadas', proposal: 'Proposta', negotiation: 'Negociação', closed_won: 'Ganhas' };
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{labels[status]}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimas Leads</CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/admin/leads">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-white/5">
                  <div>
                    <p className="text-sm font-semibold">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company || 'Individual'}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{lead.status}</Badge>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-8">Nenhuma lead registada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className={cn(
                    "mt-0.5 rounded-full p-1 h-fit",
                    log.status === 'success' ? "bg-green-500/10 text-green-500" : 
                    log.status === 'warning' ? "bg-yellow-500/10 text-yellow-500" : 
                    "bg-red-500/10 text-red-500"
                  )}>
                    {log.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : 
                     log.status === 'warning' ? <Clock className="h-3 w-3" /> : 
                     <AlertCircle className="h-3 w-3" />}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-foreground truncate capitalize">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {log.entity_type}: {log.details?.fileName || log.details?.projectName || log.action}
                    </p>
                    <p className="text-[10px] text-muted-foreground opacity-60">
                      {new Date(log.created_at).toLocaleString('pt-PT')}
                    </p>
                  </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-4">Sem atividade recente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-32 flex-col gap-3 text-lg border-primary/20 bg-primary/5 hover:bg-primary/10" asChild>
              <Link to="/admin/leads">
                <Users className="h-8 w-8 text-primary" />
                Gerir Leads
              </Link>
            </Button>
            <Button variant="outline" className="h-32 flex-col gap-3 text-lg border-primary/20 bg-primary/5 hover:bg-primary/10" asChild>
              <Link to="/admin/projects">
                <Briefcase className="h-8 w-8 text-primary" />
                Gerir Projetos
              </Link>
            </Button>
          </div>
          <Button variant="outline" className="h-32 gap-4 text-xl border-primary/20 bg-primary/5 hover:bg-primary/10" asChild>
            <Link to="/admin/finances">
              <Wallet className="h-8 w-8 text-primary" />
              Gerir Finanças e Cash Flow
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
