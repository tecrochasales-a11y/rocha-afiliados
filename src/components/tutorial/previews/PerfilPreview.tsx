import { useState, useEffect } from "react";
import { User, KeyRound, Lock, Mail, Phone, CreditCard } from "lucide-react";

export const DadosCadastraisPreview = () => {
  const [visibleFields, setVisibleFields] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleFields((prev) => {
        if (prev >= 4) {
          setTimeout(() => setVisibleFields(0), 2500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const fields = [
    { icon: Mail, label: "E-mail", value: "joao@email.com" },
    { icon: Phone, label: "Telefone", value: "(11) 99999-0000" },
    { icon: CreditCard, label: "CPF", value: "***.***.***-00" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-primary font-medium">Dados Cadastrais</span>
      </div>
      <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
        <div
          className="flex items-center gap-3 mb-2 transition-all duration-500"
          style={{
            opacity: visibleFields >= 1 ? 1 : 0,
            transform: visibleFields >= 1 ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">João Silva</p>
            <p className="text-[10px] text-muted-foreground">Afiliado desde 01/2025</p>
          </div>
        </div>
        {fields.map((field, i) => (
          <div
            key={i}
            className="space-y-1 transition-all duration-500"
            style={{
              opacity: i + 1 < visibleFields ? 1 : 0,
              transform: i + 1 < visibleFields ? "translateX(0)" : "translateX(-12px)",
            }}
          >
            <label className="text-[10px] text-muted-foreground flex items-center gap-1">
              <field.icon size={10} />{field.label}
            </label>
            <div className="h-7 rounded-md border border-border bg-muted/30 flex items-center px-2.5 text-xs text-foreground">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PixKeyPreview = () => {
  const [selectedType, setSelectedType] = useState(-1);
  const [typedKey, setTypedKey] = useState("");
  const [showSave, setShowSave] = useState(false);
  const targetKey = "joao@email.com";

  useEffect(() => {
    const types = ["CPF", "E-mail", "Telefone", "Aleatória"];
    let typeIndex = 0;

    const cycleTypes = setInterval(() => {
      if (typeIndex < types.length) {
        setSelectedType(typeIndex);
        typeIndex++;
      } else {
        clearInterval(cycleTypes);
        // Start typewriter
        let charIdx = 0;
        const typeInterval = setInterval(() => {
          if (charIdx < targetKey.length) {
            setTypedKey(targetKey.slice(0, charIdx + 1));
            charIdx++;
          } else {
            clearInterval(typeInterval);
            setTimeout(() => setShowSave(true), 400);
            // Reset
            setTimeout(() => {
              setSelectedType(-1);
              setTypedKey("");
              setShowSave(false);
              typeIndex = 0;
            }, 4000);
          }
        }, 60);
      }
    }, 400);

    return () => clearInterval(cycleTypes);
  }, []);

  return (
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
              <div
                key={i}
                className={`h-6 rounded text-[9px] flex items-center justify-center font-medium transition-all duration-300 ${
                  i === selectedType
                    ? "bg-primary text-primary-foreground scale-105"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">Chave PIX</label>
          <div className="h-7 rounded-md border border-border bg-muted/30 flex items-center px-2.5 text-xs text-foreground">
            {typedKey}
            {typedKey.length > 0 && typedKey.length < targetKey.length && (
              <span className="inline-block w-[1px] h-3.5 bg-foreground animate-pulse ml-0.5" />
            )}
          </div>
        </div>
        <div
          className={`h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-500 ${
            showSave
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]"
              : "bg-primary/40 text-primary-foreground/60"
          }`}
        >
          Salvar
        </div>
      </div>
    </div>
  );
};

export const AlterarSenhaPreview = () => {
  const [dots1, setDots1] = useState(0);
  const [dots2, setDots2] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let d1 = 0;
    let d2 = 0;

    const t1 = setTimeout(() => {
      const i1 = setInterval(() => {
        if (d1 < 8) { d1++; setDots1(d1); }
        else {
          clearInterval(i1);
          const i2 = setInterval(() => {
            if (d2 < 8) { d2++; setDots2(d2); }
            else {
              clearInterval(i2);
              setTimeout(() => setReady(true), 300);
              setTimeout(() => { setDots1(0); setDots2(0); setReady(false); }, 4000);
            }
          }, 100);
        }
      }, 100);
    }, 600);

    return () => clearTimeout(t1);
  }, []);

  return (
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
        {[
          { label: "Nova senha", dots: dots1 },
          { label: "Confirmar senha", dots: dots2 },
        ].map((field, i) => (
          <div key={i} className="space-y-1">
            <label className="text-[10px] text-muted-foreground">{field.label}</label>
            <div className="h-7 rounded-md border border-border bg-muted/30 flex items-center px-2.5 text-xs text-foreground">
              {"•".repeat(field.dots)}
              {field.dots > 0 && field.dots < 8 && (
                <span className="inline-block w-[1px] h-3.5 bg-foreground animate-pulse ml-0.5" />
              )}
            </div>
          </div>
        ))}
        <div
          className={`h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-500 ${
            ready
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]"
              : "bg-primary/40 text-primary-foreground/60"
          }`}
        >
          Alterar Senha
        </div>
      </div>
    </div>
  );
};
