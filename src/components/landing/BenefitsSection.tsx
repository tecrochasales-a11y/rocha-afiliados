import { 
  Wallet, 
  Clock, 
  Shield, 
  BarChart3, 
  Headphones, 
  Gift,
  TrendingUp,
  Zap
} from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Comissões Competitivas",
    description: "Ganhe até 30% de comissão em cada venda realizada. Valores reais no mercado de seguros.",
  },
  {
    icon: Clock,
    title: "Pagamentos Rápidos",
    description: "Receba suas comissões via PIX assim que o contrato é efetivado. Sem burocracia.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Acompanhe suas indicações, conversões e ganhos em tempo real pelo painel.",
  },
  {
    icon: Shield,
    title: "Rastreamento Seguro",
    description: "Tecnologia de tracking precisa para garantir que você receba por cada indicação.",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Equipe especializada para ajudar você e seus indicados durante todo o processo.",
  },
  {
    icon: Gift,
    title: "Bonificações Extras",
    description: "Campanhas especiais com bônus adicionais para afiliados com melhor performance.",
  },
  {
    icon: TrendingUp,
    title: "Múltiplos Produtos",
    description: "Indique planos de saúde, seguros de vida, auto, residencial e muito mais.",
  },
  {
    icon: Zap,
    title: "Cadastro Rápido",
    description: "Em menos de 2 minutos você está pronto para começar a indicar e ganhar.",
  },
];

const BenefitsSection = () => {
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
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border hover:border-secondary/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
