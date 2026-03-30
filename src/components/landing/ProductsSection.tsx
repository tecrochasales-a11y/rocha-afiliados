import { Heart, Shield, Home, Car, Briefcase, Umbrella, Star, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

const iconColorMap: Record<number, { color: string; borderColor: string }> = {
  0: { color: "bg-red-500/10 text-red-500", borderColor: "hover:border-red-500/30" },
  1: { color: "bg-blue-500/10 text-blue-500", borderColor: "hover:border-blue-500/30" },
  2: { color: "bg-amber-500/10 text-amber-500", borderColor: "hover:border-amber-500/30" },
  3: { color: "bg-green-500/10 text-green-500", borderColor: "hover:border-green-500/30" },
  4: { color: "bg-purple-500/10 text-purple-500", borderColor: "hover:border-purple-500/30" },
  5: { color: "bg-cyan-500/10 text-cyan-500", borderColor: "hover:border-cyan-500/30" },
};

const defaultIcons = [Heart, Shield, Home, Car, Briefcase, Umbrella];

const getIcon = (iconName: string | null, index: number) => {
  if (iconName && (LucideIcons as Record<string, unknown>)[iconName]) {
    return (LucideIcons as Record<string, unknown>)[iconName] as React.ComponentType<{ className?: string }>;
  }
  return defaultIcons[index % defaultIcons.length];
};

const ProductsSection = () => {
  const { content, isLoading } = useSiteContent("products");

  if (isLoading) {
    return (
      <section id="produtos" className="py-20 md:py-28 bg-background scroll-mt-20">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!content.length) return null;

  // Parse extra_data for each product
  const products = content.map((item, index) => {
    const extra = item.extra_data as Record<string, unknown>;
    const commission = item.value || "Até 20%";
    const avgTicket = (extra?.avgTicket as string) || (extra?.avg_ticket as string) || "R$ 300";
    const popularity = Number(extra?.popularity) || 3;
    const featured = Boolean(extra?.featured);
    const colors = iconColorMap[index % Object.keys(iconColorMap).length];
    const IconComponent = getIcon(item.icon, index);

    return {
      icon: IconComponent,
      title: item.title || "Produto",
      description: item.description || "",
      commission,
      avgTicket,
      popularity,
      featured,
      ...colors,
    };
  });

  const featuredProduct = products.find(p => p.featured);
  const otherProducts = products.filter(p => !p.featured);

  return (
    <section id="produtos" className="py-20 md:py-28 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Top Ofertas
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Produtos com{" "}
            <span className="text-gradient-gold bg-gradient-gold bg-clip-text text-transparent">
              Alta Conversão
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha os produtos que deseja promover e comece a ganhar comissões atrativas
          </p>
        </div>

        {/* Featured Product */}
        {featuredProduct && (
          <FeaturedProductCard product={featuredProduct} />
        )}

        {/* Other Products Grid */}
        {otherProducts.length > 0 && (
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Todos os Produtos Disponíveis
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          * Percentuais de comissão e tickets médios variam de acordo com o produto e operadora.
          Novos produtos são adicionados regularmente.
        </p>
      </div>
    </section>
  );
};

interface ProductData {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  commission: string;
  avgTicket: string;
  popularity: number;
  featured: boolean;
  color: string;
  borderColor: string;
}

const FeaturedProductCard = ({ product }: { product: ProductData }) => {
  const IconComp = product.icon;
  return (
    <div className="mb-12">
      <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-full mb-4">
              <Star className="w-4 h-4 fill-secondary-foreground text-secondary-foreground" />
              <span className="text-sm font-semibold text-secondary-foreground">Produto em Destaque</span>
            </div>
            <h3 className="font-heading text-3xl md:text-4xl font-bold mb-4">{product.title}</h3>
            <p className="text-primary-foreground/80 text-lg mb-6">
              {product.description}. Maior demanda do mercado, alta taxa de conversão e comissões competitivas.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-primary-foreground/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <p className="text-sm text-primary-foreground/70">Comissão</p>
                <p className="font-heading text-2xl font-bold text-secondary">{product.commission}</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <p className="text-sm text-primary-foreground/70">Ticket Médio</p>
                <p className="font-heading text-2xl font-bold text-primary-foreground">{product.avgTicket}</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <p className="text-sm text-primary-foreground/70">Popularidade</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < product.popularity ? "fill-secondary text-secondary" : "text-primary-foreground/30"}`} />
                  ))}
                </div>
              </div>
            </div>
            <Link to="/cadastro">
              <Button variant="hero" size="lg">
                Quero Promover Este Produto
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/20">
              <IconComp className="w-16 h-16 md:w-24 md:h-24 text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: ProductData }) => {
  const IconComp = product.icon;
  return (
    <div className={`bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border ${product.borderColor} group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl ${product.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <IconComp className="w-7 h-7" />
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
            {product.commission}
          </span>
        </div>
      </div>
      <h3 className="font-heading font-bold text-xl text-foreground mb-2">{product.title}</h3>
      <p className="text-muted-foreground mb-4">{product.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Ticket Médio</p>
          <p className="font-semibold text-foreground">{product.avgTicket}</p>
        </div>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < product.popularity ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
