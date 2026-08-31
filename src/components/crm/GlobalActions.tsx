import { Plus, Users, Building2, Briefcase, CheckSquare, Ticket, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

export function GlobalActions() {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform bg-primary"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-white/10 p-2 mb-4">
          <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-2 py-1.5">
            Ações Rápidas
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />

          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
            <Link to="/admin/leads">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Nova Lead</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
            <Link to="/admin/companies">
              <Building2 className="h-4 w-4 text-orange-500" />
              <span>Nova Empresa</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
            <Link to="/admin/projects">
              <Briefcase className="h-4 w-4 text-cyan-500" />
              <span>Novo Projeto</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
            <Link to="/admin/tasks">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span>Nova Tarefa</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
            <Link to="/admin/support">
              <Ticket className="h-4 w-4 text-purple-500" />
              <span>Novo Ticket</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
