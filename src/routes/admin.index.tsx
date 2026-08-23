import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCRMStats, getLeads, getActivityLogs } from "@/lib/crm.functions";
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

  const recentLeads = Array.isArray(leads.items) ? leads.items.slice(0, 5) : [];

  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return logs
      .filter((log) => {
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

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          CRM QuimeraTech
        </h1>
      </div>

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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Logs de Atividade
            </CardTitle>
            <div className="flex flex-col gap-2 mt-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar logs..."
                  className="pl-8 h-8 text-xs bg-muted/50 border-white/10"
                  value={logFilter.search}
                  onChange={(e) => setLogFilter((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <Select
                value={logFilter.type}
                onValueChange={(val) => setLogFilter((prev) => ({ ...prev, type: val }))}
              >
                <SelectTrigger className="h-8 text-xs bg-muted/50 border-white/10">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="project">Projetos</SelectItem>
                  <SelectItem value="drive">Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              {filteredLogs.map((log: ActivityLog) => (
                <div
                  key={log.id}
                  className="flex gap-3 text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <div
                    className={cn(
                      "mt-0.5 rounded-full p-1 h-fit",
                      log.status === "success"
                        ? "bg-green-500/10 text-green-500"
                        : log.status === "warning"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500",
                    )}
                  >
                    {log.status === "success" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : log.status === "warning" ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-foreground truncate capitalize">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      <span className="opacity-60">{log.entity_type}:</span>{" "}
                      {getLogDetail(log.details, "fileName") ||
                        getLogDetail(log.details, "projectName") ||
                        getLogDetail(log.details, "newName") ||
                        log.action}
                    </p>
                    <p className="text-[10px] text-muted-foreground opacity-60">
                      {new Date(log.created_at).toLocaleString("pt-PT")}
                    </p>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  Nenhum log encontrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex-col gap-3 text-lg border-primary/20 bg-primary/5 hover:bg-primary/10"
              asChild
            >
              <Link to="/admin/leads">
                <Users className="h-8 w-8 text-primary" />
                Gerir Leads
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex-col gap-3 text-lg border-primary/20 bg-primary/5 hover:bg-primary/10"
              asChild
            >
              <Link to="/admin/projects">
                <Briefcase className="h-8 w-8 text-primary" />
                Gerir Projetos
              </Link>
            </Button>
          </div>
          <Button
            variant="outline"
            className="h-32 gap-4 text-xl border-primary/20 bg-primary/5 hover:bg-primary/10"
            asChild
          >
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
