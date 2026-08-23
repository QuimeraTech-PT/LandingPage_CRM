import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface CRMStatsProps {
  stats: {
    totalLeads: number;
    activeProjects: number;
    revenue: number;
    profit: number;
    conversionRate: number;
    avgBudget: number;
    pendingPayments: number;
    upcomingDeadlines: number;
  };
}

export function CRMStats({ stats }: CRMStatsProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

  const statCards = [
    {
      title: "Pipeline de Leads",
      value: stats.totalLeads,
      description: "Total de contactos",
      icon: Users,
      trend: `${stats.conversionRate.toFixed(1)}% conv.`,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Operação Ativa",
      value: stats.activeProjects,
      description: `${stats.upcomingDeadlines} prazos próximos`,
      icon: Briefcase,
      trend: "Produção",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Faturação Líquida",
      value: formatCurrency(stats.revenue),
      description: "Valor recebido",
      icon: TrendingUp,
      trend: `+${formatCurrency(stats.pendingPayments)} pend.`,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Profitabilidade",
      value: formatCurrency(stats.profit),
      description: `Média ${formatCurrency(stats.avgBudget)} / proj`,
      icon: Wallet,
      trend: "Líquido",
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-110 opacity-50`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} relative z-10`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">
                  {stat.description}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                <div className={`h-1.5 w-1.5 rounded-full ${stat.color} animate-pulse`} />
                <span className={`text-[10px] font-bold ${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
