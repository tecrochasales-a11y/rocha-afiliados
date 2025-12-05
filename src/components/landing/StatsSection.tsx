import { TrendingUp, Users, DollarSign, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Afiliados Ativos",
    description: "Parceiros gerando renda",
  },
  {
    icon: DollarSign,
    value: "R$ 2M+",
    label: "Comissões Pagas",
    description: "Desde o início do programa",
  },
  {
    icon: TrendingUp,
    value: "30%",
    label: "Comissão Média",
    description: "Por venda realizada",
  },
  {
    icon: Award,
    value: "10+",
    label: "Anos de Mercado",
    description: "Credibilidade garantida",
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Resultados que Falam por Si
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Números que comprovam a força do nosso programa de afiliados
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </h3>
              <p className="font-semibold text-primary-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-primary-foreground/70">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
