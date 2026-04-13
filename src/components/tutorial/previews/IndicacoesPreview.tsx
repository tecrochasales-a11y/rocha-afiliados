import { Share2, QrCode, Eye, Copy, MessageCircle } from "lucide-react";

export const CompartilharPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Compartilhar Link</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2.5">
        <span className="text-xs text-foreground truncate font-mono flex-1">app.exemplo.com/ref/abc123</span>
        <button className="p-1.5 rounded bg-primary text-primary-foreground"><Copy size={12} /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: MessageCircle, label: "WhatsApp", color: "bg-green-500/10 text-green-600" },
          { icon: Share2, label: "Redes", color: "bg-blue-500/10 text-blue-600" },
          { icon: QrCode, label: "QR Code", color: "bg-primary/10 text-primary" },
        ].map((item, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 p-2.5 rounded-lg ${item.color}`}>
            <item.icon size={16} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const QRCodePreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">QR Code</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 flex flex-col items-center gap-3">
      <div className="w-32 h-32 bg-foreground/5 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
        <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-20 h-20">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Escaneie com a câmera do celular</p>
      <div className="h-7 w-full rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium">Baixar QR Code</div>
    </div>
  </div>
);

export const AcompanharLeadsPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Status dos Leads</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
      {[
        { status: "Pendente", color: "bg-amber-500", count: 5 },
        { status: "Contactado", color: "bg-blue-500", count: 8 },
        { status: "Qualificado", color: "bg-purple-500", count: 3 },
        { status: "Convertido", color: "bg-green-500", count: 12 },
        { status: "Perdido", color: "bg-destructive", count: 2 },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.color}`} />
          <span className="text-xs text-foreground flex-1">{s.status}</span>
          <div className="h-3 bg-muted rounded-full flex-1 max-w-[120px] overflow-hidden">
            <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.count / 12) * 100}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground w-4 text-right">{s.count}</span>
        </div>
      ))}
    </div>
  </div>
);
