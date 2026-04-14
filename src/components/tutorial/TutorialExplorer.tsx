import { useState, type ReactNode } from "react";
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
  activeCategory: string;
  searchQuery: string;
}

const TutorialExplorer = ({ activeCategory, searchQuery }: TutorialExplorerProps) => {
  const isMobile = useIsMobile();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const filteredTopics = tutorialTopics.filter((topic) => {
    const matchesCategory = activeCategory === "all" || topic.category === activeCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const query = searchQuery.toLowerCase();
    return matchesCategory && (
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query)
    );
  });

  const selectedTopic = filteredTopics.find((t) => t.id === selectedTopicId) || filteredTopics[0] || null;
  const currentId = selectedTopic?.id;

  if (filteredTopics.length === 0) return null;

  const renderDetail = (topic: TutorialTopic) => {
    const IconComponent = iconMap[topic.icon] || HelpCircle;
    const categoryLabel = tutorialCategories.find((c) => c.key === topic.category)?.label;

    return (
      <div key={topic.id} className="animate-fade-in flex flex-col gap-4">
        {/* Compact header bar */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <IconComponent size={20} />
          </div>
          <h2 className="text-base font-semibold text-foreground truncate">{topic.title}</h2>
          {categoryLabel && (
            <Badge variant="secondary" className="text-xs shrink-0">{categoryLabel}</Badge>
          )}
        </div>

        {/* Large preview area */}
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-6 min-h-[350px] flex items-center justify-center transition-all duration-500">
          <div className="w-full">
            {previewMap[topic.id] || (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Preview não disponível
              </div>
            )}
          </div>
        </div>

        {/* Collapsible info accordion */}
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="description" className="border-border/40">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Info size={14} /> Descrição
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="howto" className="border-border/40">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <span className="flex items-center gap-2 text-muted-foreground">
                <BookOpen size={14} /> Como usar
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{topic.howToUse}</p>
            </AccordionContent>
          </AccordionItem>

          {topic.tips.length > 0 && (
            <AccordionItem value="tips" className="border-border/40">
              <AccordionTrigger className="py-3 text-sm hover:no-underline">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Lightbulb size={14} /> Dicas
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5">
                  {topic.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>{tip}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {topic.notes && (
            <AccordionItem value="notes" className="border-border/40">
              <AccordionTrigger className="py-3 text-sm hover:no-underline">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle size={14} /> Observação
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{topic.notes}</p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    );
  };

  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-[220px_1fr]"
    )}>
      {/* Sidebar menu */}
      <div className={cn(
        isMobile
          ? "flex flex-wrap gap-1.5"
          : "space-y-0.5 border-r border-border/30 pr-3 max-h-[calc(100vh-220px)] overflow-y-auto"
      )}>
        {filteredTopics.map((topic) => {
          const Icon = iconMap[topic.icon] || HelpCircle;
          const isActive = topic.id === currentId;

          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={cn(
                "flex items-center gap-2 text-left transition-all duration-200 rounded-lg",
                isMobile
                  ? "px-3 py-2 text-xs"
                  : "w-full px-2.5 py-2 text-[13px]",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon size={isMobile ? 14 : 15} className="shrink-0" />
              <span className="truncate">{topic.title}</span>
            </button>
          );
        })}
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
