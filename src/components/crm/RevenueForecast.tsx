import { useSuspenseQuery } from "@tanstack/react-query";
import { getRevenueForecast } from "@/lib/finances.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, ShieldCheck } from "lucide-react";
import React from "react";

export function RevenueForecast() {
  const { data: forecast } = useSuspenseQuery({
    queryKey: ["crm-revenue-forecast"],
    queryFn: () => getRevenueForecast(),
  });

  const totalProjected = forecast.confirmedRevenue + forecast.probableRevenue;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Previsão de Receita (6 Meses)
        </CardTitle>
        <Badge variant="outline" className="text-primary border-primary/20">
          Estimativa
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-green-500" />
              Confirmado
            </div>
            <div className="text-xl font-bold">
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                forecast.confirmedRevenue,
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3 w-3 text-primary" />
              Provável (Funil)
            </div>
            <div className="text-xl font-bold opacity-80">
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                forecast.probableRevenue,
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Projetado</span>
            <span className="font-bold text-primary">
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                totalProjected,
              )}
            </span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${totalProjected ? (forecast.confirmedRevenue / totalProjected) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-primary/40 transition-all"
              style={{ width: `${totalProjected ? (forecast.probableRevenue / totalProjected) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            * Baseado em leads ganhos e probabilidade de conversão no funil atual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: "outline";
  className?: string;
}) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}>
      {children}
    </span>
  );
}
