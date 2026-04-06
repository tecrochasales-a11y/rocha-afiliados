import { useState, useEffect } from "react";
import { GestorLayout } from "@/components/gestor/GestorLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Loader2,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  sale_value: number | null;
  created_at: string;
  affiliate_name?: string;
}

const GestorLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user && profile) {
      fetchLeads();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchLeads = async () => {
    if (!profile?.pdv_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Get affiliates in this PDV
      const { data: affiliates } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("pdv_id", profile.pdv_id);

      const affiliateIds = affiliates?.map(a => a.id) || [];

      if (affiliateIds.length === 0) {
        setLeads([]);
        setIsLoading(false);
        return;
      }

      // Get leads from these affiliates
      const { data: leadsData, error } = await supabase
        .from("leads")
        .select("*")
        .in("affiliate_id", affiliateIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with affiliate names
      const enrichedLeads = (leadsData || []).map(lead => {
        const affiliate = affiliates?.find(a => a.id === lead.affiliate_id);
        return { ...lead, affiliate_name: affiliate?.full_name || "Desconhecido" };
      });

      setLeads(enrichedLeads);
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

  if (authLoading || isLoading) {
    return (
      <GestorLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground">Carregando leads...</p>
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
            </p>
          </div>
        </div>
      </GestorLayout>
    );
  }

  return (
    <GestorLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Leads do PDV
          </h1>
          <p className="text-muted-foreground">
            Acompanhe os leads dos afiliados do seu ponto de venda
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

        {/* Mobile card view */}
        <div className="lg:hidden space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
              Nenhum lead encontrado
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-card rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground truncate">{lead.name}</span>
                  {getStatusBadge(lead.status)}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 shrink-0" />
                      {lead.phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Afiliado: {lead.affiliate_name}</span>
                  <span>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                {lead.sale_value && (
                  <p className="text-sm font-medium">
                    R$ {Number(lead.sale_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[200px]">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3 shrink-0" />
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </GestorLayout>
  );
};

export default GestorLeads;