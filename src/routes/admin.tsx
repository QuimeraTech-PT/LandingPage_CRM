import { createFileRoute, redirect, Link, Outlet, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Wallet, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Building2,
  CheckSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/auth" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Leads", icon: Users, href: "/admin/leads" },
    { label: "Empresas", icon: Building2, href: "/admin/companies" },
    { label: "Projetos", icon: Briefcase, href: "/admin/projects" },
    { label: "Tarefas", icon: CheckSquare, href: "/admin/tasks" },
    { label: "Finanças", icon: Wallet, href: "/admin/finances" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "relative z-40 flex flex-col border-r border-white/5 bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          {isSidebarOpen ? (
            <Link to="/admin" className="transition-all">
              <Logo size="sm" />
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">Q</div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                location.pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isSidebarOpen ? "" : "mx-auto")} />
              {isSidebarOpen && <span>{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-2 hidden rounded bg-popover px-2 py-1 text-xs text-popover-foreground group-hover:block whitespace-nowrap z-50 shadow-xl border border-white/10">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4 space-y-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
              !isSidebarOpen && "justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Sair</span>}
          </Button>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-card text-muted-foreground hover:text-primary shadow-lg transition-all"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background custom-scrollbar relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="mx-auto max-w-7xl min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
