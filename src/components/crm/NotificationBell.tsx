import { type ReactNode } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationAsRead } from "@/lib/crm.functions";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

type Notification = {
  id: string | number;
  read: boolean | null;
  type: "success" | "warning" | "error" | "info" | string;
  title: string;
  message: string;
  created_at: string | null;
  link?: string | null;
  user_id?: string | null;
};

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: string;
};

export function NotificationBell() {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["crm-notifications"],
    queryFn: () => getNotifications(),
    refetchInterval: 30000, // Refresh every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-notifications"] });
    },
  });

  const unreadCount = notifications.filter(
    (notification: Notification) => !notification.read,
  ).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card border-white/10 p-0 shadow-2xl">
        <DropdownMenuLabel className="p-4 flex items-center justify-between">
          <span className="text-sm font-black tracking-tight uppercase">Notificações</span>
          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] bg-primary/10 text-primary border-primary/20"
            >
              {unreadCount} Novas
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 m-0" />
        <div className="max-h-100 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-xs">
              Sem notificações no momento.
            </div>
          ) : (
            notifications.map((n: Notification) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors",
                  !n.read && "bg-primary/5",
                )}
                onClick={() => !n.read && markReadMutation.mutate({ data: { id: n.id } })}
              >
                <div className="flex items-center gap-2 w-full">
                  {getIcon(n.type)}
                  <span
                    className={cn(
                      "text-xs font-bold flex-1 truncate",
                      !n.read ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {n.title}
                  </span>
                  {!n.read && (
                    <div className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/40" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-6">
                  {n.message}
                </p>
                <div className="flex items-center justify-between w-full mt-2 pl-6">
                  <span className="text-[10px] text-muted-foreground/60">
                    {n.created_at
                      ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: pt })
                      : "Data indisponível"}
                  </span>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="bg-white/5 m-0" />
        <Button
          variant="ghost"
          className="w-full text-xs text-muted-foreground rounded-none hover:bg-white/5 py-3"
        >
          Ver Todas
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Badge({ children, className, variant }: BadgeProps) {
  const variantClass = variant === "outline" ? "border" : "";

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", variantClass, className)}>
      {children}
    </span>
  );
}
