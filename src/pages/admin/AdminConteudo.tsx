import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Edit, Save, RefreshCw, Plus, Trash2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface SiteContent {
  id: string;
  section: string;
  content_key: string;
  title: string | null;
  description: string | null;
  value: string | null;
  icon: string | null;
  display_order: number;
  extra_data: Record<string, unknown>;
  is_active: boolean;
}

const sectionLabels: Record<string, string> = {
  hero: "Hero (Topo)",
  value_proposition: "Proposta de Valor",
  how_it_works: "Como Funciona",
  benefits: "Benefícios Exclusivos",
  products: "Produtos",
  results: "Resultados Alcançáveis",
  stats: "Estatísticas",
  cta: "Chamada para Ação (CTA)",
  faq: "Perguntas Frequentes",
  footer: "Rodapé",
};

const AdminConteudo = () => {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SiteContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("section", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      const mappedData: SiteContent[] = (data || []).map(item => ({
        id: item.id,
        section: item.section,
        content_key: item.content_key,
        title: item.title,
        description: item.description,
        value: item.value,
        icon: item.icon,
        display_order: item.display_order ?? 0,
        extra_data: (typeof item.extra_data === 'object' && item.extra_data !== null && !Array.isArray(item.extra_data)) 
          ? item.extra_data as Record<string, unknown>
          : {},
        is_active: item.is_active,
      }));
      
      setContent(mappedData);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Erro ao carregar conteúdo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: SiteContent) => {
    setSelectedItem({ ...item });
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem({
      id: "",
      section: activeTab,
      content_key: `new_${Date.now()}`,
      title: "",
      description: "",
      value: "",
      icon: "",
      display_order: filteredContent.length + 1,
      extra_data: {},
      is_active: true,
    });
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    setIsSaving(true);
    try {
      if (isCreateMode) {
        const { error } = await supabase
          .from("site_content")
          .insert({
            section: selectedItem.section,
            content_key: selectedItem.content_key,
            title: selectedItem.title,
            description: selectedItem.description,
            value: selectedItem.value,
            icon: selectedItem.icon,
            display_order: selectedItem.display_order,
            extra_data: selectedItem.extra_data as unknown as Json,
            is_active: selectedItem.is_active,
          });

        if (error) throw error;
        toast.success("Conteúdo criado com sucesso!");
      } else {
        const { error } = await supabase
          .from("site_content")
          .update({
            title: selectedItem.title,
            description: selectedItem.description,
            value: selectedItem.value,
            icon: selectedItem.icon,
            display_order: selectedItem.display_order,
            extra_data: selectedItem.extra_data as unknown as Json,
            is_active: selectedItem.is_active,
          })
          .eq("id", selectedItem.id);

        if (error) throw error;
        toast.success("Conteúdo atualizado com sucesso!");
      }

      setIsDialogOpen(false);
      fetchContent();
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Erro ao salvar conteúdo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      const { error } = await supabase
        .from("site_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Conteúdo excluído com sucesso!");
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Erro ao excluir conteúdo");
    }
  };

  const filteredContent = content.filter(c => c.section === activeTab);

  const renderExtraDataFields = () => {
    if (!selectedItem) return null;

    const extraData = selectedItem.extra_data as Record<string, unknown>;

    // Hero section
    if (activeTab === "hero") {
      return (
        <div className="space-y-4 border-t pt-4 mt-4">
          <h4 className="font-medium text-sm text-muted-foreground">Badges e CTAs</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Badge Afiliados</Label>
              <Input
                value={(extraData?.badge_affiliates as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, badge_affiliates: e.target.value },
                  })
                }
                placeholder="+500 Afiliados"
              />
            </div>
            <div className="space-y-2">
              <Label>Badge Pagos</Label>
              <Input
                value={(extraData?.badge_paid as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, badge_paid: e.target.value },
                  })
                }
                placeholder="R$ 2M+ Pagos"
              />
            </div>
            <div className="space-y-2">
              <Label>Badge Comissão</Label>
              <Input
                value={(extraData?.badge_commission as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, badge_commission: e.target.value },
                  })
                }
                placeholder="30% Comissão"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Primário</Label>
              <Input
                value={(extraData?.cta_primary as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, cta_primary: e.target.value },
                  })
                }
                placeholder="Quero ser Afiliado"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Secundário</Label>
              <Input
                value={(extraData?.cta_secondary as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, cta_secondary: e.target.value },
                  })
                }
                placeholder="Já sou Afiliado"
              />
            </div>
          </div>
        </div>
      );
    }

    // CTA section
    if (activeTab === "cta") {
      const benefits = Array.isArray(extraData?.benefits) ? extraData.benefits : [];
      return (
        <div className="space-y-4 border-t pt-4 mt-4">
          <h4 className="font-medium text-sm text-muted-foreground">Benefícios e CTA</h4>
          <div className="space-y-2">
            <Label>Benefícios (um por linha)</Label>
            <Textarea
              value={benefits.join("\n")}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  extra_data: { ...extraData, benefits: e.target.value.split("\n").filter(b => b.trim()) },
                })
              }
              placeholder="Cadastro 100% gratuito&#10;Comissões de até 30%"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Texto do CTA</Label>
            <Input
              value={(extraData?.cta_text as string) || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  extra_data: { ...extraData, cta_text: e.target.value },
                })
              }
              placeholder="Quero ser Afiliado Agora"
            />
          </div>
        </div>
      );
    }

    // Products section
    if (activeTab === "products") {
      return (
        <div className="space-y-4 border-t pt-4 mt-4">
          <h4 className="font-medium text-sm text-muted-foreground">Dados do Produto</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ticket Médio</Label>
              <Input
                value={(extraData?.avgTicket as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, avgTicket: e.target.value },
                  })
                }
                placeholder="R$ 350"
              />
            </div>
            <div className="space-y-2">
              <Label>Popularidade (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={(extraData?.popularity as number) || 3}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, popularity: parseInt(e.target.value) || 3 },
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={extraData?.featured === true}
                onCheckedChange={(checked) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, featured: checked },
                  })
                }
              />
              <Label>Destacar</Label>
            </div>
          </div>
        </div>
      );
    }

    // Results section
    if (activeTab === "results") {
      return (
        <div className="space-y-4 border-t pt-4 mt-4">
          <h4 className="font-medium text-sm text-muted-foreground">Dados Adicionais</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Indicações</Label>
              <Input
                value={(extraData?.leads as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, leads: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Conversões</Label>
              <Input
                value={(extraData?.conversions as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, conversions: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Período</Label>
              <Input
                value={(extraData?.period as string) || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, period: e.target.value },
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={extraData?.highlight === true}
                onCheckedChange={(checked) =>
                  setSelectedItem({
                    ...selectedItem,
                    extra_data: { ...extraData, highlight: checked },
                  })
                }
              />
              <Label>Destacar</Label>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const getValueLabel = () => {
    switch (activeTab) {
      case "hero":
        return "Badge (ex: Programa de Afiliados)";
      case "products":
        return "Comissão";
      case "stats":
      case "results":
        return "Valor";
      default:
        return "Valor";
    }
  };

  const showValueColumn = ["hero", "products", "stats", "results"].includes(activeTab);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Gerenciar Conteúdo
            </h1>
            <p className="text-muted-foreground mt-1">
              Edite todos os textos e informações do site
            </p>
          </div>
          <Button variant="outline" onClick={fetchContent}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {Object.keys(sectionLabels).map((section) => (
              <TabsTrigger key={section} value={section} className="text-xs">
                {sectionLabels[section].split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(sectionLabels).map((section) => (
            <TabsContent key={section} value={section}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{sectionLabels[section]}</CardTitle>
                    <CardDescription>
                      Edite os itens desta seção do site
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreate} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Ordem</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead className="hidden md:table-cell">Descrição</TableHead>
                        {showValueColumn && <TableHead>Valor</TableHead>}
                        <TableHead className="w-20">Ativo</TableHead>
                        <TableHead className="text-right w-32">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.display_order}</TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell className="max-w-xs truncate hidden md:table-cell">
                            {item.description}
                          </TableCell>
                          {showValueColumn && (
                            <TableCell className="font-bold text-secondary">
                              {item.value}
                            </TableCell>
                          )}
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.is_active 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {item.is_active ? "Sim" : "Não"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredContent.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={showValueColumn ? 6 : 5} className="text-center py-8 text-muted-foreground">
                            Nenhum item nesta seção. Clique em "Adicionar" para criar.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isCreateMode ? "Criar Conteúdo" : "Editar Conteúdo"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Preencha as informações e clique em salvar" : "Altere as informações e clique em salvar"}
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={selectedItem.title || ""}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={selectedItem.description || ""}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {showValueColumn && (
                  <div className="space-y-2">
                    <Label>{getValueLabel()}</Label>
                    <Input
                      value={selectedItem.value || ""}
                      onChange={(e) =>
                        setSelectedItem({ ...selectedItem, value: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ícone (Lucide)</Label>
                    <Input
                      value={selectedItem.icon || ""}
                      onChange={(e) =>
                        setSelectedItem({ ...selectedItem, icon: e.target.value })
                      }
                      placeholder="Nome do ícone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      value={selectedItem.display_order}
                      onChange={(e) =>
                        setSelectedItem({
                          ...selectedItem,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedItem.is_active}
                    onCheckedChange={(checked) =>
                      setSelectedItem({ ...selectedItem, is_active: checked })
                    }
                  />
                  <Label>Ativo</Label>
                </div>

                {renderExtraDataFields()}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminConteudo;