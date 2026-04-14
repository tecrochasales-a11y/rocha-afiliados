import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Loader2,
  Bell,
  CheckCircle,
  XCircle,
  DollarSign,
  Megaphone,
  Info,
  CheckCheck,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const Notificacoes = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchNotifications();
    }
  }, [user, authLoading, navigate]);

  const fetchNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );

      toast({
        title: "Todas marcadas como lidas",
        description: "Suas notificações foram atualizadas.",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "lead_converted":
        return <CheckCircle className="w-5 h-5 text-secondary" />;
      case "lead_lost":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "commission_released":
        return <DollarSign className="w-5 h-5 text-secondary" />;
      case "withdrawal_approved":
        return <DollarSign className="w-5 h-5 text-primary" />;
      case "campaign":
        return <Megaphone className="w-5 h-5 text-accent" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "lead_converted":
        return "Indicação Convertida";
      case "lead_lost":
        return "Indicação Perdida";
      case "commission_released":
        return "Comissão Liberada";
      case "withdrawal_approved":
        return "Saque Aprovado";
      case "campaign":
        return "Campanha";
      default:
        return "Informação";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Title */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                Notificações
              </h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 
                  ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                  : "Todas as notificações foram lidas"
                }
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Marcar todas como lidas</span>
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border shadow-soft p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-muted-foreground">
                Você será notificado sobre atualizações das suas indicações aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-card rounded-2xl border shadow-soft p-5 transition-all duration-300 hover-lift ${
                    !notification.is_read 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-border"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      notification.type === "lead_converted" ? "bg-secondary/10" :
                      notification.type === "lead_lost" ? "bg-destructive/10" :
                      notification.type === "commission_released" ? "bg-secondary/10" :
                      notification.type === "withdrawal_approved" ? "bg-primary/10" :
                      notification.type === "campaign" ? "bg-accent/10" :
                      "bg-muted"
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {getTypeLabel(notification.type)}
                          </span>
                          <h3 className={`font-medium mt-1 ${
                            !notification.is_read ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {notification.title}
                          </h3>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex-shrink-0"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground/70 mt-3">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notificacoes;