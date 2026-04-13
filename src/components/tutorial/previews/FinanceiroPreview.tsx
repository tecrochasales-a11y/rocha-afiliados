import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export const ComissoesPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Comissões</span>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Recebido", value: "R$ 2.450", icon: ArrowDownRight, color: "text-green-500" },
        { label: "A receber", value: "R$ 780", icon: ArrowUpRight, color: "text-amber-500" },
        { label: "Disponível", value: "R$ 1.250", icon: DollarSign, color: "text-primary" },
      ].map((item, i) => (
        <div key={i} className="bg-card border border-border/50 rounded-lg p-3 text-center">
          <item.icon size={16} className={`mx-auto mb-1 ${item.color}`} />
          <p className="text-sm font-bold text-foreground">{item.value}</p>
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
        <div key={i} className="flex justify-between items-center text-[10px] py-1 border-t border-border/20">
          <span className="text-foreground">{c.name}</span>
          <span className="text-green-500 font-medium">{c.value}</span>
          <span className="text-muted-foreground">{c.date}</span>
        </div>
      ))}
    </div>
  </div>
);

export const SaquePreview = () => (
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
        <div className="h-8 rounded-md border border-border bg-muted/30 flex items-center px-3 text-xs text-foreground">R$ 500,00</div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground">Chave PIX</label>
        <div className="h-8 rounded-md border border-border bg-muted/30 flex items-center px-3 text-xs text-muted-foreground">****@email.com</div>
      </div>
      <div className="h-8 rounded-md bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">Solicitar Saque</div>
    </div>
  </div>
);
