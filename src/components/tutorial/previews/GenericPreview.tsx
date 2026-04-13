import { useState, useEffect } from "react";
import { TrendingUp, Globe, AlertCircle, AlertTriangle, Ban, LayoutDashboard, Users } from "lucide-react";

export const PlataformaPreview = () => {
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 2) {
          setTimeout(() => setActiveStep(-1), 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "Indicar", step: "1" },
    { label: "Converter", step: "2" },
    { label: "Ganhar", step: "3" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Visão Geral</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
          <LayoutDashboard size={20} className="text-primary" />
          <div>
            <p className="text-xs font-medium text-foreground">Painel do Afiliado</p>
            <p className="text-[10px] text-muted-foreground">Métricas, leads e comissões</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg transition-all duration-500 ${
                i === activeStep ? "bg-primary/15 shadow-md shadow-primary/20 scale-105" : "bg-muted/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center mx-auto mb-1 transition-all duration-300 ${
                  i <= activeStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i <= activeStep ? "✓" : s.step}
              </div>
              <p className="text-[10px] font-medium text-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AfiliadosPreview = () => {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= 4) {
          setTimeout(() => setVisibleSteps(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { step: "1", text: "Copie seu link de indicação" },
    { step: "2", text: "Compartilhe com interessados" },
    { step: "3", text: "Acompanhe os leads no painel" },
    { step: "4", text: "Receba comissões por conversão" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Programa de Afiliados</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <span className="text-xs font-medium text-foreground">Como funciona</span>
        </div>
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 p-2 rounded transition-all duration-500 ${
              i < visibleSteps ? "bg-primary/5" : "bg-muted/30"
            }`}
            style={{
              opacity: i < visibleSteps ? 1 : 0.3,
              transform: i < visibleSteps ? "translateX(0)" : "translateX(-8px)",
            }}
          >
            <div
              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-all duration-300 ${
                i < visibleSteps ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              }`}
            >
              {i < visibleSteps ? "✓" : s.step}
            </div>
            <span className="text-[10px] text-foreground">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DicasConversaoPreview = () => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => {
        if (prev >= 3) { setTimeout(() => setVisible(0), 2000); return prev; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const tips = [
    { icon: TrendingUp, text: "Qualidade > quantidade de leads" },
    { icon: Globe, text: "Use redes sociais estrategicamente" },
    { icon: Users, text: "Conheça bem o produto" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Dicas de Conversão</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded bg-green-500/5 transition-all duration-500"
            style={{
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <tip.icon size={14} className="text-green-600 mt-0.5 shrink-0" />
            <span className="text-[10px] text-foreground">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RedesSociaisPreview = () => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => {
        if (prev >= 4) { setTimeout(() => setVisible(0), 2000); return prev; }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const items = ["Publique conteúdos relevantes", "Use stories e posts com link", "Responda rapidamente", "Não faça spam"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Redes Sociais</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
        {items.map((text, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded bg-blue-500/5 transition-all duration-500"
            style={{
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? "translateX(0)" : "translateX(-10px)",
            }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${i === 3 ? "bg-destructive" : "bg-blue-500"}`} />
            <span className="text-[10px] text-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProblemaLoginPreview = () => {
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setChecked((prev) => {
        if (prev >= 4) { setTimeout(() => setChecked(0), 2500); return prev; }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const items = ["E-mail correto?", "Sem espaços extras?", "Senha correta?", "Tentar 'Esqueci minha senha'"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs text-destructive font-medium">Problema: Login</span>
      </div>
      <div className="bg-card border border-destructive/20 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-destructive" />
          <span className="text-xs font-medium text-foreground">Checklist</span>
        </div>
        {items.map((text, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-[10px] transition-all duration-300"
            style={{ opacity: i <= checked ? 1 : 0.4 }}
          >
            <div
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] transition-all duration-300 ${
                i < checked
                  ? "border-green-500 bg-green-500/10 text-green-600"
                  : "border-border"
              }`}
            >
              {i < checked ? "✓" : ""}
            </div>
            <span className={`text-foreground ${i < checked ? "line-through text-muted-foreground" : ""}`}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProblemaLeadPreview = () => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => {
        if (prev >= 3) { setTimeout(() => setVisible(0), 2500); return prev; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const items = ["Atraso no processamento (aguarde)", "Link não foi usado corretamente", "Formulário incompleto"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-xs text-amber-600 font-medium">Lead não aparece</span>
      </div>
      <div className="bg-card border border-amber-500/20 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <span className="text-xs font-medium text-foreground">Possíveis causas</span>
        </div>
        {items.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-1.5 text-[10px] transition-all duration-500"
            style={{
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? "translateY(0)" : "translateY(6px)",
            }}
          >
            <span className="text-amber-500">⚠</span>
            <span className="text-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProblemaSaquePreview = () => {
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setChecked((prev) => {
        if (prev >= 3) { setTimeout(() => setChecked(0), 2500); return prev; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "Chave PIX", ok: true },
    { label: "Valor mínimo", ok: true },
    { label: "Status do saque", ok: false },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs text-destructive font-medium">Saque não processado</span>
      </div>
      <div className="bg-card border border-destructive/20 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Ban size={14} className="text-destructive" />
          <span className="text-xs font-medium text-foreground">Verificar</span>
        </div>
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-1.5 text-[10px] bg-muted/30 rounded transition-all duration-500"
            style={{
              opacity: i < checked ? 1 : 0.3,
              transform: i < checked ? "translateX(0)" : "translateX(-8px)",
            }}
          >
            <span className="text-foreground">{item.label}</span>
            <span
              className={`transition-all duration-300 ${
                i < checked ? (item.ok ? "text-green-500" : "text-destructive") : "text-muted-foreground"
              }`}
            >
              {i < checked ? (item.ok ? "✓ OK" : "⏳ Pendente") : "..."}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
