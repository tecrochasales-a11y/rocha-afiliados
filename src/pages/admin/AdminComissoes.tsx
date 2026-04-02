import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Search,
  ChevronDown,
  ChevronRight,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  User,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Commission {
  id: string;
  amount: number;
  percentage: number;
  status: string;
  installment_number: number | null;
  total_installments: number | null;
  due_date: string | null;
  paid_at: string | null;
  base_sale_value: number | null;
  created_at: string;
  lead_id: string | null;
  lead_name?: string;
  lead_status?: string;
}

interface AffiliateWithCommissions {
  id: string;
  full_name: string;
  email: string;
  tracking_code: string | null;
  leads: {
    id: string;
    name: string;
    email: string;
    status: string;
    sale_value: number | null;
    created_at: string;
    commissions: Commission[];
  }[];
  totals: {
    totalEarned: number;
    totalPaid: number;
    totalPending: number;
    totalScheduled: number;
  };
}

const AdminComissoes = () => {
  const [affiliates, setAffiliates] = useState<AffiliateWithCommissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedAffiliates, setExpandedAffiliates] = useState<Set<string>>(new Set());
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
  
  // Commission update dialog
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCommissionStatus, setNewCommissionStatus] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Commission settings
  const [commissionPercentage, setCommissionPercentage] = useState("30");
  const [commissionInstallments, setCommissionInstallments] = useState("1");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchCommissionSettings();
  }, []);

  const fetchCommissionSettings = async () => {
    try {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["commission_percentage", "commission_installments"]);
      
      if (data) {
        const pct = data.find(d => d.key === "commission_percentage");
        const inst = data.find(d => d.key === "commission_installments");
        if (pct?.value) setCommissionPercentage(pct.value);
        if (inst?.value) setCommissionInstallments(inst.value);
      }
    } catch (error) {
      console.error("Error fetching commission settings:", error);
    }
  };

  const saveCommissionSettings = async () => {
    setIsSavingSettings(true);
    try {
      const updates = [
        { key: "commission_percentage", value: commissionPercentage },
        { key: "commission_installments", value: commissionInstallments },
      ];

      for (const { key, value } of updates) {
        const { error } = await supabase
          .from("app_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key);
        if (error) throw error;
      }

      toast({
        title: "Configurações salvas!",
        description: `Comissão: ${commissionPercentage}% em ${commissionInstallments} parcela(s).`,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Fetch all affiliates with their leads and commissions
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, tracking_code")
        .order("full_name");

      if (profilesError) throw profilesError;

      const affiliatesWithData: AffiliateWithCommissions[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get leads for this affiliate
          const { data: leads } = await supabase
            .from("leads")
            .select("id, name, email, status, sale_value, created_at")
            .eq("affiliate_id", profile.id)
            .order("created_at", { ascending: false });

          // Get commissions for this affiliate
          const { data: commissions } = await supabase
            .from("commissions")
            .select("*")
            .eq("affiliate_id", profile.id)
            .order("due_date", { ascending: true });

          // Map commissions to leads
          const leadsWithCommissions = (leads || []).map((lead) => ({
            ...lead,
            commissions: (commissions || []).filter((c) => c.lead_id === lead.id),
          }));

          // Calculate totals
          const totalEarned = (commissions || []).reduce((sum, c) => sum + Number(c.amount), 0);
          const totalPaid = (commissions || [])
            .filter((c) => c.status === "paid")
            .reduce((sum, c) => sum + Number(c.amount), 0);
          const totalPending = (commissions || [])
            .filter((c) => c.status === "pending")
            .reduce((sum, c) => sum + Number(c.amount), 0);
          const totalScheduled = (commissions || [])
            .filter((c) => c.status === "scheduled")
            .reduce((sum, c) => sum + Number(c.amount), 0);

          return {
            ...profile,
            leads: leadsWithCommissions,
            totals: {
              totalEarned,
              totalPaid,
              totalPending,
              totalScheduled,
            },
          };
        })
      );

      // Filter to only show affiliates with leads or commissions
      const affiliatesWithActivity = affiliatesWithData.filter(
        (a) => a.leads.length > 0 || a.totals.totalEarned > 0
      );

      setAffiliates(affiliatesWithActivity);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAffiliate = (id: string) => {
    const newExpanded = new Set(expandedAffiliates);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAffiliates(newExpanded);
  };

  const toggleLead = (id: string) => {
    const newExpanded = new Set(expandedLeads);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLeads(newExpanded);
  };

  const openCommissionDialog = async (commission: Commission, leadName: string, affiliateId: string) => {
    setSelectedCommission({ ...commission, lead_name: leadName });
    setNewCommissionStatus(commission.status);
    setPaymentNotes("");
    
    // Fetch affiliate PIX key
    const { data: profileData } = await supabase
      .from("profiles")
      .select("pix_key")
      .eq("id", affiliateId)
      .maybeSingle();
    
    setSelectedAffiliatePixKey(profileData?.pix_key || null);
    setIsDialogOpen(true);
  };

  const handleUpdateCommission = async () => {
    if (!selectedCommission) return;

    setIsUpdating(true);

    try {
      const updateData: Record<string, unknown> = {
        status: newCommissionStatus,
      };

      if (newCommissionStatus === "paid" && selectedCommission.status !== "paid") {
        updateData.paid_at = new Date().toISOString();
      }

      if (newCommissionStatus === "cancelled") {
        updateData.paid_at = null;
      }

      const { error } = await supabase
        .from("commissions")
        .update(updateData)
        .eq("id", selectedCommission.id);

      if (error) throw error;

      toast({
        title: "Comissão atualizada!",
        description: newCommissionStatus === "paid" 
          ? "Pagamento registrado com sucesso."
          : "Status atualizado com sucesso.",
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating commission:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
            <Calendar className="w-3 h-3 mr-1" />
            Agendado
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case "converted":
        return <Badge className="bg-secondary/10 text-secondary">Convertido</Badge>;
      case "pending":
        return <Badge className="bg-accent/10 text-accent">Pendente</Badge>;
      case "contacted":
        return <Badge className="bg-blue-500/10 text-blue-500">Contatado</Badge>;
      case "qualified":
        return <Badge className="bg-primary/10 text-primary">Qualificado</Badge>;
      case "lost":
        return <Badge className="bg-destructive/10 text-destructive">Perdido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    
    // Filter by commission status
    const hasMatchingCommission = affiliate.leads.some((lead) =>
      lead.commissions.some((c) => c.status === statusFilter)
    );
    
    return matchesSearch && hasMatchingCommission;
  });

  // Calculate global totals
  const globalTotals = affiliates.reduce(
    (acc, a) => ({
      totalEarned: acc.totalEarned + a.totals.totalEarned,
      totalPaid: acc.totalPaid + a.totals.totalPaid,
      totalPending: acc.totalPending + a.totals.totalPending,
      totalScheduled: acc.totalScheduled + a.totals.totalScheduled,
    }),
    { totalEarned: 0, totalPaid: 0, totalPending: 0, totalScheduled: 0 }
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando comissões...</p>
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
            Gestão de Comissões
          </h1>
          <p className="text-muted-foreground">
            Controle de pagamentos e parcelas por afiliado
          </p>
        </div>

        {/* Commission Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Configurações de Comissão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <Label>Percentual de Comissão (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(e.target.value)}
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <Label>Nº de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={commissionInstallments}
                  onChange={(e) => setCommissionInstallments(e.target.value)}
                  className="w-32"
                />
              </div>
              <Button onClick={saveCommissionSettings} disabled={isSavingSettings}>
                {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Configurações
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Atualmente: <strong>{commissionPercentage}%</strong> do valor da venda em <strong>{commissionInstallments}</strong> parcela(s). O pagamento é automático para o afiliado.
            </p>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                R$ {globalTotals.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                Total Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-secondary">
                R$ {globalTotals.totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Pendente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">
                R$ {globalTotals.totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Agendado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-500">
                R$ {globalTotals.totalScheduled.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por afiliado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            Atualizar
          </Button>
        </div>

        {/* Affiliates List */}
        <div className="space-y-4">
          {filteredAffiliates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum afiliado com comissões encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredAffiliates.map((affiliate) => (
              <Card key={affiliate.id} className="overflow-hidden">
                <Collapsible
                  open={expandedAffiliates.has(affiliate.id)}
                  onOpenChange={() => toggleAffiliate(affiliate.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {expandedAffiliates.has(affiliate.id) ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {affiliate.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{affiliate.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {affiliate.email} • Código: {affiliate.tracking_code}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-semibold">
                              R$ {affiliate.totals.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pago</p>
                            <p className="font-semibold text-secondary">
                              R$ {affiliate.totals.totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pendente</p>
                            <p className="font-semibold text-accent">
                              R$ {(affiliate.totals.totalPending + affiliate.totals.totalScheduled).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {affiliate.leads.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          Nenhum lead registrado
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {affiliate.leads.map((lead) => (
                            <Collapsible
                              key={lead.id}
                              open={expandedLeads.has(lead.id)}
                              onOpenChange={() => toggleLead(lead.id)}
                            >
                              <div className="border rounded-lg overflow-hidden">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                      {expandedLeads.has(lead.id) ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                      )}
                                      <div>
                                        <p className="font-medium">{lead.name}</p>
                                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      {getLeadStatusBadge(lead.status)}
                                      {lead.sale_value && (
                                        <div className="text-right">
                                          <p className="text-xs text-muted-foreground">Valor Venda</p>
                                          <p className="font-semibold">
                                            R$ {Number(lead.sale_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                          </p>
                                        </div>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                                      </p>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                  {lead.commissions.length === 0 ? (
                                    <div className="px-4 pb-4 pt-2">
                                      <p className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded">
                                        Nenhuma comissão gerada para este lead
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="px-4 pb-4">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Parcela</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Vencimento</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Pago em</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {lead.commissions.map((commission) => (
                                            <TableRow key={commission.id}>
                                              <TableCell>
                                                {commission.installment_number}/{commission.total_installments}
                                              </TableCell>
                                              <TableCell className="font-semibold">
                                                R$ {Number(commission.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                              </TableCell>
                                              <TableCell>
                                                {commission.due_date
                                                  ? new Date(commission.due_date).toLocaleDateString("pt-BR")
                                                  : "-"}
                                              </TableCell>
                                              <TableCell>
                                                {getStatusBadge(commission.status)}
                                              </TableCell>
                                              <TableCell>
                                                {commission.paid_at
                                                  ? new Date(commission.paid_at).toLocaleDateString("pt-BR")
                                                  : "-"}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => openCommissionDialog(commission, lead.name)}
                                                >
                                                  {commission.status === "paid" ? "Ver" : "Pagar"}
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          )}
        </div>

        {/* Update Commission Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Atualizar Comissão</DialogTitle>
              <DialogDescription>
                Parcela {selectedCommission?.installment_number} de {selectedCommission?.total_installments} - {selectedCommission?.lead_name}
              </DialogDescription>
            </DialogHeader>
            {selectedCommission && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Valor da Parcela</span>
                    <span className="text-xl font-bold text-foreground">
                      R$ {Number(selectedCommission.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {selectedCommission.due_date && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Vencimento</span>
                      <span className="text-sm">
                        {new Date(selectedCommission.due_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newCommissionStatus} onValueChange={setNewCommissionStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newCommissionStatus === "paid" && selectedCommission.status !== "paid" && (
                  <div className="bg-secondary/10 rounded-lg p-3">
                    <p className="text-sm text-secondary font-medium">
                      ✓ O pagamento será registrado com a data de hoje
                    </p>
                  </div>
                )}

                {newCommissionStatus === "cancelled" && (
                  <div className="space-y-2">
                    <Label>Motivo do Cancelamento</Label>
                    <Textarea
                      placeholder="Informe o motivo..."
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateCommission} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : newCommissionStatus === "paid" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Pagamento
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminComissoes;