import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Save,
  Eye,
  Settings,
  ListChecks,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormProgressBar } from "@/components/lead-form/FormProgressBar";
import { DynamicFormStep, FormQuestion, FormOption } from "@/components/lead-form/DynamicFormStep";

interface AppSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  is_secret: boolean;
}

const questionTypes = [
  { value: "radio", label: "Escolha única (Radio)" },
  { value: "select", label: "Lista suspensa (Select)" },
  { value: "text", label: "Texto livre" },
  { value: "multi_select", label: "Múltipla escolha" },
  { value: "contact", label: "Dados de contato" },
  { value: "confirmation", label: "Confirmação e termos" },
];

const AdminFormulario = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    field_key: "",
    type: "radio" as FormQuestion["type"],
    options: "",
    is_required: true,
    conditional_field: "",
    conditional_value: "",
  });

  // Preview state
  const [previewStep, setPreviewStep] = useState(1);
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, settingsRes] = await Promise.all([
        supabase
          .from("lead_form_questions")
          .select("*")
          .order("display_order", { ascending: true }),
        supabase
          .from("app_settings")
          .select("*")
          .in("key", ["painel_corretor_api_key", "painel_corretor_produto_id", "painel_corretor_etiquetas"]),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      const formattedQuestions = (questionsRes.data || []).map((q) => ({
        ...q,
        options: (q.options as unknown as FormOption[]) || [],
      })) as FormQuestion[];

      setQuestions(formattedQuestions);
      setSettings(settingsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (question?: FormQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question,
        field_key: question.field_key,
        type: question.type,
        options: question.options.map((o) => `${o.value}:${o.label}`).join("\n"),
        is_required: question.is_required,
        conditional_field: question.conditional_field || "",
        conditional_value: question.conditional_value || "",
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: "",
        field_key: "",
        type: "radio",
        options: "",
        is_required: true,
        conditional_field: "",
        conditional_value: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!formData.question || !formData.field_key) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a pergunta e a chave do campo.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const options = formData.options
        .split("\n")
        .filter((line) => line.includes(":"))
        .map((line) => {
          const [value, ...labelParts] = line.split(":");
          return { value: value.trim(), label: labelParts.join(":").trim() };
        });

      const questionData = {
        question: formData.question,
        field_key: formData.field_key,
        type: formData.type,
        options,
        is_required: formData.is_required,
        conditional_field: formData.conditional_field || null,
        conditional_value: formData.conditional_value || null,
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from("lead_form_questions" as const)
          .update(questionData)
          .eq("id", editingQuestion.id);
        if (error) throw error;
      } else {
        const maxOrder = Math.max(...questions.map((q) => q.display_order || 0), 0);
        const { error } = await supabase
          .from("lead_form_questions")
          .insert({ ...questionData, display_order: maxOrder + 1 });
        if (error) throw error;
      }

      toast({ title: "Sucesso", description: "Pergunta salva com sucesso." });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a pergunta.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;

    try {
      const { error } = await supabase.from("lead_form_questions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Pergunta excluída." });
      fetchData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pergunta.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("lead_form_questions")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error toggling question:", error);
    }
  };

  const handleMoveQuestion = async (id: string, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const otherQuestion = questions[newIndex];

    try {
      await Promise.all([
        supabase
          .from("lead_form_questions")
          .update({ display_order: newIndex + 1 })
          .eq("id", id),
        supabase
          .from("lead_form_questions")
          .update({ display_order: index + 1 })
          .eq("id", otherQuestion.id),
      ]);
      fetchData();
    } catch (error) {
      console.error("Error moving question:", error);
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from("app_settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Configuração salva." });
      fetchData();
    } catch (error) {
      console.error("Error saving setting:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    const apiKey = settings.find((s) => s.key === "painel_corretor_api_key")?.value;
    if (!apiKey) {
      toast({
        title: "API Key não configurada",
        description: "Insira a chave de API antes de testar.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus("idle");

    try {
      // Simple validation - just check if API key format seems valid
      if (apiKey.length < 10) {
        setConnectionStatus("error");
        toast({
          title: "API Key inválida",
          description: "A chave parece muito curta.",
          variant: "destructive",
        });
      } else {
        setConnectionStatus("success");
        toast({
          title: "API Key configurada",
          description: "A chave foi salva. A conexão será testada no primeiro envio de lead.",
        });
      }
    } catch (error) {
      setConnectionStatus("error");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const activeQuestions = questions.filter((q) => q.is_active);

  const handlePreviewChange = (fieldKey: string, value: unknown) => {
    setPreviewValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formulário de Leads</h1>
          <p className="text-muted-foreground">
            Configure as perguntas do formulário e a integração com o CRM
          </p>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="questions" className="gap-2">
              <ListChecks className="w-4 h-4" />
              Perguntas
            </TabsTrigger>
            <TabsTrigger value="integration" className="gap-2">
              <Settings className="w-4 h-4" />
              Integração CRM
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Visualizar
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perguntas */}
          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Perguntas do Formulário</CardTitle>
                  <CardDescription>
                    Gerencie as perguntas que aparecem no formulário de leads
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Pergunta
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Ordem</TableHead>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="w-20">Ativo</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question, index) => (
                      <TableRow key={question.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveQuestion(question.id, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveQuestion(question.id, "down")}
                              disabled={index === questions.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{question.question}</p>
                            <p className="text-xs text-muted-foreground">{question.field_key}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {questionTypes.find((t) => t.value === question.type)?.label}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={question.is_active}
                            onCheckedChange={(checked) =>
                              handleToggleActive(question.id, checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(question)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Integração CRM */}
          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>Integração com Painel do Corretor</CardTitle>
                <CardDescription>
                  Configure a conexão com o CRM para envio automático de leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Chave de API</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Cole sua chave de API aqui"
                      value={settings.find((s) => s.key === "painel_corretor_api_key")?.value || ""}
                      onChange={(e) => {
                        setSettings((prev) =>
                          prev.map((s) =>
                            s.key === "painel_corretor_api_key"
                              ? { ...s, value: e.target.value }
                              : s
                          )
                        );
                      }}
                    />
                    <Button
                      onClick={() =>
                        handleSaveSetting(
                          "painel_corretor_api_key",
                          settings.find((s) => s.key === "painel_corretor_api_key")?.value || ""
                        )
                      }
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Acesse Configurações → Integrações no Painel do Corretor para gerar sua chave
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="produto-id">ID do Produto (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="produto-id"
                      placeholder="ID do produto padrão no CRM"
                      value={settings.find((s) => s.key === "painel_corretor_produto_id")?.value || ""}
                      onChange={(e) => {
                        setSettings((prev) =>
                          prev.map((s) =>
                            s.key === "painel_corretor_produto_id"
                              ? { ...s, value: e.target.value }
                              : s
                          )
                        );
                      }}
                    />
                    <Button
                      onClick={() =>
                        handleSaveSetting(
                          "painel_corretor_produto_id",
                          settings.find((s) => s.key === "painel_corretor_produto_id")?.value || ""
                        )
                      }
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etiquetas">Etiquetas Padrão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="etiquetas"
                      placeholder="fonte:afiliado, campanha:leads"
                      value={settings.find((s) => s.key === "painel_corretor_etiquetas")?.value || ""}
                      onChange={(e) => {
                        setSettings((prev) =>
                          prev.map((s) =>
                            s.key === "painel_corretor_etiquetas"
                              ? { ...s, value: e.target.value }
                              : s
                          )
                        );
                      }}
                    />
                    <Button
                      onClick={() =>
                        handleSaveSetting(
                          "painel_corretor_etiquetas",
                          settings.find((s) => s.key === "painel_corretor_etiquetas")?.value || ""
                        )
                      }
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Separe as etiquetas por vírgula. A etiqueta do afiliado será adicionada automaticamente.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    variant="outline"
                    className="gap-2"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : connectionStatus === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : connectionStatus === "error" ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : null}
                    Verificar Configuração
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Visualizar */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Visualização do Formulário</CardTitle>
                <CardDescription>
                  Veja como o formulário aparece para os leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeQuestions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma pergunta ativa. Adicione perguntas na aba "Perguntas".
                  </p>
                ) : (
                  <div className="max-w-md mx-auto space-y-6">
                    <FormProgressBar
                      currentStep={previewStep}
                      totalSteps={activeQuestions.length}
                    />
                    
                    <div className="min-h-[300px]">
                      {activeQuestions[previewStep - 1] && (
                        <DynamicFormStep
                          question={activeQuestions[previewStep - 1]}
                          value={previewValues[activeQuestions[previewStep - 1].field_key] as string | string[] | Record<string, string>}
                          onChange={handlePreviewChange}
                          allValues={previewValues}
                        />
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewStep((p) => Math.max(1, p - 1))}
                        disabled={previewStep === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        onClick={() =>
                          setPreviewStep((p) => Math.min(activeQuestions.length, p + 1))
                        }
                        disabled={previewStep === activeQuestions.length}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog: Editar/Criar Pergunta */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Editar Pergunta" : "Nova Pergunta"}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes da pergunta do formulário
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="q-question">Pergunta</Label>
                <Input
                  id="q-question"
                  placeholder="Ex: Você é MEI ou CNPJ?"
                  value={formData.question}
                  onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-field-key">Chave do Campo</Label>
                <Input
                  id="q-field-key"
                  placeholder="Ex: company_type"
                  value={formData.field_key}
                  onChange={(e) => setFormData((p) => ({ ...p, field_key: e.target.value }))}
                  disabled={!!editingQuestion}
                />
                <p className="text-xs text-muted-foreground">
                  Identificador único (sem espaços, use underscores)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-type">Tipo de Resposta</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData((p) => ({ ...p, type: val as FormQuestion["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {["radio", "select", "multi_select"].includes(formData.type) && (
                <div className="space-y-2">
                  <Label htmlFor="q-options">Opções (valor:label por linha)</Label>
                  <Textarea
                    id="q-options"
                    placeholder="mei:MEI&#10;cnpj:CNPJ"
                    value={formData.options}
                    onChange={(e) => setFormData((p) => ({ ...p, options: e.target.value }))}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: valor:Texto exibido (uma opção por linha)
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="q-required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_required: checked }))}
                />
                <Label htmlFor="q-required">Campo obrigatório</Label>
              </div>

              <div className="space-y-2">
                <Label>Condicional (opcional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Campo (ex: has_health_plan)"
                    value={formData.conditional_field}
                    onChange={(e) => setFormData((p) => ({ ...p, conditional_field: e.target.value }))}
                  />
                  <Input
                    placeholder="Valor (ex: sim)"
                    value={formData.conditional_value}
                    onChange={(e) => setFormData((p) => ({ ...p, conditional_value: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Mostrar esta pergunta apenas quando outro campo tiver um valor específico
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveQuestion} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminFormulario;
