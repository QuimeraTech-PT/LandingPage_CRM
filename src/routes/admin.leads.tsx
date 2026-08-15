import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getLeads } from '@/lib/crm.functions';
import { Users, Plus, MoreHorizontal, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/admin/leads')({
  component: LeadsPage,
});

function LeadsPage() {
  const { data: leads } = useSuspenseQuery({
    queryKey: ['crm-leads'],
    queryFn: () => getLeads(),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      new: "default",
      contacted: "secondary",
      proposal: "secondary",
      negotiation: "secondary",
      closed_won: "outline",
      closed_lost: "destructive"
    };
    
    const labels: Record<string, string> = {
      new: "Novo",
      contacted: "Contactado",
      proposal: "Proposta",
      negotiation: "Negociação",
      closed_won: "Ganho",
      closed_lost: "Perdido"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Gestão de Leads
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Lead
        </Button>
      </div>

      <div className="grid gap-4">
        {leads?.map((lead) => (
          <Card key={lead.id} className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{lead.name}</h3>
                    {getStatusBadge(lead.status)}
                    {lead.estimated_value && Number(lead.estimated_value) > 0 && (
                      <span className="text-sm font-medium text-primary">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(lead.estimated_value))}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                    {lead.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {lead.company}
                      </div>
                    )}
                  </div>

                  {lead.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 p-3 rounded-lg border border-white/5">
                      {lead.notes}
                    </p>
                  )}
                </div>

                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {leads?.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Nenhuma lead encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
