import { User, KeyRound, Lock, Mail, Phone, CreditCard } from "lucide-react";

export const DadosCadastraisPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Dados Cadastrais</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">João Silva</p>
          <p className="text-[10px] text-muted-foreground">Afiliado desde 01/2025</p>
        </div>
      </div>
      {[
        { icon: Mail, label: "E-mail", value: "joao@email.com" },
        { icon: Phone, label: "Telefone", value: "(11) 99999-0000" },
        { icon: CreditCard, label: "CPF", value: "***.***.***-00" },
      ].map((field, i) => (
        <div key={i} className="space-y-1">
          <label className="text-[10px] text-muted-foreground flex items-center gap-1">
            <field.icon size={10} />{field.label}
          </label>
          <div className="h-7 rounded-md border border-border bg-muted/30 flex items-center px-2.5 text-xs text-foreground">{field.value}</div>
        </div>
      ))}
    </div>
  </div>
);

export const PixKeyPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Chave PIX</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound size={16} className="text-primary" />
        <span className="text-xs font-medium text-foreground">Configurar Chave PIX</span>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground">Tipo da chave</label>
        <div className="grid grid-cols-4 gap-1.5">
          {["CPF", "E-mail", "Telefone", "Aleatória"].map((t, i) => (
            <div key={i} className={`h-6 rounded text-[9px] flex items-center justify-center font-medium ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</div>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground">Chave PIX</label>
        <div className="h-7 rounded-md border border-border bg-muted/30 flex items-center px-2.5 text-xs text-foreground">joao@email.com</div>
      </div>
      <div className="h-7 rounded-md bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">Salvar</div>
    </div>
  </div>
);

export const AlterarSenhaPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs text-primary font-medium">Alterar Senha</span>
    </div>
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lock size={16} className="text-primary" />
        <span className="text-xs font-medium text-foreground">Segurança da Conta</span>
      </div>
      {["Nova senha", "Confirmar senha"].map((label, i) => (
        <div key={i} className="space-y-1">
          <label className="text-[10px] text-muted-foreground">{label}</label>
          <div className="h-7 rounded-md border border-border bg-muted/30 flex items-center px-2.5 text-xs text-muted-foreground">••••••••</div>
        </div>
      ))}
      <div className="h-7 rounded-md bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">Alterar Senha</div>
    </div>
  </div>
);
