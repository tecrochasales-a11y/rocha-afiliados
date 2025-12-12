import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const Termos = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-soft mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Termos de Uso
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Última atualização: 12 de Dezembro de 2024
            </p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-3xl shadow-medium p-8 md:p-12">
            <div className="prose prose-gray max-w-none">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-muted-foreground mb-6">
                Ao acessar e usar o Programa de Afiliados Rocha Sales Seguros, você concorda em cumprir 
                e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes 
                termos, não deverá usar nosso serviço.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                2. Elegibilidade
              </h2>
              <p className="text-muted-foreground mb-6">
                Para participar do programa de afiliados, você deve ter pelo menos 18 anos de idade 
                e ser legalmente capaz de celebrar contratos. Você deve fornecer informações precisas 
                e atualizadas durante o processo de registro.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                3. Comissões e Pagamentos
              </h2>
              <p className="text-muted-foreground mb-6">
                As comissões serão calculadas com base nas vendas efetivadas através do seu link de 
                indicação. Os pagamentos serão processados mensalmente, após a confirmação da venda 
                e cumprimento do período de carência. O valor mínimo para saque é de R$ 50,00.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                4. Responsabilidades do Afiliado
              </h2>
              <p className="text-muted-foreground mb-6">
                Como afiliado, você concorda em: promover nossos produtos de forma ética e transparente; 
                não utilizar práticas de spam ou marketing enganoso; não fazer promessas falsas sobre 
                os produtos; manter a confidencialidade das informações recebidas.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                5. Propriedade Intelectual
              </h2>
              <p className="text-muted-foreground mb-6">
                Todos os materiais de marketing, logos e conteúdos fornecidos pela Rocha Sales Seguros 
                são de propriedade exclusiva da empresa. Você recebe uma licença limitada para usar 
                estes materiais apenas para fins de promoção dentro do programa.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                6. Término
              </h2>
              <p className="text-muted-foreground mb-6">
                Qualquer uma das partes pode encerrar a participação no programa a qualquer momento. 
                Em caso de término, as comissões pendentes serão pagas conforme as regras vigentes, 
                desde que as vendas tenham sido validadas.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                7. Alterações nos Termos
              </h2>
              <p className="text-muted-foreground mb-6">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações 
                entrarão em vigor após a publicação no site. O uso continuado do serviço após as 
                alterações constitui aceitação dos novos termos.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                8. Contato
              </h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: 
                afiliados@rochasalesseguros.com.br
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Termos;
