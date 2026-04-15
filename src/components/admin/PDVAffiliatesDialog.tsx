import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Affiliate {
  id: string;
  full_name: string;
  email: string;
}

interface PDVAffiliatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdvId: string;
  pdvName: string;
  onUpdate: () => void;
}

export const PDVAffiliatesDialog = ({
  open,
  onOpenChange,
  pdvId,
  pdvName,
  onUpdate,
}: PDVAffiliatesDialogProps) => {
  const [linked, setLinked] = useState<Affiliate[]>([]);
  const [available, setAvailable] = useState<Affiliate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAffiliates();
      setSearch("");
    }
  }, [open, pdvId]);

  const fetchAffiliates = async () => {
    setIsLoading(true);
    try {
      // Get affiliate user IDs
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "affiliate");
      const affiliateIds = roles?.map((r) => r.user_id) || [];
      if (affiliateIds.length === 0) {
        setLinked([]);
        setAvailable([]);
        return;
      }

      // Linked to this PDV
      const { data: linkedData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("pdv_id", pdvId)
        .in("id", affiliateIds);
      setLinked(linkedData || []);

      // Available (no PDV or different PDV)
      const { data: availData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", affiliateIds)
        .neq("pdv_id", pdvId);
      
      // Also get those with null pdv_id
      const { data: nullPdvData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", affiliateIds)
        .is("pdv_id", null);

      const allAvailable = [...(availData || []), ...(nullPdvData || [])];
      // Deduplicate
      const seen = new Set<string>();
      setAvailable(allAvailable.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      }));
    } catch (error) {
      console.error("Error fetching affiliates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const linkAffiliate = async (affiliateId: string) => {
    setActionId(affiliateId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ pdv_id: pdvId })
        .eq("id", affiliateId);
      if (error) throw error;
      toast({ title: "Afiliado vinculado ao PDV!" });
      fetchAffiliates();
      onUpdate();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao vincular", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const unlinkAffiliate = async (affiliateId: string) => {
    setActionId(affiliateId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ pdv_id: null })
        .eq("id", affiliateId);
      if (error) throw error;
      toast({ title: "Afiliado desvinculado do PDV" });
      fetchAffiliates();
      onUpdate();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao desvincular", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const filteredAvailable = available.filter(
    (a) =>
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Afiliados — {pdvName}</DialogTitle>
          <DialogDescription>
            Gerencie os afiliados vinculados a este ponto de venda
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Linked affiliates */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Vinculados ({linked.length})
              </h4>
              {linked.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum afiliado vinculado</p>
              ) : (
                <div className="space-y-2">
                  {linked.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        disabled={actionId === a.id}
                        onClick={() => unlinkAffiliate(a.id)}
                      >
                        {actionId === a.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add affiliates */}
            <div>
              <h4 className="text-sm font-medium mb-2">Adicionar afiliado</h4>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {search ? "Nenhum resultado" : "Todos os afiliados já estão vinculados"}
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredAvailable.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        disabled={actionId === a.id}
                        onClick={() => linkAffiliate(a.id)}
                      >
                        {actionId === a.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
