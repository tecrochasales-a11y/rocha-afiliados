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
import { Loader2, Edit, Save, RefreshCw } from "lucide-react";
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
  how_it_works: "Como Funciona",
  benefits: "Benefícios Exclusivos",
  results: "Resultados Alcançáveis",
  stats: "Estatísticas",
};

const AdminConteudo = () => {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SiteContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("how_it_works");

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
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    setIsSaving(true);
    try {
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
      setIsDialogOpen(false);
      fetchContent();
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Erro ao salvar conteúdo");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredContent = content.filter(c => c.section === activeTab);

  const renderExtraDataFields = () => {
    if (!selectedItem || activeTab !== "results") return null;

    const extraData = selectedItem.extra_data as Record<string, string | boolean>;

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
  };

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
              Edite os textos e informações exibidos na landing page
            </p>
          </div>
          <Button variant="outline" onClick={fetchContent}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="how_it_works">Como Funciona</TabsTrigger>
            <TabsTrigger value="benefits">Benefícios</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          {Object.keys(sectionLabels).map((section) => (
            <TabsContent key={section} value={section}>
              <Card>
                <CardHeader>
                  <CardTitle>{sectionLabels[section]}</CardTitle>
                  <CardDescription>
                    Edite os itens desta seção da landing page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ordem</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Descrição</TableHead>
                        {section === "stats" || section === "results" ? (
                          <TableHead>Valor</TableHead>
                        ) : null}
                        <TableHead>Ativo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.display_order}</TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.description}
                          </TableCell>
                          {section === "stats" || section === "results" ? (
                            <TableCell className="font-bold text-secondary">
                              {item.value}
                            </TableCell>
                          ) : null}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Conteúdo</DialogTitle>
              <DialogDescription>
                Altere as informações e clique em salvar
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

                {(activeTab === "stats" || activeTab === "results") && (
                  <div className="space-y-2">
                    <Label>Valor</Label>
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
                    <Label>Ícone</Label>
                    <Input
                      value={selectedItem.icon || ""}
                      onChange={(e) =>
                        setSelectedItem({ ...selectedItem, icon: e.target.value })
                      }
                      placeholder="Nome do ícone Lucide"
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
