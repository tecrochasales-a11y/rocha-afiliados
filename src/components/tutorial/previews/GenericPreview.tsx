import { TrendingUp, Globe, AlertCircle, AlertTriangle, Ban, LayoutDashboard, Users } from "lucide-react";

export const PlataformaPreview = () => (
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
        {[
          { label: "Indicar", step: "1" },
          { label: "Converter", step: "2" },
          { label: "Ganhar", step: "3" },
        ].map((s, i) => (
          <div key={i} className="p-2 rounded-lg bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center mx-auto mb-1">{s.step}</div>
            <p className="text-[10px] font-medium text-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AfiliadosPreview = () => (
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
      {[
        { step: "1", text: "Copie seu link de indicação" },
        { step: "2", text: "Compartilhe com interessados" },
        { step: "3", text: "Acompanhe os leads no painel" },
        { step: "4", text: "Receba comissões por conversão" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{s.step}</div>
          <span className="text-[10px] text-foreground">{s.text}</span>
        </div>
      ))}
    </div>
  </div>
);

export const DicasConversaoPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Dicas de Conversão</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
      {[
        { icon: TrendingUp, text: "Qualidade > quantidade de leads" },
        { icon: Globe, text: "Use redes sociais estrategicamente" },
        { icon: Users, text: "Conheça bem o produto" },
      ].map((tip, i) => (
        <div key={i} className="flex items-start gap-2 p-2 rounded bg-green-500/5">
          <tip.icon size={14} className="text-green-600 mt-0.5 shrink-0" />
          <span className="text-[10px] text-foreground">{tip.text}</span>
        </div>
      ))}
    </div>
  </div>
);

export const RedesSociaisPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Redes Sociais</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
      {["Publique conteúdos relevantes", "Use stories e posts com link", "Responda rapidamente", "Não faça spam"].map((text, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded bg-blue-500/5">
          <div className={`w-1.5 h-1.5 rounded-full ${i === 3 ? 'bg-destructive' : 'bg-blue-500'}`} />
          <span className="text-[10px] text-foreground">{text}</span>
        </div>
      ))}
    </div>
  </div>
);

export const ProblemaLoginPreview = () => (
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
      {["E-mail correto?", "Sem espaços extras?", "Senha correta?", "Tentar 'Esqueci minha senha'"].map((text, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px]">
          <div className="w-3.5 h-3.5 rounded border border-border flex items-center justify-center text-[8px]">{i < 2 ? "✓" : ""}</div>
          <span className="text-foreground">{text}</span>
        </div>
      ))}
    </div>
  </div>
);

export const ProblemaLeadPreview = () => (
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
      {["Atraso no processamento (aguarde)", "Link não foi usado corretamente", "Formulário incompleto"].map((text, i) => (
        <div key={i} className="flex items-start gap-2 p-1.5 text-[10px]">
          <span className="text-amber-500">⚠</span>
          <span className="text-foreground">{text}</span>
        </div>
      ))}
    </div>
  </div>
);

export const ProblemaSaquePreview = () => (
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
      {[
        { label: "Chave PIX", ok: true },
        { label: "Valor mínimo", ok: true },
        { label: "Status do saque", ok: false },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-1.5 text-[10px] bg-muted/30 rounded">
          <span className="text-foreground">{item.label}</span>
          <span className={item.ok ? "text-green-500" : "text-destructive"}>
            {item.ok ? "✓ OK" : "⏳ Pendente"}
          </span>
        </div>
      ))}
    </div>
  </div>
);
