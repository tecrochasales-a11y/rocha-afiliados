import { useState, useEffect } from "react";
import { Share2, QrCode, Eye, Copy, MessageCircle, Check } from "lucide-react";

export const CompartilharPreview = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timings = [800, 1000, 800, 1800, 2000];
    let i = 0;
    const next = () => {
      if (i >= timings.length) {
        setTimeout(() => { setStep(0); i = 0; next(); }, 500);
        return;
      }
      setTimeout(() => { setStep(i + 1); i++; next(); }, timings[i]);
    };
    next();
    return () => { i = timings.length + 1; };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Compartilhar Link</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2.5 relative">
          <span className="text-xs text-foreground truncate font-mono flex-1">app.exemplo.com/ref/abc123</span>
          <button
            className={`p-1.5 rounded transition-all duration-300 ${
              step >= 3 ? "bg-green-500 text-primary-foreground scale-110" : "bg-primary text-primary-foreground"
            }`}
          >
            {step >= 3 ? <Check size={12} /> : <Copy size={12} />}
          </button>
          {step >= 4 && (
            <div className="absolute -top-8 right-0 bg-foreground text-background text-[10px] px-2 py-1 rounded shadow-lg animate-fade-in">
              Link copiado! ✓
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: MessageCircle, label: "WhatsApp", color: "bg-green-500/10 text-green-600" },
            { icon: Share2, label: "Redes", color: "bg-blue-500/10 text-blue-600" },
            { icon: QrCode, label: "QR Code", color: "bg-primary/10 text-primary" },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-500 ${item.color}`}
              style={{
                opacity: step >= 1 ? 1 : 0,
                transform: step >= 1 ? "scale(1)" : "scale(0.8)",
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <item.icon size={16} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const QRCodePreview = () => {
  const [visible, setVisible] = useState(false);
  const [cells, setCells] = useState<boolean[]>([]);

  useEffect(() => {
    const generateCells = () => Array.from({ length: 25 }, () => Math.random() > 0.4);
    setTimeout(() => { setVisible(true); setCells(generateCells()); }, 600);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setCells(generateCells()); setVisible(true); }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">QR Code</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 flex flex-col items-center gap-3">
        <div
          className="w-32 h-32 bg-foreground/5 border-2 border-dashed border-border rounded-lg flex items-center justify-center transition-all duration-700"
          style={{
            transform: visible ? "scale(1)" : "scale(0.5)",
            opacity: visible ? 1 : 0,
          }}
        >
          <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-20 h-20">
            {cells.map((filled, i) => (
              <div
                key={i}
                className={`rounded-sm transition-all duration-300 ${filled ? "bg-foreground" : "bg-transparent"}`}
                style={{ transitionDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">Escaneie com a câmera do celular</p>
        <div className="h-7 w-full rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">
          Baixar QR Code
        </div>
      </div>
    </div>
  );
};

export const AcompanharLeadsPreview = () => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const statuses = [
    { status: "Pendente", color: "bg-amber-500", count: 5 },
    { status: "Contactado", color: "bg-blue-500", count: 8 },
    { status: "Qualificado", color: "bg-purple-500", count: 3 },
    { status: "Convertido", color: "bg-green-500", count: 12 },
    { status: "Perdido", color: "bg-destructive", count: 2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= statuses.length - 1) {
          setTimeout(() => setActiveIndex(-1), 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Status dos Leads</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
        {statuses.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 transition-all duration-500 rounded-md px-1 py-0.5 ${
              i === activeIndex ? "bg-muted/80 scale-[1.02]" : ""
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${s.color} ${
                i <= activeIndex ? "scale-125" : ""
              }`}
            />
            <span className="text-xs text-foreground flex-1">{s.status}</span>
            <div className="h-3 bg-muted rounded-full flex-1 max-w-[120px] overflow-hidden">
              <div
                className={`h-full ${s.color} rounded-full transition-all duration-700`}
                style={{ width: i <= activeIndex ? `${(s.count / 12) * 100}%` : "0%" }}
              />
            </div>
            <span
              className="text-[10px] text-muted-foreground w-4 text-right transition-all duration-300"
              style={{ opacity: i <= activeIndex ? 1 : 0.3 }}
            >
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
