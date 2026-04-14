import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import einsteinBackground from "@/assets/einstein-background.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <img 
        src={einsteinBackground}
        alt="Einstein Hospital - Rocha Sales Seguros"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 28%" }}
      />
      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-800/45 to-gray-700/25" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-secondary/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-32 right-[15%] w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-[60%] w-40 h-40 rounded-full bg-primary-foreground/5 blur-2xl animate-float-slow" style={{ animationDelay: "5s" }} />
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
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
                <Button variant="hero" size="xl" className="w-full sm:w-auto relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">
                    Quero ser Afiliado
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 shimmer" />
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
              {/* Floating Cards with glassmorphism */}
              <div className="absolute top-10 left-0 glass-card rounded-2xl shadow-medium p-6 animate-float hover-lift" style={{ animationDelay: "0s" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/15 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversão</p>
                    <p className="text-xl font-bold text-foreground">+45%</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 right-0 glass-card rounded-2xl shadow-medium p-6 animate-float hover-lift" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comissão</p>
                    <p className="text-xl font-bold text-foreground">R$ 2.500</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-10 glass-card rounded-2xl shadow-medium p-6 animate-float hover-lift" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-xl font-bold text-foreground">127</p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 glass rounded-3xl flex items-center justify-center">
                <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-glow animate-glow-pulse">
                  <DollarSign className="w-10 h-10 text-secondary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/60 to-transparent" />
    </section>
  );
};

export default HeroSection;
