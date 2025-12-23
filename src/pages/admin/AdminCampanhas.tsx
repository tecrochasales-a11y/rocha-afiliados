import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Search,
  Plus,
  Calendar,
  Edit,
  ToggleLeft,
  ToggleRight,
  Percent,
  Target,
  Users
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  bonus_percentage: number;
  target_affiliates: number;
  is_active: boolean;
  created_at: string;
}

const AdminCampanhas = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    bonus_percentage: "0",
    target_affiliates: "0",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Erro ao carregar campanhas",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingCampaign(null);
    setFormData({
      name: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      bonus_percentage: "0",
      target_affiliates: "0",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      start_date: campaign.start_date,
      end_date: campaign.end_date || "",
      bonus_percentage: campaign.bonus_percentage.toString(),
      target_affiliates: campaign.target_affiliates.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome da campanha.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_date) {
      toast({
        title: "Data de início obrigatória",
        description: "Informe quando a campanha começa.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        bonus_percentage: parseFloat(formData.bonus_percentage) || 0,
        target_affiliates: parseInt(formData.target_affiliates) || 0,
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from("campaigns")
          .update(data)
          .eq("id", editingCampaign.id);

        if (error) throw error;

        toast({
          title: "Campanha atualizada!",
          description: "As informações foram salvas.",
        });
      } else {
        const { error } = await supabase
          .from("campaigns")
          .insert(data);

        if (error) throw error;

        toast({
          title: "Campanha criada!",
          description: "A nova campanha foi cadastrada.",
        });
      }

      setIsDialogOpen(false);
      fetchCampaigns();
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (campaign: Campaign) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ is_active: !campaign.is_active })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: campaign.is_active ? "Campanha pausada" : "Campanha ativada",
        description: `${campaign.name} foi ${campaign.is_active ? "pausada" : "ativada"}.`,
      });

      fetchCampaigns();
    } catch (error) {
      console.error("Error toggling campaign:", error);
    }
  };

  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = campaign.end_date ? new Date(campaign.end_date) : null;

    if (!campaign.is_active) {
      return { label: "Pausada", className: "bg-muted text-muted-foreground" };
    }
    if (now < start) {
      return { label: "Agendada", className: "bg-blue-500/10 text-blue-500" };
    }
    if (end && now > end) {
      return { label: "Encerrada", className: "bg-muted text-muted-foreground" };
    }
    return { label: "Ativa", className: "bg-secondary/10 text-secondary" };
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando campanhas...</p>
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
              Campanhas
            </h1>
            <p className="text-muted-foreground">
              Gerencie campanhas de recrutamento de afiliados
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Campanha
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
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
                  <TableHead>Campanha</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Bônus</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma campanha encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => {
                    const status = getCampaignStatus(campaign);
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            {campaign.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {campaign.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {new Date(campaign.start_date).toLocaleDateString("pt-BR")}
                            {campaign.end_date && (
                              <> - {new Date(campaign.end_date).toLocaleDateString("pt-BR")}</>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {campaign.bonus_percentage > 0 ? (
                            <span className="inline-flex items-center gap-1 text-secondary font-medium">
                              <Percent className="w-3 h-3" />
                              +{campaign.bonus_percentage}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {campaign.target_affiliates > 0 ? (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Target className="w-3 h-3" />
                              {campaign.target_affiliates}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActive(campaign)}
                              title={campaign.is_active ? "Pausar" : "Ativar"}
                            >
                              {campaign.is_active ? (
                                <ToggleRight className="w-4 h-4 text-secondary" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(campaign)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? "Editar Campanha" : "Nova Campanha"}
              </DialogTitle>
              <DialogDescription>
                {editingCampaign 
                  ? "Atualize as informações da campanha"
                  : "Crie uma nova campanha de recrutamento"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Campanha de Verão"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva a campanha..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data Início *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bonus">Bônus (%)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={formData.bonus_percentage}
                    onChange={(e) => setFormData({ ...formData, bonus_percentage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual extra de comissão
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Meta de Afiliados</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.target_affiliates}
                    onChange={(e) => setFormData({ ...formData, target_affiliates: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade a recrutar
                  </p>
                </div>
              </div>
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
      </div>
    </AdminLayout>
  );
};

export default AdminCampanhas;