import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

const CTASection = () => {
  const { content, isLoading } = useSiteContent("cta");

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const ctaData = content[0];
  const title = ctaData?.title || "Pronto para Começar a Ganhar?";
  const description = ctaData?.description || "Junte-se a mais de 500 afiliados que já estão transformando indicações em comissões recorrentes.";
  const extra = ctaData?.extra_data as Record<string, unknown> | undefined;
  const benefits = Array.isArray(extra?.benefits) ? (extra.benefits as string[]) : ["Cadastro 100% gratuito", "Comissões de até 30%", "Pagamentos via PIX", "Suporte dedicado"];
  const ctaText = (extra?.cta_text as string) || "Quero ser Afiliado Agora";

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-hero rounded-3xl p-8 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              {description}
            </p>

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

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link to="/cadastro">
                <Button variant="hero" size="xl">
                  {ctaText}
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
