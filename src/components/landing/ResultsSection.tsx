import { TrendingUp, DollarSign, Users, Target, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

const ResultsSection = () => {
  const { content, isLoading } = useSiteContent("results");
  const { content: infoContent } = useSiteContent("results_info");

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const earningExamples = content.length > 0 
    ? content.map(item => {
        const extraData = item.extra_data as Record<string, string | boolean>;
        return {
          title: item.title || "",
          leads: extraData?.leads as string || "",
          conversions: extraData?.conversions as string || "",
          earning: item.value || "",
          period: extraData?.period as string || "",
          description: item.description || "",
          highlight: extraData?.highlight === true,
        };
      })
    : [
        { title: "Iniciante", leads: "5 indicações/mês", conversions: "2 vendas", earning: "R$ 600", period: "/mês", description: "Indicando para amigos e família", highlight: false },
        { title: "Intermediário", leads: "15 indicações/mês", conversions: "6 vendas", earning: "R$ 1.800", period: "/mês", description: "Expandindo para redes sociais", highlight: true },
        { title: "Avançado", leads: "40 indicações/mês", conversions: "16 vendas", earning: "R$ 4.800", period: "/mês", description: "Estratégia ativa de captação", highlight: false },
      ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Potencial de Ganhos
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Resultados que Você Pode{" "}
            <span className="text-gradient-gold bg-gradient-gold bg-clip-text text-transparent">
              Alcançar
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Veja simulações reais de quanto você pode ganhar como afiliado, 
            baseadas no desempenho médio dos nossos parceiros
          </p>
        </div>

        {/* Earning Examples */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {earningExamples.map((example, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-8 border transition-all duration-300 ${
                example.highlight 
                  ? "bg-gradient-hero text-primary-foreground border-transparent shadow-glow scale-105" 
                  : "bg-card text-foreground border-border hover:border-secondary/30 shadow-soft hover:shadow-medium"
              }`}
            >
              {example.highlight && (
                <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-4">
                  Mais Popular
                </span>
              )}
              
              <h3 className={`font-heading text-xl font-bold mb-4 ${
                example.highlight ? "text-primary-foreground" : "text-foreground"
              }`}>
                {example.title}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Users className={`w-5 h-5 ${example.highlight ? "text-secondary" : "text-muted-foreground"}`} />
                  <span className={example.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}>
                    {example.leads}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className={`w-5 h-5 ${example.highlight ? "text-secondary" : "text-muted-foreground"}`} />
                  <span className={example.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}>
                    {example.conversions}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className={`font-heading text-4xl font-bold ${
                    example.highlight ? "text-secondary" : "text-secondary"
                  }`}>
                    {example.earning}
                  </span>
                  <span className={example.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>
                    {example.period}
                  </span>
                </div>
              </div>

              <p className={`text-sm ${
                example.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}>
                {example.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12 border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                Sem Limite de Ganhos
              </h3>
              <p className="text-muted-foreground mb-6">
                Nossos melhores afiliados faturam mais de <strong className="text-foreground">R$ 10.000 por mês</strong>. 
                O limite é sua dedicação e estratégia. Oferecemos todo suporte necessário 
                para você alcançar seus objetivos financeiros.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <span className="text-foreground">Comissão média de 30% por venda</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <span className="text-foreground">Ticket médio de R$ 300 por contrato</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <span className="text-foreground">Taxa de conversão média de 40%</span>
                </li>
              </ul>
              <Link to="/cadastro">
                <Button variant="gold" size="lg">
                  Começar a Ganhar Agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Calculator Preview */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground">Calculadora de Ganhos</p>
                  <p className="text-sm text-muted-foreground">Disponível no dashboard</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Indicações</span>
                  <span className="font-semibold text-foreground">20</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Conversões (40%)</span>
                  <span className="font-semibold text-foreground">8</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Ticket médio</span>
                  <span className="font-semibold text-foreground">R$ 300</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-secondary/10 rounded-lg px-3 -mx-3">
                  <span className="font-semibold text-foreground">Ganho estimado</span>
                  <span className="font-heading text-2xl font-bold text-secondary">R$ 2.400</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
