import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-sm font-medium text-primary-foreground">
                Programa de Afiliados
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Indique. Converta.{" "}
              <span className="text-gradient-gold bg-gradient-gold bg-clip-text text-transparent">
                Ganhe.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
              Transforme suas indicações em comissões recorrentes. 
              Seja um afiliado Rocha Sales Seguros e ganhe dinheiro indicando planos de saúde e seguros.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/cadastro">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Quero ser Afiliado
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline_light" size="lg" className="w-full sm:w-auto">
                  Já sou Afiliado
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">+500 Afiliados</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <DollarSign className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">R$ 2M+ Pagos</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">30% Comissão</span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating Cards */}
              <div className="absolute top-10 left-0 bg-card rounded-2xl shadow-medium p-6 animate-float" style={{ animationDelay: "0s" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversão</p>
                    <p className="text-xl font-bold text-foreground">+45%</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 right-0 bg-card rounded-2xl shadow-medium p-6 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comissão</p>
                    <p className="text-xl font-bold text-foreground">R$ 2.500</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-10 bg-card rounded-2xl shadow-medium p-6 animate-float" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-xl font-bold text-foreground">127</p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-foreground/10 backdrop-blur rounded-3xl flex items-center justify-center border border-primary-foreground/20">
                <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-glow">
                  <DollarSign className="w-10 h-10 text-secondary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
