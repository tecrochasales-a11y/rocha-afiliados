import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const Privacidade = () => {
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
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Última atualização: 12 de Dezembro de 2024
            </p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-3xl shadow-medium p-8 md:p-12">
            <div className="prose prose-gray max-w-none">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                1. Coleta de Informações
              </h2>
              <p className="text-muted-foreground mb-6">
                Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone, 
                CPF/CNPJ e chave PIX durante o cadastro. Também coletamos informações sobre suas 
                atividades no programa, como leads gerados e comissões recebidas.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                2. Uso das Informações
              </h2>
              <p className="text-muted-foreground mb-6">
                Utilizamos suas informações para: processar seu cadastro e gerenciar sua conta; 
                calcular e processar comissões; enviar comunicações sobre o programa; melhorar 
                nossos serviços; cumprir obrigações legais e fiscais.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                3. Compartilhamento de Informações
              </h2>
              <p className="text-muted-foreground mb-6">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros 
                para fins de marketing. Podemos compartilhar suas informações com: prestadores de 
                serviço que nos ajudam a operar o programa; autoridades quando exigido por lei.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                4. Segurança dos Dados
              </h2>
              <p className="text-muted-foreground mb-6">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
                informações contra acesso não autorizado, alteração, divulgação ou destruição. 
                Isso inclui criptografia de dados e controles de acesso.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                5. Seus Direitos
              </h2>
              <p className="text-muted-foreground mb-6">
                De acordo com a LGPD, você tem direito a: acessar seus dados pessoais; corrigir 
                dados incompletos ou desatualizados; solicitar a exclusão de seus dados; revogar 
                seu consentimento; solicitar a portabilidade dos dados.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                6. Cookies e Tecnologias Semelhantes
              </h2>
              <p className="text-muted-foreground mb-6">
                Utilizamos cookies para melhorar sua experiência, analisar o tráfego e personalizar 
                conteúdo. Você pode configurar seu navegador para recusar cookies, mas isso pode 
                afetar algumas funcionalidades do site.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                7. Retenção de Dados
              </h2>
              <p className="text-muted-foreground mb-6">
                Mantemos suas informações pelo tempo necessário para cumprir os propósitos descritos 
                nesta política, a menos que um período de retenção maior seja exigido por lei.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                8. Alterações nesta Política
              </h2>
              <p className="text-muted-foreground mb-6">
                Podemos atualizar esta política periodicamente. Notificaremos sobre alterações 
                significativas através do e-mail cadastrado ou através de aviso no site.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                9. Contato
              </h2>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato 
                através do e-mail: privacidade@rochasalesseguros.com.br
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacidade;
