import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Cadastro 100% gratuito",
  "Comissões de até 30%",
  "Pagamentos via PIX",
  "Suporte dedicado",
];

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-hero rounded-3xl p-8 md:p-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Pronto para Começar a Ganhar?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              Junte-se a mais de 500 afiliados que já estão transformando indicações em comissões recorrentes.
            </p>

            {/* Benefits List */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-primary-foreground/90"
                >
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span className="text-sm md:text-base font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link to="/cadastro">
                <Button variant="hero" size="xl">
                  Quero ser Afiliado Agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
