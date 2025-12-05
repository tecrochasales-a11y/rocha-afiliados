import { CheckCircle2, Sparkles, DollarSign, Shield } from "lucide-react";

const propositions = [
  {
    icon: Sparkles,
    title: "Produtos de Qualidade",
    description: "Trabalhamos com as melhores operadoras do mercado brasileiro",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: DollarSign,
    title: "Altas Comissões",
    description: "Até 30% de comissão em cada venda realizada",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Shield,
    title: "Pagamentos Confiáveis",
    description: "Pagamento garantido via PIX assim que a venda é efetivada",
    color: "bg-amber-500/10 text-amber-500",
  },
];

const ValuePropositionSection = () => {
  return (
    <section className="py-16 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {propositions.map((prop, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${prop.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <prop.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground">
                  {prop.title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  {prop.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
