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
  Mail
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  affiliate_id: string | null;
  affiliate_name?: string;
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
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

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
    setIsDialogOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    setIsUpdating(true);

    try {
      const updateData: any = {
        status: newStatus,
        notes,
      };

      if (saleValue) {
        updateData.sale_value = parseFloat(saleValue);
      }

      if (newStatus === "converted" && !selectedLead.sale_value) {
        updateData.converted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", selectedLead.id);

      if (error) throw error;

      // If converted, create a commission
      if (newStatus === "converted" && selectedLead.status !== "converted" && saleValue) {
        const commissionAmount = parseFloat(saleValue) * 0.10; // 10% default
        
        if (selectedLead.affiliate_id) {
          await supabase.from("commissions").insert({
            affiliate_id: selectedLead.affiliate_id,
            lead_id: selectedLead.id,
            amount: commissionAmount,
            percentage: 10,
            status: "pending",
          });
        }
      }

      toast({
        title: "Lead atualizado!",
        description: "As informações foram salvas com sucesso.",
      });

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
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
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
                        {lead.sale_value
                          ? `R$ ${Number(lead.sale_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
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
          <DialogContent>
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

                <div className="space-y-2">
                  <Label>Valor da Venda (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Notas sobre o lead..."
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
