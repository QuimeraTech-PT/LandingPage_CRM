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
import { 
  History, 
  Info, 
  Calendar, 
  Briefcase, 
  Wallet, 
  Folder,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus
} from "lucide-react";
import { ActivityTimeline } from "./ActivityTimeline";
import { ProjectFiles } from "./ProjectFiles";
import { useQuery } from "@tanstack/react-query";
import { getActivityLogs, getTasks } from "@/lib/crm.functions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["crm_projects"]["Row"] & {
  crm_leads: { name: string | null; company: string | null } | null;
  crm_finances: Array<{ amount: number; type: string }>;
  total_income: number;
  total_expenses: number;
};

interface ProjectDrawerProps {
  project: Project;
  open: boolean;
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export function ProjectDrawer({ project, open, onClose, onUpdate }: ProjectDrawerProps) {
  const { data: logs = [] } = useQuery({
    queryKey: ["crm-activity-logs", project.id],
    queryFn: () => getActivityLogs({ data: { entityType: "project", limit: 50 } }),
    enabled: open,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["crm-tasks", project.id],
    queryFn: () => getTasks({ data: { projectId: project.id } }),
    enabled: open,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onUpdate({
      id: project.id,
      name: formData.get("name") as string,
      status: formData.get("status") as any,
      budget: Number(formData.get("budget")),
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
    });
  };

  const budgetUsage = (project.total_expenses / (project.budget || 1)) * 100;
  const margin = project.total_income - project.total_expenses;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl bg-card border-white/10 text-foreground overflow-y-auto custom-scrollbar">
        <SheetHeader className="pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-2xl font-black tracking-tight truncate">{project.name}</SheetTitle>
              <div className="flex items-center gap-2">
                <SheetDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                  CLIENTE: {project.crm_leads?.name || "N/A"}
                </SheetDescription>
                <Badge variant="outline" className="text-[9px] h-4 py-0 border-white/10">
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="bg-muted/20 border border-white/5 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="gap-2 shrink-0">
              <Info className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 shrink-0">
              <Calendar className="h-4 w-4" /> Tarefas
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2 shrink-0">
              <Folder className="h-4 w-4" /> Ficheiros
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2 shrink-0">
              <Wallet className="h-4 w-4" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2 shrink-0">
              <History className="h-4 w-4" /> Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/10 border-white/5 p-4 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orçamento</p>
                <p className="text-2xl font-black">{new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(project.budget || 0)}</p>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", budgetUsage > 90 ? "bg-red-500" : "bg-primary")} 
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }} 
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground text-right">{budgetUsage.toFixed(1)}% utilizado</p>
                </div>
              </Card>
              <Card className="bg-muted/10 border-white/5 p-4 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Margem</p>
                <p className={cn("text-2xl font-black", margin >= 0 ? "text-green-500" : "text-red-500")}>
                  {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(margin)}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Baseado em faturas pagas</span>
                </div>
              </Card>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground">Nome do Projeto</Label>
                    <Input id="name" name="name" defaultValue={project.name} className="bg-muted/20 border-white/5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs uppercase font-bold text-muted-foreground">Estado</Label>
                    <Select name="status" defaultValue={project.status}>
                      <SelectTrigger className="bg-muted/20 border-white/5 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-foreground">
                        <SelectItem value="planning">Planeamento</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="on_hold">Em Pausa</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-xs uppercase font-bold text-muted-foreground">Data Início</Label>
                    <Input id="start_date" name="start_date" type="date" defaultValue={project.start_date || ""} className="bg-muted/20 border-white/5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-xs uppercase font-bold text-muted-foreground">Deadline</Label>
                    <Input id="end_date" name="end_date" type="date" defaultValue={project.end_date || ""} className="bg-muted/20 border-white/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-xs uppercase font-bold text-muted-foreground">Orçamento (€)</Label>
                  <Input id="budget" name="budget" type="number" defaultValue={project.budget || 0} className="bg-muted/20 border-white/5" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3">
                <Button type="submit" className="flex-1 shadow-lg shadow-primary/20">Guardar Alterações</Button>
                <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6 space-y-4">
             <Button variant="outline" className="w-full gap-2 border-dashed border-primary/30 hover:bg-primary/5">
                <Plus className="h-4 w-4" /> Nova Tarefa
              </Button>
              <div className="space-y-3">
                {tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted/10 border border-white/5 rounded-xl group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-lg", task.status === 'done' ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary")}>
                        {task.status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{task.title}</p>
                        <p className="text-[10px] text-muted-foreground">{task.due_date ? `Deadline: ${new Date(task.due_date).toLocaleDateString("pt-PT")}` : 'Sem data'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-white/5">{task.priority}</Badge>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground opacity-30 italic text-xs">Nenhuma tarefa.</div>
                )}
              </div>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <ProjectFiles folderId={project.google_drive_folder_id} projectId={project.id} />
          </TabsContent>

          <TabsContent value="finance" className="mt-6 space-y-4">
            <div className="flex flex-col gap-3">
              {project.crm_finances?.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/10 border border-white/5 rounded-xl">
                  <div>
                    <p className="text-xs font-bold">{f.type === 'income' ? 'Receita' : 'Despesa'}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">Transação Financeira</p>
                  </div>
                  <p className={cn("font-mono font-bold", f.type === 'income' ? "text-green-500" : "text-red-500")}>
                    {f.type === 'income' ? '+' : '-'}{new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(f.amount)}
                  </p>
                </div>
              ))}
              {(!project.crm_finances || project.crm_finances.length === 0) && (
                <div className="text-center py-12 text-muted-foreground opacity-30 italic text-xs">Sem transações.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ActivityTimeline logs={logs as any} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
