import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff, Link2, Shield, CheckCircle, XCircle, FileSpreadsheet, Webhook, Send, RefreshCw, Plus, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Setting {
  key: string;
  value: string | null;
  description: string | null;
  is_secret: boolean;
}

interface N8nWebhook {
  id: string;
  name: string;
  webhook_url: string;
  webhook_type: string;
  http_method: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminIntegracoes = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  // CRM Settings
  const [crmApiKey, setCrmApiKey] = useState("");
  const [crmProdutoId, setCrmProdutoId] = useState("");
  const [crmEtiquetas, setCrmEtiquetas] = useState("");
  
  // Google Sheets Settings
  const [googleSheetsSpreadsheetId, setGoogleSheetsSpreadsheetId] = useState("");
  
  // n8n Webhooks
  const [webhooks, setWebhooks] = useState<N8nWebhook[]>([]);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<N8nWebhook | null>(null);
  const [webhookForm, setWebhookForm] = useState({ name: "", webhook_url: "", webhook_type: "all", http_method: "POST" });
  
  // OAuth Settings
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [facebookAppId, setFacebookAppId] = useState("");
  const [facebookAppSecret, setFacebookAppSecret] = useState("");
  const [appleServiceId, setAppleServiceId] = useState("");
  const [appleTeamId, setAppleTeamId] = useState("");

  useEffect(() => {
    fetchSettings();
    fetchWebhooks();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value, description, is_secret");

      if (error) throw error;

      const settings = data || [];
      
      // CRM
      setCrmApiKey(settings.find(s => s.key === "painel_corretor_api_key")?.value || "");
      setCrmProdutoId(settings.find(s => s.key === "painel_corretor_produto_id")?.value || "");
      setCrmEtiquetas(settings.find(s => s.key === "painel_corretor_etiquetas")?.value || "");
      
      // Google Sheets
      setGoogleSheetsSpreadsheetId(settings.find(s => s.key === "google_sheets_spreadsheet_id")?.value || "");
      
      // OAuth
      setGoogleClientId(settings.find(s => s.key === "google_client_id")?.value || "");
      setGoogleClientSecret(settings.find(s => s.key === "google_client_secret")?.value || "");
      setFacebookAppId(settings.find(s => s.key === "facebook_app_id")?.value || "");
      setFacebookAppSecret(settings.find(s => s.key === "facebook_app_secret")?.value || "");
      setAppleServiceId(settings.find(s => s.key === "apple_service_id")?.value || "");
      setAppleTeamId(settings.find(s => s.key === "apple_team_id")?.value || "");
      
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({ title: "Erro ao carregar configurações", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("n8n_webhooks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookForm.name.trim() || !webhookForm.webhook_url.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      if (editingWebhook) {
        const { error } = await supabase
          .from("n8n_webhooks")
          .update({
            name: webhookForm.name,
            webhook_url: webhookForm.webhook_url,
            webhook_type: webhookForm.webhook_type,
            http_method: webhookForm.http_method,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingWebhook.id);
        if (error) throw error;
        toast({ title: "Webhook atualizado!" });
      } else {
        const { error } = await supabase
          .from("n8n_webhooks")
          .insert({
            name: webhookForm.name,
            webhook_url: webhookForm.webhook_url,
            webhook_type: webhookForm.webhook_type,
            http_method: webhookForm.http_method,
          });
        if (error) throw error;
        toast({ title: "Webhook criado!" });
      }
      setWebhookDialogOpen(false);
      setEditingWebhook(null);
      setWebhookForm({ name: "", webhook_url: "", webhook_type: "all", http_method: "POST" });
      fetchWebhooks();
    } catch (error) {
      console.error("Error saving webhook:", error);
      toast({ title: "Erro ao salvar webhook", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase.from("n8n_webhooks").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Webhook removido!" });
      fetchWebhooks();
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast({ title: "Erro ao remover webhook", variant: "destructive" });
    }
  };

  const handleToggleWebhook = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("n8n_webhooks")
        .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ title: currentActive ? "Webhook desativado" : "Webhook ativado" });
      fetchWebhooks();
    } catch (error) {
      console.error("Error toggling webhook:", error);
    }
  };

  const handleTestWebhook = async (webhook: N8nWebhook) => {
    setIsTesting(webhook.id);
    try {
      const { data, error } = await supabase.functions.invoke("test-webhook", {
        body: { webhook_url: webhook.webhook_url, http_method: webhook.http_method || "POST" },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: "Teste enviado com sucesso!", description: `Status: ${data.status}. Verifique seu workflow n8n.` });
      } else {
        toast({ title: "Webhook respondeu com erro", description: `Status: ${data?.status} - ${data?.response}`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Test error:", error);
      toast({ title: "Erro ao testar webhook", description: String(error), variant: "destructive" });
    } finally {
      setIsTesting(null);
    }
  };

  const openCreateDialog = () => {
    setEditingWebhook(null);
    setWebhookForm({ name: "", webhook_url: "", webhook_type: "all", http_method: "POST" });
    setWebhookDialogOpen(true);
  };

  const openEditDialog = (webhook: N8nWebhook) => {
    setEditingWebhook(webhook);
    setWebhookForm({ name: webhook.name, webhook_url: webhook.webhook_url, webhook_type: webhook.webhook_type, http_method: webhook.http_method || "POST" });
    setWebhookDialogOpen(true);
  };

  const saveSetting = async (key: string, value: string, description: string, isSecret: boolean) => {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ 
        key, 
        value: value || null, 
        description, 
        is_secret: isSecret,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
    
    if (error) throw error;
  };

  const handleSaveCRM = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveSetting("painel_corretor_api_key", crmApiKey, "API Key do Painel do Corretor", true),
        saveSetting("painel_corretor_produto_id", crmProdutoId, "ID do Produto no CRM", false),
        saveSetting("painel_corretor_etiquetas", crmEtiquetas, "Etiquetas base para leads no CRM", false),
      ]);
      toast({ title: "Configurações do CRM salvas com sucesso!" });
    } catch (error) {
      console.error("Error saving CRM settings:", error);
      toast({ title: "Erro ao salvar configurações", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOAuth = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveSetting("google_client_id", googleClientId, "Google OAuth Client ID", false),
        saveSetting("google_client_secret", googleClientSecret, "Google OAuth Client Secret", true),
        saveSetting("facebook_app_id", facebookAppId, "Facebook App ID", false),
        saveSetting("facebook_app_secret", facebookAppSecret, "Facebook App Secret", true),
        saveSetting("apple_service_id", appleServiceId, "Apple Service ID", false),
        saveSetting("apple_team_id", appleTeamId, "Apple Team ID", false),
      ]);
      toast({ title: "Configurações OAuth salvas com sucesso!" });
    } catch (error) {
      console.error("Error saving OAuth settings:", error);
      toast({ title: "Erro ao salvar configurações", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SecretInput = ({ 
    id, 
    value, 
    onChange, 
    placeholder 
  }: { 
    id: string; 
    value: string; 
    onChange: (v: string) => void; 
    placeholder: string;
  }) => (
    <div className="relative">
      <Input
        id={id}
        type={showSecrets[id] ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3"
        onClick={() => toggleShowSecret(id)}
      >
        {showSecrets[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
          <p className="text-muted-foreground">Gerencie as integrações com serviços externos</p>
        </div>

        <Tabs defaultValue="n8n" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
            <TabsTrigger value="n8n" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              n8n
            </TabsTrigger>
            <TabsTrigger value="crm" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="sheets" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Google Sheets
            </TabsTrigger>
            <TabsTrigger value="oauth" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Login Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="n8n" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-primary" />
                      Webhooks n8n
                    </CardTitle>
                    <CardDescription>
                      Gerencie múltiplas integrações via n8n para leads, notificações e WhatsApp
                    </CardDescription>
                  </div>
                  <Button onClick={openCreateDialog} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhooks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum webhook configurado</p>
                    <p className="text-sm">Clique em "Novo Webhook" para adicionar uma integração n8n</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((wh) => (
                        <TableRow key={wh.id}>
                          <TableCell className="font-medium">{wh.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {wh.webhook_type === "all" ? "Todos" : wh.webhook_type === "lead" ? "Leads" : "Notificações"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {wh.webhook_url}
                          </TableCell>
                          <TableCell>
                            <Badge variant={wh.is_active ? "default" : "secondary"}>
                              {wh.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleTestWebhook(wh)} disabled={isTesting === wh.id || !wh.is_active} title="Testar">
                                {isTesting === wh.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleToggleWebhook(wh.id, wh.is_active)} title={wh.is_active ? "Desativar" : "Ativar"}>
                                {wh.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(wh)} title="Editar">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(wh.id)} title="Remover" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <Separator />

                <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                  <p className="text-sm font-medium">Payload enviado para webhooks de leads:</p>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "lead_id": "uuid",
  "name": "Nome do Cliente",
  "email": "email@exemplo.com",
  "phone": "11999999999",
  "affiliate_name": "Nome do Afiliado",
  "tracking_code": "ABC123",
  "form_responses": { ... }
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border space-y-2">
                  <p className="text-sm font-medium">Como configurar no n8n:</p>
                  <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Crie um novo workflow no n8n</li>
                    <li>Adicione o nó "Webhook" como trigger</li>
                    <li>Copie a URL de produção do webhook</li>
                    <li>Adicione o webhook aqui com o tipo adequado</li>
                    <li>Adicione nós para Google Sheets, CRM, WhatsApp, etc.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Dialog */}
            <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingWebhook ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
                  <DialogDescription>Configure a integração com o n8n</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={webhookForm.name} onChange={(e) => setWebhookForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Leads para Google Sheets" />
                  </div>
                  <div>
                    <Label>URL do Webhook</Label>
                    <Input value={webhookForm.webhook_url} onChange={(e) => setWebhookForm(f => ({ ...f, webhook_url: e.target.value }))} placeholder="https://n8n.seudominio.com/webhook/..." />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={webhookForm.webhook_type} onValueChange={(v) => setWebhookForm(f => ({ ...f, webhook_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos (Leads + Notificações)</SelectItem>
                        <SelectItem value="lead">Apenas Leads</SelectItem>
                        <SelectItem value="notification">Apenas Notificações</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Define quais eventos disparam este webhook</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveWebhook} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingWebhook ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="crm" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      Painel do Corretor
                    </CardTitle>
                    <CardDescription>
                      Integração com o CRM Painel do Corretor para envio automático de leads
                    </CardDescription>
                  </div>
                  <Badge variant={crmApiKey ? "default" : "secondary"} className="flex items-center gap-1">
                    {crmApiKey ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Configurado
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Não configurado
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crm-api-key">API Key</Label>
                  <SecretInput
                    id="crm-api-key"
                    value={crmApiKey}
                    onChange={setCrmApiKey}
                    placeholder="Sua API Key do Painel do Corretor"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre sua API Key nas configurações do Painel do Corretor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm-produto-id">ID do Produto (opcional)</Label>
                  <Input
                    id="crm-produto-id"
                    value={crmProdutoId}
                    onChange={(e) => setCrmProdutoId(e.target.value)}
                    placeholder="ID do produto para associar aos leads"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm-etiquetas">Etiquetas Base</Label>
                  <Input
                    id="crm-etiquetas"
                    value={crmEtiquetas}
                    onChange={(e) => setCrmEtiquetas(e.target.value)}
                    placeholder="fonte:afiliado, einstein-seguros"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separadas por vírgula. Serão adicionadas automaticamente a cada lead
                  </p>
                </div>

                <Button onClick={handleSaveCRM} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sheets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      Google Sheets
                    </CardTitle>
                    <CardDescription>
                      Backup automático de leads na sua planilha Google
                    </CardDescription>
                  </div>
                  <Badge variant={googleSheetsSpreadsheetId ? "default" : "secondary"} className="flex items-center gap-1">
                    {googleSheetsSpreadsheetId ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Configurado
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Não configurado
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Credenciais configuradas!</strong> O JSON da Service Account está salvo de forma segura.
                    Certifique-se de compartilhar a planilha com o e-mail da Service Account.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sheets-spreadsheet-id">ID da Planilha</Label>
                  <Input
                    id="sheets-spreadsheet-id"
                    value={googleSheetsSpreadsheetId}
                    onChange={(e) => setGoogleSheetsSpreadsheetId(e.target.value)}
                    placeholder="18UeRDAYIjRyZy96_waC3Afs1kBmtPTP8I9iM-NHcarg"
                  />
                  <p className="text-xs text-muted-foreground">
                    O ID está na URL da planilha: docs.google.com/spreadsheets/d/<strong>ID_AQUI</strong>/edit
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Nome da Aba</Label>
                  <Input
                    value="Leads"
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    A aba "Leads" deve existir na planilha
                  </p>
                </div>

                <Button 
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveSetting("google_sheets_spreadsheet_id", googleSheetsSpreadsheetId, "ID da planilha Google Sheets", false);
                      toast({ title: "Configurações do Google Sheets salvas!" });
                    } catch (error) {
                      console.error("Error saving Sheets settings:", error);
                      toast({ title: "Erro ao salvar configurações", variant: "destructive" });
                    } finally {
                      setIsSaving(false);
                    }
                  }} 
                  disabled={isSaving} 
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="oauth" className="space-y-4">
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Configuração do Login Social
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      O login social com Google está disponível. Para Facebook e Apple, é necessário 
                      configurar as contas de desenvolvedor nos respectivos serviços.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google OAuth */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </CardTitle>
                    <CardDescription>
                      Login com conta Google
                    </CardDescription>
                  </div>
                  <Badge variant={googleClientId && googleClientSecret ? "default" : "secondary"}>
                    {googleClientId && googleClientSecret ? "Configurado" : "Não configurado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* URLs para configurar no Google Cloud Console */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Configure estas URLs no Google Cloud Console:
                  </p>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-blue-600 dark:text-blue-400">Origens JavaScript autorizadas:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-white dark:bg-blue-900/50 px-2 py-1 rounded border flex-1 break-all">
                          {window.location.origin}
                        </code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin);
                            toast({ title: "URL copiada!" });
                          }}
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-blue-600 dark:text-blue-400">URI de redirecionamento autorizado:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-white dark:bg-blue-900/50 px-2 py-1 rounded border flex-1 break-all">
                          https://txvtxckwpulumhpudjio.supabase.co/auth/v1/callback
                        </code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText("https://txvtxckwpulumhpudjio.supabase.co/auth/v1/callback");
                            toast({ title: "URL copiada!" });
                          }}
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID (ID do cliente)</Label>
                  <Input
                    id="google-client-id"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="xxxxx.apps.googleusercontent.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em "ID do cliente" no Google Cloud Console
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">Client Secret (Chave secreta do cliente)</Label>
                  <SecretInput
                    id="google-client-secret"
                    value={googleClientSecret}
                    onChange={setGoogleClientSecret}
                    placeholder="GOCSPX-xxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Clique em "Add secret" no Google Cloud Console para gerar uma nova chave
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Importante:</strong> Após salvar aqui, você também precisa configurar estas credenciais no backend do Lovable Cloud.
                    Vá em <strong>Users → Auth Settings → Google Settings</strong>.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Abrir Google Cloud Console →
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Facebook OAuth */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </CardTitle>
                    <CardDescription>
                      Login com conta Facebook
                    </CardDescription>
                  </div>
                  <Badge variant={facebookAppId && facebookAppSecret ? "default" : "secondary"}>
                    {facebookAppId && facebookAppSecret ? "Configurado" : "Não configurado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook-app-id">App ID</Label>
                  <Input
                    id="facebook-app-id"
                    value={facebookAppId}
                    onChange={(e) => setFacebookAppId(e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-app-secret">App Secret</Label>
                  <SecretInput
                    id="facebook-app-secret"
                    value={facebookAppSecret}
                    onChange={setFacebookAppSecret}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure no <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta for Developers</a>
                </p>
              </CardContent>
            </Card>

            {/* Apple OAuth */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                      </svg>
                      Apple
                    </CardTitle>
                    <CardDescription>
                      Login com conta Apple (requer Apple Developer Account - $99/ano)
                    </CardDescription>
                  </div>
                  <Badge variant={appleServiceId && appleTeamId ? "default" : "secondary"}>
                    {appleServiceId && appleTeamId ? "Configurado" : "Não configurado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apple-service-id">Service ID</Label>
                  <Input
                    id="apple-service-id"
                    value={appleServiceId}
                    onChange={(e) => setAppleServiceId(e.target.value)}
                    placeholder="com.seuapp.service"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apple-team-id">Team ID</Label>
                  <Input
                    id="apple-team-id"
                    value={appleTeamId}
                    onChange={(e) => setAppleTeamId(e.target.value)}
                    placeholder="XXXXXXXXXX"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure no <a href="https://developer.apple.com/account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Developer Portal</a>
                </p>
              </CardContent>
            </Card>

            <Button onClick={handleSaveOAuth} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações OAuth
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminIntegracoes;
