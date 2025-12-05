import { Heart, Shield, Home, Car, Briefcase, Umbrella } from "lucide-react";

const products = [
  {
    icon: Heart,
    title: "Planos de Saúde",
    description: "Unimed, Bradesco Saúde, SulAmérica, Amil e mais",
    commission: "Até 30%",
    color: "bg-red-500/10 text-red-500",
  },
  {
    icon: Shield,
    title: "Seguro de Vida",
    description: "Proteção financeira para você e sua família",
    commission: "Até 25%",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Home,
    title: "Seguro Residencial",
    description: "Proteção completa para seu lar",
    commission: "Até 20%",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Car,
    title: "Seguro Auto",
    description: "Cobertura total para seu veículo",
    commission: "Até 15%",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Briefcase,
    title: "Seguro Empresarial",
    description: "Proteção completa para sua empresa",
    commission: "Até 20%",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Umbrella,
    title: "Outros Seguros",
    description: "Viagem, pets, equipamentos e mais",
    commission: "Até 25%",
    color: "bg-cyan-500/10 text-cyan-500",
  },
];

const ProductsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Variedade de Produtos
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Produtos Disponíveis
          </h2>
          <p className="text-muted-foreground text-lg">
            Indique diferentes tipos de seguros e maximize suas comissões
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border hover:border-secondary/30 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl ${product.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <product.icon className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
                  {product.commission}
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                {product.title}
              </h3>
              <p className="text-muted-foreground">
                {product.description}
              </p>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          * Percentuais de comissão variam de acordo com o produto e operadora
        </p>
      </div>
    </section>
  );
};

export default ProductsSection;
