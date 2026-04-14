import { useState, type ReactNode } from "react";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { tutorialTopics } from "@/data/tutorialData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Previews
import { DashboardMetricsPreview, DashboardLinkPreview, DashboardLeadsPreview } from "./previews/DashboardPreview";
import { ComissoesPreview, SaquePreview } from "./previews/FinanceiroPreview";
import { CompartilharPreview, QRCodePreview, AcompanharLeadsPreview } from "./previews/IndicacoesPreview";
import { DadosCadastraisPreview, PixKeyPreview, AlterarSenhaPreview } from "./previews/PerfilPreview";
import {
  PlataformaPreview, AfiliadosPreview, DicasConversaoPreview, RedesSociaisPreview,
  ProblemaLoginPreview, ProblemaLeadPreview, ProblemaSaquePreview,
} from "./previews/GenericPreview";

const previewMap: Record<string, ReactNode> = {
  "visao-plataforma": <PlataformaPreview />,
  "como-funciona-afiliados": <AfiliadosPreview />,
  "dashboard-metricas": <DashboardMetricsPreview />,
  "dashboard-link": <DashboardLinkPreview />,
  "dashboard-leads": <DashboardLeadsPreview />,
  "financeiro-comissoes": <ComissoesPreview />,
  "financeiro-saque": <SaquePreview />,
  "indicacoes-compartilhar": <CompartilharPreview />,
  "indicacoes-qrcode": <QRCodePreview />,
  "indicacoes-acompanhar": <AcompanharLeadsPreview />,
  "perfil-dados": <DadosCadastraisPreview />,
  "perfil-pix": <PixKeyPreview />,
  "perfil-senha": <AlterarSenhaPreview />,
  "dicas-conversao": <DicasConversaoPreview />,
  "dicas-redes": <RedesSociaisPreview />,
  "problema-login": <ProblemaLoginPreview />,
  "problema-lead": <ProblemaLeadPreview />,
  "problema-saque": <ProblemaSaquePreview />,
};

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialModal = ({ open, onOpenChange }: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const topics = tutorialTopics;
  const total = topics.length;
  const topic = topics[currentStep];

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, total - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Tutorial</DialogTitle>

        {/* Preview area */}
        <div className="bg-muted/50 flex items-center justify-center p-6 min-h-[200px] border-b border-border">
          <div
            key={topic.id}
            className="w-full animate-in fade-in duration-300"
          >
            {previewMap[topic.id] || (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                Preview indisponível
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-2 text-center space-y-2">
          <h3 className="text-lg font-bold text-foreground">{topic.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {topic.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 py-3">
          {topics.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                i === currentStep
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="gap-1 text-muted-foreground"
          >
            <ChevronLeft size={16} />
            Anterior
          </Button>

          <span className="text-xs text-muted-foreground">
            {currentStep + 1} de {total}
          </span>

          {currentStep < total - 1 ? (
            <Button size="sm" onClick={goNext} className="gap-1">
              Próximo
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                onOpenChange(false);
                navigate("/ajuda");
              }}
            >
              <BookOpen size={14} />
              Ver todos
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;
