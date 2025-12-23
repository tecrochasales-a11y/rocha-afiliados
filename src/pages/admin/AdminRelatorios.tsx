import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, CalendarIcon, TrendingUp, Users, Target, DollarSign, FileText, Filter } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const AdminRelatorios = () => {
  const [reportType, setReportType] = useState<string>("geral");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch affiliates data
  const { data: affiliates } = useQuery({
    queryKey: ["admin-report-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch leads data
  const { data: leads } = useQuery({
    queryKey: ["admin-report-leads", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*, profiles:affiliate_id(full_name), products:product_id(name)");
      
      if (dateRange?.from) {
        query = query.gte("created_at", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte("created_at", dateRange.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch commissions data
  const { data: commissions } = useQuery({
    queryKey: ["admin-report-commissions", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("commissions")
        .select("*, profiles:affiliate_id(full_name)");
      
      if (dateRange?.from) {
        query = query.gte("created_at", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte("created_at", dateRange.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch withdrawals data
  const { data: withdrawals } = useQuery({
    queryKey: ["admin-report-withdrawals", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("withdrawals")
        .select("*, profiles:affiliate_id(full_name)");
      
      if (dateRange?.from) {
        query = query.gte("requested_at", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte("requested_at", dateRange.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch PDVs data
  const { data: pdvs } = useQuery({
    queryKey: ["admin-report-pdvs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pdv")
        .select("*, profiles:manager_id(full_name)");
      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const stats = {
    totalAffiliates: affiliates?.length || 0,
    totalLeads: leads?.length || 0,
    convertedLeads: leads?.filter(l => l.status === 'converted')?.length || 0,
    conversionRate: leads?.length ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0,
    totalCommissions: commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    paidCommissions: commissions?.filter(c => c.status === 'paid')?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    pendingCommissions: commissions?.filter(c => c.status === 'pending')?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    totalWithdrawals: withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0,
    pendingWithdrawals: withdrawals?.filter(w => w.status === 'pending')?.reduce((sum, w) => sum + Number(w.amount), 0) || 0,
    activePDVs: pdvs?.filter(p => p.is_active)?.length || 0,
  };

  // Prepare chart data
  const leadsStatusData = [
    { name: 'Pendentes', value: leads?.filter(l => l.status === 'pending')?.length || 0 },
    { name: 'Contatados', value: leads?.filter(l => l.status === 'contacted')?.length || 0 },
    { name: 'Qualificados', value: leads?.filter(l => l.status === 'qualified')?.length || 0 },
    { name: 'Convertidos', value: leads?.filter(l => l.status === 'converted')?.length || 0 },
    { name: 'Perdidos', value: leads?.filter(l => l.status === 'lost')?.length || 0 },
  ];

  const topAffiliates = affiliates
    ?.map(a => ({
      name: a.full_name,
      leads: leads?.filter(l => l.affiliate_id === a.id)?.length || 0,
      converted: leads?.filter(l => l.affiliate_id === a.id && l.status === 'converted')?.length || 0,
      commissions: commissions?.filter(c => c.affiliate_id === a.id)?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    }))
    ?.sort((a, b) => b.converted - a.converted)
    ?.slice(0, 10) || [];

  const commissionsStatusData = [
    { name: 'Pagas', value: commissions?.filter(c => c.status === 'paid')?.length || 0, amount: stats.paidCommissions },
    { name: 'Pendentes', value: commissions?.filter(c => c.status === 'pending')?.length || 0, amount: stats.pendingCommissions },
    { name: 'Agendadas', value: commissions?.filter(c => c.status === 'scheduled')?.length || 0, amount: commissions?.filter(c => c.status === 'scheduled')?.reduce((sum, c) => sum + Number(c.amount), 0) || 0 },
  ];

  const handleExportCSV = () => {
    let csvData = "";
    
    if (reportType === "geral" || reportType === "leads") {
      csvData = "Nome,Email,Telefone,Status,Afiliado,Data\n";
      leads?.forEach(lead => {
        csvData += `"${lead.name}","${lead.email}","${lead.phone || ''}","${lead.status}","${(lead.profiles as any)?.full_name || ''}","${format(new Date(lead.created_at), 'dd/MM/yyyy')}"\n`;
      });
    } else if (reportType === "comissoes") {
      csvData = "Afiliado,Valor,Status,Parcela,Data Vencimento\n";
      commissions?.forEach(c => {
        csvData += `"${(c.profiles as any)?.full_name || ''}","R$ ${Number(c.amount).toFixed(2)}","${c.status}","${c.installment_number}/${c.total_installments}","${c.due_date ? format(new Date(c.due_date), 'dd/MM/yyyy') : ''}"\n`;
      });
    } else if (reportType === "saques") {
      csvData = "Afiliado,Valor,Status,Data Solicitação,Chave PIX\n";
      withdrawals?.forEach(w => {
        csvData += `"${(w.profiles as any)?.full_name || ''}","R$ ${Number(w.amount).toFixed(2)}","${w.status}","${format(new Date(w.requested_at), 'dd/MM/yyyy')}","${w.pix_key}"\n`;
      });
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${reportType}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setPresetRange = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case "today":
        setDateRange({ from: today, to: today });
        break;
      case "week":
        setDateRange({ from: startOfWeek(today, { locale: ptBR }), to: endOfWeek(today, { locale: ptBR }) });
        break;
      case "month":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case "30days":
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case "90days":
        setDateRange({ from: subDays(today, 90), to: today });
        break;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análise completa de performance e métricas</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setPresetRange("today")}>Hoje</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange("week")}>Esta Semana</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange("month")}>Este Mês</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange("30days")}>30 Dias</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange("90days")}>90 Dias</Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Visão Geral</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="afiliados">Afiliados</SelectItem>
                    <SelectItem value="comissoes">Comissões</SelectItem>
                    <SelectItem value="saques">Saques</SelectItem>
                    <SelectItem value="pdv">PDVs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Button onClick={handleExportCSV} className="ml-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Afiliados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
              <p className="text-xs text-muted-foreground">{stats.activePDVs} PDVs ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads no Período</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">{stats.convertedLeads} convertidos ({stats.conversionRate}%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Geradas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">R$ {stats.pendingCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saques Solicitados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">R$ {stats.pendingWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Leads</CardTitle>
              <CardDescription>Distribuição por status no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadsStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status das Comissões</CardTitle>
              <CardDescription>Valores por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={commissionsStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Affiliates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Top 10 Afiliados
            </CardTitle>
            <CardDescription>Ranking por número de conversões no período</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Convertidos</TableHead>
                  <TableHead className="text-center">Taxa</TableHead>
                  <TableHead className="text-right">Comissões</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAffiliates.map((affiliate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{affiliate.name}</TableCell>
                    <TableCell className="text-center">{affiliate.leads}</TableCell>
                    <TableCell className="text-center">{affiliate.converted}</TableCell>
                    <TableCell className="text-center">
                      {affiliate.leads > 0 ? ((affiliate.converted / affiliate.leads) * 100).toFixed(1) : 0}%
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {affiliate.commissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                {topAffiliates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum dado disponível para o período selecionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRelatorios;
