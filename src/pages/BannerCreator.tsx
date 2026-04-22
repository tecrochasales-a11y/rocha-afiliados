import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import {
  RotateCcw,
  Download,
  Share2,
  ArrowLeft,
  Layout,
  Type,
  Palette,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Upload,
  Save,
  Trash2,
  X,
  Bookmark,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import portoLogo from "@/assets/insurers/porto.png";
import sulamericaLogo from "@/assets/insurers/sulamerica.jpg";
import bradescoLogo from "@/assets/insurers/bradesco.png";
import amilLogo from "@/assets/insurers/amil.svg";
import rochaLogo from "@/assets/rocha-sales-logo.png";

type LayoutType = "classic" | "centered" | "horizontal";
type ColorScheme = "gold-dark" | "light" | "dark" | "blue" | "custom";
type TextAlign = "left" | "center" | "right";

type SchemeColors = {
  bg: string; text: string; accent: string; qrBg: string; qrFg: string;
  ctaBg: string; ctaText: string; subtitle: string; desc: string; label: string;
};

const COLOR_SCHEMES: Record<Exclude<ColorScheme, "custom">, SchemeColors> = {
  "gold-dark": { bg: "#1a1a2e", text: "#ffffff", accent: "#C9A84C", qrBg: "#ffffff", qrFg: "#1a1a2e", ctaBg: "#C9A84C", ctaText: "#1a1a2e", subtitle: "#C9A84C", desc: "#d1d5db", label: "Dourado Escuro" },
  light: { bg: "#f8f6f0", text: "#1a1a2e", accent: "#C9A84C", qrBg: "#ffffff", qrFg: "#1a1a2e", ctaBg: "#C9A84C", ctaText: "#ffffff", subtitle: "#C9A84C", desc: "#4b5563", label: "Claro Elegante" },
  dark: { bg: "#0f0f0f", text: "#ffffff", accent: "#C9A84C", qrBg: "#ffffff", qrFg: "#0f0f0f", ctaBg: "#C9A84C", ctaText: "#0f0f0f", subtitle: "#e5c76b", desc: "#9ca3af", label: "Escuro Puro" },
  blue: { bg: "#0c1b3a", text: "#ffffff", accent: "#60a5fa", qrBg: "#ffffff", qrFg: "#0c1b3a", ctaBg: "#3b82f6", ctaText: "#ffffff", subtitle: "#93c5fd", desc: "#94a3b8", label: "Azul Corporativo" },
};

const INSURERS = [
  { key: "porto", name: "Porto", logo: portoLogo },
  { key: "sulamerica", name: "SulAmérica", logo: sulamericaLogo },
  { key: "bradesco", name: "Bradesco", logo: bradescoLogo },
  { key: "amil", name: "Amil", logo: amilLogo },
];

const FIXED_MESSAGE = "Descubra como reduzir em até 30% o valor do seu plano de saúde com uma consultoria online personalizada.";
const FIXED_CTA = "Escaneie o QR Code";
const FIXED_HIGHLIGHT = "✨ Consultoria 100% gratuita";

const FONT_OPTIONS = [
  { key: "playfair", label: "Playfair Display (padrão)", css: "'Playfair Display', serif" },
  { key: "inter", label: "Inter", css: "'Inter', sans-serif" },
  { key: "poppins", label: "Poppins", css: "'Poppins', sans-serif" },
  { key: "montserrat", label: "Montserrat", css: "'Montserrat', sans-serif" },
  { key: "roboto", label: "Roboto", css: "'Roboto', sans-serif" },
  { key: "lora", label: "Lora", css: "'Lora', serif" },
  { key: "merriweather", label: "Merriweather", css: "'Merriweather', serif" },
];

const DEFAULT_TEXT_COLORS = {
  badge: "#C9A84C",
  title: "#FFFFFF",
  subtitle: "#E5E7EB",
  footerLabel: "#6B7280",
};

const BRAND_SWATCHES = [
  "#C9A84C", "#FFFFFF", "#181818",
  "#0A2540", "#E30613", "#FF6B00",
];

function ColorPickerField({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const safe = /^#([0-9A-Fa-f]{6})$/.test(value) ? value : "#000000";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-9 flex items-center gap-2 px-2 rounded-md border border-border bg-background text-xs text-foreground transition-all hover:shadow-md hover:border-primary/60 hover:scale-[1.02]"
        >
          <span
            className="w-5 h-5 rounded border border-border shadow-inner shrink-0"
            style={{ backgroundColor: safe }}
          />
          <span className="font-mono uppercase tracking-wide">{safe}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-3 animate-scale-in" align="start">
        <HexColorPicker color={safe} onChange={onChange} style={{ width: "100%", height: 140 }} />
        <Input
          value={safe}
          onChange={(e) => {
            const raw = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(raw) && raw.length === 7) onChange(raw.toUpperCase());
          }}
          className="h-8 text-xs font-mono uppercase"
          maxLength={7}
        />
        <div className="grid grid-cols-6 gap-1.5">
          {BRAND_SWATCHES.map((sw) => (
            <button
              key={sw}
              type="button"
              onClick={() => onChange(sw)}
              className="w-7 h-7 rounded border border-border ring-2 ring-transparent hover:ring-primary transition-transform hover:scale-110"
              style={{ backgroundColor: sw }}
              aria-label={sw}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface BannerConfig {
  title: string;
  layout: LayoutType;
  colorScheme: ColorScheme;
  textAlign: TextAlign;
  customColors: { bg: string; text: string; accent: string };
  logoData: string | null;
  logoSize: number;
  bgImageData: string | null;
  bgOverlay: number;
  showInsurers: boolean;
  selectedInsurers: string[];
  fontFamily: string;
  useCustomTextColors: boolean;
  textColors: { badge: string; title: string; subtitle: string; footerLabel: string };
}

interface SavedTemplate {
  id: string;
  name: string;
  config: BannerConfig;
  created_at: string;
}

const DEFAULT_CONFIG: BannerConfig = {
  title: "Proteja quem você ama",
  layout: "classic",
  colorScheme: "gold-dark",
  textAlign: "left",
  customColors: { bg: "#1a1a2e", text: "#ffffff", accent: "#C9A84C" },
  logoData: null,
  logoSize: 70,
  bgImageData: null,
  bgOverlay: 50,
  showInsurers: true,
  selectedInsurers: ["porto", "sulamerica", "bradesco", "amil"],
  fontFamily: "'Playfair Display', serif",
  useCustomTextColors: false,
  textColors: { ...DEFAULT_TEXT_COLORS },
};

const BannerCreator = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [config, setConfig] = useState<BannerConfig>(DEFAULT_CONFIG);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const referralLink = profile?.tracking_code
    ? `${window.location.origin}/ref/${profile.tracking_code}`
    : "";

  const update = <K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  // Resolve effective colors
  const colors: SchemeColors = config.colorScheme === "custom"
    ? {
        bg: config.customColors.bg,
        text: config.customColors.text,
        accent: config.customColors.accent,
        qrBg: "#ffffff",
        qrFg: config.customColors.bg,
        ctaBg: config.customColors.accent,
        ctaText: config.customColors.bg,
        subtitle: config.customColors.accent,
        desc: config.customColors.text + "cc",
        label: "Personalizado",
      }
    : COLOR_SCHEMES[config.colorScheme];

  // Load templates
  const loadTemplates = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("banner_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTemplates(data.map((t) => ({
        id: t.id,
        name: t.name,
        config: t.config as unknown as BannerConfig,
        created_at: t.created_at,
      })));
    }
  }, [user]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // File handlers
  const handleFileUpload = (file: File, key: "logoData" | "bgImageData") => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Use imagens até 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => update(key, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!user) return;
    if (!templateName.trim()) {
      toast({ title: "Nome obrigatório", description: "Dê um nome ao seu padrão.", variant: "destructive" });
      return;
    }
    setSavingTemplate(true);
    const { error } = await supabase.from("banner_templates").insert({
      user_id: user.id,
      name: templateName.trim(),
      config: config as never,
    });
    setSavingTemplate(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Padrão salvo!", description: `"${templateName}" salvo com sucesso.` });
      setTemplateName("");
      loadTemplates();
    }
  };

  const handleApplyTemplate = (t: SavedTemplate) => {
    setConfig({ ...DEFAULT_CONFIG, ...t.config });
    toast({ title: "Padrão aplicado", description: t.name });
  };

  const handleDeleteTemplate = async (id: string) => {
    const { error } = await supabase.from("banner_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Padrão excluído" });
      loadTemplates();
    }
  };

  const waitForCardAssets = async (node: HTMLElement) => {
    const images = Array.from(node.querySelectorAll("img"));

    await Promise.all(
      images.map((img) => {
        const loaded =
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
              });

        return loaded.then(
          () => img.decode?.().catch(() => {}) ?? Promise.resolve()
        );
      })
    );

    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  };

  // Generate a bitmap QR canvas directly from the `qrcode` lib.
  // Using toCanvas avoids SVG serialization + async image decoding,
  // which was the fragile step causing the QR to disappear in exports.
  const generateExportQrCanvas = async (size: number): Promise<HTMLCanvasElement> => {
    const safeSize = Math.max(64, Math.floor(size));
    const value = (referralLink || "").trim();
    if (!value) {
      throw new Error("Link de indicação indisponível. Verifique seu código de afiliado.");
    }
    const offscreen = document.createElement("canvas");
    try {
      await QRCode.toCanvas(offscreen, value, {
        width: safeSize,
        margin: 0,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: colors.qrBg,
        },
      });
    } catch (err) {
      console.error("[QR export] QRCode.toCanvas failed", { value, safeSize, err });
      throw new Error(
        `Falha ao gerar o QR Code: ${err instanceof Error ? err.message : "erro desconhecido"}`
      );
    }
    if (!offscreen.width || !offscreen.height) {
      throw new Error("QR gerado com dimensões inválidas.");
    }
    return offscreen;
  };

  // Capture banner with html2canvas and overlay a freshly generated QR bitmap
  // at the position/size of the QR wrapper. Decoupled from the live preview.
  const captureBannerCanvas = async (): Promise<HTMLCanvasElement> => {
    const node = cardRef.current;
    if (!node) {
      throw new Error("Banner não está pronto para exportação.");
    }
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForCardAssets(node);

    const SCALE = 2;

    const qrTarget =
      qrWrapperRef.current ??
      (node.querySelector('[data-qr-target="true"]') as HTMLElement | null);

    if (!qrTarget) {
      throw new Error("Área do QR não encontrada no layout atual.");
    }

    const qrStyles = window.getComputedStyle(qrTarget);
    const padL = parseFloat(qrStyles.paddingLeft) || 0;
    const padR = parseFloat(qrStyles.paddingRight) || 0;
    const padT = parseFloat(qrStyles.paddingTop) || 0;
    const padB = parseFloat(qrStyles.paddingBottom) || 0;
    const qrRadius = parseFloat(qrStyles.borderRadius) || 14;

    const cardRect = node.getBoundingClientRect();
    const qrRect = qrTarget.getBoundingClientRect();

    if (qrRect.width <= 0 || qrRect.height <= 0) {
      console.error("[QR export] Invalid qrRect", qrRect);
      throw new Error("Área do QR com dimensões inválidas. Aguarde o layout terminar de renderizar.");
    }

    const x = (qrRect.left - cardRect.left) * SCALE;
    const y = (qrRect.top - cardRect.top) * SCALE;
    const w = qrRect.width * SCALE;
    const h = qrRect.height * SCALE;

    const innerW = Math.max(1, (qrRect.width - padL - padR) * SCALE);
    const innerH = Math.max(1, (qrRect.height - padT - padB) * SCALE);
    const innerSide = Math.floor(Math.min(innerW, innerH));
    const innerX = x + padL * SCALE + (innerW - innerSide) / 2;
    const innerY = y + padT * SCALE + (innerH - innerSide) / 2;

    if (innerSide < 32) {
      console.error("[QR export] innerSide too small", { innerSide, qrRect, padL, padR, padT, padB });
      throw new Error(`QR muito pequeno para exportar (${innerSide}px). Verifique o layout.`);
    }

    let captured: HTMLCanvasElement;
    try {
      captured = await html2canvas(node, {
        scale: SCALE,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        ignoreElements: (element) =>
          element instanceof HTMLElement && element.dataset.qrTarget === "true",
        onclone: (clonedDoc) => {
          // Converter o QR SVG em <img> data:image/svg+xml para garantir captura pelo html2canvas
          const qrWrapper = clonedDoc.querySelector(
            '[data-qr-target="true"]'
          ) as HTMLElement | null;
          if (qrWrapper) {
            const qrSvg = qrWrapper.querySelector("svg");
            if (qrSvg) {
              try {
                if (!qrSvg.getAttribute("xmlns")) {
                  qrSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                }
                const svgData = new XMLSerializer().serializeToString(qrSvg);
                const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
                const imgElement = clonedDoc.createElement("img");
                imgElement.src = svgDataUrl;
                imgElement.style.display = "block";
                imgElement.style.width = "100%";
                imgElement.style.height = "100%";
                qrSvg.parentNode?.replaceChild(imgElement, qrSvg);
              } catch (e) {
                console.warn("[QR export] Falha ao converter SVG para img", e);
              }
            }
          }
        },
      });
    } catch (err) {
      console.error("[QR export] html2canvas failed", err);
      throw new Error(
        `Falha ao capturar o banner: ${err instanceof Error ? err.message : "erro desconhecido"}`
      );
    }

    const qrCanvas = await generateExportQrCanvas(innerSide);

    const ctx = captured.getContext("2d");
    if (!ctx) {
      throw new Error("Contexto 2D indisponível para compor o QR.");
    }

    // Paint wrapper background with rounded corners, then draw QR bitmap.
    ctx.save();
    ctx.fillStyle = colors.qrBg;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, qrRadius * SCALE);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
    ctx.drawImage(qrCanvas, innerX, innerY, innerSide, innerSide);
    ctx.restore();

    return captured;
  };

  const handleExport = async () => {
    if (!cardRef.current) {
      toast({ title: "Erro ao exportar", description: "Banner não encontrado.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      // Aguardar layout ser aplicado antes de capturar
      await new Promise((r) => setTimeout(r, 200));
      const canvas = await captureBannerCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Imagem gerada está vazia.");
      }
      const link = document.createElement("a");
      link.download = `banner-${profile?.full_name?.toLowerCase().replace(/\s+/g, "-") || "afiliado"}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Banner exportado!", description: "A imagem foi salva no seu dispositivo." });
    } catch (error) {
      console.error("[QR export] handleExport error:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido ao exportar.";
      toast({
        title: "Falha ao exportar banner",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) {
      toast({ title: "Erro ao compartilhar", description: "Banner não encontrado.", variant: "destructive" });
      return;
    }
    try {
      await new Promise((r) => setTimeout(r, 200));
      const canvas = await captureBannerCanvas();
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) {
        throw new Error("Não foi possível gerar a imagem para compartilhamento.");
      }
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "banner.png", { type: "image/png" });
        const shareData = { files: [file], title: "Meu Banner" };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return;
          } catch (shareErr) {
            // User cancelled share — silent.
            if ((shareErr as Error)?.name === "AbortError") return;
            throw shareErr;
          }
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "banner.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[QR export] handleShare error:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido.";
      toast({
        title: "Falha ao compartilhar banner",
        description: msg,
        variant: "destructive",
      });
    }
  };

  // ─── Banner blocks ───
  const QRBlock = ({ size = 130 }: { size?: number }) => (
    <div
      ref={qrWrapperRef}
      data-qr-target="true"
      key={`qr-${config.layout}-${size}-${referralLink}`}
      style={{ background: colors.qrBg, borderRadius: 14, padding: 10, display: "inline-block" }}
    >
      <QRCodeSVG
        value={referralLink || "https://example.com"}
        size={size}
        level="H"
        bgColor={colors.qrBg}
        fgColor="#000000"
        marginSize={0}
        style={{ display: "block", width: size, height: size }}
      />
    </div>
  );


  const LogoBlock = () => {
    if (!config.logoData) return null;
    const justify = config.textAlign === "center" ? "center" : config.textAlign === "right" ? "flex-end" : "flex-start";
    return (
      <div style={{ display: "flex", justifyContent: justify, marginBottom: 16 }}>
        <div style={{ height: config.logoSize, maxWidth: "70%", display: "flex", alignItems: "center" }}>
          <img src={config.logoData} alt="Logo" style={{ maxHeight: config.logoSize, maxWidth: "100%", width: "auto", height: "auto", display: "block" }} crossOrigin="anonymous" />
        </div>
      </div>
    );
  };

  const badgeColor = config.useCustomTextColors ? config.textColors.badge : colors.accent;
  const titleColor = config.useCustomTextColors ? config.textColors.title : colors.text;
  const subtitleColor = config.useCustomTextColors ? config.textColors.subtitle : colors.desc;
  const footerLabelColor = config.useCustomTextColors ? config.textColors.footerLabel : "#6b7280";

  const TextBlock = () => (
    <div style={{ textAlign: config.textAlign, fontFamily: config.fontFamily }}>
      <p style={{ color: badgeColor, fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, fontFamily: config.fontFamily }}>
        {FIXED_HIGHLIGHT}
      </p>
      <h2 style={{
        color: titleColor,
        fontSize: config.layout === "horizontal" ? 26 : 30,
        fontWeight: 700,
        lineHeight: 1.15,
        marginBottom: 12,
        fontFamily: config.fontFamily,
      }}>
        {config.title}
      </h2>
      <p style={{ color: subtitleColor, fontSize: 13, lineHeight: 1.5, marginBottom: 16, fontFamily: config.fontFamily }}>
        {FIXED_MESSAGE}
      </p>
      <div>
        <span style={{
          display: "inline-block",
          background: colors.ctaBg,
          color: colors.ctaText,
          padding: "9px 20px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.3,
        }}>
          {FIXED_CTA}
        </span>
      </div>
    </div>
  );

  const InsurerStrip = () => {
    if (!config.showInsurers || config.selectedInsurers.length === 0) return null;
    const visible = INSURERS.filter((i) => config.selectedInsurers.includes(i.key));
    return (
      <div style={{
        background: "#ffffff",
        padding: "12px 24px",
        borderTop: `3px solid ${colors.accent}`,
      }}>
        <p style={{ fontSize: 9, color: footerLabelColor, textAlign: "center", marginBottom: 8, letterSpacing: 1, fontWeight: 600, fontFamily: config.fontFamily }}>
          TRABALHAMOS COM AS MELHORES OPERADORAS
        </p>
        <div style={{ display: "flex", flexWrap: "nowrap", justifyContent: "space-around", alignItems: "center", width: "100%" }}>
          {visible.map((ins) => (
            <div key={ins.key} style={{ flex: 1, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", minWidth: 0 }}>
              <img src={ins.logo} alt={ins.name} style={{ maxHeight: 56, maxWidth: "100%", width: "auto", height: "auto", display: "block" }} crossOrigin="anonymous" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      width: 400,
      minHeight: 540,
      borderRadius: 16,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: config.bgImageData ? `url(${config.bgImageData}) center/cover no-repeat` : colors.bg,
      position: "relative",
    }}>
      {config.bgImageData && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: colors.bg,
          opacity: config.bgOverlay / 100,
        }} />
      )}
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );

  const renderClassic = () => (
    <CardWrapper>
      <div style={{ padding: "28px 26px 22px", flex: 1 }}>
        <LogoBlock />
        <TextBlock />
        <div style={{ marginTop: 22, display: "flex", justifyContent: config.textAlign === "right" ? "flex-end" : config.textAlign === "center" ? "center" : "flex-start" }}>
          <QRBlock />
        </div>
      </div>
      <InsurerStrip />
    </CardWrapper>
  );

  const renderCentered = () => (
    <CardWrapper>
      <div style={{ padding: "28px 26px 22px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <LogoBlock />
        <TextBlock />
        <div style={{ marginTop: 22 }}>
          <QRBlock size={150} />
        </div>
      </div>
      <InsurerStrip />
    </CardWrapper>
  );

  const renderHorizontal = () => (
    <CardWrapper>
      <div style={{ padding: "28px 22px 22px", flex: 1 }}>
        <LogoBlock />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
          <div style={{ flex: 1 }}><TextBlock /></div>
          <div style={{ flexShrink: 0, paddingTop: 4 }}><QRBlock size={110} /></div>
        </div>
      </div>
      <InsurerStrip />
    </CardWrapper>
  );

  const renderCard = () => {
    switch (config.layout) {
      case "centered": return renderCentered();
      case "horizontal": return renderHorizontal();
      default: return renderClassic();
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-b border-border shadow-soft">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Voltar ao Dashboard</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="font-heading font-bold text-foreground text-lg">Criar Banner</h1>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {!referralLink && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                Seu código de rastreamento ainda não foi gerado. O QR Code não estará disponível até que seja configurado.
              </p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Controls */}
            <div className="w-full lg:w-[400px] flex-shrink-0 space-y-5">
              {/* Title */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Type className="w-4 h-4" /> Título Principal
                </div>
                <Input
                  value={config.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Ex: Proteja quem você ama"
                />
                <p className="text-xs text-muted-foreground">
                  A mensagem institucional e o CTA são fixos para garantir padronização profissional.
                </p>
              </div>

              {/* Logo */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <ImageIcon className="w-4 h-4" /> Logo Personalizada
                </div>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "logoData")} />
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-background hover:border-primary cursor-pointer text-sm text-muted-foreground transition-colors">
                      <Upload className="w-4 h-4" />
                      {config.logoData ? "Trocar logo" : "Enviar logo"}
                    </div>
                  </label>
                  {config.logoData && (
                    <Button variant="ghost" size="icon" onClick={() => update("logoData", null)} title="Remover logo">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {config.logoData && (
                  <div className="space-y-2">
                    <Label className="text-xs">Tamanho da logo: {config.logoSize}px</Label>
                    <Slider value={[config.logoSize]} min={40} max={120} step={2} onValueChange={(v) => update("logoSize", v[0])} />
                  </div>
                )}
              </div>

              {/* Background */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <ImageIcon className="w-4 h-4" /> Imagem de Fundo
                </div>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "bgImageData")} />
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-background hover:border-primary cursor-pointer text-sm text-muted-foreground transition-colors">
                      <Upload className="w-4 h-4" />
                      {config.bgImageData ? "Trocar imagem" : "Enviar imagem"}
                    </div>
                  </label>
                  {config.bgImageData && (
                    <Button variant="ghost" size="icon" onClick={() => update("bgImageData", null)} title="Remover fundo">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {config.bgImageData && (
                  <div className="space-y-2">
                    <Label className="text-xs">Escurecimento (legibilidade): {config.bgOverlay}%</Label>
                    <Slider value={[config.bgOverlay]} min={0} max={85} step={5} onValueChange={(v) => update("bgOverlay", v[0])} />
                  </div>
                )}
              </div>

              {/* Layout */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Layout className="w-4 h-4" /> Layout
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["classic", "centered", "horizontal"] as LayoutType[]).map((l) => (
                    <button key={l} onClick={() => update("layout", l)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${config.layout === l ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/50"}`}>
                      {l === "classic" ? "Clássico" : l === "centered" ? "Central" : "Lado a Lado"}
                    </button>
                  ))}
                </div>
                <div>
                  <Label className="text-xs">Alinhamento do Texto</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(["left", "center", "right"] as TextAlign[]).map((a) => (
                      <button key={a} onClick={() => update("textAlign", a)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${config.textAlign === a ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/50"}`}>
                        {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Palette className="w-4 h-4" /> Cores
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(COLOR_SCHEMES) as [Exclude<ColorScheme, "custom">, SchemeColors][]).map(([key, scheme]) => (
                    <button key={key} onClick={() => update("colorScheme", key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${config.colorScheme === key ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/50"}`}>
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: scheme.bg, border: `2px solid ${scheme.accent}` }} />
                      {scheme.label}
                    </button>
                  ))}
                  <button onClick={() => update("colorScheme", "custom")}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all col-span-2 ${config.colorScheme === "custom" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/50"}`}>
                    <Palette className="w-4 h-4" /> Paleta Personalizada
                  </button>
                </div>
                {config.colorScheme === "custom" && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {([
                      ["bg", "Fundo"],
                      ["text", "Texto"],
                      ["accent", "Destaque"],
                    ] as const).map(([k, label]) => (
                      <div key={k} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <ColorPickerField
                          value={config.customColors[k]}
                          onChange={(hex) => update("customColors", { ...config.customColors, [k]: hex })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tipografia & Cores dos Textos */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Type className="w-4 h-4" /> Tipografia & Cores dos Textos
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Família da fonte</Label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => update("fontFamily", e.target.value)}
                    className="w-full h-9 px-2 rounded-md border border-border bg-background text-sm text-foreground"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.key} value={f.css} style={{ fontFamily: f.css }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Label className="text-xs">Personalizar cores dos textos</Label>
                  <Switch
                    checked={config.useCustomTextColors}
                    onCheckedChange={(v) => update("useCustomTextColors", v)}
                  />
                </div>

                {config.useCustomTextColors && (
                  <>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {([
                        ["badge", "Destaque (badge)"],
                        ["title", "Título"],
                        ["subtitle", "Subtítulo"],
                        ["footerLabel", "Rótulo rodapé"],
                      ] as const).map(([k, label]) => (
                        <div key={k} className="space-y-1">
                          <Label className="text-xs">{label}</Label>
                          <ColorPickerField
                            value={config.textColors[k]}
                            onChange={(hex) =>
                              update("textColors", { ...config.textColors, [k]: hex })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-1 group"
                      onClick={() => {
                        update("fontFamily", "'Playfair Display', serif");
                        update("textColors", { ...DEFAULT_TEXT_COLORS });
                        update("useCustomTextColors", false);
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5 transition-transform duration-500 group-hover:-rotate-180" />
                      Restaurar padrão
                    </Button>
                  </>
                )}
              </div>

              {/* Insurers */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                    <Building2 className="w-4 h-4" /> Faixa de Seguradoras
                  </div>
                  <Switch checked={config.showInsurers} onCheckedChange={(v) => update("showInsurers", v)} />
                </div>
                {config.showInsurers && (
                  <div className="space-y-2">
                    {INSURERS.map((ins) => (
                      <label key={ins.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <Checkbox
                          checked={config.selectedInsurers.includes(ins.key)}
                          onCheckedChange={(checked) => {
                            const next = checked
                              ? [...config.selectedInsurers, ins.key]
                              : config.selectedInsurers.filter((k) => k !== ins.key);
                            update("selectedInsurers", next);
                          }}
                        />
                        {ins.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Templates */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Bookmark className="w-4 h-4" /> Padrões Salvos
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do padrão"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                  <Button onClick={handleSaveTemplate} disabled={savingTemplate} size="icon" title="Salvar padrão atual">
                    {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
                {templates.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {templates.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-background border border-border">
                        <button onClick={() => handleApplyTemplate(t)} className="flex-1 text-left text-sm text-foreground hover:text-primary truncate">
                          {t.name}
                        </button>
                        <button onClick={() => handleDeleteTemplate(t.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhum padrão salvo ainda.</p>
                )}
              </div>

              {/* Export */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                  <Share2 className="w-4 h-4" /> Compartilhar
                </Button>
                <Button variant="hero" className="flex-1 gap-2" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Baixar PNG
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-4">Preview em tempo real</p>
              <div className="bg-muted/50 rounded-2xl p-6 border border-border inline-block sticky top-24">
                <div ref={cardRef} style={{ position: "relative" }}>
                  {renderCard()}
                  {(() => {
                    const insurerStripHeight = config.showInsurers && config.selectedInsurers.length > 0 ? 110 : 0;
                    return (
                      <img
                        src={rochaLogo}
                        alt=""
                        aria-hidden
                        crossOrigin="anonymous"
                        style={{
                          position: "absolute",
                          bottom: insurerStripHeight - 8,
                          left: 14,
                          width: 70,
                          height: "auto",
                          opacity: 0.45,
                          pointerEvents: "none",
                          userSelect: "none",
                          filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BannerCreator;
