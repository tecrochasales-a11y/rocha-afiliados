import { 
  Shield, 
  Award, 
  Clock, 
  Users, 
  Building2, 
  CheckCircle2,
  BadgeCheck,
  FileCheck
} from "lucide-react";

const trustPoints = [
  {
    icon: Building2,
    title: "Empresa Consolidada",
    description: "Mais de 10 anos atuando no mercado de seguros com transparência e ética.",
  },
  {
    icon: BadgeCheck,
    title: "Registro SUSEP",
    description: "Corretora devidamente registrada e habilitada pela Superintendência de Seguros.",
  },
  {
    icon: FileCheck,
    title: "Contratos Claros",
    description: "Documentação transparente, sem letras miúdas ou surpresas desagradáveis.",
  },
  {
    icon: Clock,
    title: "Pagamentos Pontuais",
    description: "Histórico impecável de pagamentos. Comissões pagas via PIX no prazo.",
  },
];

const credentials = [
  "Parceiro oficial das principais operadoras",
  "Mais de 500 afiliados ativos em todo Brasil",
  "R$ 2 milhões+ em comissões pagas",
  "Suporte dedicado 7 dias por semana",
  "Sistema de tracking 100% transparente",
  "Treinamento gratuito para afiliados",
];

const TrustSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              Credibilidade
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Por que Confiar na{" "}
              <span className="text-primary">Rocha Sales Seguros</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Somos uma corretora consolidada no mercado, com anos de experiência e um 
              compromisso inabalável com a transparência e o sucesso dos nossos afiliados.
            </p>

            {/* Trust Points */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {trustPoints.map((point, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/20 hover:shadow-soft transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <point.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      {point.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials Card */}
          <div className="bg-gradient-hero rounded-3xl p-8 md:p-10 text-primary-foreground relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl animate-float-slow" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "4s" }} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-glow">
                  <Award className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    Nossas Credenciais
                  </h3>
                  <p className="text-primary-foreground/70 text-sm">
                    O que nos diferencia
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {credentials.map((credential, index) => (
                  <li key={index} className="flex items-center gap-3 group">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-primary-foreground/90">{credential}</span>
                  </li>
                ))}
              </ul>

              {/* Trust Badge */}
              <div className="mt-8 pt-6 border-t border-primary-foreground/20">
                <div className="flex items-center gap-4">
                  <div className="flex items-center -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-primary shadow-glow">
                      <Shield className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border-2 border-primary">
                      <Users className="w-5 h-5 text-accent-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-primary-foreground">
                      Sua segurança é nossa prioridade
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      Dados protegidos e transações seguras
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
