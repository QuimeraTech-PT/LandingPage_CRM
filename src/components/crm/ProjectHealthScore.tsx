import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HealthScoreProps {
  score: number;
  status: "Healthy" | "At Risk" | "Critical";
  rationale: string[];
}

export function ProjectHealthScore({ score, status, rationale }: HealthScoreProps) {
  const getStatusColor = () => {
    switch (status) {
      case "Healthy":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "At Risk":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "Critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Healthy":
        return <CheckCircle2 className="h-4 w-4" />;
      case "At Risk":
        return <TrendingUp className="h-4 w-4" />;
      case "Critical":
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-help",
              getStatusColor(),
            )}
          >
            {getStatusIcon()}
            <span>Health Score: {score}/100</span>
            <span className="opacity-60">•</span>
            <span className="uppercase tracking-widest text-[9px]">{status}</span>
            <Info className="h-3 w-3 ml-1 opacity-40" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-card border-white/10 text-foreground p-3 max-w-xs space-y-2">
          <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
            Rationale:
          </p>
          <ul className="space-y-1">
            {rationale.length > 0 ? (
              rationale.map((r, i) => (
                <li key={i} className="text-[11px] flex items-start gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {r}
                </li>
              ))
            ) : (
              <li className="text-[11px] italic text-muted-foreground">
                Project is performing well according to current metrics.
              </li>
            )}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
