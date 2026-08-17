import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Briefcase, Plus, Folder, ExternalLink, Calendar, Users as UsersIcon, TrendingUp, Edit2, History, LayoutList, Kanban as KanbanIcon } from 'lucide-react';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProjects, updateProject } from '@/lib/crm.functions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProjectFiles } from '@/components/crm/ProjectFiles';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/admin/projects')({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [openFiles, setOpenFiles] = useState<Record<string, boolean>>({});
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const queryClient = useQueryClient();
  
  const { data: projects } = useSuspenseQuery({
    queryKey: ['crm-projects'],
    queryFn: () => getProjects(),
  });

  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-projects'] });
      setEditingProject(null);
      toast.success('Projeto atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar projeto.')
  });

  const toggleFiles = (id: string) => {
    setOpenFiles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;
    const formData = new FormData(e.currentTarget);
    updateProjectMutation.mutate({
      data: {
        id: editingProject.id,
        name: formData.get('name') as string,
        status: formData.get('status') as any,
        google_drive_folder_id: formData.get('folder_id') as string,
        start_date: formData.get('start_date') as string,
        budget: Number(formData.get('budget')),
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      planning: "outline",
      active: "default",
      on_hold: "secondary",
      completed: "outline",
      cancelled: "destructive"
    };
    
    const labels: Record<string, string> = {
      planning: "Planeamento",
      active: "Ativo",
      on_hold: "Em Pausa",
      completed: "Concluído",
      cancelled: "Cancelado"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const projectList = Array.isArray(projects) ? projects : [];

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            Gestão de Projetos
          </h1>
          
          <div className="flex items-center bg-muted/30 rounded-lg p-1 border border-white/5">
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
              Lista
            </Button>
            <Button 
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setViewMode('kanban')}
            >
              <KanbanIcon className="h-4 w-4" />
              Kanban
            </Button>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {viewMode === 'list' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project: any) => (
            <Card key={project.id} className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(project.status)}
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {project.google_drive_folder_id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                        <a href={`https://drive.google.com/drive/folders/${project.google_drive_folder_id}`} target="_blank" rel="noopener noreferrer">
                          <Folder className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="h-4 w-4" />
                    <span>{project.crm_leads?.name || 'Cliente Genérico'}</span>
                  </div>
                  {project.start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Início: {new Date(project.start_date).toLocaleDateString('pt-PT')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Consumo do Orçamento:</span>
                      <span className={cn(
                        "font-medium",
                        project.total_expenses > project.budget ? "text-red-500" : "text-muted-foreground"
                      )}>
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(project.total_expenses)} / {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(project.budget || 0)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          project.total_expenses > project.budget ? "bg-red-500" : 
                          project.total_expenses > (project.budget * 0.8) ? "bg-yellow-500" : "bg-primary"
                        )}
                        style={{ width: `${Math.min((project.total_expenses / (project.budget || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    {project.total_expenses > project.budget && (
                      <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse">
                        <AlertTriangle className="h-3 w-3" />
                        ORÇAMENTO ULTRAPASSADO
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margem Atual:</span>
                    <span className={cn(
                      "font-bold",
                      (project.total_income - project.total_expenses) >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(project.total_income - project.total_expenses)}
                    </span>
                  </div>

                  <Collapsible 
                    open={openFiles[project.id]} 
                    onOpenChange={() => toggleFiles(project.id)}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between px-2 text-xs hover:bg-white/5">
                        <div className="flex items-center gap-2">
                          <Folder className="h-3 w-3 text-primary" />
                          <span>Documentos e Ficheiros</span>
                        </div>
                        {openFiles[project.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <ProjectFiles folderId={project.google_drive_folder_id} projectId={project.id} />
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                      <Link to="/admin/finances">
                        Finanças
                        <TrendingUp className="h-3 w-3" />
                      </Link>
                    </Button>
                    {project.google_drive_folder_id && (
                      <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                        <a href={`https://drive.google.com/drive/folders/${project.google_drive_folder_id}`} target="_blank" rel="noopener noreferrer">
                          Drive
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {projectList.length === 0 && (
            <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-xl">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
            </div>
          )}
        </div>
      ) : (
        <KanbanBoard 
          columns={[
            { id: 'planning', title: 'Planeamento', items: projectList.filter(p => p.status === 'planning').map(p => ({ id: p.id, title: p.name, status: p.status, data: p })) || [], renderItem: (item) => <ProjectKanbanCard project={item.data} onEdit={() => setEditingProject(item.data)} /> },
            { id: 'active', title: 'Ativo', items: projectList.filter(p => p.status === 'active').map(p => ({ id: p.id, title: p.name, status: p.status, data: p })) || [], renderItem: (item) => <ProjectKanbanCard project={item.data} onEdit={() => setEditingProject(item.data)} /> },
            { id: 'on_hold', title: 'Em Pausa', items: projectList.filter(p => p.status === 'on_hold').map(p => ({ id: p.id, title: p.name, status: p.status, data: p })) || [], renderItem: (item) => <ProjectKanbanCard project={item.data} onEdit={() => setEditingProject(item.data)} /> },
            { id: 'completed', title: 'Concluído', items: projectList.filter(p => p.status === 'completed').map(p => ({ id: p.id, title: p.name, status: p.status, data: p })) || [], renderItem: (item) => <ProjectKanbanCard project={item.data} onEdit={() => setEditingProject(item.data)} /> },
          ]}
          onDragEnd={(projectId, newStatus) => updateProjectMutation.mutate({ data: { id: projectId, status: newStatus as any } })}
        />
      )}

      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-foreground">
          {editingProject && (
            <form onSubmit={handleUpdateProject}>
              <DialogHeader>
                <DialogTitle>Editar Projeto</DialogTitle>
                <DialogDescription>
                  Altere os detalhes do projeto e a associação ao Drive.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome do Projeto</Label>
                  <Input id="edit-name" name="name" defaultValue={editingProject.name} required className="bg-muted/50 border-white/10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select name="status" defaultValue={editingProject.status}>
                    <SelectTrigger className="bg-muted/50 border-white/10">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planeamento</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="on_hold">Em Pausa</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-folder">ID da Pasta Google Drive</Label>
                  <Input id="edit-folder" name="folder_id" defaultValue={editingProject.google_drive_folder_id} className="bg-muted/50 border-white/10" placeholder="ID da pasta no URL do Drive" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-start">Data de Início</Label>
                  <Input id="edit-start" name="start_date" type="date" defaultValue={editingProject.start_date} className="bg-muted/50 border-white/10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-budget">Orçamento Previsto (€)</Label>
                  <Input id="edit-budget" name="budget" type="number" step="0.01" defaultValue={editingProject.budget} className="bg-muted/50 border-white/10" placeholder="0.00" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setEditingProject(null)}>Cancelar</Button>
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectKanbanCard({ project, onEdit }: { project: any, onEdit: () => void }) {
  return (
    <Card className="bg-card border-white/10 hover:border-primary/50 transition-colors shadow-sm select-none">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm line-clamp-1">{project.name}</h4>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <UsersIcon className="h-3 w-3" />
            {project.crm_leads?.name || 'Cliente'}
          </p>
          <p className={cn(
            "text-xs font-bold",
            (project.total_income - project.total_expenses) >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(project.total_income - project.total_expenses)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
