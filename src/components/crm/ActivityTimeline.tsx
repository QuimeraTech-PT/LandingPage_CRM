import React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  UserPlus,
  Briefcase,
  TrendingUp,
  Mail,
  Phone,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database, Json } from "@/integrations/supabase/types";

type ActivityLog = Database["public"]["Tables"]["crm_activity_logs"]["Row"];

interface ActivityTimelineProps {
  logs: ActivityLog[];
  className?: string;
}

const getIcon = (action: string, type: string) => {
  if (action.includes("convert")) return UserPlus;
  if (action.includes("create")) return FileText;
  if (action.includes("update")) return Settings;
  if (type === "project") return Briefcase;
  if (type === "finance") return TrendingUp;
  if (action.includes("mail")) return Mail;
  if (action.includes("call")) return Phone;
  return History;
};

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "success": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "warning": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "failure": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "bg-primary/10 text-primary border-primary/20";
  }
};

const formatValue = (value: Json | null): string => {
  if (value === null) return "Nulo";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export function ActivityTimeline({ logs, className }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-30 border-2 border-dashed border-white/5 rounded-2xl">
        <History className="h-10 w-10 mb-2" />
        <p className="text-xs italic">Nenhuma atividade registada.</p>
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/10 before:to-transparent", className)}>
      {logs.map((log, idx) => {
        const Icon = getIcon(log.action, log.entity_type);
        
        return (
          <div key={log.id} className="relative flex items-start gap-6 group">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10 z-10",
              getStatusColor(log.status)
            )}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                  {log.action.replace(/_/g, " ")}
                </p>
                <time className="text-[10px] text-muted-foreground font-mono">
                  {format(new Date(log.created_at), "dd MMM, HH:mm", { locale: pt })}
                </time>
              </div>
              
              <div className="bg-card/30 rounded-xl p-3 border border-white/5 group-hover:border-primary/20 transition-all">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground/80">{log.entity_type}</span>:{" "}
                  {log.action === "update" && log.old_value && log.new_value ? (
                    <span>
                      Alterou de <span className="text-red-400/80 italic">{formatValue(log.old_value)}</span> para{" "}
                      <span className="text-green-400/80 font-bold">{formatValue(log.new_value)}</span>
                    </span>
                  ) : (
                    <span>{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
