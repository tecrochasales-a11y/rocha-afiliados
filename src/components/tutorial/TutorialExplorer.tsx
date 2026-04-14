import { useState, useMemo, type ReactNode } from "react";
import {
  HelpCircle, LayoutDashboard, Users, BarChart3, Link, ClipboardList,
  DollarSign, Wallet, Share2, QrCode, Eye, UserCog, KeyRound, Lock,
  TrendingUp, Globe, AlertCircle, AlertTriangle, Ban, BookOpen, Lightbulb, Info,
} from "lucide-react";
import { tutorialTopics, tutorialCategories, type TutorialTopic } from "@/data/tutorialData";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

// Previews
import { DashboardMetricsPreview, DashboardLinkPreview, DashboardLeadsPreview } from "./previews/DashboardPreview";
import { ComissoesPreview, SaquePreview } from "./previews/FinanceiroPreview";
import { CompartilharPreview, QRCodePreview, AcompanharLeadsPreview } from "./previews/IndicacoesPreview";
import { DadosCadastraisPreview, PixKeyPreview, AlterarSenhaPreview } from "./previews/PerfilPreview";
import {
  PlataformaPreview, AfiliadosPreview, DicasConversaoPreview, RedesSociaisPreview,
  ProblemaLoginPreview, ProblemaLeadPreview, ProblemaSaquePreview,
} from "./previews/GenericPreview";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  LayoutDashboard, Users, BarChart3, Link, ClipboardList,
  DollarSign, Wallet, Share2, QrCode, Eye,
  UserCog, KeyRound, Lock, TrendingUp, Globe,
  AlertCircle, AlertTriangle, Ban, HelpCircle,
};

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

interface TutorialExplorerProps {
  searchQuery: string;
}

const TutorialExplorer = ({ searchQuery }: TutorialExplorerProps) => {
  const isMobile = useIsMobile();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const filteredTopics = useMemo(() => {
    return tutorialTopics.filter((topic) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        topic.howToUse.toLowerCase().includes(query) ||
        topic.tips.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  // Group filtered topics by category (excluding "all")
  const groupedTopics = useMemo(() => {
    const categories = tutorialCategories.filter((c) => c.key !== "all");
    return categories
      .map((cat) => ({
        ...cat,
        topics: filteredTopics.filter((t) => t.category === cat.key),
      }))
      .filter((group) => group.topics.length > 0);
  }, [filteredTopics]);

  const selectedTopic = filteredTopics.find((t) => t.id === selectedTopicId) || filteredTopics[0] || null;
  const currentId = selectedTopic?.id;

  if (filteredTopics.length === 0) return null;

  const renderDetail = (topic: TutorialTopic) => {
    const IconComponent = iconMap[topic.icon] || HelpCircle;
    const categoryLabel = tutorialCategories.find((c) => c.key === topic.category)?.label;

    return (
      <div key={topic.id} className="animate-fade-in flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <IconComponent size={20} />
          </div>
          <h2 className="text-base font-semibold text-foreground truncate">{topic.title}</h2>
          {categoryLabel && (
            <Badge variant="secondary" className="text-xs shrink-0">{categoryLabel}</Badge>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-6 min-h-[350px] flex items-center justify-center transition-all duration-500">
          <div className="w-full">
            {previewMap[topic.id] || (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Preview não disponível
              </div>
            )}
          </div>
        </div>

        {/* Info cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Descrição */}
          <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Info size={14} className="text-primary" /> Descrição
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
          </div>

          {/* Como usar */}
          <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <BookOpen size={14} className="text-primary" /> Como usar
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{topic.howToUse}</p>
          </div>

          {/* Dicas */}
          {topic.tips.length > 0 && (
            <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <Lightbulb size={14} className="text-primary" /> Dicas
              </div>
              <ul className="space-y-1.5">
                {topic.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Observação */}
          {topic.notes && (
            <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <AlertCircle size={14} className="text-primary" /> Observação
              </div>
              <p className="text-sm text-muted-foreground">{topic.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-[260px_1fr]"
    )}>
      {/* Sidebar grouped by category */}
      <div className={cn(
        isMobile
          ? "flex flex-wrap gap-1.5"
          : "space-y-4 border-r border-border/30 pr-3 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin"
      )}>
        {isMobile ? (
          // Mobile: flat list
          filteredTopics.map((topic) => {
            const Icon = iconMap[topic.icon] || HelpCircle;
            const isActive = topic.id === currentId;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={cn(
                  "flex items-center gap-2 text-left transition-all duration-200 rounded-lg px-3 py-2 text-xs",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{topic.title}</span>
              </button>
            );
          })
        ) : (
          // Desktop: grouped by category
          groupedTopics.map((group) => {
            const isOverview = group.key === "overview";
            return (
              <div
                key={group.key}
                className={cn(
                  isOverview && "bg-primary/5 border border-primary/20 rounded-xl p-2 mb-1"
                )}
              >
                <p className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider px-2.5 mb-1.5 flex items-center gap-1.5",
                  isOverview ? "text-primary" : "text-muted-foreground/70"
                )}>
                  {isOverview && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.topics.map((topic) => {
                    const Icon = iconMap[topic.icon] || HelpCircle;
                    const isActive = topic.id === currentId;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={cn(
                          "flex items-center gap-2 text-left transition-all duration-200 rounded-lg w-full px-2.5 py-2 text-[13px]",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Icon size={15} className="shrink-0" />
                        <span className="leading-tight">{topic.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail area */}
      <div className={cn(
        "min-h-[400px]",
        !isMobile && "pl-3"
      )}>
        {selectedTopic && renderDetail(selectedTopic)}
      </div>
    </div>
  );
};

export default TutorialExplorer;
