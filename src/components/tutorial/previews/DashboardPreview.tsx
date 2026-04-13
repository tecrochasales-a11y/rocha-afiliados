import { BarChart3, Users, DollarSign, TrendingUp, Copy, Link } from "lucide-react";

const MetricCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="bg-card border border-border/50 rounded-lg p-3 flex items-center gap-3">
    <div className={`p-2 rounded-md ${color}`}>
      <Icon size={14} className="text-primary-foreground" />
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export const DashboardMetricsPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Cards de Métricas</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <MetricCard icon={Users} label="Total Leads" value="127" color="bg-primary" />
      <MetricCard icon={TrendingUp} label="Convertidos" value="34" color="bg-green-500" />
      <MetricCard icon={BarChart3} label="Perdidos" value="12" color="bg-destructive" />
      <MetricCard icon={DollarSign} label="Saldo" value="R$ 1.250" color="bg-amber-500" />
    </div>
  </div>
);

export const DashboardLinkPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Link de Indicação</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      <p className="text-xs text-muted-foreground">Seu link exclusivo</p>
      <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2.5">
        <Link size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs text-foreground truncate font-mono">app.exemplo.com/ref/abc123</span>
        <button className="ml-auto p-1.5 rounded bg-primary text-primary-foreground shrink-0">
          <Copy size={12} />
        </button>
      </div>
      <div className="flex gap-2">
        <div className="h-7 flex-1 rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">WhatsApp</div>
        <div className="h-7 flex-1 rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">QR Code</div>
      </div>
    </div>
  </div>
);

export const DashboardLeadsPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Tabela de Leads</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
      <div className="grid grid-cols-4 gap-1 p-2 bg-muted/50 text-[10px] font-medium text-muted-foreground">
        <span>Nome</span><span>Status</span><span>Data</span><span>Produto</span>
      </div>
      {[
        { name: "Maria S.", status: "Convertido", statusColor: "bg-green-500", date: "12/04", product: "Plano A" },
        { name: "João P.", status: "Pendente", statusColor: "bg-amber-500", date: "11/04", product: "Plano B" },
        { name: "Ana L.", status: "Contactado", statusColor: "bg-blue-500", date: "10/04", product: "Plano A" },
      ].map((lead, i) => (
        <div key={i} className="grid grid-cols-4 gap-1 p-2 text-[10px] text-foreground border-t border-border/30">
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
