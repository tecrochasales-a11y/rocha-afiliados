import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export interface FormOption {
  value: string;
  label: string;
}

export interface FormQuestion {
  id: string;
  question: string;
  field_key: string;
  type: "radio" | "select" | "text" | "multi_select" | "contact" | "confirmation";
  options: FormOption[];
  is_required: boolean;
  is_active?: boolean;
  display_order?: number;
  conditional_field?: string | null;
  conditional_value?: string | null;
}

interface DynamicFormStepProps {
  question: FormQuestion;
  value: string | string[] | Record<string, string>;
  onChange: (fieldKey: string, value: string | string[] | Record<string, string>) => void;
  allValues: Record<string, unknown>;
}

export const DynamicFormStep = ({ question, value, onChange, allValues }: DynamicFormStepProps) => {
  const renderRadioGroup = () => (
    <RadioGroup
      value={value as string}
      onValueChange={(val) => onChange(question.field_key, val)}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {question.options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            value === option.value
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          }`}
        >
          <RadioGroupItem value={option.value} />
          <span className="font-medium">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  );

  const renderSelect = () => (
    <Select
      value={value as string}
      onValueChange={(val) => onChange(question.field_key, val)}
    >
      <SelectTrigger className="w-full h-12">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        {question.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderText = () => (
    <Input
      value={value as string}
      onChange={(e) => onChange(question.field_key, e.target.value)}
      placeholder="Digite sua resposta..."
      className="h-12"
    />
  );

  const renderMultiSelect = () => {
    const selectedValues = Array.isArray(value) ? value : [];
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {question.options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  const newValues = checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((v) => v !== option.value);
                  onChange(question.field_key, newValues);
                }}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderContact = () => {
    const contactData = (value as Record<string, string>) || { name: "", email: "", phone: "" };
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Nome Completo *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="contact-name"
              placeholder="Seu nome completo"
              value={contactData.name || ""}
              onChange={(e) =>
                onChange(question.field_key, { ...contactData, name: e.target.value })
              }
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">E-mail *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="contact-email"
              type="email"
              placeholder="seu@email.com"
              value={contactData.email || ""}
              onChange={(e) =>
                onChange(question.field_key, { ...contactData, email: e.target.value })
              }
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone">Telefone/WhatsApp *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="contact-phone"
              placeholder="(11) 99999-9999"
              value={contactData.phone || ""}
              onChange={(e) =>
                onChange(question.field_key, { ...contactData, phone: e.target.value })
              }
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    const confirmData = (value as Record<string, string>) || { terms: "", whatsapp: "" };
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Suas informações estão seguras</p>
              <p className="text-sm text-muted-foreground mt-1">
                Seus dados serão utilizados apenas para entrarmos em contato com a melhor oferta de plano de saúde.
              </p>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={confirmData.terms === "true"}
            onCheckedChange={(checked) =>
              onChange(question.field_key, { ...confirmData, terms: String(checked) })
            }
            className="mt-1"
          />
          <span className="text-sm">
            Li e aceito os{" "}
            <Link to="/termos" className="text-primary hover:underline" target="_blank">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" className="text-primary hover:underline" target="_blank">
              Política de Privacidade
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={confirmData.whatsapp === "true"}
            onCheckedChange={(checked) =>
              onChange(question.field_key, { ...confirmData, whatsapp: String(checked) })
            }
            className="mt-1"
          />
          <span className="text-sm">
            Aceito receber contato via WhatsApp
          </span>
        </label>
      </div>
    );
  };

  const renderInput = () => {
    switch (question.type) {
      case "radio":
        return renderRadioGroup();
      case "select":
        return renderSelect();
      case "text":
        return renderText();
      case "multi_select":
        return renderMultiSelect();
      case "contact":
        return renderContact();
      case "confirmation":
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl md:text-2xl font-bold text-foreground text-center">
        {question.question}
      </h2>
      <div className="mt-6">{renderInput()}</div>
    </div>
  );
};
