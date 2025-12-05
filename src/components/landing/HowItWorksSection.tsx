import { UserPlus, Share2, CheckCircle, Wallet } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Cadastre-se",
    description: "Crie sua conta gratuitamente em menos de 2 minutos. Sem taxas de adesão.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Share2,
    title: "Indique",
    description: "Compartilhe seu link exclusivo com amigos, familiares e sua rede de contatos.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: CheckCircle,
    title: "Cliente Fecha",
    description: "Quando seu indicado contratar um plano ou seguro, a venda é rastreada automaticamente.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Wallet,
    title: "Receba",
    description: "Sua comissão é creditada assim que o contrato é efetivado. Saque via PIX.",
    color: "bg-secondary/10 text-secondary",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
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
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 h-full border border-border group-hover:border-secondary/30">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-heading font-bold text-sm shadow-glow">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8" />
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
