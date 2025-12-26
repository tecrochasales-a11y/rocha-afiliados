import { 
  Wallet, 
  Clock, 
  Shield, 
  BarChart3, 
  Headphones, 
  Gift,
  TrendingUp,
  Zap,
  Loader2
} from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import * as LucideIcons from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  Clock,
  Shield,
  BarChart3,
  Headphones,
  Gift,
  TrendingUp,
  Zap,
};

const BenefitsSection = () => {
  const { content, isLoading } = useSiteContent("benefits");

  const getIcon = (iconName: string | null, index: number) => {
    if (!iconName) {
      const defaultIcons = [Wallet, Clock, BarChart3, Shield, Headphones, Gift, TrendingUp, Zap];
      return defaultIcons[index % defaultIcons.length];
    }
    return iconMap[iconName] || (LucideIcons as Record<string, unknown>)[iconName] as React.ComponentType<{ className?: string }> || Wallet;
  };

  if (isLoading) {
    return (
      <section id="beneficios" className="py-20 md:py-28 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const benefits = content.length > 0 ? content : [
    { id: "1", title: "Comissões Competitivas", description: "Ganhe até 30% de comissão em cada venda realizada.", icon: "Wallet" },
    { id: "2", title: "Pagamentos Rápidos", description: "Receba suas comissões via PIX.", icon: "Clock" },
  ];

  return (
    <section id="beneficios" className="py-20 md:py-28 bg-muted/50 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Por que ser nosso Afiliado?
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Benefícios Exclusivos
          </h2>
          <p className="text-muted-foreground text-lg">
            Oferecemos as melhores condições do mercado para você maximizar seus ganhos
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = getIcon(benefit.icon, index);

            return (
              <div 
                key={benefit.id}
                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border hover:border-secondary/30 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
