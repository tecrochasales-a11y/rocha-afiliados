import { useState, useEffect } from "react";
import { GestorLayout } from "@/components/gestor/GestorLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Loader2,
  Search,
  Users,
  Mail,
  Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Affiliate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  tracking_code: string | null;
  created_at: string;
  leads_count?: number;
  converted_count?: number;
}

const GestorAfiliados = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user && profile) {
      fetchAffiliates();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchAffiliates = async () => {
    if (!profile?.pdv_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data: affiliatesData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("pdv_id", profile.pdv_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with leads count
      const enrichedAffiliates = await Promise.all(
        (affiliatesData || []).map(async (affiliate) => {
          const { data: leads } = await supabase
            .from("leads")
            .select("status")
            .eq("affiliate_id", affiliate.id);

          const leads_count = leads?.length || 0;
          const converted_count = leads?.filter(l => l.status === "converted").length || 0;

          return { ...affiliate, leads_count, converted_count };
        })
      );

      setAffiliates(enrichedAffiliates);
    } catch (error) {
      console.error("Error fetching affiliates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAffiliates = affiliates.filter((affiliate) =>
    affiliate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <GestorLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground">Carregando afiliados...</p>
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
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Afiliados do PDV
          </h1>
          <p className="text-muted-foreground">
            Gerencie os afiliados vinculados ao seu ponto de venda
          </p>
        </div>

        {/* Search */}
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
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Convertidos</TableHead>
                  <TableHead>Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum afiliado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAffiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell className="font-medium">{affiliate.full_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {affiliate.email}
                          </div>
                          {affiliate.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {affiliate.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {affiliate.tracking_code || "-"}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {affiliate.leads_count}
                      </TableCell>
                      <TableCell className="text-secondary font-medium">
                        {affiliate.converted_count}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(affiliate.created_at).toLocaleDateString("pt-BR")}
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

export default GestorAfiliados;