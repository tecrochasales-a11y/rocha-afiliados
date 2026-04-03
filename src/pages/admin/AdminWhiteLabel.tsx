import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Upload, Palette, Type, Image as ImageIcon, Mail, FileText, Settings, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface BrandSettings {
  // Branding
  brand_name: string;
  brand_slogan: string;
  brand_description: string;
  brand_primary_color: string;
  brand_secondary_color: string;
  brand_accent_color: string;
  brand_background_color: string;
  brand_text_color: string;
  brand_logo_url: string;
  brand_favicon_url: string;
  brand_login_bg_url: string;
  brand_dashboard_banner_url: string;
  // Naming
  brand_system_name: string;
  brand_system_url: string;
  // E-mails
  brand_email_sender_name: string;
  brand_email_sender_address: string;
  brand_email_signature: string;
  brand_email_footer: string;
  // Termos
  brand_terms_of_use: string;
  brand_privacy_policy: string;
  // Permissões
  brand_affiliate_can_see_leads: string;
  brand_affiliate_can_withdraw: string;
  brand_min_withdrawal_amount: string;
  brand_commission_default_pct: string;
}

const defaultSettings: BrandSettings = {
  brand_name: "Rocha Sales",
  brand_slogan: "SEGUROS",
  brand_description: "Sua proteção é nossa prioridade.",
  brand_primary_color: "#1e3a5f",
  brand_secondary_color: "#2d9e5a",
  brand_accent_color: "#e8920d",
  brand_background_color: "#f5f7fa",
  brand_text_color: "#1a2633",
  brand_logo_url: "",
  brand_favicon_url: "",
  brand_login_bg_url: "",
  brand_dashboard_banner_url: "",
  brand_system_name: "Rocha Sales Afiliados",
  brand_system_url: "",
  brand_email_sender_name: "Rocha Sales",
  brand_email_sender_address: "",
  brand_email_signature: "",
  brand_email_footer: "",
  brand_terms_of_use: "",
  brand_privacy_policy: "",
  brand_affiliate_can_see_leads: "true",
  brand_affiliate_can_withdraw: "true",
  brand_min_withdrawal_amount: "50",
  brand_commission_default_pct: "10",
};

const AdminWhiteLabel = () => {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [loginBgFile, setLoginBgFile] = useState<File | null>(null);
  const [dashboardBannerFile, setDashboardBannerFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value")
        .like("key", "brand_%");

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings = { ...defaultSettings };
        data.forEach((item) => {
          const key = item.key as keyof BrandSettings;
          if (key in loadedSettings && item.value) {
            loadedSettings[key] = item.value;
          }
        });
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error("Error fetching brand settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("site-assets")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings };

      // Upload files if selected
      const uploads: { file: File | null; key: keyof BrandSettings; prefix: string }[] = [
        { file: logoFile, key: "brand_logo_url", prefix: "brand/logo" },
        { file: faviconFile, key: "brand_favicon_url", prefix: "brand/favicon" },
        { file: loginBgFile, key: "brand_login_bg_url", prefix: "brand/login-bg" },
        { file: dashboardBannerFile, key: "brand_dashboard_banner_url", prefix: "brand/dashboard-banner" },
      ];

      for (const upload of uploads) {
        if (upload.file) {
          const url = await uploadFile(upload.file, `${upload.prefix}-${Date.now()}.${upload.file.name.split('.').pop()}`);
          updatedSettings[upload.key] = url;
        }
      }

      // Save each setting to app_settings
      for (const [key, value] of Object.entries(updatedSettings)) {
        const { data: existing } = await supabase
          .from("app_settings")
          .select("id")
          .eq("key", key)
          .single();

        if (existing) {
          await supabase
            .from("app_settings")
            .update({ value, updated_at: new Date().toISOString() })
            .eq("key", key);
        } else {
          await supabase
            .from("app_settings")
            .insert({ key, value, description: `White Label - ${key}` });
        }
      }

      setSettings(updatedSettings);
      setLogoFile(null);
      setFaviconFile(null);
      setLoginBgFile(null);
      setDashboardBannerFile(null);

      applyBrandColors(updatedSettings);

      toast({
        title: "Configurações salvas!",
        description: "Todas as personalizações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving brand settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const applyBrandColors = (brand: BrandSettings) => {
    const root = document.documentElement;
    const hsl = hexToHSL;

    if (brand.brand_primary_color) {
      const p = hsl(brand.brand_primary_color);
      root.style.setProperty("--primary", `${p.h} ${p.s}% ${p.l}%`);
    }
    if (brand.brand_secondary_color) {
      const s = hsl(brand.brand_secondary_color);
      root.style.setProperty("--secondary", `${s.h} ${s.s}% ${s.l}%`);
    }
    if (brand.brand_accent_color) {
      const a = hsl(brand.brand_accent_color);
      root.style.setProperty("--accent", `${a.h} ${a.s}% ${a.l}%`);
    }
  };

  const hexToHSL = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const updateSetting = (key: keyof BrandSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const FileUploadBox = ({ label, file, currentUrl, onFileChange }: {
    label: string;
    file: File | null;
    currentUrl: string;
    onFileChange: (f: File | null) => void;
  }) => (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center relative">
        {(file || currentUrl) ? (
          <div className="space-y-3">
            <img
              src={file ? URL.createObjectURL(file) : currentUrl}
              alt={label}
              className="max-h-20 mx-auto object-contain"
            />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Arquivo atual"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Clique para enviar</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="opacity-0 cursor-pointer"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          style={{ position: "relative", marginTop: "8px" }}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              White Label
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize completamente a plataforma com a identidade da sua empresa.
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Tudo
          </Button>
        </div>

        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="branding" className="flex items-center gap-2 text-xs">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Identidade Visual</span>
              <span className="sm:hidden">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="naming" className="flex items-center gap-2 text-xs">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Nome do Sistema</span>
              <span className="sm:hidden">Nome</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2 text-xs">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">E-mails</span>
              <span className="sm:hidden">E-mails</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Termos e Políticas</span>
              <span className="sm:hidden">Termos</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 text-xs">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== ABA: Identidade Visual ==================== */}
          <TabsContent value="branding" className="space-y-6">
            {/* Nome e Textos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Nome e Textos
                </CardTitle>
                <CardDescription>
                  Defina o nome da empresa, slogan e descrição institucional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Empresa</Label>
                    <Input
                      value={settings.brand_name}
                      onChange={(e) => updateSetting("brand_name", e.target.value)}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <Label>Slogan / Subtítulo</Label>
                    <Input
                      value={settings.brand_slogan}
                      onChange={(e) => updateSetting("brand_slogan", e.target.value)}
                      placeholder="Ex: SEGUROS"
                    />
                  </div>
                </div>
                <div>
                  <Label>Descrição Institucional</Label>
                  <Textarea
                    value={settings.brand_description}
                    onChange={(e) => updateSetting("brand_description", e.target.value)}
                    placeholder="Breve descrição da empresa"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo, Favicon e Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Logo, Favicon e Imagens
                </CardTitle>
                <CardDescription>
                  Substitua a logo, ícone, tela de login e banner do dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadBox
                    label="Logotipo"
                    file={logoFile}
                    currentUrl={settings.brand_logo_url}
                    onFileChange={setLogoFile}
                  />
                  <FileUploadBox
                    label="Favicon (ícone do navegador)"
                    file={faviconFile}
                    currentUrl={settings.brand_favicon_url}
                    onFileChange={setFaviconFile}
                  />
                  <FileUploadBox
                    label="Imagem de fundo do Login"
                    file={loginBgFile}
                    currentUrl={settings.brand_login_bg_url}
                    onFileChange={setLoginBgFile}
                  />
                  <FileUploadBox
                    label="Banner do Dashboard"
                    file={dashboardBannerFile}
                    currentUrl={settings.brand_dashboard_banner_url}
                    onFileChange={setDashboardBannerFile}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Paleta de Cores
                </CardTitle>
                <CardDescription>
                  Personalize as cores do tema da plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: "brand_primary_color" as const, label: "Cor Primária", desc: "Botões, links e destaques" },
                    { key: "brand_secondary_color" as const, label: "Cor Secundária", desc: "CTAs e ações secundárias" },
                    { key: "brand_accent_color" as const, label: "Cor de Destaque", desc: "Badges e alertas" },
                    { key: "brand_background_color" as const, label: "Cor de Fundo", desc: "Background geral" },
                    { key: "brand_text_color" as const, label: "Cor do Texto", desc: "Textos principais" },
                  ].map((color) => (
                    <div key={color.key} className="space-y-2">
                      <Label>{color.label}</Label>
                      <p className="text-xs text-muted-foreground">{color.desc}</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings[color.key]}
                          onChange={(e) => updateSetting(color.key, e.target.value)}
                          className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                        />
                        <Input
                          value={settings[color.key]}
                          onChange={(e) => updateSetting(color.key, e.target.value)}
                          className="flex-1 font-mono text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Preview */}
                <div>
                  <Label className="text-base font-semibold">Pré-visualização</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Veja como as cores ficam na prática.
                  </p>
                  <div
                    className="rounded-xl p-6 border border-border"
                    style={{ backgroundColor: settings.brand_background_color }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {settings.brand_logo_url && (
                        <img src={settings.brand_logo_url} alt="Logo" className="h-8 object-contain" />
                      )}
                      <div>
                        <h3 className="font-heading font-bold" style={{ color: settings.brand_text_color }}>
                          {settings.brand_name}
                        </h3>
                        <p className="text-xs" style={{ color: settings.brand_text_color, opacity: 0.6 }}>
                          {settings.brand_slogan}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-4" style={{ color: settings.brand_text_color, opacity: 0.8 }}>
                      {settings.brand_description}
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: settings.brand_primary_color, color: "#fff" }}
                      >
                        Botão Primário
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: settings.brand_secondary_color, color: "#fff" }}
                      >
                        Botão Secundário
                      </button>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold flex items-center"
                        style={{ backgroundColor: settings.brand_accent_color, color: "#fff" }}
                      >
                        Destaque
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ABA: Nome do Sistema ==================== */}
          <TabsContent value="naming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Identidade do Sistema
                </CardTitle>
                <CardDescription>
                  Altere o nome do software e a URL personalizada para refletir sua marca.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome do Sistema</Label>
                  <Input
                    value={settings.brand_system_name}
                    onChange={(e) => updateSetting("brand_system_name", e.target.value)}
                    placeholder="Ex: Minha Empresa Afiliados"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este nome aparecerá no título do navegador, e-mails e relatórios.
                  </p>
                </div>
                <div>
                  <Label>URL Personalizada (Domínio)</Label>
                  <Input
                    value={settings.brand_system_url}
                    onChange={(e) => updateSetting("brand_system_url", e.target.value)}
                    placeholder="https://afiliados.suaempresa.com.br"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Domínio personalizado para acesso ao sistema (requer configuração de DNS).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ABA: E-mails ==================== */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  E-mails Automáticos
                </CardTitle>
                <CardDescription>
                  Configure os e-mails de notificação com seu remetente e assinatura.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Remetente</Label>
                    <Input
                      value={settings.brand_email_sender_name}
                      onChange={(e) => updateSetting("brand_email_sender_name", e.target.value)}
                      placeholder="Sua Empresa"
                    />
                  </div>
                  <div>
                    <Label>E-mail do Remetente</Label>
                    <Input
                      type="email"
                      value={settings.brand_email_sender_address}
                      onChange={(e) => updateSetting("brand_email_sender_address", e.target.value)}
                      placeholder="contato@suaempresa.com.br"
                    />
                  </div>
                </div>
                <div>
                  <Label>Assinatura do E-mail</Label>
                  <Textarea
                    value={settings.brand_email_signature}
                    onChange={(e) => updateSetting("brand_email_signature", e.target.value)}
                    placeholder="Ex: Atenciosamente, Equipe Sua Empresa"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Texto que aparecerá no final de cada e-mail automático.
                  </p>
                </div>
                <div>
                  <Label>Rodapé do E-mail</Label>
                  <Textarea
                    value={settings.brand_email_footer}
                    onChange={(e) => updateSetting("brand_email_footer", e.target.value)}
                    placeholder="Ex: © 2026 Sua Empresa. Todos os direitos reservados."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ABA: Termos e Políticas ==================== */}
          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Termos de Uso
                </CardTitle>
                <CardDescription>
                  Personalize os Termos de Uso exibidos na plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.brand_terms_of_use}
                  onChange={(e) => updateSetting("brand_terms_of_use", e.target.value)}
                  placeholder="Cole aqui os Termos de Uso da sua empresa..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Suporta texto simples. Os termos serão exibidos na página /termos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Política de Privacidade
                </CardTitle>
                <CardDescription>
                  Personalize a Política de Privacidade exibida na plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.brand_privacy_policy}
                  onChange={(e) => updateSetting("brand_privacy_policy", e.target.value)}
                  placeholder="Cole aqui a Política de Privacidade da sua empresa..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Suporta texto simples. A política será exibida na página /privacidade.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ABA: Configurações ==================== */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Funcionalidades e Permissões
                </CardTitle>
                <CardDescription>
                  Ajuste regras de negócio e permissões dos afiliados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="text-sm font-medium">Afiliados podem ver detalhes dos leads</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permite que afiliados vejam nome, e-mail e telefone dos leads que indicaram.
                    </p>
                  </div>
                  <Switch
                    checked={settings.brand_affiliate_can_see_leads === "true"}
                    onCheckedChange={(checked) => updateSetting("brand_affiliate_can_see_leads", checked ? "true" : "false")}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="text-sm font-medium">Afiliados podem solicitar saques</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permite que afiliados solicitem saques de comissões pelo sistema.
                    </p>
                  </div>
                  <Switch
                    checked={settings.brand_affiliate_can_withdraw === "true"}
                    onCheckedChange={(checked) => updateSetting("brand_affiliate_can_withdraw", checked ? "true" : "false")}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Mínimo para Saque (R$)</Label>
                    <Input
                      type="number"
                      value={settings.brand_min_withdrawal_amount}
                      onChange={(e) => updateSetting("brand_min_withdrawal_amount", e.target.value)}
                      placeholder="50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Valor mínimo em reais para o afiliado solicitar um saque.
                    </p>
                  </div>
                  <div>
                    <Label>Comissão Padrão (%)</Label>
                    <Input
                      type="number"
                      value={settings.brand_commission_default_pct}
                      onChange={(e) => updateSetting("brand_commission_default_pct", e.target.value)}
                      placeholder="10"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Percentual de comissão padrão para novos produtos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWhiteLabel;
