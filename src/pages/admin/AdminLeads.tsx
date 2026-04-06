import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  CreditCard,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeadFormResponsesDialog } from "@/components/admin/LeadFormResponsesDialog";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  sale_value: number | null;
  created_at: string;
  tracking_code: string | null;
  notes: string | null;
  rejection_reason: string | null;
  affiliate_id: string | null;
  affiliate_name?: string;
  payment_status: string | null;
  payment_confirmed_at: string | null;
  payment_notes: string | null;
  form_responses: unknown | null;
  company_type: string | null;
  has_health_plan: string | null;
  monthly_income: string | null;
  health_plan_investment: string | null;
  insurance_provider: string | null;
  covered_ages: string | null;
  adjustment_month: string | null;
  cnpj_or_region: string | null;
  accepts_whatsapp: boolean | null;
}

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [saleValue, setSaleValue] = useState("");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [formResponsesLead, setFormResponsesLead] = useState<Lead | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [commissionPercentage, setCommissionPercentage] = useState(30);
  const [commissionInstallments, setCommissionInstallments] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
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
        if (pct?.value) setCommissionPercentage(parseFloat(pct.value));
        if (inst?.value) setCommissionInstallments(parseInt(inst.value));
      }
    } catch (error) {
      console.error("Error fetching commission settings:", error);
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);

    try {
      const { data: leadsData, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch affiliate names
      const leadsWithAffiliates = await Promise.all(
        (leadsData || []).map(async (lead) => {
          if (lead.affiliate_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", lead.affiliate_id)
              .maybeSingle();
            return { ...lead, affiliate_name: profile?.full_name || "Desconhecido" };
          }
          return { ...lead, affiliate_name: "Sem afiliado" };
        })
      );

      setLeads(leadsWithAffiliates);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openUpdateDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setSaleValue(lead.sale_value?.toString() || "");
    setNotes(lead.notes || "");
    setRejectionReason(lead.rejection_reason || "");
    setPaymentStatus(lead.payment_status || "pending");
    setPaymentNotes(lead.payment_notes || "");
    setIsDialogOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    const normalizedPaymentStatus = (paymentStatus || "").toLowerCase();
    const normalizedPreviousPaymentStatus = (selectedLead.payment_status || "").toLowerCase();
    const shouldCancelCommissions =
      newStatus === "lost" ||
      normalizedPaymentStatus === "cancelled" ||
      normalizedPaymentStatus === "cancelado";
    const wasCancellationState =
      selectedLead.status === "lost" ||
      normalizedPreviousPaymentStatus === "cancelled" ||
      normalizedPreviousPaymentStatus === "cancelado";
    const shouldRestoreCancelledCommissions =
      newStatus === "converted" && !shouldCancelCommissions && wasCancellationState;

    // Validação: se status for "lost", precisa de justificativa
    if (newStatus === "lost" && !rejectionReason.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Por favor, informe o motivo pelo qual o lead não fechou.",
        variant: "destructive",
      });
      return;
    }

    // Validação: se status for "converted", precisa de valor
    if (newStatus === "converted" && !saleValue) {
      toast({
        title: "Valor obrigatório",
        description: "Por favor, informe o valor da venda.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        notes,
        payment_status: paymentStatus,
        payment_notes: paymentNotes,
      };

      // Registrar data de confirmação de pagamento
      if (paymentStatus === "paid" && selectedLead.payment_status !== "paid") {
        updateData.payment_confirmed_at = new Date().toISOString();
      } else if (paymentStatus !== "paid" && selectedLead.payment_status === "paid") {
        updateData.payment_confirmed_at = null;
      }

      if (saleValue) {
        updateData.sale_value = parseFloat(saleValue);
      }

      if (newStatus === "converted" && selectedLead.status !== "converted") {
        updateData.converted_at = new Date().toISOString();
      }

      if (newStatus === "lost") {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", selectedLead.id);

      if (error) throw error;

      // Se convertido pela primeira vez, criar comissões usando configurações do admin
      const isNewConversion = newStatus === "converted" && selectedLead.status !== "converted" && saleValue && selectedLead.affiliate_id;
      
      if (isNewConversion) {
        // Verificar se já existem comissões para este lead (evitar duplicatas)
        const { data: existingCommissions } = await supabase
          .from("commissions")
          .select("id")
          .eq("lead_id", selectedLead.id)
          .limit(1);
        
        if (existingCommissions && existingCommissions.length > 0) {
          console.log("Comissões já existem para este lead, pulando criação.");
        } else {
          const saleValueNum = parseFloat(saleValue as string);
          
          const { error: commissionError } = await supabase.rpc("create_installment_commissions", {
            _lead_id: selectedLead.id,
            _affiliate_id: selectedLead.affiliate_id!,
            _product_id: null,
            _sale_value: saleValueNum,
          });

          if (commissionError) {
            console.error("Error creating commissions:", commissionError);
            throw commissionError;
          }

          const totalCommission = saleValueNum * (commissionPercentage / 100);
          const installmentText = commissionInstallments > 1 
            ? ` em ${commissionInstallments} parcelas mensais.` 
            : " em parcela única.";
          const notifTitle = "Indicação Convertida! 🎉";
          const notifMessage = `Sua indicação ${selectedLead.name} foi convertida! Você receberá R$ ${totalCommission.toFixed(2)}${installmentText}`;

          await supabase.rpc("create_lead_result_notification", {
            _affiliate_id: selectedLead.affiliate_id!,
            _lead_name: selectedLead.name,
            _converted: true,
            _commission_amount: totalCommission,
            _rejection_reason: null,
          });

          // Enviar para n8n (WhatsApp)
          supabase.functions.invoke("send-notification-webhook", {
            body: {
              affiliate_id: selectedLead.affiliate_id,
              notification_title: notifTitle,
              notification_message: notifMessage,
              notification_type: "lead_converted",
              lead_name: selectedLead.name,
              lead_id: selectedLead.id,
            },
          }).catch((err) => console.error("Webhook notification error:", err));

          const installmentDesc = commissionInstallments > 1 
            ? ` em ${commissionInstallments} parcelas` 
            : " em parcela única";
          toast({
            title: "Lead convertido!",
            description: `Comissão de R$ ${totalCommission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${commissionPercentage}%)${installmentDesc}.`,
          });
        }
      }

      // Cancelar ou reativar comissões conforme status atual do lead/pagamento
      if (shouldCancelCommissions) {
        const { error: cancelError } = await supabase
          .from("commissions")
          .update({ status: "cancelled" })
          .eq("lead_id", selectedLead.id)
          .neq("status", "paid");

        if (cancelError) {
          console.error("Error cancelling commissions:", cancelError);
        }
      } else if (shouldRestoreCancelledCommissions) {
        const { data: cancelledCommissions, error: cancelledCommissionsError } = await supabase
          .from("commissions")
          .select("id, installment_number")
          .eq("lead_id", selectedLead.id)
          .eq("status", "cancelled");

        if (cancelledCommissionsError) {
          console.error("Error fetching cancelled commissions:", cancelledCommissionsError);
          throw cancelledCommissionsError;
        }

        if (cancelledCommissions && cancelledCommissions.length > 0) {
          const restoreResults = await Promise.all(
            cancelledCommissions.map((commission) =>
              supabase
                .from("commissions")
                .update({
                  status:
                    commission.installment_number && commission.installment_number > 1
                      ? "scheduled"
                      : "pending",
                  paid_at: null,
                })
                .eq("id", commission.id)
            )
          );

          const restoreError = restoreResults.find((result) => result.error)?.error;

          if (restoreError) {
            console.error("Error restoring commissions:", restoreError);
            throw restoreError;
          }
        }
      }

      // Notificar afiliado sobre mudanças de status do lead
      if (selectedLead.affiliate_id && newStatus !== selectedLead.status) {
        const statusLabels: Record<string, string> = {
          pending: "Pendente",
          contacted: "Contatado",
          qualified: "Qualificado",
          converted: "Convertido",
          lost: "Perdido",
        };

        if (newStatus === "lost") {
          const lostNotifTitle = "Indicação não convertida";
          const lostNotifMessage = `Infelizmente a indicação ${selectedLead.name} não fechou. Motivo: ${rejectionReason || "Não informado"}`;

          await supabase.rpc("create_lead_result_notification", {
            _affiliate_id: selectedLead.affiliate_id,
            _lead_name: selectedLead.name,
            _converted: false,
            _commission_amount: null,
            _rejection_reason: rejectionReason,
          });

          supabase.functions.invoke("send-notification-webhook", {
            body: {
              affiliate_id: selectedLead.affiliate_id,
              notification_title: lostNotifTitle,
              notification_message: lostNotifMessage,
              notification_type: "lead_lost",
              lead_name: selectedLead.name,
              lead_id: selectedLead.id,
            },
          }).catch((err) => console.error("Webhook notification error:", err));
        } else if (newStatus !== "converted") {
          // Notificar para contacted, qualified, pending
          const statusNotifTitle = `Atualização da sua indicação`;
          const statusNotifMessage = `Sua indicação ${selectedLead.name} teve o status atualizado para: ${statusLabels[newStatus] || newStatus}.`;

          await supabase.from("notifications").insert({
            user_id: selectedLead.affiliate_id,
            title: statusNotifTitle,
            message: statusNotifMessage,
            type: "lead_status_update",
          });

          supabase.functions.invoke("send-notification-webhook", {
            body: {
              affiliate_id: selectedLead.affiliate_id,
              notification_title: statusNotifTitle,
              notification_message: statusNotifMessage,
              notification_type: "lead_status_update",
              lead_name: selectedLead.name,
              lead_id: selectedLead.id,
            },
          }).catch((err) => console.error("Webhook notification error:", err));
        }
      }

      // Notificar afiliado sobre mudanças de status do pagamento
      if (selectedLead.affiliate_id && paymentStatus !== (selectedLead.payment_status || "pending")) {
        // Buscar nome amigável do status de pagamento
        const { data: paymentStatusData } = await supabase
          .from("payment_statuses")
          .select("name")
          .eq("key", paymentStatus)
          .single();

        const paymentStatusLabel = paymentStatusData?.name || paymentStatus;
        const payNotifTitle = "Atualização de Pagamento";
        const payNotifMessage = `O pagamento referente à sua indicação ${selectedLead.name} foi atualizado para: ${paymentStatusLabel}.`;

        await supabase.from("notifications").insert({
          user_id: selectedLead.affiliate_id,
          title: payNotifTitle,
          message: payNotifMessage,
          type: "payment_status_update",
        });

        supabase.functions.invoke("send-notification-webhook", {
          body: {
            affiliate_id: selectedLead.affiliate_id,
            notification_title: payNotifTitle,
            notification_message: payNotifMessage,
            notification_type: "payment_status_update",
            lead_name: selectedLead.name,
            lead_id: selectedLead.id,
          },
        }).catch((err) => console.error("Webhook notification error:", err));
      }

      if (shouldCancelCommissions && newStatus !== "lost") {
        toast({
          title: "Lead atualizado",
          description: "Comissões canceladas com sucesso.",
        });
      } else if (shouldRestoreCancelledCommissions) {
        toast({
          title: "Lead atualizado",
          description: "Comissões reativadas com sucesso.",
        });
      } else {
        toast({
          title: "Lead atualizado!",
          description: "As informações foram salvas com sucesso.",
        });
      }

      setIsDialogOpen(false);
      fetchLeads();
    } catch (error) {
      console.error("Error updating lead:", error);
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
      case "converted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
            <CheckCircle className="w-3 h-3" />
            Convertido
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
            <Phone className="w-3 h-3" />
            Contatado
          </span>
        );
      case "qualified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <CheckCircle className="w-3 h-3" />
            Qualificado
          </span>
        );
      case "lost":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Perdido
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando leads...</p>
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
            Leads
          </h1>
          <p className="text-muted-foreground">
            Gerencie as indicações dos afiliados
          </p>
        </div>

        {/* Commission Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Sistema de Comissões</p>
              <p className="text-sm text-muted-foreground">
                Ao converter um lead, o afiliado recebe <strong>{commissionPercentage}% do valor da venda</strong>{commissionInstallments > 1 ? ` dividido em ${commissionInstallments} parcelas mensais de ${(commissionPercentage / commissionInstallments).toFixed(1)}%` : " em parcela única"}.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="contacted">Contatado</SelectItem>
              <SelectItem value="qualified">Qualificado</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Status Lead</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          {lead.status === "lost" && lead.rejection_reason && (
                            <p className="text-xs text-destructive mt-1">
                              Motivo: {lead.rejection_reason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{lead.affiliate_name}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        {lead.status === "converted" ? (
                          lead.payment_status === "paid" ? (
                            <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                              <CreditCard className="w-3 h-3 mr-1" />
                              Pago
                            </Badge>
                          ) : lead.payment_status === "cancelled" ? (
                            <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
                              <XCircle className="w-3 h-3 mr-1" />
                              Cancelado
                            </Badge>
                          ) : (
                            <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                              <Clock className="w-3 h-3 mr-1" />
                              Aguardando
                            </Badge>
                          )
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.sale_value
                          ? `R$ ${(Number(lead.sale_value) * commissionPercentage / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateDialog(lead)}
                        >
                          Atualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Update Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Atualizar Lead</DialogTitle>
              <DialogDescription>
                Atualize o status e informações do lead
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium">{selectedLead.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="contacted">Contatado</SelectItem>
                      <SelectItem value="qualified">Qualificado</SelectItem>
                      <SelectItem value="converted">Convertido</SelectItem>
                      <SelectItem value="lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newStatus === "converted" && (
                  <>
                    <div className="space-y-2">
                      <Label>Valor da Venda (R$) *</Label>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={saleValue}
                        onChange={(e) => setSaleValue(e.target.value)}
                      />
                      {saleValue && (
                        <div className="bg-secondary/10 rounded-lg p-3 mt-2">
                          <p className="text-sm font-medium text-secondary">Prévia da Comissão ({commissionPercentage}%)</p>
                          <p className="text-lg font-bold text-secondary">
                            R$ {(parseFloat(saleValue) * (commissionPercentage / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {commissionInstallments > 1 
                              ? `${commissionInstallments} parcelas de R$ ${(parseFloat(saleValue) * (commissionPercentage / 100) / commissionInstallments).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                              : "Parcela única"
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Status de Pagamento do Cliente</Label>
                      <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Aguardando Pagamento</SelectItem>
                          <SelectItem value="paid">Cliente Pagou</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Informe se o cliente pagou a proposta
                      </p>
                    </div>

                    {paymentStatus === "paid" && (
                      <div className="bg-secondary/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-secondary">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm font-medium">Pagamento confirmado</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {newStatus === "lost" && (
                  <div className="space-y-2">
                    <Label>Motivo da Perda *</Label>
                    <Textarea
                      placeholder="Explique por que o lead não fechou..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Esta informação será enviada ao afiliado.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Observações internas</Label>
                  <Textarea
                    placeholder="Notas sobre o lead (não enviadas ao afiliado)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateLead} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
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

export default AdminLeads;