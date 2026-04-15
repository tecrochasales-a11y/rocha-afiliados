import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Search,
  Plus,
  MapPin,
  Edit,
  ToggleLeft,
  ToggleRight,
  Users
} from "lucide-react";
import { PDVAffiliatesDialog } from "@/components/admin/PDVAffiliatesDialog";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PDVAffiliatesSection } from "@/components/admin/PDVAffiliatesSection";

interface PDV {
  id: string;
  name: string;
  location: string | null;
  manager_id: string | null;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  affiliate_count?: number;
}

interface Manager {
  id: string;
  full_name: string;
}

const AdminPDV = () => {
  const [pdvs, setPdvs] = useState<PDV[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPdv, setEditingPdv] = useState<PDV | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    manager_id: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [affiliatesPdv, setAffiliatesPdv] = useState<PDV | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Fetch PDVs
      const { data: pdvsData, error: pdvsError } = await supabase
        .from("pdv")
        .select("*")
        .order("created_at", { ascending: false });

      if (pdvsError) throw pdvsError;

      // Fetch managers (users with gestor role)
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "gestor");

      if (rolesError) throw rolesError;

      const gestorIds = rolesData?.map(r => r.user_id) || [];
      
      let managersData: Manager[] = [];
      if (gestorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", gestorIds);
        managersData = profilesData || [];
      }

      setManagers(managersData);

      // Enrich PDVs with manager names and affiliate counts
      const enrichedPdvs = await Promise.all(
        (pdvsData || []).map(async (pdv) => {
          let manager_name = "Sem gestor";
          if (pdv.manager_id) {
            const manager = managersData.find(m => m.id === pdv.manager_id);
            manager_name = manager?.full_name || "Desconhecido";
          }

          // Count affiliates in this PDV
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("pdv_id", pdv.id);

          return { ...pdv, manager_name, affiliate_count: count || 0 };
        })
      );

      setPdvs(enrichedPdvs);
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

  const filteredPdvs = pdvs.filter((pdv) =>
    pdv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pdv.location && pdv.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openCreateDialog = () => {
    setEditingPdv(null);
    setFormData({ name: "", location: "", manager_id: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pdv: PDV) => {
    setEditingPdv(pdv);
    setFormData({
      name: pdv.name,
      location: pdv.location || "",
      manager_id: pdv.manager_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do PDV.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        name: formData.name,
        location: formData.location || null,
        manager_id: formData.manager_id || null,
      };

      if (editingPdv) {
        const { error } = await supabase
          .from("pdv")
          .update(data)
          .eq("id", editingPdv.id);

        if (error) throw error;

        toast({
          title: "PDV atualizado!",
          description: "As informações foram salvas.",
        });
      } else {
        const { error } = await supabase
          .from("pdv")
          .insert(data);

        if (error) throw error;

        toast({
          title: "PDV criado!",
          description: "O novo ponto de venda foi cadastrado.",
        });
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving PDV:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (pdv: PDV) => {
    try {
      const { error } = await supabase
        .from("pdv")
        .update({ is_active: !pdv.is_active })
        .eq("id", pdv.id);

      if (error) throw error;

      toast({
        title: pdv.is_active ? "PDV desativado" : "PDV ativado",
        description: `${pdv.name} foi ${pdv.is_active ? "desativado" : "ativado"}.`,
      });

      fetchData();
    } catch (error) {
      console.error("Error toggling PDV:", error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando PDVs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Pontos de Venda
            </h1>
            <p className="text-muted-foreground">
              Gerencie os PDVs e seus gestores
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo PDV
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou localização..."
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Afiliados</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPdvs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum PDV encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPdvs.map((pdv) => (
                    <TableRow key={pdv.id}>
                      <TableCell className="font-medium">{pdv.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {pdv.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {pdv.location}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{pdv.manager_name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {pdv.affiliate_count}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          pdv.is_active 
                            ? "bg-secondary/10 text-secondary" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {pdv.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAffiliatesPdv(pdv)}
                            title="Gerenciar afiliados"
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActive(pdv)}
                            title={pdv.is_active ? "Desativar" : "Ativar"}
                          >
                            {pdv.is_active ? (
                              <ToggleRight className="w-4 h-4 text-secondary" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(pdv)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPdv ? "Editar PDV" : "Novo PDV"}
              </DialogTitle>
              <DialogDescription>
                {editingPdv 
                  ? "Atualize as informações do ponto de venda"
                  : "Cadastre um novo ponto de venda"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Loja Centro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  placeholder="Ex: Av. Principal, 123"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Gestor Responsável</Label>
                <select
                  id="manager"
                  value={formData.manager_id}
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Sem gestor</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name}
                    </option>
                  ))}
                </select>
                {managers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhum gestor cadastrado. Adicione o role "gestor" a um usuário.
                  </p>
                )}
              </div>

              {editingPdv && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Afiliados Vinculados</Label>
                    <PDVAffiliatesSection pdvId={editingPdv.id} onUpdate={fetchData} />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
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
        {affiliatesPdv && (
          <PDVAffiliatesDialog
            open={!!affiliatesPdv}
            onOpenChange={(open) => !open && setAffiliatesPdv(null)}
            pdvId={affiliatesPdv.id}
            pdvName={affiliatesPdv.name}
            onUpdate={fetchData}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPDV;