import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Share2,
  ArrowLeft,
  Layout,
  Type,
  Palette,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import localLogo from "@/assets/rocha-sales-logo.png";

type LayoutType = "classic" | "centered" | "horizontal";
type ColorScheme = "gold-dark" | "light" | "dark" | "blue";
type TextAlign = "left" | "center" | "right";

const COLOR_SCHEMES: Record<ColorScheme, { bg: string; text: string; accent: string; qrBg: string; qrFg: string; ctaBg: string; ctaText: string; subtitle: string; desc: string; label: string }> = {
  "gold-dark": {
    bg: "#1a1a2e",
    text: "#ffffff",
    accent: "#C9A84C",
    qrBg: "#ffffff",
    qrFg: "#1a1a2e",
    ctaBg: "#C9A84C",
    ctaText: "#1a1a2e",
    subtitle: "#C9A84C",
    desc: "#d1d5db",
    label: "Dourado Escuro",
  },
  light: {
    bg: "#f8f6f0",
    text: "#1a1a2e",
    accent: "#C9A84C",
    qrBg: "#ffffff",
    qrFg: "#1a1a2e",
    ctaBg: "#C9A84C",
    ctaText: "#ffffff",
    subtitle: "#C9A84C",
    desc: "#4b5563",
    label: "Claro Elegante",
  },
  dark: {
    bg: "#0f0f0f",
    text: "#ffffff",
    accent: "#C9A84C",
    qrBg: "#ffffff",
    qrFg: "#0f0f0f",
    ctaBg: "#C9A84C",
    ctaText: "#0f0f0f",
    subtitle: "#e5c76b",
    desc: "#9ca3af",
    label: "Escuro Puro",
  },
  blue: {
    bg: "#0c1b3a",
    text: "#ffffff",
    accent: "#60a5fa",
    qrBg: "#ffffff",
    qrFg: "#0c1b3a",
    ctaBg: "#3b82f6",
    ctaText: "#ffffff",
    subtitle: "#93c5fd",
    desc: "#94a3b8",
    label: "Azul Corporativo",
  },
};

const BannerCreator = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const referralLink = profile?.tracking_code
    ? `${window.location.origin}/ref/${profile.tracking_code}`
    : "";

  // Editor state
  const [title, setTitle] = useState("Proteja quem você ama");
  const [subtitle, setSubtitle] = useState("Seguros sob medida para você");
  const [description, setDescription] = useState("Faça sua cotação gratuita e descubra as melhores opções de seguro para sua família e empresa.");
  const [highlight, setHighlight] = useState("✨ Consultoria 100% gratuita");
  const [cta, setCta] = useState("Escaneie o QR Code");
  const [layout, setLayout] = useState<LayoutType>("classic");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("gold-dark");
  const [textAlign, setTextAlign] = useState<TextAlign>("left");

  const colors = COLOR_SCHEMES[colorScheme];

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `banner-${profile?.full_name?.toLowerCase().replace(/\s+/g, "-") || "afiliado"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Banner exportado!",
        description: "A imagem foi salva no seu dispositivo.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro ao exportar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "banner.png", { type: "image/png" });
          const shareData = { files: [file], title: "Meu Banner" };
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "banner.png";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      // user cancelled
    }
  };

  // QR Code block
  const QRBlock = ({ size = 140 }: { size?: number }) => (
    <div style={{ background: colors.qrBg, borderRadius: 16, padding: 12, display: "inline-block" }}>
      <QRCodeSVG
        value={referralLink || "https://example.com"}
        size={size}
        level="H"
        bgColor={colors.qrBg}
        fgColor={colors.qrFg}
        includeMargin={false}
      />
    </div>
  );

  // Text block
  const TextBlock = () => (
    <div style={{ textAlign }}>
      {highlight && (
        <p style={{ color: colors.accent, fontSize: 14, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>
          {highlight}
        </p>
      )}
      <h2 style={{
        color: colors.text,
        fontSize: layout === "horizontal" ? 28 : 32,
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: 10,
        fontFamily: "'Playfair Display', serif",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          color: colors.subtitle,
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 10,
        }}>
          {subtitle}
        </p>
      )}
      {description && (
        <p style={{
          color: colors.desc,
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 16,
        }}>
          {description}
        </p>
      )}
      {cta && (
        <div style={{ textAlign }}>
          <span style={{
            display: "inline-block",
            background: colors.ctaBg,
            color: colors.ctaText,
            padding: "10px 24px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}>
            {cta}
          </span>
        </div>
      )}
    </div>
  );

  // Footer image placeholder
  const FooterImage = () => (
    <div style={{
      width: "100%",
      height: 180,
      background: `linear-gradient(135deg, ${colors.accent}22, ${colors.accent}44)`,
      borderRadius: "0 0 16px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(to top, ${colors.bg}cc, transparent)`,
      }} />
      <img
        src={localLogo}
        alt="Logo"
        style={{ height: 60, objectFit: "contain", position: "relative", zIndex: 1, opacity: 0.7 }}
        crossOrigin="anonymous"
      />
    </div>
  );

  // Layout renderers
  const renderClassic = () => (
    <div style={{
      width: 400,
      minHeight: 500,
      background: colors.bg,
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{ padding: "32px 28px 24px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <TextBlock />
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", justifyContent: textAlign === "right" ? "flex-end" : textAlign === "center" ? "center" : "flex-start" }}>
          <QRBlock />
        </div>
      </div>
      <FooterImage />
    </div>
  );

  const renderCentered = () => (
    <div style={{
      width: 400,
      minHeight: 500,
      background: colors.bg,
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      textAlign: "center",
    }}>
      <div style={{ padding: "32px 28px 24px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <TextBlock />
        <div style={{ marginTop: 24 }}>
          <QRBlock size={160} />
        </div>
      </div>
      <FooterImage />
    </div>
  );

  const renderHorizontal = () => (
    <div style={{
      width: 400,
      minHeight: 500,
      background: colors.bg,
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{ padding: "32px 24px 24px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <TextBlock />
          </div>
          <div style={{ flexShrink: 0, paddingTop: 4 }}>
            <QRBlock size={120} />
          </div>
        </div>
      </div>
      <FooterImage />
    </div>
  );

  const renderCard = () => {
    switch (layout) {
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
      {/* Header */}
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
            {/* Controls Panel */}
            <div className="w-full lg:w-[380px] flex-shrink-0 space-y-6">
              {/* Texts */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-4">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Type className="w-4 h-4" />
                  Textos
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title" className="text-xs">Título</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título principal" />
                  </div>
                  <div>
                    <Label htmlFor="subtitle" className="text-xs">Subtítulo</Label>
                    <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo" />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-xs">Descrição</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição curta" rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="highlight" className="text-xs">Frase de Destaque</Label>
                    <Input id="highlight" value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="Ex: ✨ Consultoria gratuita" />
                  </div>
                  <div>
                    <Label htmlFor="cta" className="text-xs">CTA (Chamada)</Label>
                    <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Ex: Escaneie o QR Code" />
                  </div>
                </div>
              </div>

              {/* Layout */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-4">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Layout className="w-4 h-4" />
                  Layout
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["classic", "centered", "horizontal"] as LayoutType[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLayout(l)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        layout === l
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {l === "classic" ? "Clássico" : l === "centered" ? "Central" : "Lado a Lado"}
                    </button>
                  ))}
                </div>

                <div>
                  <Label className="text-xs">Alinhamento do Texto</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(["left", "center", "right"] as TextAlign[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setTextAlign(a)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          textAlign === a
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-4">
                <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                  <Palette className="w-4 h-4" />
                  Cores
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(COLOR_SCHEMES) as [ColorScheme, typeof COLOR_SCHEMES[ColorScheme]][]).map(([key, scheme]) => (
                    <button
                      key={key}
                      onClick={() => setColorScheme(key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                        colorScheme === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: scheme.bg, border: `2px solid ${scheme.accent}` }} />
                      {scheme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Export buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
                <Button
                  variant="hero"
                  className="flex-1 gap-2"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Baixar PNG
                </Button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-4">Preview em tempo real</p>
              <div className="bg-muted/50 rounded-2xl p-6 border border-border inline-block">
                <div ref={cardRef}>
                  {renderCard()}
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
