import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Upload, Palette, Type, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BrandSettings {
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
};

const AdminWhiteLabel = () => {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
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

      // Upload logo if selected
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile, `brand/logo-${Date.now()}.${logoFile.name.split('.').pop()}`);
        updatedSettings.brand_logo_url = logoUrl;
      }

      // Upload favicon if selected
      if (faviconFile) {
        const faviconUrl = await uploadFile(faviconFile, `brand/favicon-${Date.now()}.${faviconFile.name.split('.').pop()}`);
        updatedSettings.brand_favicon_url = faviconUrl;
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

      // Apply colors dynamically
      applyBrandColors(updatedSettings);

      toast({
        title: "Identidade visual salva!",
        description: "As configurações de marca foram atualizadas com sucesso.",
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
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Identidade Visual (White Label)
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize a aparência da plataforma com a identidade da sua empresa.
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>

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

        {/* Logo e Favicon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Logo e Favicon
            </CardTitle>
            <CardDescription>
              Faça upload do logotipo e ícone da sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div className="space-y-3">
                <Label>Logotipo</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  {(logoFile || settings.brand_logo_url) ? (
                    <div className="space-y-3">
                      <img
                        src={logoFile ? URL.createObjectURL(logoFile) : settings.brand_logo_url}
                        alt="Logo"
                        className="max-h-20 mx-auto object-contain"
                      />
                      <p className="text-sm text-muted-foreground">
                        {logoFile ? logoFile.name : "Logo atual"}
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
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    style={{ position: "relative", marginTop: "8px" }}
                  />
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-3">
                <Label>Favicon (ícone do navegador)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  {(faviconFile || settings.brand_favicon_url) ? (
                    <div className="space-y-3">
                      <img
                        src={faviconFile ? URL.createObjectURL(faviconFile) : settings.brand_favicon_url}
                        alt="Favicon"
                        className="max-h-16 mx-auto object-contain"
                      />
                      <p className="text-sm text-muted-foreground">
                        {faviconFile ? faviconFile.name : "Favicon atual"}
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
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                    style={{ position: "relative", marginTop: "8px" }}
                  />
                </div>
              </div>
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
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: settings.brand_primary_color,
                      color: "#fff",
                    }}
                  >
                    Botão Primário
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: settings.brand_secondary_color,
                      color: "#fff",
                    }}
                  >
                    Botão Secundário
                  </button>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold flex items-center"
                    style={{
                      backgroundColor: settings.brand_accent_color,
                      color: "#fff",
                    }}
                  >
                    Destaque
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminWhiteLabel;
