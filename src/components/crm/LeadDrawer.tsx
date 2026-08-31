import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, MessageSquare, Info, Settings, Calendar, Briefcase, Plus } from "lucide-react";
import { ActivityTimeline } from "./ActivityTimeline";
import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "@/lib/crm.functions";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["crm_leads"]["Row"];

interface LeadDrawerProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<Lead>) => void;
}

export function LeadDrawer({ lead, open, onClose, onUpdate }: LeadDrawerProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onUpdate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      notes: formData.get("notes") as string,
      status: formData.get("status") as Lead["status"],
      estimated_value: Number(formData.get("estimated_value")),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl bg-card border-white/10 text-foreground overflow-y-auto custom-scrollbar">
        <SheetHeader className="pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black tracking-tight">{lead.name}</SheetTitle>
              <SheetDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                ID: {lead.id.split("-")[0]}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="bg-muted/20 border border-white/5 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <Info className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <History className="h-4 w-4" /> Atividade
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <Calendar className="h-4 w-4" /> Tarefas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs uppercase font-bold text-muted-foreground"
                  >
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={lead.name}
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-xs uppercase font-bold text-muted-foreground"
                  >
                    Estado
                  </Label>
                  <Select name="status" defaultValue={lead.status}>
                    <SelectTrigger className="bg-muted/20 border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="proposal">Proposta</SelectItem>
                      <SelectItem value="negotiation">Negociação</SelectItem>
                      <SelectItem value="closed_won">Ganho</SelectItem>
                      <SelectItem value="closed_lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase font-bold text-muted-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    defaultValue={lead.email || ""}
                    className="bg-muted/20 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="text-xs uppercase font-bold text-muted-foreground"
                  >
                    Empresa
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={lead.company || ""}
                    className="bg-muted/20 border-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="estimated_value"
                  className="text-xs uppercase font-bold text-muted-foreground"
                >
                  Valor Estimado (€)
                </Label>
                <Input
                  id="estimated_value"
                  name="estimated_value"
                  type="number"
                  defaultValue={lead.estimated_value || 0}
                  className="bg-muted/20 border-white/5 font-mono text-primary"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-xs uppercase font-bold text-muted-foreground"
                >
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={lead.notes || ""}
                  className="bg-muted/20 border-white/5 min-h-37.5 italic text-sm"
                  placeholder="Observações importantes sobre o cliente..."
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3">
                <Button type="submit" className="flex-1 shadow-lg shadow-primary/20">
                  Guardar Alterações
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ActivityTimelineWrapper leadId={lead.id} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-primary/30 hover:bg-primary/5"
              >
                <Plus className="h-4 w-4" /> Adicionar Tarefa
              </Button>
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-30">
                <Calendar className="h-10 w-10 mb-2" />
                <p className="text-xs italic">Sem tarefas pendentes.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function ActivityTimelineWrapper({ leadId }: { leadId: string }) {
  const { data: logs = [] } = useQuery({
    queryKey: ["crm-activity-logs", leadId],
    queryFn: () => getActivityLogs({ data: { entityType: "lead", limit: 50 } }),
  });

  return <ActivityTimeline logs={logs} />;
}
