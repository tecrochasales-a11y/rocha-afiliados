import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Loader2,
  Clock,
  CheckCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface Stats {
  totalAffiliates: number;
  totalLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  totalCommissions: number;
  pendingWithdrawals: number;
  pendingWithdrawalsAmount: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalAffiliates: 0,
    totalLeads: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    totalCommissions: 0,
    pendingWithdrawals: 0,
    pendingWithdrawalsAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);

    try {
      const { count: affiliatesCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { data: leadsData } = await supabase
        .from("leads")
        .select("status, sale_value, created_at, name")
        .order("created_at", { ascending: false });

      const { data: commissionsData } = await supabase
        .from("commissions")
        .select("amount, status");

      const { data: withdrawalsData } = await supabase
        .from("withdrawals")
        .select("amount, status")
        .eq("status", "pending");

      if (leadsData) {
        setAllLeads(leadsData);
        setStats({
          totalAffiliates: affiliatesCount || 0,
          totalLeads: leadsData.length,
          convertedLeads: leadsData.filter(l => l.status === "converted").length,
          pendingLeads: leadsData.filter(l => l.status === "pending").length,
          totalCommissions: commissionsData?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
          pendingWithdrawals: withdrawalsData?.length || 0,
          pendingWithdrawalsAmount: withdrawalsData?.reduce((sum, w) => sum + Number(w.amount), 0) || 0,
        });
        setRecentLeads(leadsData.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Build chart data from real leads grouped by month (last 6 months)
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx;
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthLeads = allLeads.filter(l => {
      const ld = new Date(l.created_at);
      return ld.getMonth() === month && ld.getFullYear() === year;
    });
    return {
      name: monthNames[month],
      leads: monthLeads.length,
      conversions: monthLeads.filter(l => l.status === "converted").length,
    };
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground">
            Visão geral do programa de afiliados
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Afiliados</p>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.totalAffiliates}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.totalLeads}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Convertidos</p>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.convertedLeads}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Comissões</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.totalCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Leads por Mês
              </CardTitle>
              <CardDescription>Evolução de leads nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" />
                Conversões por Mês
              </CardTitle>
              <CardDescription>Taxa de conversão mensal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="conversions" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Saques Pendentes
              </CardTitle>
              <CardDescription>
                {stats.pendingWithdrawals} saques aguardando aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-foreground">
                R$ {stats.pendingWithdrawalsAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total em saques pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Leads Recentes
              </CardTitle>
              <CardDescription>Últimas indicações recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum lead recente</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === "converted" 
                          ? "bg-secondary/10 text-secondary" 
                          : "bg-accent/10 text-accent"
                      }`}>
                        {lead.status === "converted" ? "Convertido" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
