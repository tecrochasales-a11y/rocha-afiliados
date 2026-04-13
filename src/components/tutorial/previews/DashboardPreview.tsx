import { useState, useEffect } from "react";
import { BarChart3, Users, DollarSign, TrendingUp, Copy, Link, Check } from "lucide-react";

const useCountUp = (target: number, duration = 1500, delay = 0) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setValue(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      tick();
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
};

export const DashboardMetricsPreview = () => {
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev >= 4) {
          // Reset loop
          setTimeout(() => setVisibleCards(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const leads = useCountUp(127, 1200, 400);
  const converted = useCountUp(34, 1200, 800);
  const lost = useCountUp(12, 1200, 1200);
  const balance = useCountUp(1250, 1200, 1600);

  const cards = [
    { icon: Users, label: "Total Leads", value: leads.toString(), color: "bg-primary" },
    { icon: TrendingUp, label: "Convertidos", value: converted.toString(), color: "bg-green-500" },
    { icon: BarChart3, label: "Perdidos", value: lost.toString(), color: "bg-destructive" },
    { icon: DollarSign, label: "Saldo", value: `R$ ${balance.toLocaleString("pt-BR")}`, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Cards de Métricas</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-card border border-border/50 rounded-lg p-3 flex items-center gap-3 transition-all duration-500"
            style={{
              opacity: i < visibleCards ? 1 : 0,
              transform: i < visibleCards ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <div className={`p-2 rounded-md ${card.color}`}>
              <card.icon size={14} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{card.label}</p>
              <p className="text-sm font-bold text-foreground">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardLinkPreview = () => {
  const [step, setStep] = useState(0);
  // 0: idle, 1: show link, 2: cursor moves to button, 3: button clicked, 4: show "Copiado!"

  useEffect(() => {
    const timings = [600, 1200, 800, 1500, 2000];
    let current = 0;
    const next = () => {
      if (current >= timings.length) {
        setTimeout(() => setStep(0), 500);
        current = 0;
        return;
      }
      setTimeout(() => {
        setStep(current + 1);
        current++;
        next();
      }, timings[current]);
    };
    next();
    return () => { current = timings.length + 1; };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Link de Indicação</span>
      </div>
      <div
        className="bg-card border border-border/50 rounded-lg p-4 space-y-3 transition-all duration-500"
        style={{ opacity: step >= 1 ? 1 : 0.4 }}
      >
        <p className="text-xs text-muted-foreground">Seu link exclusivo</p>
        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2.5 relative">
          <Link size={14} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-foreground truncate font-mono">app.exemplo.com/ref/abc123</span>
          <button
            className={`ml-auto p-1.5 rounded shrink-0 transition-all duration-300 ${
              step >= 3 ? "bg-green-500 text-primary-foreground scale-110" : "bg-primary text-primary-foreground"
            }`}
          >
            {step >= 3 ? <Check size={12} /> : <Copy size={12} />}
          </button>
          {/* Animated cursor */}
          {step === 2 && (
            <div
              className="absolute w-4 h-4 pointer-events-none transition-all duration-700"
              style={{ right: "8px", top: "50%", transform: "translateY(-50%)" }}
            >
              <svg viewBox="0 0 24 24" fill="hsl(var(--foreground))" className="w-4 h-4 animate-pulse">
                <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z" />
              </svg>
            </div>
          )}
          {/* Tooltip "Copiado!" */}
          {step >= 4 && (
            <div className="absolute -top-8 right-0 bg-foreground text-background text-[10px] px-2 py-1 rounded shadow-lg animate-fade-in">
              Copiado! ✓
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="h-7 flex-1 rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">WhatsApp</div>
          <div className="h-7 flex-1 rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">QR Code</div>
        </div>
      </div>
    </div>
  );
};

export const DashboardLeadsPreview = () => {
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleRows((prev) => {
        if (prev >= 3) {
          setTimeout(() => setVisibleRows(0), 2500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const leads = [
    { name: "Maria S.", status: "Convertido", statusColor: "bg-green-500", date: "12/04", product: "Plano A" },
    { name: "João P.", status: "Pendente", statusColor: "bg-amber-500", date: "11/04", product: "Plano B" },
    { name: "Ana L.", status: "Contactado", statusColor: "bg-blue-500", date: "10/04", product: "Plano A" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Tabela de Leads</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-1 p-2 bg-muted/50 text-[10px] font-medium text-muted-foreground">
          <span>Nome</span><span>Status</span><span>Data</span><span>Produto</span>
        </div>
        {leads.map((lead, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-1 p-2 text-[10px] text-foreground border-t border-border/30 transition-all duration-500"
            style={{
              opacity: i < visibleRows ? 1 : 0,
              transform: i < visibleRows ? "translateX(0)" : "translateX(-20px)",
            }}
          >
            <span>{lead.name}</span>
            <span className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${lead.statusColor}`} />
              {lead.status}
            </span>
            <span className="text-muted-foreground">{lead.date}</span>
            <span>{lead.product}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
