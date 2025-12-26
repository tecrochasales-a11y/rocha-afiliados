import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Search,
  Plus,
  Star,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit,
  Video
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar_initials: string | null;
  avatar_url: string | null;
  content: string;
  earnings: string;
  period: string;
  stars: number;
  video_url: string | null;
  is_active: boolean;
  display_order: number;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    avatar_initials: "",
    avatar_url: "",
    content: "",
    earnings: "",
    period: "",
    stars: "5",
    video_url: "",
    display_order: "0",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast({
        title: "Erro ao carregar depoimentos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTestimonials = testimonials.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    setFormData({
      name: "",
      role: "",
      avatar_initials: "",
      avatar_url: "",
      content: "",
      earnings: "",
      period: "",
      stars: "5",
      video_url: "",
      display_order: "0",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      avatar_initials: testimonial.avatar_initials || "",
      avatar_url: testimonial.avatar_url || "",
      content: testimonial.content,
      earnings: testimonial.earnings,
      period: testimonial.period,
      stars: testimonial.stars.toString(),
      video_url: testimonial.video_url || "",
      display_order: testimonial.display_order.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e depoimento são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        name: formData.name,
        role: formData.role,
        avatar_initials: formData.avatar_initials || null,
        avatar_url: formData.avatar_url || null,
        content: formData.content,
        earnings: formData.earnings,
        period: formData.period,
        stars: parseInt(formData.stars) || 5,
        video_url: formData.video_url || null,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update(data)
          .eq("id", editingTestimonial.id);

        if (error) throw error;
        toast({ title: "Depoimento atualizado!" });
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert(data);

        if (error) throw error;
        toast({ title: "Depoimento criado!" });
      }

      setIsDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_active: !testimonial.is_active })
        .eq("id", testimonial.id);

      if (error) throw error;
      toast({
        title: testimonial.is_active ? "Depoimento desativado" : "Depoimento ativado",
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Error toggling testimonial:", error);
    }
  };

  const deleteTestimonial = async (testimonial: Testimonial) => {
    if (!confirm(`Deseja excluir o depoimento de "${testimonial.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonial.id);

      if (error) throw error;
      toast({ title: "Depoimento excluído!" });
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              Depoimentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os depoimentos exibidos na página principal
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Depoimento
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar depoimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Testimonials List */}
        {filteredTestimonials.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-soft p-12 text-center">
            <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Nenhum depoimento encontrado
            </h3>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Depoimento
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`bg-card rounded-2xl border shadow-soft p-6 ${
                  testimonial.is_active ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {testimonial.avatar_url ? (
                      <img
                        src={testimonial.avatar_url}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {testimonial.avatar_initials || testimonial.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                        {testimonial.video_url && (
                          <Video className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{testimonial.role}</p>
                      <p className="text-foreground line-clamp-2">"{testimonial.content}"</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.stars)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-secondary">
                          {testimonial.earnings} {testimonial.period}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(testimonial)}
                    >
                      {testimonial.is_active ? (
                        <ToggleRight className="w-5 h-5 text-secondary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTestimonial(testimonial)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial
                  ? "Atualize as informações do depoimento"
                  : "Adicione um novo depoimento de afiliado"
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Carlos Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo/Período</Label>
                  <Input
                    id="role"
                    placeholder="Ex: Afiliado desde 2022"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Depoimento *</Label>
                <Textarea
                  id="content"
                  placeholder="O que o afiliado diz sobre o programa..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="earnings">Ganhos</Label>
                  <Input
                    id="earnings"
                    placeholder="Ex: R$ 15.000+"
                    value={formData.earnings}
                    onChange={(e) => setFormData({ ...formData, earnings: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Período</Label>
                  <Input
                    id="period"
                    placeholder="Ex: em 6 meses"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stars">Estrelas (1-5)</Label>
                  <Input
                    id="stars"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.stars}
                    onChange={(e) => setFormData({ ...formData, stars: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Ordem</Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_initials">Iniciais (se não tiver foto)</Label>
                <Input
                  id="avatar_initials"
                  placeholder="Ex: CS"
                  maxLength={2}
                  value={formData.avatar_initials}
                  onChange={(e) => setFormData({ ...formData, avatar_initials: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL da Foto (opcional)</Label>
                <Input
                  id="avatar_url"
                  placeholder="https://..."
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">URL do Vídeo YouTube (opcional)</Label>
                <Input
                  id="video_url"
                  placeholder="https://www.youtube.com/embed/..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Use o formato embed: https://www.youtube.com/embed/VIDEO_ID
                </p>
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

export default AdminTestimonials;
