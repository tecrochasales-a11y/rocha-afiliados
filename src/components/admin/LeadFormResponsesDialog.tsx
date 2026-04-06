import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface LeadFormResponsesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  formResponses: Record<string, unknown> | null;
  leadData: {
    name: string;
    email: string;
    phone: string | null;
    company_type?: string | null;
    has_health_plan?: string | null;
    monthly_income?: string | null;
    health_plan_investment?: string | null;
    insurance_provider?: string | null;
    covered_ages?: string | null;
    adjustment_month?: string | null;
    cnpj_or_region?: string | null;
    accepts_whatsapp?: boolean | null;
  };
}

const fieldLabels: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
  phone: "Telefone",
  company_type: "Tipo de empresa",
  has_health_plan: "Já possui plano de saúde?",
  monthly_income: "Faixa de renda mensal",
  health_plan_investment: "Investimento em plano de saúde",
  insurance_provider: "Operadora atual",
  covered_ages: "Faixas etárias cobertas",
  adjustment_month: "Mês de reajuste",
  cnpj_or_region: "CNPJ ou Região",
  accepts_whatsapp: "Aceita WhatsApp?",
  contact_info: "Dados de Contato",
};

const formatValue = (value: unknown): string => {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    // Handle nested objects like contact_info
    const obj = value as Record<string, unknown>;
    const parts: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && v !== undefined && v !== "") {
        const label = fieldLabels[k] || k.replace(/_/g, " ");
        parts.push(`${label}: ${String(v)}`);
      }
    }
    return parts.length > 0 ? parts.join("\n") : "-";
  }
  return String(value);
};

const isObjectValue = (value: unknown): boolean => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const LeadFormResponsesDialog = ({
  open,
  onOpenChange,
  leadName,
  formResponses,
  leadData,
}: LeadFormResponsesDialogProps) => {
  const allKnownFields: [string, unknown][] = [
    ["name", leadData.name],
    ["email", leadData.email],
    ["phone", leadData.phone],
    ["company_type", leadData.company_type],
    ["has_health_plan", leadData.has_health_plan],
    ["monthly_income", leadData.monthly_income],
    ["health_plan_investment", leadData.health_plan_investment],
    ["insurance_provider", leadData.insurance_provider],
    ["covered_ages", leadData.covered_ages],
    ["adjustment_month", leadData.adjustment_month],
    ["cnpj_or_region", leadData.cnpj_or_region],
    ["accepts_whatsapp", leadData.accepts_whatsapp],
  ];
  const knownFields = allKnownFields.filter(
    ([, value]) => value !== null && value !== undefined && value !== ""
  );

  const dynamicResponses = formResponses
    ? Object.entries(formResponses).filter(
        ([key]) => !Object.keys(fieldLabels).includes(key) || key === "contact_info"
      )
    : [];

  // Flatten nested objects into individual rows
  const flattenedDynamic: [string, unknown][] = [];
  for (const [key, value] of dynamicResponses) {
    if (isObjectValue(value)) {
      const obj = value as Record<string, unknown>;
      // Add as a section header
      flattenedDynamic.push([key, "__section__"]);
      for (const [subKey, subValue] of Object.entries(obj)) {
        if (subValue !== null && subValue !== undefined && subValue !== "") {
          flattenedDynamic.push([subKey, subValue]);
        }
      }
    } else {
      flattenedDynamic.push([key, value]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Respostas do Formulário
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{leadName}</p>
        </DialogHeader>

        <div className="space-y-1 py-2">
          {knownFields.map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2.5 border-b border-border last:border-0 gap-1"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {fieldLabels[key] || key}
              </span>
              <span className="text-sm text-foreground sm:text-right sm:max-w-[60%] break-words">
                {formatValue(value)}
              </span>
            </div>
          ))}

          {flattenedDynamic.map(([key, value], idx) =>
            value === "__section__" ? (
              <div
                key={`section-${idx}`}
                className="pt-4 pb-1 border-b border-border"
              >
                <span className="text-sm font-semibold text-foreground">
                  {fieldLabels[key] || key.replace(/_/g, " ")}
                </span>
              </div>
            ) : (
              <div
                key={`dynamic-${idx}`}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2.5 border-b border-border last:border-0 gap-1"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {fieldLabels[key] || key.replace(/_/g, " ")}
                </span>
                <span className="text-sm text-foreground sm:text-right sm:max-w-[60%] break-words whitespace-pre-line">
                  {formatValue(value)}
                </span>
              </div>
            )
          )}

          {knownFields.length === 0 && flattenedDynamic.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma resposta registrada para este lead.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
