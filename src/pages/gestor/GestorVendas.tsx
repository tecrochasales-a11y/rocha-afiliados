import { useState, useMemo } from "react";
import { GestorLayout } from "@/components/gestor/GestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, DollarSign, TrendingUp, Users, BarChart3, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  contacted: "Contatado",
  qualified: "Qualificado",
  converted: "Convertido",
  lost: "Perdido",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  qualified: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const GestorVendas = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [affiliateFilter, setAffiliateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  // Fetch PDV IDs managed by this gestor
  const { data: pdvIds } = useQuery({
    queryKey: ["gestor-pdvs", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("pdv")
        .select("id")
        .eq("manager_id", user!.id);
      return data?.map((p) => p.id) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch affiliates in the PDV
  const { data: affiliates } = useQuery({
    queryKey: ["gestor-affiliates", pdvIds],
    queryFn: async () => {
      if (!pdvIds?.length) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("pdv_id", pdvIds);
      return data || [];
    },
    enabled: !!pdvIds?.length,
  });

  // Fetch leads from those affiliates
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["gestor-vendas-leads", affiliates?.map((a) => a.id)],
    queryFn: async () => {
      if (!affiliates?.length) return [];
      const affiliateIds = affiliates.map((a) => a.id);
      const { data } = await supabase
        .from("leads")
        .select("*")
        .in("affiliate_id", affiliateIds)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!affiliates?.length,
  });

  // Fetch commissions
  const { data: commissions } = useQuery({
    queryKey: ["gestor-vendas-commissions", affiliates?.map((a) => a.id)],
    queryFn: async () => {
      if (!affiliates?.length) return [];
      const affiliateIds = affiliates.map((a) => a.id);
      const { data } = await supabase
        .from("commissions")
        .select("*")
        .in("affiliate_id", affiliateIds);
      return data || [];
    },
    enabled: !!affiliates?.length,
  });

  // Period filter helper
  const getDateThreshold = (period: string) => {
    const now = new Date();
    if (period === "7d") return new Date(now.setDate(now.getDate() - 7));
    if (period === "30d") return new Date(now.setDate(now.getDate() - 30));
    if (period === "90d") return new Date(now.setDate(now.getDate() - 90));
    return null;
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      if (searchTerm && !lead.name.toLowerCase().includes(searchTerm.toLowerCase()) && !lead.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (affiliateFilter !== "all" && lead.affiliate_id !== affiliateFilter) return false;
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (periodFilter !== "all") {
        const threshold = getDateThreshold(periodFilter);
        if (threshold && new Date(lead.created_at) < threshold) return false;
      }
      return true;
    });
  }, [leads, searchTerm, affiliateFilter, statusFilter, periodFilter]);

  // Summary metrics
  const metrics = useMemo(() => {
    const convertedLeads = filteredLeads.filter((l) => l.status === "converted");
    const totalSaleValue = convertedLeads.reduce((sum, l) => sum + (l.sale_value || 0), 0);
    const totalConversions = convertedLeads.length;
    const conversionRate = filteredLeads.length > 0 ? (totalConversions / filteredLeads.length) * 100 : 0;

    const affiliateIds = filteredLeads.map((l) => l.affiliate_id).filter(Boolean);
    const totalCommissions = (commissions || [])
      .filter((c) => affiliateIds.includes(c.affiliate_id))
      .reduce((sum, c) => sum + c.amount, 0);

    return { totalSaleValue, totalConversions, conversionRate, totalCommissions, totalLeads: filteredLeads.length };
  }, [filteredLeads, commissions]);

  // Per-affiliate summary
  const affiliateSummary = useMemo(() => {
    if (!affiliates || !filteredLeads) return [];
    return affiliates.map((aff) => {
      const affLeads = filteredLeads.filter((l) => l.affiliate_id === aff.id);
      const converted = affLeads.filter((l) => l.status === "converted");
      const totalSales = converted.reduce((sum, l) => sum + (l.sale_value || 0), 0);
      const affCommissions = (commissions || []).filter((c) => c.affiliate_id === aff.id).reduce((sum, c) => sum + c.amount, 0);
      return {
        ...aff,
        totalLeads: affLeads.length,
        conversions: converted.length,
        totalSales,
        totalCommissions: affCommissions,
      };
    }).filter((a) => a.totalLeads > 0).sort((a, b) => b.totalSales - a.totalSales);
  }, [affiliates, filteredLeads, commissions]);

  const getAffiliateName = (id: string | null) => {
    if (!id || !affiliates) return "—";
    return affiliates.find((a) => a.id === id)?.full_name || "—";
  };

  const isLoading = leadsLoading;

  return (
    <GestorLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground">Acompanhe as vendas dos afiliados do seu PDV</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Vendido</p>
                  <p className="text-lg font-bold text-foreground">
                    R$ {metrics.totalSaleValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conversões</p>
                  <p className="text-lg font-bold text-foreground">{metrics.totalConversions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                  <p className="text-lg font-bold text-foreground">{metrics.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Leads</p>
                  <p className="text-lg font-bold text-foreground">{metrics.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
                <SelectTrigger><SelectValue placeholder="Afiliado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os afiliados</SelectItem>
                  {affiliates?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Per-affiliate summary */}
        {affiliateSummary.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumo por Afiliado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Afiliado</th>
                      <th className="pb-2 font-medium text-muted-foreground text-center">Leads</th>
                      <th className="pb-2 font-medium text-muted-foreground text-center">Conversões</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Total Vendido</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Comissões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliateSummary.map((aff) => (
                      <tr key={aff.id} className="border-b border-border/50">
                        <td className="py-3 font-medium text-foreground">{aff.full_name}</td>
                        <td className="py-3 text-center text-muted-foreground">{aff.totalLeads}</td>
                        <td className="py-3 text-center text-muted-foreground">{aff.conversions}</td>
                        <td className="py-3 text-right text-foreground">
                          R$ {aff.totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          R$ {aff.totalCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed leads table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalhamento de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum lead encontrado</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 font-medium text-muted-foreground">Lead</th>
                        <th className="pb-2 font-medium text-muted-foreground">Afiliado</th>
                        <th className="pb-2 font-medium text-muted-foreground">Status</th>
                        <th className="pb-2 font-medium text-muted-foreground text-right">Valor</th>
                        <th className="pb-2 font-medium text-muted-foreground text-right">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="border-b border-border/50">
                          <td className="py-3">
                            <p className="font-medium text-foreground">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </td>
                          <td className="py-3 text-muted-foreground">{getAffiliateName(lead.affiliate_id)}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className={statusColors[lead.status] || ""}>
                              {statusLabels[lead.status] || lead.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right text-foreground">
                            {lead.sale_value ? `R$ ${lead.sale_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className="border border-border rounded-xl p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{getAffiliateName(lead.affiliate_id)}</p>
                        </div>
                        <Badge variant="secondary" className={statusColors[lead.status] || ""}>
                          {statusLabels[lead.status] || lead.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="font-medium text-foreground">
                          {lead.sale_value ? `R$ ${lead.sale_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </GestorLayout>
  );
};

export default GestorVendas;
