import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Search,
  Plus,
  Image,
  Video,
  FileImage,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Upload
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SiteAsset {
  id: string;
  type: string;
  name: string;
  url: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const assetTypes = [
  { value: "logo", label: "Logo", icon: FileImage },
  { value: "banner", label: "Banner", icon: Image },
  { value: "image", label: "Imagem", icon: Image },
  { value: "video", label: "Vídeo", icon: Video },
  { value: "favicon", label: "Favicon", icon: FileImage },
];

const AdminAssets = () => {
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<SiteAsset | null>(null);
  const [formData, setFormData] = useState({
    type: "image",
    name: "",
    url: "",
    description: "",
    display_order: "0",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("site_assets")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      setAssets(data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast({
        title: "Erro ao carregar mídia",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const openCreateDialog = () => {
    setEditingAsset(null);
    setFormData({
      type: "image",
      name: "",
      url: "",
      description: "",
      display_order: "0",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (asset: SiteAsset) => {
    setEditingAsset(asset);
    setFormData({
      type: asset.type,
      name: asset.name,
      url: asset.url,
      description: asset.description || "",
      display_order: asset.display_order.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${formData.type}/${fileName}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        url: publicUrlData.publicUrl,
        name: formData.name || file.name.replace(/\.[^/.]+$/, ""),
      });

      toast({
        title: "Upload concluído!",
        description: "O arquivo foi enviado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do asset.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.url.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Faça upload de um arquivo ou informe a URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        type: formData.type,
        name: formData.name,
        url: formData.url,
        description: formData.description || null,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingAsset) {
        const { error } = await supabase
          .from("site_assets")
          .update(data)
          .eq("id", editingAsset.id);

        if (error) throw error;

        toast({
          title: "Asset atualizado!",
          description: "As informações foram salvas.",
        });
      } else {
        const { error } = await supabase
          .from("site_assets")
          .insert(data);

        if (error) throw error;

        toast({
          title: "Asset criado!",
          description: "O novo arquivo foi cadastrado.",
        });
      }

      setIsDialogOpen(false);
      fetchAssets();
    } catch (error) {
      console.error("Error saving asset:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (asset: SiteAsset) => {
    try {
      const { error } = await supabase
        .from("site_assets")
        .update({ is_active: !asset.is_active })
        .eq("id", asset.id);

      if (error) throw error;

      toast({
        title: asset.is_active ? "Asset desativado" : "Asset ativado",
      });

      fetchAssets();
    } catch (error) {
      console.error("Error toggling asset:", error);
    }
  };

  const deleteAsset = async (asset: SiteAsset) => {
    if (!confirm(`Deseja realmente excluir "${asset.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("site_assets")
        .delete()
        .eq("id", asset.id);

      if (error) throw error;

      toast({
        title: "Asset excluído!",
      });

      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = assetTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || Image;
    return <Icon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando mídia...</p>
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
              Gestão de Mídia
            </h1>
            <p className="text-muted-foreground">
              Gerencie logos, banners, imagens e vídeos do site
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Asset
          </Button>
        </div>

        {/* Filters */}
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {assetTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-soft p-12 text-center">
            <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Nenhum asset encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando logos, banners ou imagens.
            </p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Asset
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`bg-card rounded-2xl border shadow-soft overflow-hidden ${
                  asset.is_active ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                {/* Preview */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {asset.type === "video" ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm">
                      {getTypeIcon(asset.type)}
                      {assetTypes.find(t => t.value === asset.type)?.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-foreground truncate">{asset.name}</h3>
                  {asset.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {asset.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(asset)}
                        title={asset.is_active ? "Desativar" : "Ativar"}
                      >
                        {asset.is_active ? (
                          <ToggleRight className="w-4 h-4 text-secondary" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(asset.url, "_blank")}
                        title="Abrir URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(asset)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAsset(asset)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? "Editar Asset" : "Novo Asset"}
              </DialogTitle>
              <DialogDescription>
                {editingAsset 
                  ? "Atualize as informações do arquivo"
                  : "Faça upload ou insira a URL de um arquivo de mídia"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Logo Principal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="url">URL Externa</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Enviando...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Clique para selecionar um arquivo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Máximo 10MB • Imagens e vídeos
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.url && (
                    <p className="text-xs text-secondary truncate">
                      ✓ Arquivo carregado: {formData.url.split('/').pop()}
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="url" className="space-y-2">
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Insira a URL de um arquivo hospedado externamente.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do arquivo..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Ordem de Exibição</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isUploading}>
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

export default AdminAssets;
