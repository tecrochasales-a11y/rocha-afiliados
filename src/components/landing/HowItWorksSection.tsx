import { UserPlus, Share2, CheckCircle, Wallet, Loader2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import * as LucideIcons from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Share2,
  CheckCircle,
  Wallet,
};

const colorsByIndex = [
  "bg-primary/10 text-primary",
  "bg-secondary/10 text-secondary",
  "bg-accent/10 text-accent",
  "bg-secondary/10 text-secondary",
];

const HowItWorksSection = () => {
  const { content, isLoading } = useSiteContent("how_it_works");

  const getIcon = (iconName: string | null, index: number) => {
    if (!iconName) {
      const defaultIcons = [UserPlus, Share2, CheckCircle, Wallet];
      return defaultIcons[index % defaultIcons.length];
    }
    return iconMap[iconName] || (LucideIcons as Record<string, unknown>)[iconName] as React.ComponentType<{ className?: string }> || UserPlus;
  };

  if (isLoading) {
    return (
      <section id="como-funciona" className="py-20 md:py-28 bg-background scroll-mt-20">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const steps = content.length > 0 ? content : [
    { id: "1", title: "Cadastre-se", description: "Crie sua conta gratuitamente em menos de 2 minutos.", icon: "UserPlus", display_order: 1 },
    { id: "2", title: "Indique", description: "Compartilhe seu link exclusivo com sua rede.", icon: "Share2", display_order: 2 },
    { id: "3", title: "Cliente Fecha", description: "Quando seu indicado contratar, a venda é rastreada.", icon: "CheckCircle", display_order: 3 },
    { id: "4", title: "Receba", description: "Sua comissão é creditada. Saque via PIX.", icon: "Wallet", display_order: 4 },
  ];

  return (
    <section id="como-funciona" className="py-20 md:py-28 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            Simples e Eficiente
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            Em apenas 4 passos você começa a ganhar comissões indicando nossos produtos
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop with gradient animation */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = getIcon(step.icon, index);
              const color = colorsByIndex[index % colorsByIndex.length];

              return (
                <div 
                  key={step.id} 
                  className="relative group"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 h-full border border-border group-hover:border-secondary/30 hover-lift">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-8 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-heading font-bold text-sm shadow-glow">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8" />
                    </div>

                    {/* Content */}
                    <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
