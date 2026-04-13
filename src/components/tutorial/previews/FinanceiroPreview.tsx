import { useState, useEffect } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export const ComissoesPreview = () => {
  const [visibleCards, setVisibleCards] = useState(0);
  const [values, setValues] = useState([0, 0, 0]);

  useEffect(() => {
    const targets = [2450, 780, 1250];
    const interval = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev >= 3) {
          setTimeout(() => {
            setVisibleCards(0);
            setValues([0, 0, 0]);
          }, 3000);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    // Count up values
    const timeout = setTimeout(() => {
      const duration = 1500;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setValues(targets.map((t) => Math.floor(progress * t)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      tick();
    }, 600);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const cards = [
    { label: "Recebido", icon: ArrowDownRight, color: "text-green-500" },
    { label: "A receber", icon: ArrowUpRight, color: "text-amber-500" },
    { label: "Disponível", icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Comissões</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((item, i) => (
          <div
            key={i}
            className="bg-card border border-border/50 rounded-lg p-3 text-center transition-all duration-500"
            style={{
              opacity: i < visibleCards ? 1 : 0,
              transform: i < visibleCards ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <item.icon size={16} className={`mx-auto mb-1 ${item.color}`} />
            <p className="text-sm font-bold text-foreground">
              R$ {values[i].toLocaleString("pt-BR")}
            </p>
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-foreground">Últimas comissões</p>
        {[
          { name: "Lead Maria S.", value: "+R$ 150", date: "12/04" },
          { name: "Lead João P.", value: "+R$ 200", date: "08/04" },
        ].map((c, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-[10px] py-1 border-t border-border/20 transition-all duration-500"
            style={{
              opacity: i < visibleCards - 1 ? 1 : 0,
              transform: i < visibleCards - 1 ? "translateX(0)" : "translateX(-12px)",
            }}
          >
            <span className="text-foreground">{c.name}</span>
            <span className="text-green-500 font-medium">{c.value}</span>
            <span className="text-muted-foreground">{c.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SaquePreview = () => {
  const [step, setStep] = useState(0);
  const [typedValue, setTypedValue] = useState("");
  const targetValue = "R$ 500,00";

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setStep(1), 800));

    let charIndex = 0;
    timers.push(setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex < targetValue.length) {
          setTypedValue(targetValue.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setStep(2), 400);
          setTimeout(() => setStep(3), 1200);
          setTimeout(() => {
            setStep(0);
            setTypedValue("");
          }, 5000);
        }
      }, 80);
    }, 1200));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Solicitar Saque</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-primary" />
          <span className="text-xs font-medium text-foreground">Saldo disponível: R$ 1.250,00</span>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground">Valor do saque</label>
          <div className="h-8 rounded-md border border-border bg-muted/30 flex items-center px-3 text-xs text-foreground relative">
            {typedValue}
            {step === 1 && (
              <span className="inline-block w-[1px] h-3.5 bg-foreground animate-pulse ml-0.5" />
            )}
          </div>
        </div>
        <div
          className="space-y-2 transition-all duration-500"
          style={{ opacity: step >= 2 ? 1 : 0.3 }}
        >
          <label className="text-[10px] text-muted-foreground">Chave PIX</label>
          <div className="h-8 rounded-md border border-border bg-muted/30 flex items-center px-3 text-xs text-muted-foreground">
            ****@email.com
          </div>
        </div>
        <div
          className={`h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-300 ${
            step >= 3
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]"
              : "bg-primary/50 text-primary-foreground/70"
          }`}
        >
          Solicitar Saque
        </div>
      </div>
    </div>
  );
};
