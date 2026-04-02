import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, Plus, Pencil, Trash2, GripVertical, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentStatus {
  id: string;
  name: string;
  key: string;
  color: string;
  display_order: number;
  is_active: boolean;
}

const AdminStatusPagamento = () => {
  const [statuses, setStatuses] = useState<PaymentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formColor, setFormColor] = useState("#6b7280");
  const [formOrder, setFormOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("payment_statuses")
      .select("*")
      .order("display_order");
    
    if (error) {
      console.error("Error:", error);
    } else {
      setStatuses(data || []);
    }
    setIsLoading(false);
  };

  const openCreateDialog = () => {
    setSelectedStatus(null);
    setFormName("");
    setFormKey("");
    setFormColor("#6b7280");
    setFormOrder(statuses.length + 1);
    setFormActive(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (status: PaymentStatus) => {
    setSelectedStatus(status);
    setFormName(status.name);
    setFormKey(status.key);
    setFormColor(status.color);
    setFormOrder(status.display_order);
    setFormActive(status.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formKey.trim()) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (selectedStatus) {
        const { error } = await supabase
          .from("payment_statuses")
          .update({
            name: formName,
            key: formKey,
            color: formColor,
            display_order: formOrder,
            is_active: formActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedStatus.id);
        if (error) throw error;
        toast({ title: "Status atualizado!" });
      } else {
        const { error } = await supabase
          .from("payment_statuses")
          .insert({
            name: formName,
            key: formKey,
            color: formColor,
            display_order: formOrder,
            is_active: formActive,
          });
        if (error) throw error;
        toast({ title: "Status criado!" });
      }

      setIsDialogOpen(false);
      fetchStatuses();
    } catch (error: any) {
      console.error("Error:", error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStatus) return;
    try {
      const { error } = await supabase
        .from("payment_statuses")
        .delete()
        .eq("id", selectedStatus.id);
      if (error) throw error;
      toast({ title: "Status removido!" });
      setIsDeleteOpen(false);
      fetchStatuses();
    } catch (error: any) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Status de Pagamento
            </h1>
            <p className="text-muted-foreground">
              Gerencie os status de pagamento disponíveis para os leads
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Status
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Chave</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell className="text-muted-foreground">{status.display_order}</TableCell>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full border border-border" 
                        style={{ backgroundColor: status.color }} 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{status.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{status.key}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        status.is_active 
                          ? "bg-secondary/10 text-secondary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {status.is_active ? "Sim" : "Não"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(status)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => { setSelectedStatus(status); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {statuses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum status cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStatus ? "Editar Status" : "Novo Status"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Pago" />
            </div>
            <div className="space-y-2">
              <Label>Chave (identificador único) *</Label>
              <Input value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="Ex: pago" />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={formColor} 
                    onChange={(e) => setFormColor(e.target.value)} 
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-28" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input type="number" value={formOrder} onChange={(e) => setFormOrder(Number(e.target.value))} className="w-20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover status?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o status "{selectedStatus?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminStatusPagamento;
