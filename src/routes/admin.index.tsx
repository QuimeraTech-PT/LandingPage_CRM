import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCRMStats, getLeads, getActivityLogs, getTasks, getProjects } from "@/lib/crm.functions";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  Wallet,
  ArrowRight,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { RevenueForecast } from "@/components/crm/RevenueForecast";
import { CRMStats } from "@/components/crm/CRMStats";
import { ActivityTimeline } from "@/components/crm/ActivityTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database, Json } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["crm_leads"]["Row"];
type ActivityLog = Database["public"]["Tables"]["crm_activity_logs"]["Row"];

const getLogDetail = (details: Json | null, key: string) => {
  if (!details || typeof details !== "object" || Array.isArray(details)) return undefined;
  const value = details[key];
  return typeof value === "string" ? value : undefined;
};

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [logFilter, setLogFilter] = useState({
    type: "all",
    search: "",
  });

  const { data: stats } = useSuspenseQuery({
    queryKey: ["crm-stats"],
    queryFn: () => getCRMStats(),
  });

  const { data: leads } = useSuspenseQuery({
    queryKey: ["crm-leads"],
    queryFn: () => getLeads(),
  });

  const { data: logs } = useSuspenseQuery({
    queryKey: ["crm-activity-logs"],
    queryFn: () => getActivityLogs({ data: { limit: 100 } }),
  });

  const { data: tasks } = useSuspenseQuery({
    queryKey: ["crm-tasks"],
    queryFn: () => getTasks({ data: {} }),
  });

  const { data: projectsData } = useSuspenseQuery({
    queryKey: ["crm-projects"],
    queryFn: () => getProjects(),
  });
  const projects = Array.isArray(projectsData?.items) ? projectsData.items : [];


  const recentLeads = Array.isArray(leads.items) ? leads.items.slice(0, 5) : [];

  const filteredLogs = useMemo(() => {
    const rawLogs = logs as any;
    const logsItems = Array.isArray(rawLogs.items) ? rawLogs.items : (Array.isArray(rawLogs) ? rawLogs : []);
    
    return logsItems
      .filter((log: any) => {
        const matchesType = logFilter.type === "all" || log.entity_type === logFilter.type;
        const searchStr = logFilter.search.toLowerCase();
        const matchesSearch =
          !searchStr ||
          log.action.toLowerCase().includes(searchStr) ||
          log.entity_type.toLowerCase().includes(searchStr) ||
          JSON.stringify(log.details).toLowerCase().includes(searchStr);
        return matchesType && matchesSearch;
      })
      .slice(0, 8);
  }, [logs, logFilter]);

  const funnelData = Array.isArray(leads.items)
    ? leads.items.reduce<Record<string, number>>((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {})
    : {};

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const staleLeadsCount = Array.isArray(leads.items) 
    ? leads.items.filter(l => 
        l.status !== 'closed_won' && 
        l.status !== 'closed_lost' && 
        new Date(l.updated_at || l.created_at) < sevenDaysAgo
      ).length
    : 0;

  const upcomingDeadlines = Array.isArray(projects)
    ? projects.filter(p => 
        p.status !== 'completed' && 
        p.end_date && 
        new Date(p.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      )
    : [];

  const insights = [
    { 
      text: staleLeadsCount > 0 ? `${staleLeadsCount} leads sem follow-up há mais de 7 dias.` : "Todas as leads têm follow-up em dia.", 
      color: staleLeadsCount > 0 ? "text-yellow-500" : "text-green-500", 
      icon: Clock 
    },
    { 
      text: `O pipeline tem ${Array.isArray(leads.items) ? leads.items.length : 0} oportunidades ativas.`, 
      color: "text-primary", 
      icon: TrendingUp 
    },
    { 
      text: upcomingDeadlines.length > 0 
        ? `${upcomingDeadlines.length} projetos com deadline próximo.` 
        : "Sem deadlines críticos nos próximos 7 dias.", 
      color: upcomingDeadlines.length > 0 ? "text-red-500" : "text-green-500", 
      icon: AlertTriangle 
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Bem-vindo ao centro de operações da QuimeraTech.
          </p>
        </div>

        <div className="flex gap-4 mt-4 md:mt-0">
          <Card className="bg-card/40 border-white/5 p-3 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Tarefas Hoje</p>
              <p className="text-xl font-black">{(tasks as any[])?.filter(t => t.status === 'todo').length || 0}</p>
            </div>
          </Card>
          
          <Card className="bg-card/40 border-white/5 p-3 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Insights Novos</p>
              <p className="text-xl font-black">3</p>
            </div>
          </Card>
        </div>
      </header>


      <CRMStats stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <RevenueForecast />
          <Card className="bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="h-24 w-24 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Pipeline de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["new", "contacted", "proposal", "negotiation", "closed_won"].map((status, idx) => {
                  const count = funnelData[status] || 0;
                  const total = Array.isArray(leads.items) ? leads.items.length : 1;
                  const percentage = (count / Math.max(total, 1)) * 100;
                  const labels: Record<string, string> = {
                    new: "Novas Oportunidades",
                    contacted: "Qualificação",
                    proposal: "Proposta Enviada",
                    negotiation: "Em Negociação",
                    closed_won: "Fecho Ganho",
                  };
                  const colors = [
                    "bg-blue-500/40",
                    "bg-blue-500/60",
                    "bg-cyan-500/80",
                    "bg-primary",
                    "bg-green-500",
                  ];

                  return (
                    <motion.div 
                      key={status} 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", colors[idx])} />
                          {labels[status]}
                        </span>
                        <span className="text-foreground">{count}</span>
                      </div>
                      <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          className={cn("h-full transition-all duration-1000 ease-out", colors[idx])}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-white/10 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-2 text-xs text-primary">
              <Link to="/admin/leads">
                Ver Leads <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {recentLeads.map((lead, idx) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-white/5 hover:bg-muted/20 hover:border-primary/20 transition-all cursor-default group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{lead.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">
                      {lead.company || "Individual"}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[9px] px-1.5 py-0 border-white/10",
                    lead.status === 'new' && "text-blue-400 border-blue-400/20",
                    lead.status === 'closed_won' && "text-green-400 border-green-400/20",
                  )}>
                    {lead.status.replace('_', ' ')}
                  </Badge>
                </motion.div>
              ))}
              {recentLeads.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                  <Users className="h-8 w-8 mb-2" />
                  <p className="text-xs italic">Nenhuma lead registada.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quimera Insights Section */}
        <Card className="col-span-1 bg-primary/5 border-primary/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Target className="h-32 w-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black italic">
              <TrendingUp className="h-5 w-5 text-primary" />
              QUIMERA INSIGHTS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { text: "3 leads sem follow-up há mais de 7 dias.", color: "text-yellow-500", icon: Clock },
              { text: "O pipeline aumentou 18% este mês.", color: "text-green-500", icon: TrendingUp },
              { text: "O projeto ACME está com deadline próximo.", color: "text-red-500", icon: AlertTriangle },
            ].map((insight, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 items-start p-3 bg-card/40 rounded-xl border border-white/5 group-hover:border-primary/20 transition-all"
              >
                <insight.icon className={cn("h-4 w-4 mt-0.5 shrink-0", insight.color)} />
                <p className="text-xs font-medium leading-relaxed">{insight.text}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card/40 backdrop-blur-md border-white/5 shadow-xl relative overflow-hidden">

          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <History className="h-5 w-5 text-primary" />
              Monitorização
            </CardTitle>
            <div className="flex flex-col gap-2 mt-4 relative z-10">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filtrar eventos..."
                  className="pl-8 h-8 text-[11px] bg-muted/20 border-white/5 focus:border-primary/50 transition-all"
                  value={logFilter.search}
                  onChange={(e) => setLogFilter((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <Select
                value={logFilter.type}
                onValueChange={(val) => setLogFilter((prev) => ({ ...prev, type: val }))}
              >
                <SelectTrigger className="h-8 text-[11px] bg-muted/20 border-white/5 focus:border-primary/50 transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-primary" />
                    <SelectValue placeholder="Tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">Todos os Eventos</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="project">Projetos</SelectItem>
                  <SelectItem value="finance">Finanças</SelectItem>
                  <SelectItem value="drive">Documentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <ActivityTimeline logs={filteredLogs as any} />
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2 grid gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Button
              variant="outline"
              className="h-40 flex-col gap-4 text-xl font-bold border-white/5 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:bg-primary/5 group transition-all"
              asChild
            >
              <Link to="/admin/leads">
                <div className="p-4 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-10 w-10 text-blue-500" />
                </div>
                Gestão Comercial
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-40 flex-col gap-4 text-xl font-bold border-white/5 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:bg-primary/5 group transition-all"
              asChild
            >
              <Link to="/admin/projects">
                <div className="p-4 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                  <Briefcase className="h-10 w-10 text-cyan-500" />
                </div>
                Gestão de Projetos
              </Link>
            </Button>
          </div>
          <Button
            variant="outline"
            className="h-40 gap-6 text-2xl font-black border-white/5 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:bg-primary/5 group transition-all"
            asChild
          >
            <Link to="/admin/finances">
              <div className="p-5 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Wallet className="h-12 w-12 text-primary" />
              </div>
              Controlo Financeiro & Cash Flow
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
