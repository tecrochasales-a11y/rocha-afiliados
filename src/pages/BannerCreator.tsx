import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

type PixelStats = {
  darkCount: number;
  whiteCount: number;
  transparentCount: number;
  otherCount: number;
  sampleSize: number;
};

type ExportDebugChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

type ExportDebugInfo = {
  timestamp: string;
  referralLinkPresent: boolean;
  qrTarget: {
    width: number;
    height: number;
    dataExportIgnore: string | null;
    previewCanvasWidth: number;
    previewCanvasHeight: number;
    padding: { left: number; right: number; top: number; bottom: number };
    radius: number;
  };
  offscreenQr: {
    width: number;
    height: number;
    darkCount: number;
    whiteCount: number;
  };
  capturedCanvas: {
    width: number;
    height: number;
    qrBg: string | null;
  };
  overlayPlacement: {
    layout: LayoutType;
    textAlign: TextAlign;
    x: number;
    y: number;
    w: number;
    h: number;
    innerX: number;
    innerY: number;
    innerSide: number;
    qrRect: { width: number; height: number };
  };
  beforeOverlay: PixelStats | null;
  afterOverlay: PixelStats | null;
  finalCanvas: {
    width: number;
    height: number;
    composedOnFreshCanvas: boolean;
  };
  issues: string[];
  checklist: ExportDebugChecklistItem[];
};

type ExportPreviewState = {
  qrDataUrl: string;
  finalDataUrl: string;
  fileName: string;
  qrSize: number;
  debug: ExportDebugInfo;
};

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
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  const brandLogoRef = useRef<HTMLImageElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPreview, setExportPreview] = useState<ExportPreviewState | null>(null);

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

  // Verifies that the visible QR canvas inside the preview has actually been painted
  // before we reuse it for the export overlay.
  const waitForQrCanvasReady = async (
    qrNode: HTMLElement | null,
    label: string,
    maxAttempts = 8,
    delayMs = 150
  ): Promise<HTMLCanvasElement> => {
    if (!qrNode) {
      throw new Error("Área visível do QR não encontrada para exportação.");
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const candidate = qrNode.querySelector(
        "canvas"
      ) as HTMLCanvasElement | null;

      if (candidate && candidate.width > 0 && candidate.height > 0) {
        // Confirm it's not a blank canvas by sampling a few pixels.
        try {
          const probe = candidate.getContext("2d");
          if (probe) {
            const { data } = probe.getImageData(
              0,
              0,
              Math.min(candidate.width, 32),
              Math.min(candidate.height, 32)
            );
            let hasInk = false;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] !== 0) {
                // any non-transparent pixel implies QR was drawn
                // (qrcode.react paints opaque white background + black modules)
                if (data[i - 3] < 250 || data[i - 2] < 250 || data[i - 1] < 250) {
                  hasInk = true;
                  break;
                }
              }
            }
            if (hasInk) return candidate;
          } else {
            return candidate;
          }
        } catch {
          // CORS-tainted canvas would throw — but our QR is local, so just accept it.
          return candidate;
        }
      }

      console.warn(
        `[QR export] ${label} canvas not ready (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error("QR Code de exportação não ficou pronto a tempo.");
  };

  // Ensures all <img> tags inside the banner have decoded bitmaps available
  // before html2canvas runs. Retries with backoff for slow assets (logo, etc.).
  const waitForBannerImages = async (
    node: HTMLElement,
    maxAttempts = 6,
    delayMs = 200
  ): Promise<void> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const images = Array.from(node.querySelectorAll("img"));
      const pending = images.filter(
        (img) => !img.complete || img.naturalWidth === 0
      );

      if (pending.length === 0) {
        await Promise.all(
          images.map((img) =>
            img.decode ? img.decode().catch(() => {}) : Promise.resolve()
          )
        );
        return;
      }

      console.warn(
        `[QR export] ${pending.length} image(s) still loading (attempt ${attempt}/${maxAttempts}). Waiting ${delayMs}ms...`,
        pending.map((p) => p.src)
      );

      await Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
              setTimeout(done, delayMs);
            })
        )
      );
    }
    console.warn("[QR export] Proceeding with export despite unresolved images.");
  };

  const waitForExportImageReady = async (
    image: HTMLImageElement | null,
    label: string,
    maxAttempts = 8,
    delayMs = 150
  ): Promise<HTMLImageElement | null> => {
    if (!image) return null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (image.complete && image.naturalWidth > 0) {
        await image.decode?.().catch(() => {});
        return image;
      }

      console.warn(
        `[Banner export] ${label} bitmap not ready (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`,
        image.currentSrc || image.src
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }

    console.warn(`[Banner export] ${label} bitmap was not confirmed before capture.`);
    return image.complete && image.naturalWidth > 0 ? image : null;
  };

  const getContainedImageRect = (
    containerRect: DOMRect,
    image: HTMLImageElement
  ) => {
    const naturalWidth = image.naturalWidth || containerRect.width;
    const naturalHeight = image.naturalHeight || containerRect.height;

    if (naturalWidth <= 0 || naturalHeight <= 0) {
      return {
        left: containerRect.left,
        top: containerRect.top,
        width: containerRect.width,
        height: containerRect.height,
      };
    }

    const scale = Math.min(
      containerRect.width / naturalWidth,
      containerRect.height / naturalHeight,
      1
    );

    const width = Math.max(1, naturalWidth * scale);
    const height = Math.max(1, naturalHeight * scale);

    return {
      left: containerRect.left + (containerRect.width - width) / 2,
      top: containerRect.top + (containerRect.height - height) / 2,
      width,
      height,
    };
  };

  const readPixelStats = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): PixelStats | null => {
    const sx = Math.max(0, Math.floor(x));
    const sy = Math.max(0, Math.floor(y));
    const sw = Math.min(ctx.canvas.width - sx, Math.max(0, Math.floor(width)));
    const sh = Math.min(ctx.canvas.height - sy, Math.max(0, Math.floor(height)));
    if (sw <= 0 || sh <= 0) return null;

    const sample = ctx.getImageData(sx, sy, sw, sh);
    let darkCount = 0;
    let whiteCount = 0;
    let transparentCount = 0;
    let otherCount = 0;

    for (let i = 0; i < sample.data.length; i += 4) {
      const r = sample.data[i];
      const g = sample.data[i + 1];
      const b = sample.data[i + 2];
      const a = sample.data[i + 3];

      if (a === 0) transparentCount++;
      else if (r < 80 && g < 80 && b < 80) darkCount++;
      else if (r > 240 && g > 240 && b > 240) whiteCount++;
      else otherCount++;
    }

    return {
      darkCount,
      whiteCount,
      transparentCount,
      otherCount,
      sampleSize: sample.data.length / 4,
    };
  };

  // Renders an INDEPENDENT QR canvas off-screen, decoupled from the visible preview.
  // This avoids any race with html2canvas / preview re-renders.
  const renderExportQrCanvas = async (
    sizePx: number
  ): Promise<{ canvas: HTMLCanvasElement; stats: { darkCount: number; whiteCount: number } }> => {
    const value = (referralLink || "").trim();
    if (!value) {
      throw new Error("Link de indicação indisponível. Verifique seu código de afiliado.");
    }

    const out = document.createElement("canvas");
    out.width = sizePx;
    out.height = sizePx;

    await QRCode.toCanvas(out, value, {
      width: sizePx,
      margin: 0,
      errorCorrectionLevel: "H",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const outCtx = out.getContext("2d");
    if (!outCtx) throw new Error("Contexto 2D indisponível para o QR de exportação.");

    const { data } = outCtx.getImageData(0, 0, out.width, out.height);
    let darkCount = 0;
    let whiteCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < 80 && g < 80 && b < 80) darkCount++;
      else if (r > 240 && g > 240 && b > 240) whiteCount++;
    }

    if (darkCount <= 50) {
      throw new Error("QR Code de exportação ficou sem módulos escuros.");
    }

    console.warn("[QR export] Off-screen QR rendered", {
      width: out.width,
      height: out.height,
      darkCount,
      whiteCount,
    });

    return {
      canvas: out,
      stats: { darkCount, whiteCount },
    };
  };

  // Capture banner with html2canvas and overlay a freshly generated QR bitmap
  // at the position/size of the QR wrapper. Decoupled from the live preview.
  const captureBannerCanvas = async (): Promise<{ canvas: HTMLCanvasElement; debug: ExportDebugInfo }> => {
    const node = cardRef.current;
    if (!node) {
      throw new Error("Banner não está pronto para exportação.");
    }
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForCardAssets(node);
    await waitForBannerImages(node);

    const SCALE = 2;

    const qrTarget = node.querySelector('[data-qr-target="true"]') as HTMLElement | null;

    if (!qrTarget) {
      throw new Error("Área do QR não encontrada no layout atual.");
    }

    const qrStyles = window.getComputedStyle(qrTarget);
    const previewQrCanvas = qrTarget.querySelector("canvas") as HTMLCanvasElement | null;
    const padL = parseFloat(qrStyles.paddingLeft) || 0;
    const padR = parseFloat(qrStyles.paddingRight) || 0;
    const padT = parseFloat(qrStyles.paddingTop) || 0;
    const padB = parseFloat(qrStyles.paddingBottom) || 0;
    const qrRadius = parseFloat(qrStyles.borderRadius) || 14;

    const cardRect = node.getBoundingClientRect();
    const qrRect = qrTarget.getBoundingClientRect();
    const liveLogoTarget = config.logoData
      ? logoWrapperRef.current ?? (node.querySelector('[data-logo-target="true"]') as HTMLDivElement | null)
      : null;
    const liveLogoImage = config.logoData
      ? logoImageRef.current ?? (node.querySelector('[data-logo-image="true"]') as HTMLImageElement | null)
      : null;
    const readyLogoImage = await waitForExportImageReady(liveLogoImage, "Custom logo");
    const logoTargetRect = liveLogoTarget?.getBoundingClientRect() ?? null;
    const logoRect = readyLogoImage && logoTargetRect
      ? getContainedImageRect(logoTargetRect, readyLogoImage)
      : readyLogoImage?.getBoundingClientRect() ?? null;
    const liveBrandLogo = brandLogoRef.current ?? (node.querySelector('[data-brand-logo="true"]') as HTMLImageElement | null);
    const readyBrandLogo = await waitForExportImageReady(liveBrandLogo, "Brand logo");
    const insurerStripHeight = config.showInsurers && config.selectedInsurers.length > 0 ? 110 : 0;
    const brandLogoBottom = insurerStripHeight - 8;
    const brandLogoLeft = 14;
    const brandLogoWidth = 70;

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

    // Render QR independently off-screen — does NOT depend on the visible preview.
    const { canvas: qrCanvas, stats: qrStats } = await renderExportQrCanvas(innerSide);
    console.warn("[QR export] Overlay placement", {
      layout: config.layout,
      textAlign: config.textAlign,
      x, y, w, h, innerX, innerY, innerSide,
      qrRect: { width: qrRect.width, height: qrRect.height },
    });

    let captured: HTMLCanvasElement;
    try {
      captured = await html2canvas(node, {
        scale: SCALE,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        ignoreElements: (element) =>
          element instanceof HTMLElement &&
          (element.dataset.exportIgnore === "custom-logo" ||
            element.dataset.exportIgnore === "brand-logo"),
        // NOTE: do NOT ignore the QR wrapper — it must keep its space in the
        // captured layout so the surrounding text doesn't collapse over it.
        // We overpaint our own off-screen QR on top of it afterwards.
      });
    } catch (err) {
      console.error("[QR export] html2canvas failed", err);
      throw new Error(
        `Falha ao capturar o banner: ${err instanceof Error ? err.message : "erro desconhecido"}`
      );
    }

    const composed = document.createElement("canvas");
    composed.width = captured.width;
    composed.height = captured.height;

    const ctx = composed.getContext("2d");
    if (!ctx) throw new Error("Contexto 2D indisponível para compor o QR.");
    ctx.drawImage(captured, 0, 0);

    const beforeOverlay = readPixelStats(ctx, x, y, w, h);

    console.warn("[QR export] Captured canvas dims", {
      width: captured.width,
      height: captured.height,
      qrCanvasW: qrCanvas.width,
      qrCanvasH: qrCanvas.height,
      qrBg: colors.qrBg,
    });

    ctx.save();
    ctx.fillStyle = colors.qrBg || "#ffffff";
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, qrRadius * SCALE);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, innerX, innerY, innerSide, innerSide);
    ctx.restore();

    console.warn("[QR export] QR overlay painted", { x, y, w, h, innerX, innerY, innerSide });

    const afterOverlay = readPixelStats(ctx, x, y, w, h);
    console.warn("[QR export] QR area validation", afterOverlay);

    if (readyLogoImage && logoRect && logoRect.width > 0 && logoRect.height > 0) {
      const logoX = (logoRect.left - cardRect.left) * SCALE;
      const logoY = (logoRect.top - cardRect.top) * SCALE;
      const logoW = logoRect.width * SCALE;
      const logoH = logoRect.height * SCALE;
      ctx.drawImage(readyLogoImage, logoX, logoY, logoW, logoH);
    }

    if (readyBrandLogo && readyBrandLogo.naturalWidth > 0 && readyBrandLogo.naturalHeight > 0) {
      const brandW = brandLogoWidth * SCALE;
      const brandH = (brandLogoWidth * (readyBrandLogo.naturalHeight / readyBrandLogo.naturalWidth)) * SCALE;
      const brandX = brandLogoLeft * SCALE;
      const brandY = captured.height - brandH - brandLogoBottom * SCALE;

      console.warn("[Banner export] Drawing brand logo overlay", {
        layout: config.layout,
        textAlign: config.textAlign,
        brandX,
        brandY,
        brandW,
        brandH,
      });

      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.drawImage(readyBrandLogo, brandX, brandY, brandW, brandH);
      ctx.restore();
    }

    const issues: string[] = [];
    if (!referralLink.trim()) issues.push("Link de indicação ausente.");
    if (!previewQrCanvas) issues.push("Canvas do QR no preview não foi encontrado dentro da área marcada.");
    if (qrStats.darkCount <= 50) issues.push("QR off-screen foi gerado sem módulos escuros suficientes.");
    if (!beforeOverlay) issues.push("Não foi possível ler os pixels da área do QR antes da composição.");
    if (!afterOverlay) issues.push("Não foi possível ler os pixels da área do QR após a composição.");
    if (afterOverlay && afterOverlay.darkCount <= 50) issues.push("A área final do QR ficou praticamente sem pixels escuros.");
    if (
      beforeOverlay &&
      afterOverlay &&
      afterOverlay.darkCount <= beforeOverlay.darkCount + 500
    ) {
      issues.push("A composição final quase não alterou a quantidade de pixels escuros na área do QR.");
    }
    if (
      beforeOverlay &&
      afterOverlay &&
      afterOverlay.whiteCount <= beforeOverlay.whiteCount + 500
    ) {
      issues.push("O fundo branco do QR não apareceu com ganho visível na composição final.");
    }
    if (x < 0 || y < 0 || x + w > composed.width || y + h > composed.height) {
      issues.push("A posição calculada do QR extrapola os limites do canvas final.");
    }

    const debug: ExportDebugInfo = {
      timestamp: new Date().toISOString(),
      referralLinkPresent: !!referralLink.trim(),
      qrTarget: {
        width: qrRect.width,
        height: qrRect.height,
        dataExportIgnore: qrTarget.dataset.exportIgnore ?? null,
        previewCanvasWidth: previewQrCanvas?.width ?? 0,
        previewCanvasHeight: previewQrCanvas?.height ?? 0,
        padding: { left: padL, right: padR, top: padT, bottom: padB },
        radius: qrRadius,
      },
      offscreenQr: {
        width: qrCanvas.width,
        height: qrCanvas.height,
        darkCount: qrStats.darkCount,
        whiteCount: qrStats.whiteCount,
      },
      capturedCanvas: {
        width: captured.width,
        height: captured.height,
        qrBg: colors.qrBg || null,
      },
      overlayPlacement: {
        layout: config.layout,
        textAlign: config.textAlign,
        x,
        y,
        w,
        h,
        innerX,
        innerY,
        innerSide,
        qrRect: { width: qrRect.width, height: qrRect.height },
      },
      beforeOverlay,
      afterOverlay,
      finalCanvas: {
        width: composed.width,
        height: composed.height,
        composedOnFreshCanvas: true,
      },
      issues,
      checklist: [
        {
          id: "link",
          label: "Link do afiliado disponível",
          ok: !!referralLink.trim(),
          detail: referralLink.trim() ? "O QR tem URL para codificar." : "Sem URL, o QR não pode ser montado.",
        },
        {
          id: "preview-target",
          label: "Área do QR encontrada no layout",
          ok: qrRect.width > 0 && qrRect.height > 0,
          detail: `Área medida: ${Math.round(qrRect.width)}x${Math.round(qrRect.height)}px; data-export-ignore=${qrTarget.dataset.exportIgnore ?? "null"}.`,
        },
        {
          id: "preview-canvas",
          label: "Canvas do preview detectado",
          ok: !!previewQrCanvas,
          detail: previewQrCanvas
            ? `Canvas do preview: ${previewQrCanvas.width}x${previewQrCanvas.height}px.`
            : "Nenhum canvas do preview foi encontrado dentro do wrapper do QR.",
        },
        {
          id: "offscreen-qr",
          label: "QR off-screen gerado com pixels válidos",
          ok: qrStats.darkCount > 50 && qrStats.whiteCount > 50,
          detail: `Off-screen ${qrCanvas.width}x${qrCanvas.height}px; dark=${qrStats.darkCount}; white=${qrStats.whiteCount}.`,
        },
        {
          id: "placement",
          label: "Posição calculada dentro do canvas final",
          ok: x >= 0 && y >= 0 && x + w <= composed.width && y + h <= composed.height,
          detail: `x=${Math.round(x)}, y=${Math.round(y)}, w=${Math.round(w)}, h=${Math.round(h)}, innerSide=${Math.round(innerSide)}.`,
        },
        {
          id: "overlay-diff",
          label: "Área final mudou após a composição",
          ok: !!beforeOverlay && !!afterOverlay && afterOverlay.darkCount > beforeOverlay.darkCount + 500,
          detail:
            beforeOverlay && afterOverlay
              ? `Antes dark/white=${beforeOverlay.darkCount}/${beforeOverlay.whiteCount}; depois=${afterOverlay.darkCount}/${afterOverlay.whiteCount}.`
              : "Não foi possível comparar pixels antes/depois.",
        },
        {
          id: "overlay-bg",
          label: "Fundo branco do QR foi pintado",
          ok: !!beforeOverlay && !!afterOverlay && afterOverlay.whiteCount > beforeOverlay.whiteCount + 500,
          detail:
            beforeOverlay && afterOverlay
              ? `white antes=${beforeOverlay.whiteCount}; white depois=${afterOverlay.whiteCount}.`
              : "Não foi possível validar o fundo branco.",
        },
      ],
    };

    console.warn("[QR export] Debug snapshot", debug);

    return { canvas: composed, debug };
  };


  // Captures the banner with progressive backoff. If the first attempt fails
  // (commonly because QR/logo bitmaps weren't ready), waits longer and retries.
  const captureBannerCanvasWithRetry = async (): Promise<{ canvas: HTMLCanvasElement; debug: ExportDebugInfo }> => {
    const delays = [1000, 1500, 2500];
    let lastErr: unknown;
    for (let i = 0; i < delays.length; i++) {
      try {
        await new Promise((r) => setTimeout(r, delays[i]));
        return await captureBannerCanvas();
      } catch (err) {
        lastErr = err;
        console.warn(
          `[QR export] Capture attempt ${i + 1}/${delays.length} failed:`,
          err instanceof Error ? err.message : err
        );
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error("Falha ao capturar o banner após múltiplas tentativas.");
  };

  const handleExport = async () => {
    if (!cardRef.current) {
      toast({ title: "Erro ao exportar", description: "Banner não encontrado.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const { canvas } = await captureBannerCanvasWithRetry();
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

  // Generates the export (final canvas + standalone QR bitmap) and opens
  // a preview dialog so the user can confirm before downloading the PNG.
  const handlePreviewExport = async () => {
    if (!cardRef.current) {
      toast({ title: "Erro ao pré-visualizar", description: "Banner não encontrado.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      // Generate the standalone QR exactly as the export pipeline will use it.
      const { canvas: qrPreviewCanvas } = await renderExportQrCanvas(512);
      const qrDataUrl = qrPreviewCanvas.toDataURL("image/png");

      // Generate the final composed banner (same path as the actual download).
      const { canvas, debug } = await captureBannerCanvasWithRetry();
      const finalDataUrl = canvas.toDataURL("image/png");
      if (!finalDataUrl || finalDataUrl === "data:,") {
        throw new Error("Imagem gerada está vazia.");
      }

      const fileName = `banner-${profile?.full_name?.toLowerCase().replace(/\s+/g, "-") || "afiliado"}.png`;
      setExportPreview({ qrDataUrl, finalDataUrl, fileName, qrSize: qrPreviewCanvas.width, debug });
    } catch (error) {
      console.error("[QR export] handlePreviewExport error:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido ao pré-visualizar.";
      toast({ title: "Falha na pré-visualização", description: msg, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const confirmPreviewDownload = () => {
    if (!exportPreview) return;
    const link = document.createElement("a");
    link.download = exportPreview.fileName;
    link.href = exportPreview.finalDataUrl;
    link.click();
    toast({ title: "Banner exportado!", description: "A imagem foi salva no seu dispositivo." });
    setExportPreview(null);
  };

  const handleShare = async () => {
    if (!cardRef.current) {
      toast({ title: "Erro ao compartilhar", description: "Banner não encontrado.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const { canvas } = await captureBannerCanvasWithRetry();
      // Validação equivalente à do handleExport (detecta canvas vazio)
      const dataUrl = canvas.toDataURL("image/png");
      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Imagem gerada está vazia.");
      }

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob || blob.size === 0) {
        throw new Error("Não foi possível gerar a imagem para compartilhamento.");
      }

      const fileName = `banner-${profile?.full_name?.toLowerCase().replace(/\s+/g, "-") || "afiliado"}.png`;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: "image/png" });
        const shareData = { files: [file], title: "Meu Banner" };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return;
          } catch (shareErr) {
            // Usuário cancelou — silencioso.
            if ((shareErr as Error)?.name === "AbortError") return;
            throw shareErr;
          }
        }
      }

      // Fallback: download direto, mesmo padrão de nome do handleExport
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[QR export] handleShare error:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido ao compartilhar.";
      toast({
        title: "Falha ao compartilhar banner",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Banner blocks ───
  const QRBlock = ({ size = 130 }: { size?: number }) => (
    <div
      ref={qrWrapperRef}
      data-qr-target="true"
      data-export-ignore="qr"
      key={`qr-${config.layout}-${size}-${referralLink}`}
      style={{ background: colors.qrBg, borderRadius: 14, padding: 10, display: "inline-block" }}
    >
      <QRCodeCanvas
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
      <div style={{ display: "flex", justifyContent: justify, width: "100%", marginBottom: 16 }}>
        <div
          ref={logoWrapperRef}
          data-logo-target="true"
          data-export-ignore="custom-logo"
          style={{ height: config.logoSize, maxWidth: "70%", display: "flex", alignItems: "center" }}
        >
          <img ref={logoImageRef} data-logo-image="true" src={config.logoData} alt="Logo" style={{ maxHeight: config.logoSize, maxWidth: "100%", width: "auto", height: "auto", display: "block" }} crossOrigin="anonymous" />
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
                <Button variant="hero" className="flex-1 gap-2" onClick={handlePreviewExport} disabled={isExporting}>
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Pré-visualizar e baixar
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
                        ref={brandLogoRef}
                        data-brand-logo="true"
                        data-export-ignore="brand-logo"
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

      <Dialog open={!!exportPreview} onOpenChange={(open) => !open && setExportPreview(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização do download</DialogTitle>
            <DialogDescription>
              Confira como o banner e o QR Code ficarão no PNG final antes de baixar.
              Compare o QR isolado abaixo com o do preview ao vivo.
            </DialogDescription>
          </DialogHeader>

          {exportPreview && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">QR Code que será embutido ({exportPreview.qrSize}px)</p>
                <div className="inline-block bg-white p-3 rounded-lg border border-border">
                  <img
                    src={exportPreview.qrDataUrl}
                    alt="QR de exportação"
                    style={{ width: 180, height: 180, imageRendering: "pixelated" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Se este QR estiver em branco, o problema está na geração off-screen.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Banner final composto</p>
                <div className="bg-muted/40 rounded-lg p-3 border border-border">
                  <img
                    src={exportPreview.finalDataUrl}
                    alt="Banner final"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Se o banner estiver correto mas o QR no banner sair em branco,
                  o problema é na composição (drawImage / posicionamento).
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setExportPreview(null)}>
              Cancelar
            </Button>
            <Button variant="hero" className="gap-2" onClick={confirmPreviewDownload}>
              <Download className="w-4 h-4" />
              Confirmar e baixar PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerCreator;
