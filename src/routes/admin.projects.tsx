import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Briefcase, Plus, Folder, ExternalLink, Calendar, Users as UsersIcon, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProjects } from '@/lib/crm.functions';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/projects')({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery({
    queryKey: ['crm-projects'],
    queryFn: () => getProjects(),
  });

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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-primary" />
          Gestão de Projetos
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectList.map((project: any) => (
          <Card key={project.id} className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-colors flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                {getStatusBadge(project.status)}
                {project.google_drive_folder_id && (
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                     <a href={`https://drive.google.com/drive/folders/${project.google_drive_folder_id}`} target="_blank" rel="noopener noreferrer">
                       <Folder className="h-4 w-4" />
                     </a>
                   </Button>
                )}
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

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rentabilidade:</span>
                  <span className={cn(
                    "font-bold",
                    (project.total_income - project.total_expenses) >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(project.total_income - project.total_expenses)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                    <Link to="/admin/finances">
                      Ver Finanças
                      <TrendingUp className="h-3 w-3" />
                    </Link>
                  </Button>
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
    </div>
  );
}
