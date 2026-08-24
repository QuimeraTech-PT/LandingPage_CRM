import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTask, createTask } from "@/lib/crm.tasks.functions";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  User,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/tasks")({
  component: TasksPage,
});

type Task = Database["public"]["Tables"]["crm_tasks"]["Row"];

function TasksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: tasks } = useSuspenseQuery({
    queryKey: ["crm-tasks", search],
    queryFn: () => getTasks({ data: { search } }),
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });
      toast.success("Tarefa atualizada.");
    },
  });

  const handleDragEnd = (taskId: string, newStatus: string) => {
    updateMutation.mutate({ data: { id: taskId, status: newStatus as any } });
  };

  const kanbanColumns = [
    { 
      id: "todo", 
      title: "A Fazer", 
      items: (tasks || []).filter(t => t.status === 'todo').map(t => ({ id: t.id, title: t.title, status: t.status, data: t })),
      renderItem: (item: any) => <TaskCard task={item.data} />
    },
    { 
      id: "in_progress", 
      title: "Em Progresso", 
      items: (tasks || []).filter(t => t.status === 'in_progress').map(t => ({ id: t.id, title: t.title, status: t.status, data: t })),
      renderItem: (item: any) => <TaskCard task={item.data} />
    },
    { 
      id: "review", 
      title: "Revisão", 
      items: (tasks || []).filter(t => t.status === 'review').map(t => ({ id: t.id, title: t.title, status: t.status, data: t })),
      renderItem: (item: any) => <TaskCard task={item.data} />
    },
    { 
      id: "done", 
      title: "Concluído", 
      items: (tasks || []).filter(t => t.status === 'done').map(t => ({ id: t.id, title: t.title, status: t.status, data: t })),
      renderItem: (item: any) => <TaskCard task={item.data} />
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-8 p-8 animate-in fade-in duration-700 overflow-hidden">
      <header className="flex flex-col gap-1 shrink-0">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <CheckSquare className="h-8 w-8 text-primary" />
          Kanban de Tarefas
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Gestão de produtividade e fluxo de trabalho da equipa.
        </p>
      </header>

      <div className="flex items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl shrink-0">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar tarefas..." 
              className="pl-10 bg-muted/20 border-white/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 border-white/5">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button className="gap-2 h-10 px-6 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard
          columns={kanbanColumns}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const priorityColors = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  return (
    <Card className="bg-card border-white/10 hover:border-primary/50 transition-all shadow-sm group relative overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <Badge 
            variant="outline" 
            className={cn("text-[9px] uppercase font-bold py-0 h-4", priorityColors[task.priority as keyof typeof priorityColors] || "")}
          >
            {task.priority}
          </Badge>
          <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 italic opacity-80">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3 text-primary/70" />
            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString("pt-PT") : "Sem data"}</span>
          </div>
          <div className="flex -space-x-2">
            <div className="h-5 w-5 rounded-full bg-primary/20 border border-card flex items-center justify-center">
              <User className="h-3 w-3 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
