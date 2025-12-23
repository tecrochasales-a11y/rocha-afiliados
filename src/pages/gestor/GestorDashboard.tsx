import { useState, useEffect } from "react";
import { GestorLayout } from "@/components/gestor/GestorLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Loader2,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock
} from "lucide-react";

interface Stats {
  totalAffiliates: number;
  totalLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  totalCommissions: number;
}

const GestorDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalAffiliates: 0,
    totalLeads: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    totalCommissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user && profile) {
      fetchStats();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchStats = async () => {
    if (!profile?.pdv_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Get affiliates in this PDV
      const { data: affiliates } = await supabase
        .from("profiles")
        .select("id")
        .eq("pdv_id", profile.pdv_id);

      const affiliateIds = affiliates?.map(a => a.id) || [];
      
      if (affiliateIds.length === 0) {
        setStats({
          totalAffiliates: 0,
          totalLeads: 0,
          convertedLeads: 0,
          pendingLeads: 0,
          totalCommissions: 0,
        });
        setIsLoading(false);
        return;
      }

      // Get leads from these affiliates
      const { data: leads } = await supabase
        .from("leads")
        .select("status, sale_value")
        .in("affiliate_id", affiliateIds);

      // Get commissions
      const { data: commissions } = await supabase
        .from("commissions")
        .select("amount, status")
        .in("affiliate_id", affiliateIds);

      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(l => l.status === "converted").length || 0;
      const pendingLeads = leads?.filter(l => l.status === "pending").length || 0;
      const totalCommissions = commissions
        ?.filter(c => c.status === "paid")
        .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      setStats({
        totalAffiliates: affiliateIds.length,
        totalLeads,
        convertedLeads,
        pendingLeads,
        totalCommissions,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <GestorLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </GestorLayout>
    );
  }

  if (!profile?.pdv_id) {
    return (
      <GestorLayout>
        <div className="p-6 lg:p-8">
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">
              Nenhum PDV Atribuído
            </h2>
            <p className="text-muted-foreground">
              Você ainda não está vinculado a nenhum Ponto de Venda.
              Entre em contato com o administrador.
            </p>
          </div>
        </div>
      </GestorLayout>
    );
  }

  return (
    <GestorLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Dashboard do Gestor
          </h1>
          <p className="text-muted-foreground">
            Acompanhe a performance do seu PDV
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Afiliados</p>
            <p className="text-2xl font-heading font-bold text-foreground">{stats.totalAffiliates}</p>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
            <p className="text-2xl font-heading font-bold text-foreground">{stats.totalLeads}</p>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Convertidos</p>
            <p className="text-2xl font-heading font-bold text-foreground">{stats.convertedLeads}</p>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
            <p className="text-2xl font-heading font-bold text-foreground">{stats.pendingLeads}</p>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Comissões Pagas</p>
            <p className="text-2xl font-heading font-bold text-foreground">
              R$ {stats.totalCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Taxa de Conversão
            </h3>
          </div>
          <div className="flex items-end gap-4">
            <p className="text-4xl font-heading font-bold text-foreground">
              {stats.totalLeads > 0 
                ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1)
                : 0
              }%
            </p>
            <p className="text-muted-foreground mb-1">
              {stats.convertedLeads} de {stats.totalLeads} leads convertidos
            </p>
          </div>
        </div>
      </div>
    </GestorLayout>
  );
};

export default GestorDashboard;